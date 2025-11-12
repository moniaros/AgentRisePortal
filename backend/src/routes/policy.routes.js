import express from 'express';
import { body, param } from 'express-validator';
import {
  getPolicies,
  getPolicyById,
  createPolicy,
  updatePolicy,
  deletePolicy,
  uploadHandler,
  uploadAndExtractPolicy,
  syncPolicyToCRM,
  getCustomerPolicies
} from '../controllers/policy.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import validate from '../middleware/validate.js';

const router = express.Router();
router.use(authenticate);

// Policy document upload and AI extraction
router.post('/upload', uploadHandler, uploadAndExtractPolicy);

// Sync extracted data to CRM
router.post('/sync', [
  body('extractedData').isObject(),
  body('extractedData.policy').isObject(),
  body('extractedData.policyHolder').isObject(),
  validate
], syncPolicyToCRM);

// Standard policy CRUD
router.get('/', getPolicies);
router.get('/:id', [param('id').isInt(), validate], getPolicyById);
router.post('/', [
  body('customerId').isInt(),
  body('policyNumber').trim().notEmpty(),
  body('policyType').isIn(['auto', 'home', 'life', 'health', 'commercial', 'umbrella', 'renters', 'other']),
  body('insurer').trim().notEmpty(),
  body('effectiveDate').isISO8601(),
  body('expirationDate').isISO8601(),
  body('premiumAmount').isFloat({ min: 0 }),
  validate
], createPolicy);
router.put('/:id', [param('id').isInt(), validate], updatePolicy);
router.delete('/:id', [param('id').isInt(), validate], authorize('admin'), deletePolicy);

export default router;
