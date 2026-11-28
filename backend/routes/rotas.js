import { Router } from 'express';
import rotasTotem from './rotasTotem.js';

// Roteador intermediário: agrupa os recursos da API sob /totem.
const router = Router();
router.use('/totem', rotasTotem);

export default router;
