import { Response } from 'express';

export class ApiError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(statusCode: number, message: string, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

// Standard API response interface
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string | undefined;
  error?: string | undefined;
  metadata?: {
    pagination?: PaginationInfo;
    timestamp: string;
    requestId?: string | undefined;
  };
}

// Pagination interface
export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Success response helper
export const successResponse = <T>(
  res: Response,
  data: T,
  message?: string,
  statusCode: number = 200,
  pagination?: PaginationInfo
): void => {
  const response: ApiResponse<T> = {
    success: true,
    data,
    message,
    metadata: {
      timestamp: new Date().toISOString(),
      requestId: res.get('x-request-id') || undefined,
      ...(pagination && { pagination }),
    },
  };

  res.status(statusCode).json(response);
};

// Error response helper
export const errorResponse = (
  res: Response,
  error: string,
  message?: string,
  statusCode: number = 400,
  details?: any
): void => {
  const response: ApiResponse = {
    success: false,
    error,
    message,
    metadata: {
      timestamp: new Date().toISOString(),
      requestId: res.get('x-request-id') || undefined,
    },
    ...(details && { details }),
  };

  res.status(statusCode).json(response);
};

// Specific response helpers
export const createdResponse = <T>(
  res: Response,
  data: T,
  message: string = 'Resource created successfully'
): void => {
  successResponse(res, data, message, 201);
};

export const updatedResponse = <T>(
  res: Response,
  data: T,
  message: string = 'Resource updated successfully'
): void => {
  successResponse(res, data, message, 200);
};

export const deletedResponse = (
  res: Response,
  message: string = 'Resource deleted successfully'
): void => {
  successResponse(res, null, message, 200);
};

export const notFoundResponse = (
  res: Response,
  message: string = 'Resource not found'
): void => {
  errorResponse(res, 'Not Found', message, 404);
};

export const unauthorizedResponse = (
  res: Response,
  message: string = 'Unauthorized access'
): void => {
  errorResponse(res, 'Unauthorized', message, 401);
};

export const forbiddenResponse = (
  res: Response,
  message: string = 'Access forbidden'
): void => {
  errorResponse(res, 'Forbidden', message, 403);
};

export const conflictResponse = (
  res: Response,
  message: string = 'Resource conflict'
): void => {
  errorResponse(res, 'Conflict', message, 409);
};

export const validationErrorResponse = (
  res: Response,
  details: any,
  message: string = 'Validation failed'
): void => {
  errorResponse(res, 'Validation Error', message, 400, details);
};

// Paginated response helper
export const paginatedResponse = <T>(
  res: Response,
  data: T[],
  pagination: PaginationInfo,
  message?: string
): void => {
  successResponse(res, data, message, 200, pagination);
};

// Helper to create pagination info
export const createPaginationInfo = (
  page: number,
  limit: number,
  total: number
): PaginationInfo => {
  const totalPages = Math.ceil(total / limit);

  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
};

// Response helpers that don't require Express Response object
export const createSuccessResponse = <T>(
  message: string,
  data: T
): ApiResponse<T> => {
  return {
    success: true,
    message,
    data,
    metadata: {
      timestamp: new Date().toISOString(),
    },
  };
};

export const createErrorResponse = (
  error: string,
  details?: any
): ApiResponse => {
  return {
    success: false,
    error,
    metadata: {
      timestamp: new Date().toISOString(),
    },
    ...(details && { details }),
  };
};
