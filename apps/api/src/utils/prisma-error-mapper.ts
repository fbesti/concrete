import { Prisma } from '@prisma/client';
import {
  ApiError,
  ConflictError,
  NotFoundError,
  ValidationError,
} from './response';

/**
 * Maps Prisma errors to appropriate ApiError instances with meaningful messages
 */
export const mapPrismaError = (error: unknown): ApiError => {
  // Handle Prisma errors by checking the error properties instead of instanceof
  // This approach works better with mocked Prisma in tests
  if (
    error &&
    typeof error === 'object' &&
    'code' in error &&
    'message' in error
  ) {
    const prismaError = error as { code: string; message: string; meta?: any };

    switch (prismaError.code) {
      case 'P2002': {
        // Unique constraint violation
        const field = prismaError.meta?.target as string[] | undefined;
        const fieldName = field ? field.join(', ') : 'field';

        // Create specific error messages based on field
        if (field?.includes('registrationNum')) {
          return new ConflictError(
            'House association with this registration number already exists'
          );
        }
        if (field?.includes('email')) {
          return new ConflictError('User with this email already exists');
        }
        if (field?.includes('kennitala')) {
          return new ConflictError('User with this kennitala already exists');
        }

        return new ConflictError(`${fieldName} already exists`);
      }

      case 'P2025':
        // Record not found
        return new NotFoundError('The requested resource was not found');

      case 'P2003':
        // Foreign key constraint violation
        return new ValidationError('Referenced record does not exist');

      case 'P2014':
        // Required relation violation
        return new ValidationError('Required relationship is missing');

      case 'P2016':
        // Query interpretation error
        return new ValidationError('Invalid query parameters');

      case 'P2021':
        // Table does not exist
        return ApiError.internal('Database schema error');

      case 'P2022':
        // Column does not exist
        return ApiError.internal('Database schema error');

      default:
        return ApiError.internal(
          `Database operation failed: ${prismaError.code}`
        );
    }
  }

  // Try to handle instanceof checks with fallback for mocked environments
  try {
    if (
      Prisma?.PrismaClientValidationError &&
      error instanceof Prisma.PrismaClientValidationError
    ) {
      return new ValidationError('Invalid data provided to database');
    }

    if (
      Prisma?.PrismaClientInitializationError &&
      error instanceof Prisma.PrismaClientInitializationError
    ) {
      return ApiError.internal('Database connection failed');
    }

    if (
      Prisma?.PrismaClientRustPanicError &&
      error instanceof Prisma.PrismaClientRustPanicError
    ) {
      return ApiError.internal('Database engine error');
    }
  } catch {
    // Ignore errors in test environment where Prisma might be undefined
  }

  // If it's already an ApiError, don't wrap it
  if (error instanceof ApiError) {
    return error;
  }

  // For any other error, return a generic internal error
  if (error instanceof Error) {
    return ApiError.internal(`Unexpected error: ${error.message}`);
  }

  return ApiError.internal('An unknown error occurred');
};

/**
 * Specific error mappers for common scenarios
 */
export const mapHouseAssociationErrors = (error: unknown): ApiError => {
  // Add context-specific error handling for house associations first
  if (
    error &&
    typeof error === 'object' &&
    'code' in error &&
    'message' in error
  ) {
    const prismaError = error as { code: string; message: string; meta?: any };

    if (prismaError.code === 'P2002') {
      const field = prismaError.meta?.target as string[] | undefined;
      if (field && field.includes('registrationNum')) {
        return new ConflictError(
          'House association with this registration number already exists'
        );
      }
    }
    if (
      prismaError.code === 'P2025' &&
      prismaError.meta?.modelName === 'HouseAssociation'
    ) {
      return new NotFoundError('House association not found');
    }
  }

  return mapPrismaError(error);
};

export const mapUserErrors = (error: unknown): ApiError => {
  // Add context-specific error handling for users first
  if (
    error &&
    typeof error === 'object' &&
    'code' in error &&
    'message' in error
  ) {
    const prismaError = error as { code: string; message: string; meta?: any };

    if (prismaError.code === 'P2002') {
      const field = prismaError.meta?.target as string[] | undefined;
      if (field && field.includes('email')) {
        return new ConflictError('User with this email already exists');
      }
    }
    if (
      prismaError.code === 'P2025' &&
      prismaError.meta?.modelName === 'User'
    ) {
      return new NotFoundError('User not found');
    }
  }

  return mapPrismaError(error);
};

export const mapMembershipErrors = (error: unknown): ApiError => {
  // Add context-specific error handling for memberships first
  if (
    error &&
    typeof error === 'object' &&
    'code' in error &&
    'message' in error
  ) {
    const prismaError = error as { code: string; message: string; meta?: any };

    if (prismaError.code === 'P2002') {
      const field = prismaError.meta?.target as string[] | undefined;
      if (field && field.includes('userId') && field.includes('haId')) {
        return new ConflictError(
          'User is already a member of this house association'
        );
      }
    }
    if (
      prismaError.code === 'P2025' &&
      prismaError.meta?.modelName === 'HAMembership'
    ) {
      return new NotFoundError(
        'User is not a member of this house association'
      );
    }
  }

  return mapPrismaError(error);
};
