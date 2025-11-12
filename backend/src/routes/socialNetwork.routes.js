import express from 'express';
import { param } from 'express-validator';
import {
  getConnections,
  initiateConnection,
  handleCallback,
  disconnect,
  refreshConnection
} from '../controllers/socialNetwork.controller.js';
import { authenticate } from '../middleware/auth.js';
import validate from '../middleware/validate.js';

const router = express.Router();

/**
 * @route   GET /api/v1/social/connections
 * @desc    Get all social network connections for current user
 * @access  Private
 */
router.get('/connections', authenticate, getConnections);

/**
 * @route   POST /api/v1/social/connect/:platform
 * @desc    Initiate OAuth connection for a platform
 * @access  Private
 */
router.post(
  '/connect/:platform',
  authenticate,
  [
    param('platform')
      .isIn(['facebook', 'instagram', 'linkedin', 'x', 'tiktok', 'youtube'])
      .withMessage('Invalid platform'),
    validate
  ],
  initiateConnection
);

/**
 * @route   GET /api/v1/social/callback/:platform
 * @desc    Handle OAuth callback from platform
 * @access  Public (but requires valid OAuth state)
 */
router.get(
  '/callback/:platform',
  [
    param('platform')
      .isIn(['facebook', 'instagram', 'linkedin', 'x', 'tiktok', 'youtube'])
      .withMessage('Invalid platform'),
    validate
  ],
  handleCallback
);

/**
 * @route   DELETE /api/v1/social/connections/:id
 * @desc    Disconnect a social network
 * @access  Private
 */
router.delete(
  '/connections/:id',
  authenticate,
  [
    param('id').isInt().withMessage('Connection ID must be an integer'),
    validate
  ],
  disconnect
);

/**
 * @route   POST /api/v1/social/connections/:id/refresh
 * @desc    Refresh access token for a connection
 * @access  Private
 */
router.post(
  '/connections/:id/refresh',
  authenticate,
  [
    param('id').isInt().withMessage('Connection ID must be an integer'),
    validate
  ],
  refreshConnection
);

export default router;
