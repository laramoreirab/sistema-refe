import prisma from '../config/prisma.js';

/** Busca um passe e prepara, em uma transação, a liberação única de uma tag. */
export async function prepararRetirada(senha, totemId, ipOrigem) {
  return prisma.$transaction(async (tx) => {
    const passe = await tx.passe.findUnique({
      where: { senha },
      include: { compra: true },
    });
    const agora = new Date();

    // Registra senhas inexistentes para auditoria e retorna o motivo da recusa.
    if (!passe) {
      await tx.tentativaSenha.create({ data: { totemId, ipOrigem, resultado: 'SENHA_INVALIDA' } });
      return { ok: false, motivo: 'SENHA_INVALIDA' };
    }

    // Impede a retirada quando a compra não foi confirmada ou o passe não está válido.
    if (passe.compra.status !== 'PAGA') {
      await tx.tentativaSenha.create({ data: { totemId, passeId: passe.id, ipOrigem, resultado: 'PAGAMENTO_NAO_CONFIRMADO' } });
      return { ok: false, motivo: 'PAGAMENTO_NAO_CONFIRMADO' };
    }
    if (passe.status === 'UTILIZADO') {
      await tx.tentativaSenha.create({ data: { totemId, passeId: passe.id, ipOrigem, resultado: 'SENHA_JA_UTILIZADA' } });
      return { ok: false, motivo: 'SENHA_JA_UTILIZADA' };
    }
    if (passe.status !== 'ATIVO' || passe.expiraEm <= agora) {
      await tx.tentativaSenha.create({ data: { totemId, passeId: passe.id, ipOrigem, resultado: 'SENHA_EXPIRADA' } });
      return { ok: false, motivo: 'SENHA_EXPIRADA' };
    }

    // Reutiliza uma solicitação ainda aberta para evitar liberar duas tags.
    // Libera tags reservadas em solicitações anteriores que expiraram.
    const expiradas = await tx.dispensacao.findMany({
      where: { passeId: passe.id, status: { in: ['SOLICITADA', 'TAG_RESERVADA', 'ENVIADA_AO_TOTEM', 'LIBERANDO'] }, expiraEm: { lte: agora } },
      include: { tag: true },
    });
    for (const item of expiradas) {
      await tx.dispensacao.update({ where: { id: item.id }, data: { status: 'EXPIRADA', eventos: { create: { tipo: 'TIMEOUT', origem: 'BACKEND' } } } });
      if (item.tag?.status === 'RESERVADA') await tx.tag.update({ where: { id: item.tag.id }, data: { status: 'DISPONIVEL' } });
    }
    const pendente = await tx.dispensacao.findFirst({
      where: { passeId: passe.id, status: { in: ['SOLICITADA', 'TAG_RESERVADA', 'ENVIADA_AO_TOTEM', 'LIBERANDO'] }, expiraEm: { gt: agora } },
      include: { tag: true },
    });
    if (pendente && pendente.totemId !== totemId) return { ok: false, motivo: 'PASSE_EM_OUTRO_TOTEM' };
    if (pendente) {
      return { ok: true, dispensacao: pendente, reutilizada: true };
    }

    // Reserva uma tag disponível no mesmo totem antes de instruir o equipamento.
    const tag = await tx.tag.findFirst({
      where: { totemId, status: 'DISPONIVEL' },
      orderBy: { posicao: 'asc' },
    });
    if (!tag) return { ok: false, motivo: 'SEM_TAG_DISPONIVEL' };

    const expiraEm = new Date(agora.getTime() + 2 * 60 * 1000);
    const reserva = await tx.tag.updateMany({ where: { id: tag.id, status: 'DISPONIVEL' }, data: { status: 'RESERVADA' } });
    if (reserva.count !== 1) return { ok: false, motivo: 'SEM_TAG_DISPONIVEL' };

    const dispensacao = await tx.dispensacao.create({
      data: {
        passeId: passe.id,
        totemId,
        tagId: tag.id,
        chaveIdempotencia: `passe-${passe.id}-${agora.getTime()}`,
        status: 'TAG_RESERVADA',
        expiraEm,
        eventos: { create: [
          { tipo: 'SOLICITACAO_CRIADA', origem: 'BACKEND' },
          { tipo: 'TAG_RESERVADA', origem: 'BACKEND', uidRfid: tag.uidRfid },
          { tipo: 'ORDEM_ENVIADA', origem: 'BACKEND', uidRfid: tag.uidRfid },
        ] },
      },
      include: { tag: true },
    });
    await tx.dispensacao.update({ where: { id: dispensacao.id }, data: { status: 'ENVIADA_AO_TOTEM' } });
    await tx.tentativaSenha.create({ data: { totemId, passeId: passe.id, ipOrigem, resultado: 'SUCESSO' } });

    return { ok: true, dispensacao: { ...dispensacao, status: 'ENVIADA_AO_TOTEM' }, reutilizada: false };
  });
}

/** Confirma a entrega física após o ESP32 ler o UID da tag reservada. */
export async function confirmarEntrega(dispensacaoId, uidRfid, totemId) {
  return prisma.$transaction(async (tx) => {
    const dispensacao = await tx.dispensacao.findUnique({ where: { id: dispensacaoId }, include: { tag: true, passe: true } });
    if (!dispensacao || !dispensacao.tag || dispensacao.totemId !== totemId) return { ok: false, motivo: 'DISPENSACAO_NAO_ENCONTRADA' };
    if (dispensacao.status === 'ENTREGUE') return { ok: true, dispensacao, reutilizada: true };
    if (dispensacao.tag.uidRfid !== uidRfid) return { ok: false, motivo: 'UID_DA_TAG_DIFERENTE' };
    if (dispensacao.status !== 'ENVIADA_AO_TOTEM' && dispensacao.status !== 'LIBERANDO') return { ok: false, motivo: 'DISPENSACAO_INVALIDA' };

    const agora = new Date();
    await tx.dispensacao.update({ where: { id: dispensacaoId }, data: {
      status: 'ENTREGUE', uidLido: uidRfid, concluidaEm: agora,
      eventos: { create: [
        { tipo: 'RFID_LIDO', origem: 'ESP32', uidRfid },
        { tipo: 'ENTREGA_CONFIRMADA', origem: 'ESP32', uidRfid },
      ] },
    } });
    await tx.tag.update({ where: { id: dispensacao.tag.id }, data: { status: 'EM_USO' } });
    await tx.passe.update({ where: { id: dispensacao.passeId }, data: { status: 'UTILIZADO', utilizadoEm: agora } });
    await tx.emprestimoTag.create({ data: { tagId: dispensacao.tag.id, passeId: dispensacao.passeId, dispensacaoId } });
    return { ok: true, dispensacao: { ...dispensacao, status: 'ENTREGUE', uidLido: uidRfid }, reutilizada: false };
  });
}

/** Interpreta um UID recebido pelo MQTT como entrega de tag ou consulta de estudante. */
export async function processarLeituraRfid(uidRfid, totemId) {
  const dispensacao = await prisma.dispensacao.findFirst({
    where: {
      totemId,
      status: { in: ['ENVIADA_AO_TOTEM', 'LIBERANDO'] },
      expiraEm: { gt: new Date() },
      tag: { is: { uidRfid } },
    },
  });

  // Se o UID é o da tag reservada, confirma a entrega e consome o passe.
  if (dispensacao) {
    const entrega = await confirmarEntrega(dispensacao.id, uidRfid, totemId);
    return entrega.ok
      ? { tipo: 'ENTREGA_CONFIRMADA', dispensacaoId: dispensacao.id, status: 'ENTREGUE' }
      : { tipo: 'ERRO', motivo: entrega.motivo };
  }

  // Qualquer outro UID é consultado como carteirinha de estudante.
  return { tipo: 'RESULTADO_RFID', ...(await consultarCarteirinha(uidRfid, totemId)) };
}
/** Consulta o cadastro RFID, saldo e extrato do estudante em uma leitura. */
export async function consultarCarteirinha(uidRfid, totemId) {
  return prisma.$transaction(async (tx) => {
    const carteirinha = await tx.carteirinha.findUnique({
      where: { uidRfid },
      include: { usuario: { include: { conta: { include: { movimentacoes: { orderBy: { criadoEm: 'desc' }, take: 20 } } } } },
    });
    if (!carteirinha) {
      await tx.consultaCarteirinha.create({ data: { totemId, uidLido: uidRfid, resultado: 'CARTEIRINHA_DESCONHECIDA' } });
      return { resultado: 'CARTEIRINHA_DESCONHECIDA' };
    }

    const conta = carteirinha.usuario.conta;
    if (carteirinha.status !== 'ATIVA') {
      await tx.consultaCarteirinha.create({ data: { totemId, carteirinhaId: carteirinha.id, uidLido: uidRfid, resultado: 'CARTEIRINHA_BLOQUEADA', saldoCentavos: conta?.saldoCentavos ?? 0 } });
      return { resultado: 'CARTEIRINHA_BLOQUEADA' };
    }

    const saldoCentavos = conta?.saldoCentavos ?? 0;
    const movimentacoes = conta?.movimentacoes ?? [];
    await tx.consultaCarteirinha.create({ data: {
      totemId, carteirinhaId: carteirinha.id, uidLido: uidRfid,
      resultado: saldoCentavos > 0 ? 'CREDITOS_CONFIRMADOS' : 'SEM_CREDITOS', saldoCentavos,
    } });

    // Monta o formato consumido pelas telas de saldo e extrato do totem.
    const ultimaRecarga = movimentacoes.find((item) => item.tipo === 'CREDITO_RECARGA');
    return {
      resultado: saldoCentavos > 0 ? 'CREDITOS_CONFIRMADOS' : 'SEM_CREDITOS',
      aluno: {
        nome: carteirinha.usuario.nome,
        primeiroNome: carteirinha.usuario.nome.trim().split(/\s+/)[0],
        matricula: carteirinha.usuario.matricula,
        saldoCentavos,
        ultimaRecarga: ultimaRecarga ? {
          valorCentavos: ultimaRecarga.valorCentavos,
          meio: 'PIX',
          quando: ultimaRecarga.criadoEm,
        } : null,
        movimentacoes: movimentacoes.map((item) => ({
          id: item.id,
          data: item.criadoEm,
          descricao: item.descricao ?? item.tipo.replaceAll('_', ' '),
          valorCentavos: item.valorCentavos,
          saldoAposCentavos: item.saldoAposCentavos,
        })),
      },
    };
  });
}



