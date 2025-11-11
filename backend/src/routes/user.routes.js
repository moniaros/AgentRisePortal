import express from 'express';
import { param } from 'express-validator';
import { getUsers, getUserById, updateUser, deleteUser } from '../controllers/user.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import validate from '../middleware/validate.js';

const router = express.Router();
router.use(authenticate);

router.get('/', getUsers);
router.get('/:id', [param('id').isInt(), validate], getUserById);
router.put('/:id', [param('id').isInt(), validate], authorize('admin'), updateUser);
router.delete('/:id', [param('id').isInt(), validate], authorize('admin'), deleteUser);

export default router;
