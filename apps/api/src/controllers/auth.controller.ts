import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { createSuccessResponse, createErrorResponse } from '../utils/response';
import {
  RegisterRequest,
  LoginRequest,
  RefreshTokenRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
} from '../schemas/auth.schemas';

/**
 * User registration controller
 * POST /api/v1/auth/register
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const userData = req.body as RegisterRequest;

    // Remove confirmPassword from data (not needed for user creation)
    const { confirmPassword: _, ...userRegistrationData } = userData;

    // Convert undefined kennitala to null
    const registrationData = {
      ...userRegistrationData,
      kennitala: userRegistrationData.kennitala || null,
    };

    // Register user
    const user = await AuthService.registerUser(registrationData);

    // Generate tokens
    const tokens = AuthService.generateTokens(user);

    // Remove password from response
    const { password: _password, ...userWithoutPassword } = user;

    res.status(201).json(
      createSuccessResponse('User registered successfully', {
        user: userWithoutPassword,
        tokens,
      })
    );
  } catch (error) {
    console.error('Registration error:', error);

    if (error instanceof Error) {
      // Handle known errors
      if (error.message.includes('already exists')) {
        res.status(409).json(
          createErrorResponse('Registration failed', {
            code: 'USER_EXISTS',
            details: error.message,
          })
        );
        return;
      }
    }

    res.status(500).json(
      createErrorResponse('Registration failed', {
        code: 'REGISTRATION_ERROR',
        details: 'An error occurred during user registration',
      })
    );
  }
};

/**
 * User login controller
 * POST /api/v1/auth/login
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, rememberMe } = req.body as LoginRequest;

    // Authenticate user
    const user = await AuthService.authenticateUser({ email, password });

    if (!user) {
      res.status(401).json(
        createErrorResponse('Authentication failed', {
          code: 'INVALID_CREDENTIALS',
          details: 'Invalid email or password',
        })
      );
      return;
    }

    // Generate tokens
    const tokens = AuthService.generateTokens(user);

    // Remove password from response
    const { password: _userPassword, ...userWithoutPassword } = user;

    // Log successful login
    console.log(`User ${user.email} logged in successfully`, {
      userId: user.id,
      role: user.role,
      rememberMe,
      timestamp: new Date().toISOString(),
    });

    res.status(200).json(
      createSuccessResponse('Login successful', {
        user: userWithoutPassword,
        tokens,
      })
    );
  } catch (error) {
    console.error('Login error:', error);

    res.status(500).json(
      createErrorResponse('Login failed', {
        code: 'LOGIN_ERROR',
        details: 'An error occurred during login',
      })
    );
  }
};

/**
 * Token refresh controller
 * POST /api/v1/auth/refresh
 */
export const refreshToken = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { refreshToken: token } = req.body as RefreshTokenRequest;

    // Generate new access token
    const newAccessToken = await AuthService.refreshAccessToken(token);

    res.status(200).json(
      createSuccessResponse('Token refreshed successfully', {
        accessToken: newAccessToken,
      })
    );
  } catch (error) {
    console.error('Token refresh error:', error);

    res.status(401).json(
      createErrorResponse('Token refresh failed', {
        code: 'INVALID_REFRESH_TOKEN',
        details:
          error instanceof Error ? error.message : 'Invalid refresh token',
      })
    );
  }
};

/**
 * User logout controller
 * POST /api/v1/auth/logout
 */
export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    // In a stateless JWT implementation, logout is handled client-side
    // by removing the tokens from storage. However, we can log the logout event.

    if (req.user) {
      console.log(`User ${req.user.email} logged out`, {
        userId: req.user.id,
        timestamp: new Date().toISOString(),
      });
    }

    res.status(200).json(
      createSuccessResponse('Logout successful', {
        message: 'User logged out successfully',
      })
    );
  } catch (error) {
    console.error('Logout error:', error);

    res.status(500).json(
      createErrorResponse('Logout failed', {
        code: 'LOGOUT_ERROR',
        details: 'An error occurred during logout',
      })
    );
  }
};

/**
 * Forgot password controller
 * POST /api/v1/auth/forgot-password
 */
export const forgotPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email } = req.body as ForgotPasswordRequest;

    // TODO: Implement password reset token generation and email sending
    // For MVP, we'll just log the request and return success
    console.log(`Password reset requested for email: ${email}`);

    // Always return success to prevent email enumeration attacks
    res.status(200).json(
      createSuccessResponse('Password reset email sent', {
        message:
          'If an account with this email exists, a password reset link has been sent.',
      })
    );
  } catch (error) {
    console.error('Forgot password error:', error);

    res.status(500).json(
      createErrorResponse('Password reset request failed', {
        code: 'FORGOT_PASSWORD_ERROR',
        details: 'An error occurred while processing password reset request',
      })
    );
  }
};

/**
 * Reset password controller
 * POST /api/v1/auth/reset-password
 */
export const resetPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { token, password: _password } = req.body as ResetPasswordRequest;

    // TODO: Implement password reset functionality
    // For MVP, we'll just return a not implemented response
    console.log(
      `Password reset attempted with token: ${token.substring(0, 10)}...`
    );

    res.status(501).json(
      createErrorResponse('Password reset not implemented', {
        code: 'NOT_IMPLEMENTED',
        details:
          'Password reset functionality will be implemented in a future version',
      })
    );
  } catch (error) {
    console.error('Reset password error:', error);

    res.status(500).json(
      createErrorResponse('Password reset failed', {
        code: 'RESET_PASSWORD_ERROR',
        details: 'An error occurred while resetting password',
      })
    );
  }
};

/**
 * Get current user controller
 * GET /api/v1/auth/me
 */
export const getCurrentUser = async (
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

    // Remove password from response
    const { password: _password, ...userWithoutPassword } = req.user;

    res.status(200).json(
      createSuccessResponse('User profile retrieved', {
        user: userWithoutPassword,
      })
    );
  } catch (error) {
    console.error('Get current user error:', error);

    res.status(500).json(
      createErrorResponse('Failed to retrieve user profile', {
        code: 'GET_USER_ERROR',
        details: 'An error occurred while retrieving user profile',
      })
    );
  }
};

/**
 * Validate token controller
 * GET /api/v1/auth/validate
 */
export const validateToken = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user || !req.tokenPayload) {
      res.status(401).json(
        createErrorResponse('Invalid token', {
          code: 'INVALID_TOKEN',
          details: 'Token is invalid or expired',
        })
      );
      return;
    }

    res.status(200).json(
      createSuccessResponse('Token is valid', {
        valid: true,
        payload: req.tokenPayload,
      })
    );
  } catch (error) {
    console.error('Token validation error:', error);

    res.status(500).json(
      createErrorResponse('Token validation failed', {
        code: 'VALIDATION_ERROR',
        details: 'An error occurred while validating token',
      })
    );
  }
};

export default {
  register,
  login,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword,
  getCurrentUser,
  validateToken,
};
