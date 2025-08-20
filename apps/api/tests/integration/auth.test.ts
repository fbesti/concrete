import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import app from '../../src/app';
import { AuthService } from '../../src/services/auth.service';

const prisma = new PrismaClient();

describe('Authentication Integration Tests', () => {
  beforeAll(async () => {
    // Ensure database is connected
    await prisma.$connect();
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.user.deleteMany({
      where: {
        email: {
          contains: 'test',
        },
      },
    });
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Clean up any test users before each test
    await prisma.user.deleteMany({
      where: {
        email: {
          contains: 'test',
        },
      },
    });
  });

  describe('POST /api/v1/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'TestPassword123!',
        confirmPassword: 'TestPassword123!',
        firstName: 'Test',
        lastName: 'User',
        role: 'PROPERTY_OWNER',
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('User registered successfully');
      expect(response.body.data.user).toHaveProperty('id');
      expect(response.body.data.user.email).toBe('test@example.com');
      expect(response.body.data.user.firstName).toBe('Test');
      expect(response.body.data.user.lastName).toBe('User');
      expect(response.body.data.user.role).toBe('PROPERTY_OWNER');
      expect(response.body.data.user).not.toHaveProperty('password');
      expect(response.body.data.tokens).toHaveProperty('accessToken');
      expect(response.body.data.tokens).toHaveProperty('refreshToken');
    });

    it('should reject registration with weak password', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'weak',
        confirmPassword: 'weak',
        firstName: 'Test',
        lastName: 'User',
        role: 'PROPERTY_OWNER',
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('validation');
    });

    it('should reject registration with mismatched passwords', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'TestPassword123!',
        confirmPassword: 'DifferentPassword123!',
        firstName: 'Test',
        lastName: 'User',
        role: 'PROPERTY_OWNER',
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('validation');
    });

    it('should reject registration with invalid email', async () => {
      const userData = {
        email: 'invalid-email',
        password: 'TestPassword123!',
        confirmPassword: 'TestPassword123!',
        firstName: 'Test',
        lastName: 'User',
        role: 'PROPERTY_OWNER',
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('validation');
    });

    it('should reject duplicate email registration', async () => {
      const userData = {
        email: 'duplicate@example.com',
        password: 'TestPassword123!',
        confirmPassword: 'TestPassword123!',
        firstName: 'Test',
        lastName: 'User',
        role: 'PROPERTY_OWNER',
      };

      // First registration should succeed
      await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(201);

      // Second registration with same email should fail
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Registration failed');
    });

    it('should register user with valid kennitala', async () => {
      const userData = {
        email: 'kennitala-test@example.com',
        password: 'TestPassword123!',
        confirmPassword: 'TestPassword123!',
        firstName: 'Test',
        lastName: 'User',
        role: 'PROPERTY_OWNER',
        kennitala: '010170-1234',
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.kennitala).toBe('0101701234');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    beforeEach(async () => {
      // Create a test user for login tests
      const hashedPassword = await AuthService.hashPassword('TestPassword123!');
      await prisma.user.create({
        data: {
          email: 'login-test@example.com',
          password: hashedPassword,
          firstName: 'Login',
          lastName: 'Test',
          role: 'PROPERTY_OWNER',
        },
      });
    });

    it('should login with valid credentials', async () => {
      const credentials = {
        email: 'login-test@example.com',
        password: 'TestPassword123!',
      };

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send(credentials)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Login successful');
      expect(response.body.data.user).toHaveProperty('id');
      expect(response.body.data.user.email).toBe('login-test@example.com');
      expect(response.body.data.user).not.toHaveProperty('password');
      expect(response.body.data.tokens).toHaveProperty('accessToken');
      expect(response.body.data.tokens).toHaveProperty('refreshToken');
    });

    it('should reject login with invalid email', async () => {
      const credentials = {
        email: 'nonexistent@example.com',
        password: 'TestPassword123!',
      };

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send(credentials)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Authentication failed');
    });

    it('should reject login with invalid password', async () => {
      const credentials = {
        email: 'login-test@example.com',
        password: 'WrongPassword123!',
      };

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send(credentials)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Authentication failed');
    });

    it('should reject login with missing fields', async () => {
      const credentials = {
        email: 'login-test@example.com',
        // Missing password
      };

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send(credentials)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('validation');
    });
  });

  describe('POST /api/v1/auth/refresh', () => {
    let refreshToken: string;

    beforeEach(async () => {
      // Create a test user and get tokens
      const userData = {
        email: 'refresh-test@example.com',
        password: 'TestPassword123!',
        confirmPassword: 'TestPassword123!',
        firstName: 'Refresh',
        lastName: 'Test',
        role: 'PROPERTY_OWNER',
      };

      const registerResponse = await request(app)
        .post('/api/v1/auth/register')
        .send(userData);

      refreshToken = registerResponse.body.data.tokens.refreshToken;
    });

    it('should refresh access token with valid refresh token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Token refreshed successfully');
      expect(response.body.data).toHaveProperty('accessToken');
      expect(typeof response.body.data.accessToken).toBe('string');
    });

    it('should reject refresh with invalid token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: 'invalid-token' })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Token refresh failed');
    });

    it('should reject refresh with missing token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('validation');
    });
  });

  describe('GET /api/v1/auth/me', () => {
    let accessToken: string;

    beforeEach(async () => {
      // Create a test user and get access token
      const userData = {
        email: 'me-test@example.com',
        password: 'TestPassword123!',
        confirmPassword: 'TestPassword123!',
        firstName: 'Me',
        lastName: 'Test',
        role: 'PROPERTY_OWNER',
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData);

      accessToken = response.body.data.tokens.accessToken;
    });

    it('should get current user with valid token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('User profile retrieved');
      expect(response.body.data.user).toHaveProperty('id');
      expect(response.body.data.user.email).toBe('me-test@example.com');
      expect(response.body.data.user).not.toHaveProperty('password');
    });

    it('should reject request without token', async () => {
      const response = await request(app).get('/api/v1/auth/me').expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Authentication required');
    });

    it('should reject request with invalid token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid or expired token');
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    let accessToken: string;

    beforeEach(async () => {
      // Create a test user and get access token
      const userData = {
        email: 'logout-test@example.com',
        password: 'TestPassword123!',
        confirmPassword: 'TestPassword123!',
        firstName: 'Logout',
        lastName: 'Test',
        role: 'PROPERTY_OWNER',
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData);

      accessToken = response.body.data.tokens.accessToken;
    });

    it('should logout successfully with valid token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Logout successful');
    });

    it('should reject logout without token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/logout')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Authentication required');
    });
  });

  describe('GET /api/v1/auth/validate', () => {
    let accessToken: string;

    beforeEach(async () => {
      // Create a test user and get access token
      const userData = {
        email: 'validate-test@example.com',
        password: 'TestPassword123!',
        confirmPassword: 'TestPassword123!',
        firstName: 'Validate',
        lastName: 'Test',
        role: 'PROPERTY_OWNER',
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData);

      accessToken = response.body.data.tokens.accessToken;
    });

    it('should validate token successfully', async () => {
      const response = await request(app)
        .get('/api/v1/auth/validate')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Token is valid');
      expect(response.body.data.valid).toBe(true);
      expect(response.body.data.payload).toHaveProperty('userId');
      expect(response.body.data.payload).toHaveProperty('email');
      expect(response.body.data.payload).toHaveProperty('role');
    });

    it('should reject invalid token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/validate')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid or expired token');
    });
  });
});
