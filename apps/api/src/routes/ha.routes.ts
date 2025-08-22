import { Router } from 'express';
import type { Router as ExpressRouter } from 'express';
import { validateRequest } from '../middleware/validation';
import { requireAuth, requireRole } from '../middleware/auth.middleware';
import { UserRole } from '@prisma/client';
import * as haController from '../controllers/ha.controller';
import {
  createHASchema,
  updateHASchema,
  getHASchema,
  listHASchema,
  addHAMemberSchema,
  removeHAMemberSchema,
  listHAMembersSchema,
} from '../schemas/ha.schemas';

const router: ExpressRouter = Router();

/**
 * @route POST /api/v1/ha
 * @desc Create a new house association
 * @access Private (HA_MANAGER only)
 */
router.post(
  '/',
  requireAuth,
  requireRole(UserRole.HA_MANAGER),
  validateRequest({ body: createHASchema.shape.body }),
  haController.createHA
);

/**
 * @route GET /api/v1/ha
 * @desc List user's house associations
 * @access Private
 */
router.get(
  '/',
  requireAuth,
  validateRequest({ query: listHASchema.shape.query }),
  haController.listHAs
);

/**
 * @route GET /api/v1/ha/:id
 * @desc Get house association details
 * @access Private (members and manager only)
 */
router.get(
  '/:id',
  requireAuth,
  validateRequest({ params: getHASchema.shape.params }),
  haController.getHA
);

/**
 * @route PUT /api/v1/ha/:id
 * @desc Update house association details
 * @access Private (manager only)
 */
router.put(
  '/:id',
  requireAuth,
  validateRequest({
    params: updateHASchema.shape.params,
    body: updateHASchema.shape.body,
  }),
  haController.updateHA
);

/**
 * @route DELETE /api/v1/ha/:id
 * @desc Delete house association
 * @access Private (manager only)
 */
router.delete(
  '/:id',
  requireAuth,
  validateRequest({ params: getHASchema.shape.params }),
  haController.deleteHA
);

/**
 * @route POST /api/v1/ha/:id/members
 * @desc Add member to house association by kennitala
 * @access Private (manager only)
 */
router.post(
  '/:id/members',
  requireAuth,
  validateRequest({
    params: addHAMemberSchema.shape.params,
    body: addHAMemberSchema.shape.body,
  }),
  haController.addMember
);

/**
 * @route GET /api/v1/ha/:id/members
 * @desc List house association members
 * @access Private (members and manager only)
 */
router.get(
  '/:id/members',
  requireAuth,
  validateRequest({
    params: listHAMembersSchema.shape.params,
    query: listHAMembersSchema.shape.query,
  }),
  haController.listMembers
);

/**
 * @route DELETE /api/v1/ha/:id/members/:userId
 * @desc Remove member from house association
 * @access Private (manager only)
 */
router.delete(
  '/:id/members/:userId',
  requireAuth,
  validateRequest({ params: removeHAMemberSchema.shape.params }),
  haController.removeMember
);

export default router;
