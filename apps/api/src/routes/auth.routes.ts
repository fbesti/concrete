import { Router } from 'express';
import type { Router as ExpressRouter } from 'express';
import { validateRequest } from '../middleware/validation';
import { requireAuth } from '../middleware/auth.middleware';
import * as authController from '../controllers/auth.controller';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../schemas/auth.schemas';

const router: ExpressRouter = Router();

/**
 * @route POST /api/v1/auth/register
 * @desc Register a new user
 * @access Public
 */
router.post(
  '/register',
  validateRequest({ body: registerSchema.shape.body }),
  authController.register
);

/**
 * @route POST /api/v1/auth/login
 * @desc Login user
 * @access Public
 */
router.post(
  '/login',
  validateRequest({ body: loginSchema.shape.body }),
  authController.login
);

/**
 * @route POST /api/v1/auth/refresh
 * @desc Refresh access token
 * @access Public
 */
router.post(
  '/refresh',
  validateRequest({ body: refreshTokenSchema.shape.body }),
  authController.refreshToken
);

/**
 * @route POST /api/v1/auth/logout
 * @desc Logout user
 * @access Private
 */
router.post('/logout', requireAuth, authController.logout);

/**
 * @route POST /api/v1/auth/forgot-password
 * @desc Request password reset
 * @access Public
 */
router.post(
  '/forgot-password',
  validateRequest({ body: forgotPasswordSchema.shape.body }),
  authController.forgotPassword
);

/**
 * @route POST /api/v1/auth/reset-password
 * @desc Reset password with token
 * @access Public
 */
router.post(
  '/reset-password',
  validateRequest({ body: resetPasswordSchema.shape.body }),
  authController.resetPassword
);

/**
 * @route GET /api/v1/auth/me
 * @desc Get current user profile
 * @access Private
 */
router.get('/me', requireAuth, authController.getCurrentUser);

/**
 * @route GET /api/v1/auth/validate
 * @desc Validate token
 * @access Private
 */
router.get('/validate', requireAuth, authController.validateToken);

export default router;
