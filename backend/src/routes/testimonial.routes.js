import express from 'express';
import { getTestimonials, createTestimonial, updateTestimonialStatus, deleteTestimonial } from '../controllers/testimonial.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getTestimonials); // Public
router.post('/', createTestimonial); // Public submission

router.use(authenticate); // Require auth for moderation
router.put('/:id/status', authorize('admin'), updateTestimonialStatus);
router.delete('/:id', authorize('admin'), deleteTestimonial);

export default router;
