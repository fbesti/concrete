import { Request, Response, NextFunction } from 'express';
import {
  authenticateToken,
  extractToken,
  requireRole,
  requireHAManager,
  requirePropertyOwner,
} from '../../../src/middleware/auth.middleware';
import { AuthService } from '../../../src/services/auth.service';
import { UserRole } from '@prisma/client';

// Mock AuthService
jest.mock('../../../src/services/auth.service');

const mockedAuthService = AuthService as jest.Mocked<typeof AuthService>;

describe('Auth Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      headers: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('extractToken', () => {
    it('should extract token from Authorization header', () => {
      mockRequest.headers = {
        authorization: 'Bearer valid-token',
      };

      const token = extractToken(mockRequest as Request);

      expect(token).toBe('valid-token');
    });

    it('should return null for missing Authorization header', () => {
      const token = extractToken(mockRequest as Request);

      expect(token).toBeNull();
    });

    it('should return null for invalid Authorization header format', () => {
      mockRequest.headers = {
        authorization: 'Invalid format',
      };

      const token = extractToken(mockRequest as Request);

      expect(token).toBeNull();
    });

    it('should return null for malformed Bearer token', () => {
      mockRequest.headers = {
        authorization: 'Bearer',
      };

      const token = extractToken(mockRequest as Request);

      expect(token).toBeNull();
    });
  });

  describe('authenticateToken', () => {
    it('should authenticate valid token successfully', async () => {
      const mockUser = {
        id: 'user123',
        email: 'test@example.com',
        role: UserRole.PROPERTY_OWNER,
        firstName: 'Test',
        lastName: 'User',
        password: 'hashedPassword',
        kennitala: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockTokenPayload = {
        userId: 'user123',
        email: 'test@example.com',
        role: UserRole.PROPERTY_OWNER,
      };

      mockRequest.headers = {
        authorization: 'Bearer valid-token',
      };

      mockedAuthService.verifyToken.mockReturnValue(mockTokenPayload);
      mockedAuthService.getUserById.mockResolvedValue(mockUser);

      await authenticateToken(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(AuthService.verifyToken).toHaveBeenCalledWith('valid-token');
      expect(AuthService.getUserById).toHaveBeenCalledWith('user123');
      expect(mockRequest.user).toBe(mockUser);
      expect(mockRequest.tokenPayload).toBe(mockTokenPayload);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should return 401 for missing token', async () => {
      await authenticateToken(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Authentication required',
        })
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 for invalid token', async () => {
      mockRequest.headers = {
        authorization: 'Bearer invalid-token',
      };

      mockedAuthService.verifyToken.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await authenticateToken(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Invalid or expired token',
        })
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 for user not found', async () => {
      const mockTokenPayload = {
        userId: 'nonexistent-user',
        email: 'test@example.com',
        role: UserRole.PROPERTY_OWNER,
      };

      mockRequest.headers = {
        authorization: 'Bearer valid-token',
      };

      mockedAuthService.verifyToken.mockReturnValue(mockTokenPayload);
      mockedAuthService.getUserById.mockResolvedValue(null);

      await authenticateToken(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'User not found',
        })
      );
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('requireRole', () => {
    it('should allow access for user with required role', () => {
      const mockUser = {
        id: 'user123',
        role: UserRole.HA_MANAGER,
      };

      mockRequest.user = mockUser as any;

      const middleware = requireRole(UserRole.HA_MANAGER);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should deny access for user without required role', () => {
      const mockUser = {
        id: 'user123',
        role: UserRole.PROPERTY_OWNER,
      };

      mockRequest.user = mockUser as any;

      const middleware = requireRole(UserRole.HA_MANAGER);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Insufficient permissions',
        })
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should deny access for unauthenticated user', () => {
      const middleware = requireRole(UserRole.HA_MANAGER);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Authentication required',
        })
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should allow access for user with any of multiple roles', () => {
      const mockUser = {
        id: 'user123',
        role: UserRole.PROPERTY_OWNER,
      };

      mockRequest.user = mockUser as any;

      const middleware = requireRole(
        UserRole.PROPERTY_OWNER,
        UserRole.HA_MANAGER
      );
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });
  });

  describe('requireHAManager', () => {
    it('should allow access for HA Manager', () => {
      const mockUser = {
        id: 'user123',
        role: UserRole.HA_MANAGER,
      };

      mockRequest.user = mockUser as any;

      requireHAManager(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should deny access for Property Owner', () => {
      const mockUser = {
        id: 'user123',
        role: UserRole.PROPERTY_OWNER,
      };

      mockRequest.user = mockUser as any;

      requireHAManager(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('requirePropertyOwner', () => {
    it('should allow access for Property Owner', () => {
      const mockUser = {
        id: 'user123',
        role: UserRole.PROPERTY_OWNER,
      };

      mockRequest.user = mockUser as any;

      requirePropertyOwner(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should allow access for HA Manager', () => {
      const mockUser = {
        id: 'user123',
        role: UserRole.HA_MANAGER,
      };

      mockRequest.user = mockUser as any;

      requirePropertyOwner(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });
  });
});
