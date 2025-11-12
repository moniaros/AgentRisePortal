import express from 'express';
import { body, param } from 'express-validator';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  getOpportunities,
  getOpportunitiesByStage,
  getOpportunityById,
  createOpportunity,
  updateOpportunity,
  updateOpportunityStage,
  getMyDayOpportunities,
  deleteOpportunity
} from '../controllers/opportunity.controller.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/v1/opportunities
 * @desc    Get all opportunities
 * @access  Private
 */
router.get('/', getOpportunities);

/**
 * @route   GET /api/v1/opportunities/kanban
 * @desc    Get opportunities grouped by stage (for Kanban board)
 * @access  Private
 */
router.get('/kanban', getOpportunitiesByStage);

/**
 * @route   GET /api/v1/opportunities/my-day
 * @desc    Get "My Day" dashboard opportunities
 * @access  Private
 */
router.get('/my-day', getMyDayOpportunities);

/**
 * @route   GET /api/v1/opportunities/:id
 * @desc    Get opportunity by ID
 * @access  Private
 */
router.get('/:id', [
  param('id').isInt().withMessage('Invalid opportunity ID')
], validate, getOpportunityById);

/**
 * @route   POST /api/v1/opportunities
 * @desc    Create new opportunity
 * @access  Private
 */
router.post('/', [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('prospectName').trim().notEmpty().withMessage('Prospect name is required'),
  body('prospectEmail').optional().isEmail().withMessage('Valid email required'),
  body('estimatedValue').optional().isFloat({ min: 0 }),
  body('probability').optional().isInt({ min: 0, max: 100 }),
  body('policyType').optional().trim(),
  body('nextFollowUpDate').optional().isISO8601()
], validate, createOpportunity);

/**
 * @route   PUT /api/v1/opportunities/:id
 * @desc    Update opportunity
 * @access  Private
 */
router.put('/:id', [
  param('id').isInt().withMessage('Invalid opportunity ID'),
  body('title').optional().trim(),
  body('description').optional().trim(),
  body('estimatedValue').optional().isFloat({ min: 0 }),
  body('probability').optional().isInt({ min: 0, max: 100 }),
  body('nextFollowUpDate').optional().isISO8601(),
  body('policyType').optional().trim()
], validate, updateOpportunity);

/**
 * @route   PUT /api/v1/opportunities/:id/stage
 * @desc    Update opportunity stage (for Kanban drag-drop)
 * @access  Private
 */
router.put('/:id/stage', [
  param('id').isInt().withMessage('Invalid opportunity ID'),
  body('stage').isIn(['new', 'contacted', 'proposal', 'won', 'lost']).withMessage('Invalid stage'),
  body('lostReason').optional().trim(),
  body('actualPremium').optional().isFloat({ min: 0 }),
  body('policyId').optional().isInt()
], validate, updateOpportunityStage);

/**
 * @route   DELETE /api/v1/opportunities/:id
 * @desc    Delete opportunity
 * @access  Private
 */
router.delete('/:id', [
  param('id').isInt().withMessage('Invalid opportunity ID')
], validate, deleteOpportunity);

export default router;
