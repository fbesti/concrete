import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Load environment variables first
dotenv.config();

// Import and validate environment
import { env } from './config/env';

// Import middleware
import { requestLogger, addRequestId } from './middleware/request-logger';
import { errorHandler, notFoundHandler } from './middleware/error-handler';
import { generalLimiter } from './middleware/rate-limiter';
import { sanitizeInput } from './middleware/validation';
import { successResponse } from './utils/response';

const app: Application = express();
const prisma = new PrismaClient();

// Trust proxy (for rate limiting behind reverse proxy)
app.set('trust proxy', 1);

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
  })
);

// CORS configuration
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-request-id'],
  })
);

// Request parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request middleware
app.use(addRequestId);
app.use(requestLogger);
app.use(generalLimiter);
app.use(sanitizeInput);

// Database health check endpoint
app.get('/health', async (req: Request, res: Response): Promise<void> => {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;

    successResponse(
      res,
      {
        status: 'healthy',
        database: 'connected',
        environment: env.NODE_ENV,
        version: '1.0.0',
      },
      'Service is healthy'
    );
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(503).json({
      success: false,
      error: 'Service unhealthy',
      message: 'Database connection failed',
      metadata: {
        timestamp: new Date().toISOString(),
        requestId: res.get('x-request-id'),
      },
    });
  }
});

// Make Prisma client available to routes
app.locals.prisma = prisma;

// Import routes
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import haRoutes from './routes/ha.routes';

// API routes
app.use(`${env.API_PREFIX}/auth`, authRoutes);
app.use(`${env.API_PREFIX}/users`, userRoutes);
app.use(`${env.API_PREFIX}/ha`, haRoutes);

// 404 handler for undefined routes
app.use('*', notFoundHandler);

// Error handling middleware (must be last)
app.use(errorHandler);

// Graceful shutdown handling
const server = app.listen(env.PORT, (): void => {
  console.log(`🚀 Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
  console.log(
    `📊 Health check available at http://localhost:${env.PORT}/health`
  );
});

// Handle shutdown signals
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(async () => {
    console.log('HTTP server closed.');
    await prisma.$disconnect();
    console.log('Database connection closed.');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('SIGINT received. Shutting down gracefully...');
  server.close(async () => {
    console.log('HTTP server closed.');
    await prisma.$disconnect();
    console.log('Database connection closed.');
    process.exit(0);
  });
});

export default app;
