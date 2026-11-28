import { ApiError } from '../dev-utils/ApiError.js';
import { prepararRetirada, confirmarEntrega } from '../models/TotemModel.js';
import { publicarComandoTotem } from '../config/mqtt.js';

// Converte motivos do model em códigos HTTP claros para o cliente do totem.
const statusPorMotivo = {
  SENHA_INVALIDA: 404,
  PAGAMENTO_NAO_CONFIRMADO: 409,
  SENHA_JA_UTILIZADA: 409,
  SENHA_EXPIRADA: 410,
  PASSE_EM_OUTRO_TOTEM: 409,
  SEM_TAG_DISPONIVEL: 409,
  DISPENSACAO_NAO_ENCONTRADA: 404,
  UID_DA_TAG_DIFERENTE: 409,
  DISPENSACAO_INVALIDA: 409,
};

class TotemController {
  // Valida a senha, reserva uma tag e envia a ordem de liberação pelo MQTT.
  static async validarSenha(req, res, next) {
    try {
      const { senha } = req.body;
      if (!/^\d{6}$/.test(String(senha ?? ''))) {
        throw ApiError.validacao('A senha deve conter 6 dígitos.');
      }

      const resultado = await prepararRetirada(String(senha), req.totem.id, req.ip);
      if (!resultado.ok) {
        return res.status(statusPorMotivo[resultado.motivo] ?? 409).json({
          sucesso: false,
          motivo: resultado.motivo,
          mensagem: mensagemPorMotivo(resultado.motivo),
        });
      }

      // O ESP32 executa a liberação e depois confirma o UID pelo fluxo RFID MQTT.
      const comando = {
        acao: 'LIBERAR_TAG',
        dispensacaoId: resultado.dispensacao.id,
        posicao: resultado.dispensacao.tag.posicao,
        uidEsperado: resultado.dispensacao.tag.uidRfid,
        expiraEm: resultado.dispensacao.expiraEm,
      };
      try {
        await publicarComandoTotem(req.totem.id, comando);
      } catch {
        throw new ApiError('Não foi possível enviar o comando ao totem. Verifique a conexão MQTT.', 503);
      }

      return res.json({
        sucesso: true,
        mensagem: 'Senha válida. Retire a tag RFID na bandeja.',
        dispensacaoId: resultado.dispensacao.id,
        comando,
      });
    } catch (erro) {
      return next(erro);
    }
  }

  // Confirma a entrega pelo HTTP quando o dispositivo não envia a leitura via MQTT.
  static async confirmarEntrega(req, res, next) {
    try {
      const { dispensacaoId, uidRfid } = req.body;
      if (!dispensacaoId || !uidRfid) {
        throw ApiError.validacao('Informe a dispensação e o UID RFID lido.');
      }
      const resultado = await confirmarEntrega(dispensacaoId, String(uidRfid).trim(), req.totem.id);
      if (!resultado.ok) {
        return res.status(statusPorMotivo[resultado.motivo] ?? 409).json({
          sucesso: false,
          motivo: resultado.motivo,
          mensagem: mensagemPorMotivo(resultado.motivo),
        });
      }
      return res.json({ sucesso: true, dispensacaoId, status: 'ENTREGUE' });
    } catch (erro) {
      return next(erro);
    }
  }
}

// Traduz os estados do passe e do dispenser em mensagens simples para o totem.
function mensagemPorMotivo(motivo) {
  const mensagens = {
    SENHA_INVALIDA: 'Senha não encontrada.',
    PAGAMENTO_NAO_CONFIRMADO: 'A compra ainda não foi confirmada.',
    SENHA_JA_UTILIZADA: 'Esta senha já foi utilizada.',
    SENHA_EXPIRADA: 'Esta senha expirou ou foi cancelada.',
    PASSE_EM_OUTRO_TOTEM: 'Esta senha já tem uma retirada em andamento em outro totem.',
    SEM_TAG_DISPONIVEL: 'Não há cartões disponíveis neste totem.',
    DISPENSACAO_NAO_ENCONTRADA: 'Dispensação não encontrada.',
    UID_DA_TAG_DIFERENTE: 'O cartão lido não corresponde ao cartão reservado.',
    DISPENSACAO_INVALIDA: 'Esta dispensação não pode ser confirmada.',
  };
  return mensagens[motivo] ?? 'Não foi possível concluir a operação.';
}

export default TotemController;
