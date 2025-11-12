import express from 'express';
import { body, param } from 'express-validator';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  getInquiries,
  getInquiryById,
  createInquiry,
  convertToOpportunity,
  updateInquiryStatus
} from '../controllers/inquiry.controller.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/v1/inquiries
 * @desc    Get all inquiries (leads inbox)
 * @access  Private
 */
router.get('/', getInquiries);

/**
 * @route   GET /api/v1/inquiries/:id
 * @desc    Get inquiry by ID
 * @access  Private
 */
router.get('/:id', [
  param('id').isInt().withMessage('Invalid inquiry ID')
], validate, getInquiryById);

/**
 * @route   POST /api/v1/inquiries
 * @desc    Create new inquiry (from microsite)
 * @access  Private (or Public with API key)
 */
router.post('/', [
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').optional().trim(),
  body('inquiryType').optional().isIn(['general', 'quote_request', 'policy_question', 'claim', 'other']),
  body('policyInterest').optional().trim(),
  body('message').optional().trim()
], validate, createInquiry);

/**
 * @route   POST /api/v1/inquiries/:id/convert
 * @desc    Convert inquiry to opportunity
 * @access  Private
 */
router.post('/:id/convert', [
  param('id').isInt().withMessage('Invalid inquiry ID'),
  body('title').optional().trim(),
  body('estimatedValue').optional().isFloat({ min: 0 }),
  body('policyType').optional().trim()
], validate, convertToOpportunity);

/**
 * @route   PUT /api/v1/inquiries/:id/status
 * @desc    Update inquiry status
 * @access  Private
 */
router.put('/:id/status', [
  param('id').isInt().withMessage('Invalid inquiry ID'),
  body('status').isIn(['new', 'reviewed', 'converted', 'spam', 'duplicate']).withMessage('Invalid status')
], validate, updateInquiryStatus);

export default router;
