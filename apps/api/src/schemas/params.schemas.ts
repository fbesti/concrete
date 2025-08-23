import { z } from 'zod';

// Common UUID validation
const uuidSchema = z.string().uuid('Invalid UUID format');

// User-related parameter schemas
export const UserIdParamSchema = z.object({
  userId: uuidSchema,
});

export const UserQuerySchema = z.object({
  role: z.enum(['HA_MANAGER', 'PROPERTY_OWNER']).optional(),
  search: z.string().min(1).max(100).optional(),
  page: z.string().regex(/^\d+$/, 'Page must be a number').optional(),
  limit: z.string().regex(/^\d+$/, 'Limit must be a number').optional(),
});

// HA-related parameter schemas
export const HAIdParamSchema = z.object({
  id: uuidSchema,
});

export const HAMemberParamSchema = z.object({
  id: uuidSchema,
  userId: uuidSchema,
});

export const HAQuerySchema = z.object({
  search: z.string().min(1).max(100).optional(),
  page: z.string().regex(/^\d+$/, 'Page must be a number').optional(),
  limit: z.string().regex(/^\d+$/, 'Limit must be a number').optional(),
});

export const HAMembersQuerySchema = z.object({
  page: z.string().regex(/^\d+$/, 'Page must be a number').optional(),
  limit: z.string().regex(/^\d+$/, 'Limit must be a number').optional(),
});

// Export types for TypeScript
export type UserIdParam = z.infer<typeof UserIdParamSchema>;
export type UserQuery = z.infer<typeof UserQuerySchema>;
export type HAIdParam = z.infer<typeof HAIdParamSchema>;
export type HAMemberParam = z.infer<typeof HAMemberParamSchema>;
export type HAQuery = z.infer<typeof HAQuerySchema>;
export type HAMembersQuery = z.infer<typeof HAMembersQuerySchema>;
