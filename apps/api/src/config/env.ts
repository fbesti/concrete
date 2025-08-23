import { z } from 'zod';
import dotenv from 'dotenv';

// Load environment variables first
dotenv.config({ path: '.env' });

// Environment validation schema
const envSchema = z.object({
  // Node environment
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),

  // Server configuration
  PORT: z
    .string()
    .transform(Number)
    .pipe(z.number().min(1).max(65535))
    .default('3001'),

  // Database configuration
  DATABASE_URL: z
    .string()
    .url('DATABASE_URL must be a valid PostgreSQL connection string'),
  SHADOW_DATABASE_URL: z
    .string()
    .url('SHADOW_DATABASE_URL must be a valid PostgreSQL connection string')
    .optional(),

  // JWT configuration
  JWT_SECRET: z
    .string()
    .min(32, 'JWT_SECRET must be at least 32 characters long'),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_SECRET: z
    .string()
    .min(32, 'JWT_REFRESH_SECRET must be at least 32 characters long')
    .optional(),

  // Optional Azure configuration (for future file uploads)
  AZURE_STORAGE_CONNECTION_STRING: z.string().optional(),
  AZURE_STORAGE_CONTAINER_NAME: z.string().optional(),

  // Optional email configuration (for future notifications)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z
    .string()
    .transform(Number)
    .pipe(z.number().min(1).max(65535))
    .optional(),
  SMTP_USER: z.string().email().optional(),
  SMTP_PASS: z.string().optional(),

  // API configuration
  API_PREFIX: z.string().default('/api/v1'),

  // CORS configuration
  CORS_ORIGIN: z.string().default('http://localhost:3000'),

  // Rate limiting
  RATE_LIMIT_WINDOW_MS: z
    .string()
    .transform(Number)
    .pipe(z.number().min(1000))
    .default('900000'), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: z
    .string()
    .transform(Number)
    .pipe(z.number().min(1))
    .default('1000'),
});

// Validate environment variables
export const validateEnv = (): z.infer<typeof envSchema> => {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map((err) => ({
        variable: err.path.join('.'),
        message: err.message,
        received: (err as any).received || 'undefined',
      }));

      console.error('❌ Environment validation failed:');
      console.error(JSON.stringify(missingVars, null, 2));

      process.exit(1);
    }

    throw error;
  }
};

// Export validated environment variables
export const env = validateEnv();

// Type export for use in other files
export type Environment = z.infer<typeof envSchema>;
