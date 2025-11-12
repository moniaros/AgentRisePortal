import express from 'express';
import { body, param } from 'express-validator';
import {
  getCustomerBeneficiaries,
  getBeneficiaryById,
  createBeneficiary,
  updateBeneficiary,
  deleteBeneficiary,
  linkBeneficiaryToPolicy,
  updateBeneficiaryLink,
  removeBeneficiaryFromPolicy,
  getPolicyBeneficiaries
} from '../controllers/beneficiary.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import validate from '../middleware/validate.js';

const router = express.Router();
router.use(authenticate);

// Beneficiary CRUD
router.get('/beneficiaries/:id', [param('id').isInt(), validate], getBeneficiaryById);
router.put('/beneficiaries/:id', [param('id').isInt(), validate], updateBeneficiary);
router.delete('/beneficiaries/:id', [param('id').isInt(), validate], authorize('admin'), deleteBeneficiary);

// Customer beneficiaries
router.get('/customers/:customerId/beneficiaries', [param('customerId').isInt(), validate], getCustomerBeneficiaries);
router.post('/customers/:customerId/beneficiaries', [
  param('customerId').isInt(),
  body('firstName').trim().notEmpty(),
  body('lastName').trim().notEmpty(),
  body('relationship').trim().notEmpty(),
  validate
], createBeneficiary);

// Policy beneficiaries (linking)
router.get('/policies/:policyId/beneficiaries', [param('policyId').isInt(), validate], getPolicyBeneficiaries);
router.post('/policies/:policyId/beneficiaries', [
  param('policyId').isInt(),
  body('contactId').isInt(),
  body('beneficiaryType').isIn(['primary', 'contingent']),
  body('allocationPercentage').isFloat({ min: 0, max: 100 }),
  body('relationship').trim().notEmpty(),
  validate
], linkBeneficiaryToPolicy);
router.put('/policies/:policyId/beneficiaries/:linkId', [
  param('policyId').isInt(),
  param('linkId').isInt(),
  validate
], updateBeneficiaryLink);
router.delete('/policies/:policyId/beneficiaries/:linkId', [
  param('policyId').isInt(),
  param('linkId').isInt(),
  validate
], removeBeneficiaryFromPolicy);

export default router;
