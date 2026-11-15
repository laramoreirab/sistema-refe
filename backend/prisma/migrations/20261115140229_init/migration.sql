-- CreateEnum
CREATE TYPE "TipoUsuario" AS ENUM ('ESTUDANTE', 'VISITANTE', 'ADMIN');

-- CreateEnum
CREATE TYPE "StatusCarteirinha" AS ENUM ('ATIVA', 'BLOQUEADA', 'PERDIDA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "TipoMovimentacao" AS ENUM ('CREDITO_RECARGA', 'ESTORNO', 'AJUSTE_MANUAL');

-- CreateEnum
CREATE TYPE "TipoCompra" AS ENUM ('RECARGA_CREDITO', 'REFEICAO_VISITANTE');

-- CreateEnum
CREATE TYPE "StatusCompra" AS ENUM ('PENDENTE', 'PAGA', 'EXPIRADA', 'CANCELADA', 'ESTORNADA');

-- CreateEnum
CREATE TYPE "MetodoPagamento" AS ENUM ('PIX');

-- CreateEnum
CREATE TYPE "StatusPagamento" AS ENUM ('PENDENTE', 'CONFIRMADO', 'FALHOU', 'EXPIRADO', 'ESTORNADO');

-- CreateEnum
CREATE TYPE "StatusPasse" AS ENUM ('ATIVO', 'UTILIZADO', 'EXPIRADO', 'CANCELADO', 'BLOQUEADO');

-- CreateEnum
CREATE TYPE "ResultadoTentativaSenha" AS ENUM ('SUCESSO', 'SENHA_INVALIDA', 'SENHA_EXPIRADA', 'SENHA_JA_UTILIZADA', 'PAGAMENTO_NAO_CONFIRMADO', 'BLOQUEADO_POR_TENTATIVAS');

-- CreateEnum
CREATE TYPE "StatusTotem" AS ENUM ('ATIVO', 'INATIVO', 'MANUTENCAO', 'ERRO');

-- CreateEnum
CREATE TYPE "FormatoTag" AS ENUM ('CARTAO', 'CHAVEIRO');

-- CreateEnum
CREATE TYPE "StatusTag" AS ENUM ('DISPONIVEL', 'RESERVADA', 'EM_USO', 'PRESA', 'PERDIDA', 'DANIFICADA', 'MANUTENCAO');

-- CreateEnum
CREATE TYPE "StatusDispensacao" AS ENUM ('SOLICITADA', 'TAG_RESERVADA', 'ENVIADA_AO_TOTEM', 'LIBERANDO', 'ENTREGUE', 'FALHA', 'CANCELADA', 'EXPIRADA');

-- CreateEnum
CREATE TYPE "TipoEventoDispensacao" AS ENUM ('SOLICITACAO_CRIADA', 'TAG_RESERVADA', 'ORDEM_ENVIADA', 'MOTOR_ACIONADO', 'SENSOR_PASSAGEM', 'RFID_LIDO', 'ENTREGA_CONFIRMADA', 'FALHA_MECANICA', 'FALHA_LEITURA_RFID', 'TIMEOUT', 'CANCELADA', 'RECUPERACAO_MANUAL');

-- CreateEnum
CREATE TYPE "OrigemEvento" AS ENUM ('BACKEND', 'TABLET', 'ESP32', 'ADMIN');

-- CreateEnum
CREATE TYPE "StatusEmprestimo" AS ENUM ('EM_USO', 'DEVOLVIDO', 'NAO_DEVOLVIDO', 'PERDIDO', 'DANIFICADO');

-- CreateEnum
CREATE TYPE "ResultadoConsultaCarteirinha" AS ENUM ('CREDITOS_CONFIRMADOS', 'SEM_CREDITOS', 'CARTEIRINHA_DESCONHECIDA', 'CARTEIRINHA_BLOQUEADA');

-- CreateEnum
CREATE TYPE "NivelLog" AS ENUM ('INFO', 'AVISO', 'ERRO');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" UUID NOT NULL,
    "tipo" "TipoUsuario" NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT,
    "telefone" TEXT,
    "cpf" TEXT,
    "matricula" TEXT,
    "senhaHash" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessoes_usuario" (
    "id" UUID NOT NULL,
    "usuarioId" UUID NOT NULL,
    "refreshTokenHash" TEXT NOT NULL,
    "userAgent" TEXT,
    "ipOrigem" TEXT,
    "expiraEm" TIMESTAMP(3) NOT NULL,
    "revogadoEm" TIMESTAMP(3),
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessoes_usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "carteirinhas" (
    "id" UUID NOT NULL,
    "usuarioId" UUID NOT NULL,
    "uidRfid" TEXT NOT NULL,
    "status" "StatusCarteirinha" NOT NULL DEFAULT 'ATIVA',
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "carteirinhas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contas_credito" (
    "id" UUID NOT NULL,
    "usuarioId" UUID NOT NULL,
    "saldoCentavos" INTEGER NOT NULL DEFAULT 0,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contas_credito_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "movimentacoes" (
    "id" UUID NOT NULL,
    "contaId" UUID NOT NULL,
    "tipo" "TipoMovimentacao" NOT NULL,
    "valorCentavos" INTEGER NOT NULL,
    "saldoAposCentavos" INTEGER NOT NULL,
    "compraId" UUID,
    "descricao" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "movimentacoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "produtos" (
    "id" UUID NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "valorCentavos" INTEGER NOT NULL,
    "validadePasseMin" INTEGER NOT NULL DEFAULT 120,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "produtos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compras" (
    "id" UUID NOT NULL,
    "usuarioId" UUID NOT NULL,
    "tipo" "TipoCompra" NOT NULL,
    "produtoId" UUID,
    "valorCentavos" INTEGER NOT NULL,
    "status" "StatusCompra" NOT NULL DEFAULT 'PENDENTE',
    "expiraEm" TIMESTAMP(3),
    "pagaEm" TIMESTAMP(3),
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "compras_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pagamentos" (
    "id" UUID NOT NULL,
    "compraId" UUID NOT NULL,
    "provedor" TEXT NOT NULL,
    "idExterno" TEXT,
    "metodo" "MetodoPagamento" NOT NULL DEFAULT 'PIX',
    "status" "StatusPagamento" NOT NULL DEFAULT 'PENDENTE',
    "valorCentavos" INTEGER NOT NULL,
    "pixCopiaECola" TEXT,
    "expiraEm" TIMESTAMP(3),
    "confirmadoEm" TIMESTAMP(3),
    "simulado" BOOLEAN NOT NULL DEFAULT false,
    "payloadProvedor" JSONB,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pagamentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "eventos_webhook_pagamento" (
    "id" UUID NOT NULL,
    "provedor" TEXT NOT NULL,
    "idEventoExterno" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "pagamentoId" UUID,
    "payload" JSONB NOT NULL,
    "assinaturaValida" BOOLEAN NOT NULL DEFAULT false,
    "processadoEm" TIMESTAMP(3),
    "erro" TEXT,
    "recebidoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "eventos_webhook_pagamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "passes" (
    "id" UUID NOT NULL,
    "compraId" UUID NOT NULL,
    "usuarioId" UUID NOT NULL,
    "senha" TEXT NOT NULL,
    "status" "StatusPasse" NOT NULL DEFAULT 'ATIVO',
    "expiraEm" TIMESTAMP(3) NOT NULL,
    "utilizadoEm" TIMESTAMP(3),
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "passes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tentativas_senha" (
    "id" UUID NOT NULL,
    "totemId" UUID,
    "passeId" UUID,
    "ipOrigem" TEXT,
    "resultado" "ResultadoTentativaSenha" NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tentativas_senha_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "totens" (
    "id" UUID NOT NULL,
    "nome" TEXT NOT NULL,
    "localizacao" TEXT,
    "status" "StatusTotem" NOT NULL DEFAULT 'ATIVO',
    "apiKeyHash" TEXT NOT NULL,
    "firmwareVersao" TEXT,
    "ultimoContatoEm" TIMESTAMP(3),
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "totens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tags" (
    "id" UUID NOT NULL,
    "uidRfid" TEXT NOT NULL,
    "codigo" TEXT,
    "formato" "FormatoTag" NOT NULL,
    "status" "StatusTag" NOT NULL DEFAULT 'DISPONIVEL',
    "totemId" UUID,
    "posicao" INTEGER,
    "observacao" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dispensacoes" (
    "id" UUID NOT NULL,
    "passeId" UUID NOT NULL,
    "totemId" UUID NOT NULL,
    "tagId" UUID,
    "chaveIdempotencia" TEXT NOT NULL,
    "status" "StatusDispensacao" NOT NULL DEFAULT 'SOLICITADA',
    "uidLido" TEXT,
    "motivoFalha" TEXT,
    "expiraEm" TIMESTAMP(3) NOT NULL,
    "solicitadaEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "concluidaEm" TIMESTAMP(3),
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dispensacoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "eventos_dispensacao" (
    "id" UUID NOT NULL,
    "dispensacaoId" UUID NOT NULL,
    "tipo" "TipoEventoDispensacao" NOT NULL,
    "origem" "OrigemEvento" NOT NULL,
    "uidRfid" TEXT,
    "detalhes" JSONB,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "eventos_dispensacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "emprestimos_tag" (
    "id" UUID NOT NULL,
    "tagId" UUID NOT NULL,
    "passeId" UUID NOT NULL,
    "dispensacaoId" UUID NOT NULL,
    "status" "StatusEmprestimo" NOT NULL DEFAULT 'EM_USO',
    "entregueEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "devolvidoEm" TIMESTAMP(3),
    "observacao" TEXT,

    CONSTRAINT "emprestimos_tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consultas_carteirinha" (
    "id" UUID NOT NULL,
    "totemId" UUID NOT NULL,
    "carteirinhaId" UUID,
    "uidLido" TEXT NOT NULL,
    "resultado" "ResultadoConsultaCarteirinha" NOT NULL,
    "saldoCentavos" INTEGER,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "consultas_carteirinha_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "logs_totem" (
    "id" UUID NOT NULL,
    "totemId" UUID NOT NULL,
    "nivel" "NivelLog" NOT NULL DEFAULT 'INFO',
    "evento" TEXT NOT NULL,
    "mensagem" TEXT,
    "detalhes" JSONB,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "logs_totem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_cpf_key" ON "usuarios"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_matricula_key" ON "usuarios"("matricula");

-- CreateIndex
CREATE INDEX "usuarios_tipo_idx" ON "usuarios"("tipo");

-- CreateIndex
CREATE UNIQUE INDEX "sessoes_usuario_refreshTokenHash_key" ON "sessoes_usuario"("refreshTokenHash");

-- CreateIndex
CREATE INDEX "sessoes_usuario_usuarioId_idx" ON "sessoes_usuario"("usuarioId");

-- CreateIndex
CREATE INDEX "sessoes_usuario_expiraEm_idx" ON "sessoes_usuario"("expiraEm");

-- CreateIndex
CREATE UNIQUE INDEX "carteirinhas_uidRfid_key" ON "carteirinhas"("uidRfid");

-- CreateIndex
CREATE INDEX "carteirinhas_usuarioId_idx" ON "carteirinhas"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "contas_credito_usuarioId_key" ON "contas_credito"("usuarioId");

-- CreateIndex
CREATE INDEX "movimentacoes_contaId_criadoEm_idx" ON "movimentacoes"("contaId", "criadoEm");

-- CreateIndex
CREATE UNIQUE INDEX "movimentacoes_compraId_tipo_key" ON "movimentacoes"("compraId", "tipo");

-- CreateIndex
CREATE INDEX "compras_usuarioId_criadoEm_idx" ON "compras"("usuarioId", "criadoEm");

-- CreateIndex
CREATE INDEX "compras_status_idx" ON "compras"("status");

-- CreateIndex
CREATE INDEX "pagamentos_compraId_idx" ON "pagamentos"("compraId");

-- CreateIndex
CREATE INDEX "pagamentos_status_idx" ON "pagamentos"("status");

-- CreateIndex
CREATE UNIQUE INDEX "pagamentos_provedor_idExterno_key" ON "pagamentos"("provedor", "idExterno");

-- CreateIndex
CREATE INDEX "eventos_webhook_pagamento_pagamentoId_idx" ON "eventos_webhook_pagamento"("pagamentoId");

-- CreateIndex
CREATE UNIQUE INDEX "eventos_webhook_pagamento_provedor_idEventoExterno_key" ON "eventos_webhook_pagamento"("provedor", "idEventoExterno");

-- CreateIndex
CREATE UNIQUE INDEX "passes_compraId_key" ON "passes"("compraId");

-- CreateIndex
CREATE UNIQUE INDEX "passes_senha_key" ON "passes"("senha");

-- CreateIndex
CREATE INDEX "passes_usuarioId_idx" ON "passes"("usuarioId");

-- CreateIndex
CREATE INDEX "passes_status_expiraEm_idx" ON "passes"("status", "expiraEm");

-- CreateIndex
CREATE INDEX "tentativas_senha_totemId_criadoEm_idx" ON "tentativas_senha"("totemId", "criadoEm");

-- CreateIndex
CREATE INDEX "tentativas_senha_ipOrigem_criadoEm_idx" ON "tentativas_senha"("ipOrigem", "criadoEm");

-- CreateIndex
CREATE INDEX "tentativas_senha_passeId_idx" ON "tentativas_senha"("passeId");

-- CreateIndex
CREATE UNIQUE INDEX "totens_nome_key" ON "totens"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "totens_apiKeyHash_key" ON "totens"("apiKeyHash");

-- CreateIndex
CREATE UNIQUE INDEX "tags_uidRfid_key" ON "tags"("uidRfid");

-- CreateIndex
CREATE UNIQUE INDEX "tags_codigo_key" ON "tags"("codigo");

-- CreateIndex
CREATE INDEX "tags_status_idx" ON "tags"("status");

-- CreateIndex
CREATE UNIQUE INDEX "tags_totemId_posicao_key" ON "tags"("totemId", "posicao");

-- CreateIndex
CREATE UNIQUE INDEX "dispensacoes_chaveIdempotencia_key" ON "dispensacoes"("chaveIdempotencia");

-- CreateIndex
CREATE INDEX "dispensacoes_passeId_idx" ON "dispensacoes"("passeId");

-- CreateIndex
CREATE INDEX "dispensacoes_tagId_idx" ON "dispensacoes"("tagId");

-- CreateIndex
CREATE INDEX "dispensacoes_totemId_status_idx" ON "dispensacoes"("totemId", "status");

-- CreateIndex
CREATE INDEX "dispensacoes_status_expiraEm_idx" ON "dispensacoes"("status", "expiraEm");

-- CreateIndex
CREATE INDEX "eventos_dispensacao_dispensacaoId_criadoEm_idx" ON "eventos_dispensacao"("dispensacaoId", "criadoEm");

-- CreateIndex
CREATE UNIQUE INDEX "emprestimos_tag_dispensacaoId_key" ON "emprestimos_tag"("dispensacaoId");

-- CreateIndex
CREATE INDEX "emprestimos_tag_tagId_status_idx" ON "emprestimos_tag"("tagId", "status");

-- CreateIndex
CREATE INDEX "emprestimos_tag_passeId_idx" ON "emprestimos_tag"("passeId");

-- CreateIndex
CREATE INDEX "consultas_carteirinha_totemId_criadoEm_idx" ON "consultas_carteirinha"("totemId", "criadoEm");

-- CreateIndex
CREATE INDEX "consultas_carteirinha_carteirinhaId_idx" ON "consultas_carteirinha"("carteirinhaId");

-- CreateIndex
CREATE INDEX "logs_totem_totemId_criadoEm_idx" ON "logs_totem"("totemId", "criadoEm");

-- CreateIndex
CREATE INDEX "logs_totem_nivel_criadoEm_idx" ON "logs_totem"("nivel", "criadoEm");

-- AddForeignKey
ALTER TABLE "sessoes_usuario" ADD CONSTRAINT "sessoes_usuario_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "carteirinhas" ADD CONSTRAINT "carteirinhas_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contas_credito" ADD CONSTRAINT "contas_credito_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimentacoes" ADD CONSTRAINT "movimentacoes_contaId_fkey" FOREIGN KEY ("contaId") REFERENCES "contas_credito"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimentacoes" ADD CONSTRAINT "movimentacoes_compraId_fkey" FOREIGN KEY ("compraId") REFERENCES "compras"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compras" ADD CONSTRAINT "compras_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compras" ADD CONSTRAINT "compras_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "produtos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagamentos" ADD CONSTRAINT "pagamentos_compraId_fkey" FOREIGN KEY ("compraId") REFERENCES "compras"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eventos_webhook_pagamento" ADD CONSTRAINT "eventos_webhook_pagamento_pagamentoId_fkey" FOREIGN KEY ("pagamentoId") REFERENCES "pagamentos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "passes" ADD CONSTRAINT "passes_compraId_fkey" FOREIGN KEY ("compraId") REFERENCES "compras"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "passes" ADD CONSTRAINT "passes_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tentativas_senha" ADD CONSTRAINT "tentativas_senha_totemId_fkey" FOREIGN KEY ("totemId") REFERENCES "totens"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tentativas_senha" ADD CONSTRAINT "tentativas_senha_passeId_fkey" FOREIGN KEY ("passeId") REFERENCES "passes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tags" ADD CONSTRAINT "tags_totemId_fkey" FOREIGN KEY ("totemId") REFERENCES "totens"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dispensacoes" ADD CONSTRAINT "dispensacoes_passeId_fkey" FOREIGN KEY ("passeId") REFERENCES "passes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dispensacoes" ADD CONSTRAINT "dispensacoes_totemId_fkey" FOREIGN KEY ("totemId") REFERENCES "totens"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dispensacoes" ADD CONSTRAINT "dispensacoes_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "tags"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eventos_dispensacao" ADD CONSTRAINT "eventos_dispensacao_dispensacaoId_fkey" FOREIGN KEY ("dispensacaoId") REFERENCES "dispensacoes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emprestimos_tag" ADD CONSTRAINT "emprestimos_tag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "tags"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emprestimos_tag" ADD CONSTRAINT "emprestimos_tag_passeId_fkey" FOREIGN KEY ("passeId") REFERENCES "passes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emprestimos_tag" ADD CONSTRAINT "emprestimos_tag_dispensacaoId_fkey" FOREIGN KEY ("dispensacaoId") REFERENCES "dispensacoes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consultas_carteirinha" ADD CONSTRAINT "consultas_carteirinha_totemId_fkey" FOREIGN KEY ("totemId") REFERENCES "totens"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consultas_carteirinha" ADD CONSTRAINT "consultas_carteirinha_carteirinhaId_fkey" FOREIGN KEY ("carteirinhaId") REFERENCES "carteirinhas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "logs_totem" ADD CONSTRAINT "logs_totem_totemId_fkey" FOREIGN KEY ("totemId") REFERENCES "totens"("id") ON DELETE CASCADE ON UPDATE CASCADE;
