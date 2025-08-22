// Test environment setup
// This file sets up environment variables for Jest tests
import { config } from 'dotenv';
import path from 'path';

// Load test environment variables before any other modules
process.env.NODE_ENV = 'test';

// Set test-specific environment variables
process.env.DATABASE_URL =
  'postgresql://postgres:postgres@localhost:5432/ha_management_test';
process.env.JWT_SECRET =
  'test-jwt-secret-key-that-is-at-least-32-characters-long-for-testing';
process.env.JWT_REFRESH_SECRET =
  'test-refresh-jwt-secret-key-that-is-at-least-32-characters-long';
process.env.PORT = '3002'; // Different port for tests
process.env.API_PREFIX = '/api/v1';
process.env.CORS_ORIGIN = 'http://localhost:3000';
process.env.RATE_LIMIT_WINDOW_MS = '900000';
process.env.RATE_LIMIT_MAX_REQUESTS = '1000';

// Load any additional environment variables from .env.test if it exists
config({
  path: path.resolve(__dirname, '../../.env.test'),
  override: false, // Don't override already set variables
});

export {};
