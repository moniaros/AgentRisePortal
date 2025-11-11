import express from 'express';
import { uploadHandler, analyzePolicyDocument, getGapAnalysis } from '../controllers/gapAnalysis.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();
router.use(authenticate);

router.post('/upload', uploadHandler, analyzePolicyDocument);
router.get('/customer/:customerId', getGapAnalysis);

export default router;
