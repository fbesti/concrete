import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/response';

// Error handling middleware
export const errorHandler = (
  error: Error | ApiError,
  req: Request,
  res: Response,
  _next: NextFunction
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

  // Handle ApiError instances (our custom errors)
  if (error instanceof ApiError) {
    res.status(error.statusCode).json({
      success: false,
      error: error.message,
      metadata: {
        timestamp: new Date().toISOString(),
        requestId: res.get('x-request-id') || undefined,
      },
    });
    return;
  }

  // Handle unexpected errors (should be rare now that we have proper error mapping)
  console.error('Unexpected error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message:
      process.env.NODE_ENV === 'development'
        ? error.message
        : 'Something went wrong',
    metadata: {
      timestamp: new Date().toISOString(),
      requestId: res.get('x-request-id') || undefined,
    },
  });
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
