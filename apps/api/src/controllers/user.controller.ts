import { Request, Response } from 'express';
import { UserService } from '../services/user.service';
import { createSuccessResponse, createErrorResponse } from '../utils/response';
import {
  UpdateProfileRequest,
  ChangePasswordRequest,
} from '../schemas/auth.schemas';
import { UserRole } from '@prisma/client';

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
 * Change user password
 * PUT /api/v1/users/password
 */
export const changePassword = async (
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

    const passwordData = req.body as ChangePasswordRequest;

    // Remove confirmNewPassword from data (not needed for service)
    const { confirmNewPassword: _, ...changePasswordData } = passwordData;

    await UserService.changePassword(req.user.id, {
      currentPassword: changePasswordData.currentPassword,
      newPassword: changePasswordData.newPassword,
    });

    // Log password change
    console.log(`Password changed for user ${req.user.email}`, {
      userId: req.user.id,
      timestamp: new Date().toISOString(),
    });

    res.status(200).json(
      createSuccessResponse('Password changed successfully', {
        message: 'Your password has been updated',
      })
    );
  } catch (error) {
    console.error('Change password error:', error);

    if (error instanceof Error) {
      // Handle known errors
      if (error.message.includes('Current password is incorrect')) {
        res.status(400).json(
          createErrorResponse('Password change failed', {
            code: 'INVALID_CURRENT_PASSWORD',
            details: 'Current password is incorrect',
          })
        );
        return;
      }

      if (error.message.includes('Password validation failed')) {
        res.status(400).json(
          createErrorResponse('Password change failed', {
            code: 'WEAK_PASSWORD',
            details: error.message,
          })
        );
        return;
      }
    }

    res.status(500).json(
      createErrorResponse('Password change failed', {
        code: 'CHANGE_PASSWORD_ERROR',
        details: 'An error occurred while changing password',
      })
    );
  }
};

/**
 * Get users list (admin only)
 * GET /api/v1/users
 */
export const getUsers = async (req: Request, res: Response): Promise<void> => {
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

    // Only HA Managers can list users
    if (req.user.role !== UserRole.HA_MANAGER) {
      res.status(403).json(
        createErrorResponse('Insufficient permissions', {
          code: 'AUTH_FORBIDDEN',
          details: 'Only HA Managers can access user lists',
        })
      );
      return;
    }

    // Parse query parameters
    const { role, search, page = '1', limit = '10' } = req.query;

    const filters = {
      role: (role as UserRole) || null,
      search: (search as string) || null,
      page: parseInt(page as string, 10),
      limit: Math.min(parseInt(limit as string, 10), 100), // Max 100 per page
    };

    const result = await UserService.getUsers(filters);

    res
      .status(200)
      .json(createSuccessResponse('Users retrieved successfully', result));
  } catch (error) {
    console.error('Get users error:', error);

    res.status(500).json(
      createErrorResponse('Failed to retrieve users', {
        code: 'GET_USERS_ERROR',
        details: 'An error occurred while retrieving users',
      })
    );
  }
};

/**
 * Get user by ID (admin only)
 * GET /api/v1/users/:userId
 */
export const getUserById = async (
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

    const { userId } = req.params;

    if (!userId) {
      res.status(400).json(
        createErrorResponse('Missing user ID', {
          code: 'VALIDATION_ERROR',
          details: 'User ID parameter is required',
        })
      );
      return;
    }

    // Check if user can access this resource
    const canAccess = await UserService.canUserAccessResource(
      req.user.id,
      userId,
      UserRole.HA_MANAGER
    );

    if (!canAccess) {
      res.status(403).json(
        createErrorResponse('Access denied', {
          code: 'AUTH_FORBIDDEN',
          details:
            'You can only access your own profile or you must be an HA Manager',
        })
      );
      return;
    }

    const user = await UserService.getUserProfile(userId);

    if (!user) {
      res.status(404).json(
        createErrorResponse('User not found', {
          code: 'USER_NOT_FOUND',
          details: 'User with the specified ID was not found',
        })
      );
      return;
    }

    res.status(200).json(
      createSuccessResponse('User retrieved successfully', {
        user,
      })
    );
  } catch (error) {
    console.error('Get user by ID error:', error);

    res.status(500).json(
      createErrorResponse('Failed to retrieve user', {
        code: 'GET_USER_ERROR',
        details: 'An error occurred while retrieving user',
      })
    );
  }
};

/**
 * Get user statistics (admin only)
 * GET /api/v1/users/statistics
 */
export const getUserStatistics = async (
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

    // Only HA Managers can access statistics
    if (req.user.role !== UserRole.HA_MANAGER) {
      res.status(403).json(
        createErrorResponse('Insufficient permissions', {
          code: 'AUTH_FORBIDDEN',
          details: 'Only HA Managers can access user statistics',
        })
      );
      return;
    }

    const statistics = await UserService.getUserStatistics();

    res.status(200).json(
      createSuccessResponse('User statistics retrieved successfully', {
        statistics,
      })
    );
  } catch (error) {
    console.error('Get user statistics error:', error);

    res.status(500).json(
      createErrorResponse('Failed to retrieve user statistics', {
        code: 'GET_STATISTICS_ERROR',
        details: 'An error occurred while retrieving user statistics',
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

/**
 * Delete user account (self or admin)
 * DELETE /api/v1/users/:userId
 */
export const deleteUser = async (
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

    const { userId } = req.params;

    if (!userId) {
      res.status(400).json(
        createErrorResponse('Missing user ID', {
          code: 'VALIDATION_ERROR',
          details: 'User ID parameter is required',
        })
      );
      return;
    }

    // Check if user can delete this account
    const canAccess = await UserService.canUserAccessResource(
      req.user.id,
      userId,
      UserRole.HA_MANAGER
    );

    if (!canAccess) {
      res.status(403).json(
        createErrorResponse('Access denied', {
          code: 'AUTH_FORBIDDEN',
          details:
            'You can only delete your own account or you must be an HA Manager',
        })
      );
      return;
    }

    await UserService.deleteUser(userId);

    // Log user deletion
    console.log(`User account deleted`, {
      deletedUserId: userId,
      deletedBy: req.user.id,
      timestamp: new Date().toISOString(),
    });

    res.status(200).json(
      createSuccessResponse('User account deleted successfully', {
        message: 'User account has been permanently deleted',
      })
    );
  } catch (error) {
    console.error('Delete user error:', error);

    if (error instanceof Error) {
      // Handle known errors
      if (error.message.includes('User not found')) {
        res.status(404).json(
          createErrorResponse('User not found', {
            code: 'USER_NOT_FOUND',
            details: error.message,
          })
        );
        return;
      }

      if (error.message.includes('managing house associations')) {
        res.status(400).json(
          createErrorResponse('Cannot delete user', {
            code: 'USER_HAS_DEPENDENCIES',
            details: error.message,
          })
        );
        return;
      }
    }

    res.status(500).json(
      createErrorResponse('Failed to delete user account', {
        code: 'DELETE_USER_ERROR',
        details: 'An error occurred while deleting user account',
      })
    );
  }
};

export default {
  getProfile,
  updateProfile,
  changePassword,
  getUsers,
  getUserById,
  getUserStatistics,
  getUserMemberships,
  getManagedHAs,
  deleteUser,
};
