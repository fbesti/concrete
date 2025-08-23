import { Request, Response } from 'express';
import { UserService } from '../../services/user.service';
import {
  createSuccessResponse,
  createErrorResponse,
} from '../../utils/response';
import { ChangePasswordRequest } from '../../schemas/auth.schemas';

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

    // Log password change (using user ID instead of email for security)
    console.log(`Password changed for user ID: ${req.user.id}`, {
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

export default {
  changePassword,
};
