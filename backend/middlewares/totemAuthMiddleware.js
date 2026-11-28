import { createHash } from 'node:crypto';
import prisma from '../config/prisma.js';

// Autentica o equipamento usando o hash SHA-256 da chave cadastrada no banco.
export async function autenticarTotem(req, res, next) {
  try {
    const chave = req.get('x-totem-key');
    if (!chave) {
      return res.status(401).json({ sucesso: false, mensagem: 'Chave do totem não informada.' });
    }

    const apiKeyHash = createHash('sha256').update(chave).digest('hex');
    const totem = await prisma.totem.findUnique({ where: { apiKeyHash } });
    if (!totem || totem.status !== 'ATIVO') {
      return res.status(401).json({ sucesso: false, mensagem: 'Totem inválido ou inativo.' });
    }

    // Registra o último contato e disponibiliza o totem autenticado ao controller.
    await prisma.totem.update({ where: { id: totem.id }, data: { ultimoContatoEm: new Date() } });
    req.totem = totem;
    return next();
  } catch (erro) {
    return next(erro);
  }
}
