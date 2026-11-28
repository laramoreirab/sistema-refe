import { ApiError } from '../dev-utils/ApiError.js';
import { consultarCarteirinha } from '../models/TotemModel.js';

class CarterinhasController {
  // Busca cadastro e créditos pelo UID lido pelo RFID e devolve os dados do extrato.
  static async consultarNoTotem(req, res, next) {
    try {
      const { uidRfid } = req.body;
      if (!uidRfid) {
        throw ApiError.validacao('Informe o UID RFID.');
      }
      const resultado = await consultarCarteirinha(String(uidRfid).trim(), req.totem.id);
      if (resultado.resultado === 'CARTEIRINHA_DESCONHECIDA') {
        return res.status(404).json({ sucesso: false, resultado: resultado.resultado, mensagem: 'Carteirinha não encontrada.' });
      }
      if (resultado.resultado === 'CARTEIRINHA_BLOQUEADA') {
        return res.status(403).json({ sucesso: false, resultado: resultado.resultado, mensagem: 'Carteirinha bloqueada. Procure um atendente.' });
      }
      return res.json({ sucesso: true, ...resultado });
    } catch (erro) {
      return next(erro);
    }
  }
}

export default CarterinhasController;

