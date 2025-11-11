import express from 'express';
import { body, query as queryValidator, param } from 'express-validator';
import {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  addTimelineEntry
} from '../controllers/customer.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import validate from '../middleware/validate.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/v1/customers
 * @desc    Get all customers with filtering and pagination
 * @access  Private
 */
router.get(
  '/',
  [
    queryValidator('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    queryValidator('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    queryValidator('status').optional().isIn(['active', 'inactive', 'pending']).withMessage('Invalid status'),
    queryValidator('sortBy').optional().isIn(['created_at', 'first_name', 'last_name', 'customer_since']).withMessage('Invalid sort field'),
    queryValidator('sortOrder').optional().isIn(['ASC', 'DESC']).withMessage('Sort order must be ASC or DESC'),
    validate
  ],
  getCustomers
);

/**
 * @route   GET /api/v1/customers/:id
 * @desc    Get single customer by ID
 * @access  Private
 */
router.get(
  '/:id',
  [
    param('id').isInt().withMessage('Customer ID must be an integer'),
    validate
  ],
  getCustomerById
);

/**
 * @route   POST /api/v1/customers
 * @desc    Create new customer
 * @access  Private
 */
router.post(
  '/',
  [
    body('firstName').trim().notEmpty().withMessage('First name is required'),
    body('lastName').trim().notEmpty().withMessage('Last name is required'),
    body('email').optional().isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('phone').optional().isMobilePhone().withMessage('Valid phone number is required'),
    body('dateOfBirth').optional().isISO8601().withMessage('Valid date of birth is required'),
    body('communicationPreference').optional().isIn(['email', 'phone', 'sms', 'none']).withMessage('Invalid communication preference'),
    validate
  ],
  createCustomer
);

/**
 * @route   PUT /api/v1/customers/:id
 * @desc    Update customer
 * @access  Private
 */
router.put(
  '/:id',
  [
    param('id').isInt().withMessage('Customer ID must be an integer'),
    body('firstName').optional().trim().notEmpty().withMessage('First name cannot be empty'),
    body('lastName').optional().trim().notEmpty().withMessage('Last name cannot be empty'),
    body('email').optional().isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('phone').optional().isMobilePhone().withMessage('Valid phone number is required'),
    body('status').optional().isIn(['active', 'inactive', 'pending']).withMessage('Invalid status'),
    body('communicationPreference').optional().isIn(['email', 'phone', 'sms', 'none']).withMessage('Invalid communication preference'),
    validate
  ],
  updateCustomer
);

/**
 * @route   DELETE /api/v1/customers/:id
 * @desc    Delete customer
 * @access  Private (Admin only)
 */
router.delete(
  '/:id',
  [
    param('id').isInt().withMessage('Customer ID must be an integer'),
    validate
  ],
  authorize('admin'),
  deleteCustomer
);

/**
 * @route   POST /api/v1/customers/:id/timeline
 * @desc    Add timeline entry for customer
 * @access  Private
 */
router.post(
  '/:id/timeline',
  [
    param('id').isInt().withMessage('Customer ID must be an integer'),
    body('entryType').isIn(['note', 'call', 'email', 'meeting', 'claim', 'policy_change', 'payment']).withMessage('Invalid entry type'),
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('description').optional().trim(),
    validate
  ],
  addTimelineEntry
);

export default router;
