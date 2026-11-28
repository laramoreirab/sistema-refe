import { Router } from 'express';
import TotemController from '../controllers/totemController.js';
import CarterinhasController from '../controllers/carterinhasController.js';
import { autenticarTotem } from '../middlewares/totemAuthMiddleware.js';

const routerTotem = Router();

// Protege todas as operações do equipamento com sua chave cadastrada.
routerTotem.use(autenticarTotem);
// Valida a senha e publica no MQTT o comando de liberação da tag.
routerTotem.post('/senhas/validar', TotemController.validarSenha);
// Confirma manualmente a entrega, caso o dispositivo use HTTP em vez de MQTT.
routerTotem.post('/dispensacoes/confirmar-entrega', TotemController.confirmarEntrega);
// Consulta o saldo e as movimentações pelo UID da carteirinha.
routerTotem.post('/carteirinhas/consultar', CarterinhasController.consultarNoTotem);

export default routerTotem;
