import express from 'express';
import { getDashboardStats, getRevenueAnalytics, getLeadFunnelAnalytics } from '../controllers/analytics.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();
router.use(authenticate);

router.get('/dashboard', getDashboardStats);
router.get('/revenue', getRevenueAnalytics);
router.get('/lead-funnel', getLeadFunnelAnalytics);

export default router;
