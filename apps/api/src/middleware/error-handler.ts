import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';

export interface ApiError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export class CustomError extends Error implements ApiError {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends CustomError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class NotFoundError extends CustomError {
  constructor(message: string = 'Resource not found') {
    super(message, 404);
  }
}

export class ConflictError extends CustomError {
  constructor(message: string) {
    super(message, 409);
  }
}

export class UnauthorizedError extends CustomError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401);
  }
}

export class ForbiddenError extends CustomError {
  constructor(message: string = 'Forbidden') {
    super(message, 403);
  }
}

// Error handling middleware
export const errorHandler = (
  error: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Log error
  console.error('Error occurred:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString(),
    userAgent: req.get('User-Agent'),
    ip: req.ip,
  });

  // Handle Prisma-specific errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    handlePrismaError(error, res);
    return;
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    res.status(400).json({
      success: false,
      error: 'Invalid data provided',
      message: 'Validation failed',
      timestamp: new Date().toISOString(),
    });
    return;
  }

  // Handle custom errors
  if (error.statusCode) {
    res.status(error.statusCode).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
    return;
  }

  // Handle unexpected errors
  console.error('Unexpected error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message:
      process.env.NODE_ENV === 'development'
        ? error.message
        : 'Something went wrong',
    timestamp: new Date().toISOString(),
  });
};

// Handle Prisma-specific errors
const handlePrismaError = (
  error: Prisma.PrismaClientKnownRequestError,
  res: Response
): void => {
  switch (error.code) {
    case 'P2002':
      // Unique constraint violation
      const field = error.meta?.target as string[] | undefined;
      res.status(409).json({
        success: false,
        error: 'Duplicate entry',
        message: `${field ? field.join(', ') : 'Field'} already exists`,
        timestamp: new Date().toISOString(),
      });
      break;

    case 'P2025':
      // Record not found
      res.status(404).json({
        success: false,
        error: 'Record not found',
        message: 'The requested resource was not found',
        timestamp: new Date().toISOString(),
      });
      break;

    case 'P2003':
      // Foreign key constraint violation
      res.status(400).json({
        success: false,
        error: 'Invalid reference',
        message: 'Referenced record does not exist',
        timestamp: new Date().toISOString(),
      });
      break;

    default:
      res.status(500).json({
        success: false,
        error: 'Database error',
        message:
          process.env.NODE_ENV === 'development'
            ? error.message
            : 'Database operation failed',
        timestamp: new Date().toISOString(),
      });
  }
};

// Async error catcher wrapper
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// 404 handler for undefined routes
export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    message: `Route ${req.method} ${req.originalUrl} not found`,
    timestamp: new Date().toISOString(),
  });
};
