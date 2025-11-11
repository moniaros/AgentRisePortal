import express from 'express';
import { body, param } from 'express-validator';
import { getLeads, getLeadById, createLead, updateLead, deleteLead, convertLead } from '../controllers/lead.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import validate from '../middleware/validate.js';

const router = express.Router();
router.use(authenticate);

router.get('/', getLeads);
router.get('/:id', [param('id').isInt(), validate], getLeadById);
router.post('/', [
  body('firstName').trim().notEmpty(),
  body('lastName').trim().notEmpty(),
  body('email').optional().isEmail().normalizeEmail(),
  validate
], createLead);
router.put('/:id', [param('id').isInt(), validate], updateLead);
router.delete('/:id', [param('id').isInt(), validate], authorize('admin'), deleteLead);
router.post('/:id/convert', [param('id').isInt(), validate], convertLead);

export default router;
