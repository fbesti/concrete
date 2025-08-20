import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AuthService } from '../../../src/services/auth.service';
import { UserRole } from '@prisma/client';

// Mock dependencies
jest.mock('bcrypt');
jest.mock('jsonwebtoken');
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  })),
  UserRole: {
    HA_MANAGER: 'HA_MANAGER',
    PROPERTY_OWNER: 'PROPERTY_OWNER',
  },
}));

const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;
const mockedJwt = jwt as jest.Mocked<typeof jwt>;

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET =
      'test-secret-key-that-is-at-least-32-characters-long';
  });

  afterEach(() => {
    delete process.env.JWT_SECRET;
  });

  describe('hashPassword', () => {
    it('should hash password with correct salt rounds', async () => {
      const password = 'testPassword123!';
      const hashedPassword = 'hashedPassword';

      mockedBcrypt.hash.mockResolvedValue(hashedPassword as never);

      const result = await AuthService.hashPassword(password);

      expect(bcrypt.hash).toHaveBeenCalledWith(password, 12);
      expect(result).toBe(hashedPassword);
    });
  });

  describe('comparePassword', () => {
    it('should compare password correctly', async () => {
      const password = 'testPassword123!';
      const hashedPassword = 'hashedPassword';

      mockedBcrypt.compare.mockResolvedValue(true as never);

      const result = await AuthService.comparePassword(
        password,
        hashedPassword
      );

      expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
      expect(result).toBe(true);
    });

    it('should return false for incorrect password', async () => {
      const password = 'wrongPassword';
      const hashedPassword = 'hashedPassword';

      mockedBcrypt.compare.mockResolvedValue(false as never);

      const result = await AuthService.comparePassword(
        password,
        hashedPassword
      );

      expect(result).toBe(false);
    });
  });

  describe('generateAccessToken', () => {
    it('should generate access token with correct payload', () => {
      const payload = {
        userId: 'user123',
        email: 'test@example.com',
        role: UserRole.PROPERTY_OWNER,
      };
      const token = 'generated-token';

      mockedJwt.sign.mockReturnValue(token as never);

      const result = AuthService.generateAccessToken(payload);

      expect(jwt.sign).toHaveBeenCalledWith(payload, process.env.JWT_SECRET, {
        expiresIn: '15m',
        issuer: 'ha-management-api',
        audience: 'ha-management-client',
      });
      expect(result).toBe(token);
    });

    it('should throw error if JWT_SECRET is not set', () => {
      delete process.env.JWT_SECRET;

      const payload = {
        userId: 'user123',
        email: 'test@example.com',
        role: UserRole.PROPERTY_OWNER,
      };

      expect(() => AuthService.generateAccessToken(payload)).toThrow(
        'JWT_SECRET environment variable is required'
      );
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate refresh token with correct payload', () => {
      const payload = {
        userId: 'user123',
        email: 'test@example.com',
        role: UserRole.PROPERTY_OWNER,
      };
      const token = 'refresh-token';

      mockedJwt.sign.mockReturnValue(token as never);

      const result = AuthService.generateRefreshToken(payload);

      expect(jwt.sign).toHaveBeenCalledWith(payload, process.env.JWT_SECRET, {
        expiresIn: '7d',
        issuer: 'ha-management-api',
        audience: 'ha-management-client',
      });
      expect(result).toBe(token);
    });
  });

  describe('verifyToken', () => {
    it('should verify token successfully', () => {
      const token = 'valid-token';
      const decodedPayload = {
        userId: 'user123',
        email: 'test@example.com',
        role: UserRole.PROPERTY_OWNER,
        iat: 1234567890,
        exp: 1234567999,
      };

      mockedJwt.verify.mockReturnValue(decodedPayload as never);

      const result = AuthService.verifyToken(token);

      expect(jwt.verify).toHaveBeenCalledWith(token, process.env.JWT_SECRET, {
        issuer: 'ha-management-api',
        audience: 'ha-management-client',
      });
      expect(result).toEqual({
        userId: decodedPayload.userId,
        email: decodedPayload.email,
        role: decodedPayload.role,
      });
    });

    it('should throw error for expired token', () => {
      const token = 'expired-token';
      const error = new jwt.TokenExpiredError('jwt expired', new Date());

      mockedJwt.verify.mockImplementation(() => {
        throw error;
      });

      expect(() => AuthService.verifyToken(token)).toThrow('Token has expired');
    });

    it('should throw error for invalid token', () => {
      const token = 'invalid-token';
      const error = new jwt.JsonWebTokenError('invalid token');

      mockedJwt.verify.mockImplementation(() => {
        throw error;
      });

      expect(() => AuthService.verifyToken(token)).toThrow('Invalid token');
    });
  });

  describe('generateTokens', () => {
    it('should generate both access and refresh tokens', () => {
      const user = {
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

      const accessToken = 'access-token';
      const refreshToken = 'refresh-token';

      mockedJwt.sign
        .mockReturnValueOnce(accessToken as never)
        .mockReturnValueOnce(refreshToken as never);

      const result = AuthService.generateTokens(user);

      expect(result).toEqual({
        accessToken,
        refreshToken,
      });
      expect(jwt.sign).toHaveBeenCalledTimes(2);
    });
  });

  describe('validatePasswordStrength', () => {
    it('should validate strong password', () => {
      const password = 'StrongPass123!';

      const result = AuthService.validatePasswordStrength(password);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject weak password', () => {
      const password = 'weak';

      const result = AuthService.validatePasswordStrength(password);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'Password must be at least 8 characters long'
      );
      expect(result.errors).toContain(
        'Password must contain at least one uppercase letter'
      );
      expect(result.errors).toContain(
        'Password must contain at least one number'
      );
      expect(result.errors).toContain(
        'Password must contain at least one special character'
      );
    });

    it('should reject password without uppercase letter', () => {
      const password = 'lowercase123!';

      const result = AuthService.validatePasswordStrength(password);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'Password must contain at least one uppercase letter'
      );
    });

    it('should reject password without lowercase letter', () => {
      const password = 'UPPERCASE123!';

      const result = AuthService.validatePasswordStrength(password);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'Password must contain at least one lowercase letter'
      );
    });

    it('should reject password without number', () => {
      const password = 'NoNumbers!';

      const result = AuthService.validatePasswordStrength(password);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'Password must contain at least one number'
      );
    });

    it('should reject password without special character', () => {
      const password = 'NoSpecialChar123';

      const result = AuthService.validatePasswordStrength(password);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'Password must contain at least one special character'
      );
    });
  });

  describe('validateKennitala', () => {
    it('should validate correct kennitala format', () => {
      const kennitala = '0101701234';

      const result = AuthService.validateKennitala(kennitala);

      expect(result).toBe(true);
    });

    it('should validate kennitala with separators', () => {
      const kennitala = '010170-1234';

      const result = AuthService.validateKennitala(kennitala);

      expect(result).toBe(true);
    });

    it('should reject kennitala with wrong length', () => {
      const kennitala = '123456789'; // 9 digits

      const result = AuthService.validateKennitala(kennitala);

      expect(result).toBe(false);
    });

    it('should reject kennitala with invalid day', () => {
      const kennitala = '3201701234'; // Day 32

      const result = AuthService.validateKennitala(kennitala);

      expect(result).toBe(false);
    });

    it('should reject kennitala with invalid month', () => {
      const kennitala = '0113701234'; // Month 13

      const result = AuthService.validateKennitala(kennitala);

      expect(result).toBe(false);
    });

    it('should reject kennitala with non-numeric characters', () => {
      const kennitala = '01017a1234';

      const result = AuthService.validateKennitala(kennitala);

      expect(result).toBe(false);
    });
  });
});
