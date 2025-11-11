import express from 'express';
import { getLocations, getReviews, replyToReview } from '../controllers/gbp.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();
router.use(authenticate);

router.get('/locations', getLocations);
router.get('/locations/:locationId/reviews', getReviews);
router.post('/reviews/:reviewId/reply', replyToReview);

export default router;
