import express from 'express';
import { getRules, createRule, updateRule, deleteRule } from '../controllers/automation.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();
router.use(authenticate);

router.get('/rules', getRules);
router.post('/rules', createRule);
router.put('/rules/:id', updateRule);
router.delete('/rules/:id', deleteRule);

export default router;
