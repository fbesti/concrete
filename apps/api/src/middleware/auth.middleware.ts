import { Request, Response, NextFunction } from 'express';
import { User, UserRole } from '@prisma/client';
import { AuthService, TokenPayload } from '../services/auth.service';
import { createErrorResponse } from '../utils/response';

// Extend Express Request interface to include user
/* eslint-disable no-unused-vars */
declare global {
  namespace Express {
    interface Request {
      user?: User;
      tokenPayload?: TokenPayload;
    }
  }
}
/* eslint-enable no-unused-vars */

/**
 * Extract JWT token from request headers
 */
export const extractToken = (req: Request): string | null => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return null;
  }

  // Expected format: "Bearer <token>"
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1] || null;
};

/**
 * Middleware to authenticate requests using JWT tokens
 * Adds user and tokenPayload to request object if authentication succeeds
 */
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = extractToken(req);

    if (!token) {
      res.status(401).json(
        createErrorResponse('Authentication required', {
          code: 'AUTH_TOKEN_MISSING',
          details: 'Authorization header with Bearer token is required',
        })
      );
      return;
    }

    // Verify token
    let tokenPayload: TokenPayload;
    try {
      tokenPayload = AuthService.verifyToken(token);
    } catch (error) {
      res.status(401).json(
        createErrorResponse('Invalid or expired token', {
          code: 'AUTH_TOKEN_INVALID',
          details:
            error instanceof Error
              ? error.message
              : 'Token verification failed',
        })
      );
      return;
    }

    // Get user from database
    const user = await AuthService.getUserById(tokenPayload.userId);

    if (!user) {
      res.status(401).json(
        createErrorResponse('User not found', {
          code: 'AUTH_USER_NOT_FOUND',
          details: 'User associated with token no longer exists',
        })
      );
      return;
    }

    // Add user and token payload to request
    req.user = user;
    req.tokenPayload = tokenPayload;

    next();
  } catch (error) {
    console.error('Authentication middleware error:', error);
    res.status(500).json(
      createErrorResponse('Authentication error', {
        code: 'AUTH_INTERNAL_ERROR',
        details: 'Internal authentication error occurred',
      })
    );
  }
};

/**
 * Middleware to require authentication (wrapper around authenticateToken)
 * Use this when you want to ensure the request is authenticated
 */
export const requireAuth = authenticateToken;

/**
 * Middleware to optionally authenticate requests
 * Continues without error if no token is provided
 */
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = extractToken(req);

    if (!token) {
      // No token provided, continue without authentication
      next();
      return;
    }

    // Try to verify token if provided
    try {
      const tokenPayload = AuthService.verifyToken(token);
      const user = await AuthService.getUserById(tokenPayload.userId);

      if (user) {
        req.user = user;
        req.tokenPayload = tokenPayload;
      }
    } catch (error) {
      // Invalid token, but continue without authentication
      console.warn('Optional auth failed:', error);
    }

    next();
  } catch (error) {
    console.error('Optional authentication middleware error:', error);
    next(); // Continue without authentication on error
  }
};

/**
 * Middleware factory to require specific user roles
 */
export const requireRole = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json(
        createErrorResponse('Authentication required', {
          code: 'AUTH_REQUIRED',
          details: 'User must be authenticated to access this resource',
        })
      );
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json(
        createErrorResponse('Insufficient permissions', {
          code: 'AUTH_FORBIDDEN',
          details: `User role '${req.user.role}' is not authorized for this resource`,
          allowedRoles,
        })
      );
      return;
    }

    next();
  };
};

/**
 * Middleware to require HA Manager role
 */
export const requireHAManager = requireRole(UserRole.HA_MANAGER);

/**
 * Middleware to require Property Owner role or higher
 */
export const requirePropertyOwner = requireRole(
  UserRole.PROPERTY_OWNER,
  UserRole.HA_MANAGER
);

/**
 * Middleware to ensure user can only access their own resources
 * Compares the authenticated user ID with a user ID parameter in the route
 */
export const requireSameUser = (userIdParam = 'userId') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json(
        createErrorResponse('Authentication required', {
          code: 'AUTH_REQUIRED',
          details: 'User must be authenticated to access this resource',
        })
      );
      return;
    }

    const targetUserId = req.params[userIdParam];

    if (!targetUserId) {
      res.status(400).json(
        createErrorResponse('Missing user identifier', {
          code: 'VALIDATION_ERROR',
          details: `Missing ${userIdParam} parameter in request`,
        })
      );
      return;
    }

    // Allow access if user is accessing their own resource or is an HA Manager
    if (req.user.id !== targetUserId && req.user.role !== UserRole.HA_MANAGER) {
      res.status(403).json(
        createErrorResponse('Access denied', {
          code: 'AUTH_FORBIDDEN',
          details: 'Users can only access their own resources',
        })
      );
      return;
    }

    next();
  };
};

/**
 * Middleware to ensure user can only access resources they own or manage
 * For use with user profiles, where the route doesn't have a userId param
 */
export const requireSelfAccess = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json(
      createErrorResponse('Authentication required', {
        code: 'AUTH_REQUIRED',
        details: 'User must be authenticated to access this resource',
      })
    );
    return;
  }

  // This middleware is typically used for profile endpoints where
  // the user is accessing their own profile by default
  next();
};

/**
 * Type guard to check if user is authenticated
 */
export const isAuthenticated = (
  req: Request
): req is Request & { user: User } => {
  return !!req.user;
};

/**
 * Type guard to check if user has specific role
 */
export const hasRole = (req: Request, role: UserRole): boolean => {
  return req.user?.role === role;
};

/**
 * Type guard to check if user has any of the specified roles
 */
export const hasAnyRole = (req: Request, roles: UserRole[]): boolean => {
  return req.user ? roles.includes(req.user.role) : false;
};

export default {
  authenticateToken,
  requireAuth,
  optionalAuth,
  requireRole,
  requireHAManager,
  requirePropertyOwner,
  requireSameUser,
  requireSelfAccess,
  extractToken,
  isAuthenticated,
  hasRole,
  hasAnyRole,
};
