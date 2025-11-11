import express from 'express';
import { getMicrosites, getMicrositeById, createMicrosite, updateMicrosite, deleteMicrosite } from '../controllers/microsite.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();
router.use(authenticate);

router.get('/', getMicrosites);
router.get('/:id', getMicrositeById);
router.post('/', createMicrosite);
router.put('/:id', updateMicrosite);
router.delete('/:id', deleteMicrosite);

export default router;
