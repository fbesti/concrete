import { Request, Response } from 'express';
import { UserRole, User } from '@prisma/client';
import { HAService } from '../services/ha.service';
import {
  createSuccessResponse,
  createErrorResponse,
  ApiError,
} from '../utils/response';
import {
  CreateHARequest,
  UpdateHARequest,
  UpdateHAParams,
  GetHAParams,
  ListHAQuery,
  AddHAMemberRequest,
  AddHAMemberParams,
  RemoveHAMemberParams,
  ListHAMembersParams,
  ListHAMembersQuery,
} from '../schemas/ha.schemas';

interface AuthenticatedRequest extends Request {
  user?: User;
}

/**
 * Create house association controller
 * POST /api/v1/ha
 */
export const createHA = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const haData = req.body as CreateHARequest;
    const userId = req.user!.id;

    // Only HA_MANAGER can create house associations
    if (req.user!.role !== UserRole.HA_MANAGER) {
      res
        .status(403)
        .json(
          createErrorResponse('Only managers can create house associations')
        );
      return;
    }

    const houseAssociation = await HAService.createHA({
      ...haData,
      managerId: userId,
    });

    res.status(201).json(
      createSuccessResponse('House association created successfully', {
        houseAssociation,
      })
    );
  } catch (error) {
    console.error('Create HA error:', error);

    if (error instanceof ApiError) {
      res.status(error.statusCode).json(createErrorResponse(error.message));
      return;
    }

    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json(
      createErrorResponse('Failed to create house association', {
        details: errorMessage,
      })
    );
  }
};

/**
 * Get house association details controller
 * GET /api/v1/ha/:id
 */
export const getHA = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params as GetHAParams;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    const houseAssociation = await HAService.getHAById(id, userId, userRole);

    res.status(200).json(
      createSuccessResponse('House association retrieved successfully', {
        houseAssociation,
      })
    );
  } catch (error) {
    console.error('Get HA error:', error);

    if (error instanceof ApiError) {
      res.status(error.statusCode).json(createErrorResponse(error.message));
      return;
    }

    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json(
      createErrorResponse('Failed to get house association', {
        details: errorMessage,
      })
    );
  }
};

/**
 * List house associations controller
 * GET /api/v1/ha
 */
export const listHAs = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const query = req.query as unknown as ListHAQuery;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    const result = await HAService.listHAs({
      page: query.page || 1,
      limit: query.limit || 10,
      search: query.search || undefined,
      userId,
      userRole,
    });

    res
      .status(200)
      .json(
        createSuccessResponse(
          'House associations retrieved successfully',
          result
        )
      );
  } catch (error) {
    console.error('List HAs error:', error);

    if (error instanceof ApiError) {
      res.status(error.statusCode).json(createErrorResponse(error.message));
      return;
    }

    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json(
      createErrorResponse('Failed to list house associations', {
        details: errorMessage,
      })
    );
  }
};

/**
 * Update house association controller
 * PUT /api/v1/ha/:id
 */
export const updateHA = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params as UpdateHAParams;
    const updateData = req.body as UpdateHARequest;
    const userId = req.user!.id;

    const houseAssociation = await HAService.updateHA(id, updateData, userId);

    res.status(200).json(
      createSuccessResponse('House association updated successfully', {
        houseAssociation,
      })
    );
  } catch (error) {
    console.error('Update HA error:', error);

    if (error instanceof ApiError) {
      res.status(error.statusCode).json(createErrorResponse(error.message));
      return;
    }

    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json(
      createErrorResponse('Failed to update house association', {
        details: errorMessage,
      })
    );
  }
};

/**
 * Delete house association controller
 * DELETE /api/v1/ha/:id
 */
export const deleteHA = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params as GetHAParams;
    const userId = req.user!.id;

    await HAService.deleteHA(id, userId);

    res
      .status(200)
      .json(
        createSuccessResponse('House association deleted successfully', null)
      );
  } catch (error) {
    console.error('Delete HA error:', error);

    if (error instanceof ApiError) {
      res.status(error.statusCode).json(createErrorResponse(error.message));
      return;
    }

    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json(
      createErrorResponse('Failed to delete house association', {
        details: errorMessage,
      })
    );
  }
};

/**
 * Add member to house association controller
 * POST /api/v1/ha/:id/members
 */
export const addMember = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params as AddHAMemberParams;
    const { kennitala } = req.body as AddHAMemberRequest;
    const userId = req.user!.id;

    const membership = await HAService.addMember(id, kennitala, userId);

    res.status(201).json(
      createSuccessResponse('Member added successfully', {
        membership,
      })
    );
  } catch (error) {
    console.error('Add member error:', error);

    if (error instanceof ApiError) {
      res.status(error.statusCode).json(createErrorResponse(error.message));
      return;
    }

    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json(
      createErrorResponse('Failed to add member to house association', {
        details: errorMessage,
      })
    );
  }
};

/**
 * Remove member from house association controller
 * DELETE /api/v1/ha/:id/members/:userId
 */
export const removeMember = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id, userId: memberUserId } = req.params as RemoveHAMemberParams;
    const managerId = req.user!.id;

    await HAService.removeMember(id, memberUserId, managerId);

    res
      .status(200)
      .json(createSuccessResponse('Member removed successfully', null));
  } catch (error) {
    console.error('Remove member error:', error);

    if (error instanceof ApiError) {
      res.status(error.statusCode).json(createErrorResponse(error.message));
      return;
    }

    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json(
      createErrorResponse('Failed to remove member from house association', {
        details: errorMessage,
      })
    );
  }
};

/**
 * List house association members controller
 * GET /api/v1/ha/:id/members
 */
export const listMembers = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params as ListHAMembersParams;
    const query = req.query as unknown as ListHAMembersQuery;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    const result = await HAService.listMembers(
      id,
      {
        page: query.page || 1,
        limit: query.limit || 20,
      },
      userId,
      userRole
    );

    res
      .status(200)
      .json(createSuccessResponse('Members retrieved successfully', result));
  } catch (error) {
    console.error('List members error:', error);

    if (error instanceof ApiError) {
      res.status(error.statusCode).json(createErrorResponse(error.message));
      return;
    }

    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json(
      createErrorResponse('Failed to list house association members', {
        details: errorMessage,
      })
    );
  }
};

export default {
  createHA,
  getHA,
  listHAs,
  updateHA,
  deleteHA,
  addMember,
  removeMember,
  listMembers,
};
