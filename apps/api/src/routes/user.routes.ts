import { Router } from 'express';
import type { Router as ExpressRouter } from 'express';
import { validateRequest } from '../middleware/validation';
import { requireAuth, requireHAManager } from '../middleware/auth.middleware';
import * as userController from '../controllers/user.controller';
import {
  updateProfileSchema,
  changePasswordSchema,
} from '../schemas/auth.schemas';
import { UserIdParamSchema, UserQuerySchema } from '../schemas/params.schemas';

const router: ExpressRouter = Router();

/**
 * @route GET /api/v1/users/profile
 * @desc Get current user profile
 * @access Private
 */
router.get('/profile', requireAuth, userController.getProfile);

/**
 * @route PUT /api/v1/users/profile
 * @desc Update current user profile
 * @access Private
 */
router.put(
  '/profile',
  requireAuth,
  validateRequest({ body: updateProfileSchema.shape.body }),
  userController.updateProfile
);

/**
 * @route PUT /api/v1/users/password
 * @desc Change user password
 * @access Private
 */
router.put(
  '/password',
  requireAuth,
  validateRequest({ body: changePasswordSchema.shape.body }),
  userController.changePassword
);

/**
 * @route GET /api/v1/users/memberships
 * @desc Get user's house association memberships
 * @access Private
 */
router.get('/memberships', requireAuth, userController.getUserMemberships);

/**
 * @route GET /api/v1/users/managed-has
 * @desc Get house associations managed by user
 * @access Private
 */
router.get('/managed-has', requireAuth, userController.getManagedHAs);

/**
 * @route GET /api/v1/users/statistics
 * @desc Get user statistics
 * @access Private (HA Manager only)
 */
router.get(
  '/statistics',
  requireAuth,
  requireHAManager,
  userController.getUserStatistics
);

/**
 * @route GET /api/v1/users
 * @desc Get users list with filtering and pagination
 * @access Private (HA Manager only)
 */
router.get(
  '/',
  requireAuth,
  requireHAManager,
  validateRequest({ query: UserQuerySchema }),
  userController.getUsers
);

/**
 * @route GET /api/v1/users/:userId
 * @desc Get user by ID
 * @access Private (Self or HA Manager)
 */
router.get(
  '/:userId',
  requireAuth,
  validateRequest({ params: UserIdParamSchema }),
  userController.getUserById
);

/**
 * @route DELETE /api/v1/users/:userId
 * @desc Delete user account
 * @access Private (Self or HA Manager)
 */
router.delete(
  '/:userId',
  requireAuth,
  validateRequest({ params: UserIdParamSchema }),
  userController.deleteUser
);

export default router;
