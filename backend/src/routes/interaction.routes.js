import express from 'express';
import { body, param } from 'express-validator';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  getOpportunityInteractions,
  createInteraction,
  updateInteraction,
  deleteInteraction,
  getInteractionStats
} from '../controllers/interaction.controller.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/v1/opportunities/:opportunityId/interactions
 * @desc    Get all interactions for an opportunity
 * @access  Private
 */
router.get('/:opportunityId/interactions', [
  param('opportunityId').isInt().withMessage('Invalid opportunity ID')
], validate, getOpportunityInteractions);

/**
 * @route   GET /api/v1/opportunities/:opportunityId/interactions/stats
 * @desc    Get interaction statistics for an opportunity
 * @access  Private
 */
router.get('/:opportunityId/interactions/stats', [
  param('opportunityId').isInt().withMessage('Invalid opportunity ID')
], validate, getInteractionStats);

/**
 * @route   POST /api/v1/opportunities/:opportunityId/interactions
 * @desc    Create new interaction (log communication)
 * @access  Private
 */
router.post('/:opportunityId/interactions', [
  param('opportunityId').isInt().withMessage('Invalid opportunity ID'),
  body('interactionType').isIn(['email', 'sms', 'phone', 'meeting', 'viber', 'whatsapp', 'note']).withMessage('Invalid interaction type'),
  body('direction').optional().isIn(['inbound', 'outbound']),
  body('subject').optional().trim(),
  body('content').optional().trim(),
  body('recipient').optional().trim(),
  body('sentVia').optional().trim(),
  body('deliveryStatus').optional().isIn(['pending', 'sent', 'delivered', 'failed', 'bounced'])
], validate, createInteraction);

/**
 * @route   PUT /api/v1/interactions/:id
 * @desc    Update interaction
 * @access  Private
 */
router.put('/:id', [
  param('id').isInt().withMessage('Invalid interaction ID'),
  body('subject').optional().trim(),
  body('content').optional().trim(),
  body('deliveryStatus').optional().isIn(['pending', 'sent', 'delivered', 'failed', 'bounced'])
], validate, updateInteraction);

/**
 * @route   DELETE /api/v1/interactions/:id
 * @desc    Delete interaction
 * @access  Private
 */
router.delete('/:id', [
  param('id').isInt().withMessage('Invalid interaction ID')
], validate, deleteInteraction);

export default router;
