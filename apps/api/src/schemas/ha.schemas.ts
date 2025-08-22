import { z } from 'zod';

/**
 * Validation schema for creating a house association
 */
export const createHASchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(1, 'House association name is required')
      .max(200, 'House association name is too long')
      .regex(
        /^[a-zA-ZÀ-ÿĀ-žÐðÞþ0-9\s\-.,&()]+$/,
        'House association name contains invalid characters'
      )
      .transform((name) => name.trim()),

    address: z
      .string()
      .min(1, 'Address is required')
      .max(500, 'Address is too long')
      .transform((address) => address.trim()),

    registrationNum: z
      .string()
      .min(1, 'Registration number is required')
      .max(20, 'Registration number is too long')
      .regex(
        /^[0-9\-]+$/,
        'Registration number can only contain numbers and hyphens'
      )
      .transform((num) => num.trim()),
  }),
});

/**
 * Validation schema for updating house association
 */
export const updateHASchema = z.object({
  params: z.object({
    id: z.string().cuid('Invalid HA ID format'),
  }),
  body: z
    .object({
      name: z
        .string()
        .min(1, 'House association name is required')
        .max(200, 'House association name is too long')
        .regex(
          /^[a-zA-ZÀ-ÿĀ-žÐðÞþ0-9\s\-.,&()]+$/,
          'House association name contains invalid characters'
        )
        .transform((name) => name.trim())
        .optional(),

      address: z
        .string()
        .min(1, 'Address is required')
        .max(500, 'Address is too long')
        .transform((address) => address.trim())
        .optional(),

      registrationNum: z
        .string()
        .min(1, 'Registration number is required')
        .max(20, 'Registration number is too long')
        .regex(
          /^[0-9\-]+$/,
          'Registration number can only contain numbers and hyphens'
        )
        .transform((num) => num.trim())
        .optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'At least one field must be provided for update',
    }),
});

/**
 * Validation schema for getting HA details
 */
export const getHASchema = z.object({
  params: z.object({
    id: z.string().cuid('Invalid HA ID format'),
  }),
});

/**
 * Validation schema for HA list query parameters
 */
export const listHASchema = z.object({
  query: z.object({
    page: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 1))
      .refine((val) => val > 0, 'Page must be greater than 0'),

    limit: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 10))
      .refine(
        (val) => val > 0 && val <= 100,
        'Limit must be between 1 and 100'
      ),

    search: z
      .string()
      .optional()
      .transform((val) => (val ? val.trim() : undefined)),
  }),
});

/**
 * Validation schema for adding HA member by kennitala
 */
export const addHAMemberSchema = z.object({
  params: z.object({
    id: z.string().cuid('Invalid HA ID format'),
  }),
  body: z.object({
    kennitala: z
      .string()
      .min(1, 'Kennitala is required')
      .refine(
        (kennitala) => {
          // Remove any non-digit characters
          const cleaned = kennitala.replace(/\D/g, '');

          // Must be exactly 10 digits
          if (cleaned.length !== 10) return false;

          // Basic format validation (DDMMYY-NNCC)
          const day = parseInt(cleaned.substring(0, 2), 10);
          const month = parseInt(cleaned.substring(2, 4), 10);

          return day >= 1 && day <= 31 && month >= 1 && month <= 12;
        },
        {
          message: 'Invalid kennitala format. Must be 10 digits (DDMMYY-NNCC)',
        }
      )
      .transform((kennitala) => {
        // Remove any non-digit characters and return clean format
        return kennitala.replace(/\D/g, '');
      }),
  }),
});

/**
 * Validation schema for removing HA member
 */
export const removeHAMemberSchema = z.object({
  params: z.object({
    id: z.string().cuid('Invalid HA ID format'),
    userId: z.string().cuid('Invalid user ID format'),
  }),
});

/**
 * Validation schema for listing HA members
 */
export const listHAMembersSchema = z.object({
  params: z.object({
    id: z.string().cuid('Invalid HA ID format'),
  }),
  query: z.object({
    page: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 1))
      .refine((val) => val > 0, 'Page must be greater than 0'),

    limit: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 20))
      .refine(
        (val) => val > 0 && val <= 100,
        'Limit must be between 1 and 100'
      ),
  }),
});

/**
 * Common validation for cuid parameters
 */
export const cuidValidation = z.string().cuid('Invalid ID format');

/**
 * Common validation for registration numbers
 */
export const registrationNumValidation = z
  .string()
  .min(1, 'Registration number is required')
  .max(20, 'Registration number is too long')
  .regex(
    /^[0-9\-]+$/,
    'Registration number can only contain numbers and hyphens'
  )
  .transform((num) => num.trim());

/**
 * Common validation for HA names
 */
export const haNameValidation = z
  .string()
  .min(1, 'House association name is required')
  .max(200, 'House association name is too long')
  .regex(
    /^[a-zA-ZÀ-ÿĀ-žÐðÞþ0-9\s\-.,&()]+$/,
    'House association name contains invalid characters'
  )
  .transform((name) => name.trim());

/**
 * Common validation for addresses
 */
export const addressValidation = z
  .string()
  .min(1, 'Address is required')
  .max(500, 'Address is too long')
  .transform((address) => address.trim());

/**
 * Common kennitala validation for member operations
 */
export const kennitalaMemberValidation = z
  .string()
  .min(1, 'Kennitala is required')
  .refine(
    (kennitala) => {
      // Remove any non-digit characters
      const cleaned = kennitala.replace(/\D/g, '');

      // Must be exactly 10 digits
      if (cleaned.length !== 10) return false;

      // Basic format validation (DDMMYY-NNCC)
      const day = parseInt(cleaned.substring(0, 2), 10);
      const month = parseInt(cleaned.substring(2, 4), 10);

      return day >= 1 && day <= 31 && month >= 1 && month <= 12;
    },
    {
      message: 'Invalid kennitala format. Must be 10 digits (DDMMYY-NNCC)',
    }
  )
  .transform((kennitala) => {
    // Remove any non-digit characters and return clean format
    return kennitala.replace(/\D/g, '');
  });

/**
 * Type definitions for validated schemas
 */
export type CreateHARequest = z.infer<typeof createHASchema>['body'];
export type UpdateHARequest = z.infer<typeof updateHASchema>['body'];
export type UpdateHAParams = z.infer<typeof updateHASchema>['params'];
export type GetHAParams = z.infer<typeof getHASchema>['params'];
export type ListHAQuery = z.infer<typeof listHASchema>['query'];
export type AddHAMemberRequest = z.infer<typeof addHAMemberSchema>['body'];
export type AddHAMemberParams = z.infer<typeof addHAMemberSchema>['params'];
export type RemoveHAMemberParams = z.infer<
  typeof removeHAMemberSchema
>['params'];
export type ListHAMembersParams = z.infer<typeof listHAMembersSchema>['params'];
export type ListHAMembersQuery = z.infer<typeof listHAMembersSchema>['query'];

export default {
  createHASchema,
  updateHASchema,
  getHASchema,
  listHASchema,
  addHAMemberSchema,
  removeHAMemberSchema,
  listHAMembersSchema,
  cuidValidation,
  registrationNumValidation,
  haNameValidation,
  addressValidation,
  kennitalaMemberValidation,
};
