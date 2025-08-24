import { Request, Response } from 'express';
import { UserService } from '../../services/user.service';
import {
  createSuccessResponse,
  createErrorResponse,
} from '../../utils/response';
import { UpdateProfileRequest } from '../../schemas/auth.schemas';

/**
 * Get current user profile
 * GET /api/v1/users/profile
 */
export const getProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json(
        createErrorResponse('Authentication required', {
          code: 'AUTH_REQUIRED',
          details: 'User must be authenticated to access this resource',
        })
      );
      return;
    }

    const user = await UserService.getUserProfile(req.user.id);

    if (!user) {
      res.status(404).json(
        createErrorResponse('User not found', {
          code: 'USER_NOT_FOUND',
          details: 'User profile not found',
        })
      );
      return;
    }

    res.status(200).json(
      createSuccessResponse('User profile retrieved successfully', {
        user,
      })
    );
  } catch (error) {
    console.error('Get profile error:', error);

    res.status(500).json(
      createErrorResponse('Failed to retrieve user profile', {
        code: 'GET_PROFILE_ERROR',
        details: 'An error occurred while retrieving user profile',
      })
    );
  }
};

/**
 * Update user profile
 * PUT /api/v1/users/profile
 */
export const updateProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json(
        createErrorResponse('Authentication required', {
          code: 'AUTH_REQUIRED',
          details: 'User must be authenticated to access this resource',
        })
      );
      return;
    }

    const updateData = req.body as UpdateProfileRequest;

    // Convert undefined values to null for proper handling
    const sanitizedUpdateData = {
      firstName:
        updateData.firstName !== undefined ? updateData.firstName : null,
      lastName: updateData.lastName !== undefined ? updateData.lastName : null,
      kennitala:
        updateData.kennitala !== undefined ? updateData.kennitala : null,
    };

    const updatedUser = await UserService.updateUserProfile(
      req.user.id,
      sanitizedUpdateData
    );

    res.status(200).json(
      createSuccessResponse('Profile updated successfully', {
        user: updatedUser,
      })
    );
  } catch (error) {
    console.error('Update profile error:', error);

    if (error instanceof Error) {
      // Handle known errors
      if (error.message.includes('already in use')) {
        res.status(409).json(
          createErrorResponse('Profile update failed', {
            code: 'KENNITALA_IN_USE',
            details: error.message,
          })
        );
        return;
      }

      if (error.message.includes('Invalid kennitala')) {
        res.status(400).json(
          createErrorResponse('Profile update failed', {
            code: 'INVALID_KENNITALA',
            details: error.message,
          })
        );
        return;
      }
    }

    res.status(500).json(
      createErrorResponse('Profile update failed', {
        code: 'UPDATE_PROFILE_ERROR',
        details: 'An error occurred while updating user profile',
      })
    );
  }
};

/**
 * Get user's house association memberships
 * GET /api/v1/users/memberships
 */
export const getUserMemberships = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json(
        createErrorResponse('Authentication required', {
          code: 'AUTH_REQUIRED',
          details: 'User must be authenticated to access this resource',
        })
      );
      return;
    }

    const memberships = await UserService.getUserHAMemberships(req.user.id);

    res.status(200).json(
      createSuccessResponse('User memberships retrieved successfully', {
        memberships,
      })
    );
  } catch (error) {
    console.error('Get user memberships error:', error);

    res.status(500).json(
      createErrorResponse('Failed to retrieve user memberships', {
        code: 'GET_MEMBERSHIPS_ERROR',
        details: 'An error occurred while retrieving user memberships',
      })
    );
  }
};

/**
 * Get house associations managed by user
 * GET /api/v1/users/managed-has
 */
export const getManagedHAs = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json(
        createErrorResponse('Authentication required', {
          code: 'AUTH_REQUIRED',
          details: 'User must be authenticated to access this resource',
        })
      );
      return;
    }

    const managedHAs = await UserService.getUserManagedHAs(req.user.id);

    res.status(200).json(
      createSuccessResponse(
        'Managed house associations retrieved successfully',
        {
          managedHAs,
        }
      )
    );
  } catch (error) {
    console.error('Get managed HAs error:', error);

    res.status(500).json(
      createErrorResponse('Failed to retrieve managed house associations', {
        code: 'GET_MANAGED_HAS_ERROR',
        details:
          'An error occurred while retrieving managed house associations',
      })
    );
  }
};

export default {
  getProfile,
  updateProfile,
  getUserMemberships,
  getManagedHAs,
};
