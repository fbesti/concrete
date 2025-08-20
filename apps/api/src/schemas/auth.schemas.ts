import { z } from 'zod';
import { UserRole } from '@prisma/client';

/**
 * Validation schema for user registration
 */
export const registerSchema = z.object({
  body: z
    .object({
      email: z
        .string()
        .email('Invalid email format')
        .min(1, 'Email is required')
        .max(255, 'Email is too long')
        .transform((email) => email.toLowerCase().trim()),

      password: z
        .string()
        .min(8, 'Password must be at least 8 characters long')
        .max(128, 'Password is too long')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/\d/, 'Password must contain at least one number')
        .regex(
          /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
          'Password must contain at least one special character'
        ),

      confirmPassword: z.string().min(1, 'Password confirmation is required'),

      firstName: z
        .string()
        .min(1, 'First name is required')
        .max(50, 'First name is too long')
        .regex(
          /^[a-zA-ZÀ-ÿĀ-žÐðÞþ\s'-]+$/,
          'First name contains invalid characters'
        )
        .transform((name) => name.trim()),

      lastName: z
        .string()
        .min(1, 'Last name is required')
        .max(50, 'Last name is too long')
        .regex(
          /^[a-zA-ZÀ-ÿĀ-žÐðÞþ\s'-]+$/,
          'Last name contains invalid characters'
        )
        .transform((name) => name.trim()),

      role: z
        .nativeEnum(UserRole, {
          errorMap: () => ({ message: 'Invalid user role' }),
        })
        .default(UserRole.PROPERTY_OWNER),

      kennitala: z
        .string()
        .optional()
        .refine(
          (kennitala) => {
            if (!kennitala) return true; // Optional field

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
            message:
              'Invalid kennitala format. Must be 10 digits (DDMMYY-NNCC)',
          }
        )
        .transform((kennitala) => {
          if (!kennitala) return undefined;
          // Remove any non-digit characters and return clean format
          return kennitala.replace(/\D/g, '');
        }),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: 'Passwords do not match',
      path: ['confirmPassword'],
    }),
});

/**
 * Validation schema for user login
 */
export const loginSchema = z.object({
  body: z.object({
    email: z
      .string()
      .email('Invalid email format')
      .min(1, 'Email is required')
      .transform((email) => email.toLowerCase().trim()),

    password: z.string().min(1, 'Password is required'),

    rememberMe: z.boolean().optional().default(false),
  }),
});

/**
 * Validation schema for token refresh
 */
export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
  }),
});

/**
 * Validation schema for password reset request
 */
export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z
      .string()
      .email('Invalid email format')
      .min(1, 'Email is required')
      .transform((email) => email.toLowerCase().trim()),
  }),
});

/**
 * Validation schema for password reset
 */
export const resetPasswordSchema = z.object({
  body: z
    .object({
      token: z.string().min(1, 'Reset token is required'),

      password: z
        .string()
        .min(8, 'Password must be at least 8 characters long')
        .max(128, 'Password is too long')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/\d/, 'Password must contain at least one number')
        .regex(
          /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
          'Password must contain at least one special character'
        ),

      confirmPassword: z.string().min(1, 'Password confirmation is required'),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: 'Passwords do not match',
      path: ['confirmPassword'],
    }),
});

/**
 * Validation schema for changing password (authenticated user)
 */
export const changePasswordSchema = z.object({
  body: z
    .object({
      currentPassword: z.string().min(1, 'Current password is required'),

      newPassword: z
        .string()
        .min(8, 'Password must be at least 8 characters long')
        .max(128, 'Password is too long')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/\d/, 'Password must contain at least one number')
        .regex(
          /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
          'Password must contain at least one special character'
        ),

      confirmNewPassword: z
        .string()
        .min(1, 'Password confirmation is required'),
    })
    .refine((data) => data.newPassword === data.confirmNewPassword, {
      message: 'Passwords do not match',
      path: ['confirmNewPassword'],
    })
    .refine((data) => data.currentPassword !== data.newPassword, {
      message: 'New password must be different from current password',
      path: ['newPassword'],
    }),
});

/**
 * Validation schema for updating user profile
 */
export const updateProfileSchema = z.object({
  body: z
    .object({
      firstName: z
        .string()
        .min(1, 'First name is required')
        .max(50, 'First name is too long')
        .regex(
          /^[a-zA-ZÀ-ÿĀ-žÐðÞþ\s'-]+$/,
          'First name contains invalid characters'
        )
        .transform((name) => name.trim())
        .optional(),

      lastName: z
        .string()
        .min(1, 'Last name is required')
        .max(50, 'Last name is too long')
        .regex(
          /^[a-zA-ZÀ-ÿĀ-žÐðÞþ\s'-]+$/,
          'Last name contains invalid characters'
        )
        .transform((name) => name.trim())
        .optional(),

      kennitala: z
        .string()
        .nullable()
        .optional()
        .refine(
          (kennitala) => {
            if (!kennitala) return true; // Nullable field

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
            message:
              'Invalid kennitala format. Must be 10 digits (DDMMYY-NNCC)',
          }
        )
        .transform((kennitala) => {
          if (!kennitala) return null;
          // Remove any non-digit characters and return clean format
          return kennitala.replace(/\D/g, '');
        }),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'At least one field must be provided for update',
    }),
});

/**
 * Validation schema for email verification
 */
export const verifyEmailSchema = z.object({
  body: z.object({
    token: z.string().min(1, 'Verification token is required'),
  }),
});

/**
 * Common password validation for reuse
 */
export const passwordValidation = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .max(128, 'Password is too long')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/\d/, 'Password must contain at least one number')
  .regex(
    /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
    'Password must contain at least one special character'
  );

/**
 * Common email validation for reuse
 */
export const emailValidation = z
  .string()
  .email('Invalid email format')
  .min(1, 'Email is required')
  .max(255, 'Email is too long')
  .transform((email) => email.toLowerCase().trim());

/**
 * Common name validation for reuse
 */
export const nameValidation = z
  .string()
  .min(1, 'Name is required')
  .max(50, 'Name is too long')
  .regex(/^[a-zA-ZÀ-ÿĀ-žÐðÞþ\s'-]+$/, 'Name contains invalid characters')
  .transform((name) => name.trim());

/**
 * Type definitions for validated schemas
 */
export type RegisterRequest = z.infer<typeof registerSchema>['body'];
export type LoginRequest = z.infer<typeof loginSchema>['body'];
export type RefreshTokenRequest = z.infer<typeof refreshTokenSchema>['body'];
export type ForgotPasswordRequest = z.infer<
  typeof forgotPasswordSchema
>['body'];
export type ResetPasswordRequest = z.infer<typeof resetPasswordSchema>['body'];
export type ChangePasswordRequest = z.infer<
  typeof changePasswordSchema
>['body'];
export type UpdateProfileRequest = z.infer<typeof updateProfileSchema>['body'];
export type VerifyEmailRequest = z.infer<typeof verifyEmailSchema>['body'];

export default {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  updateProfileSchema,
  verifyEmailSchema,
  passwordValidation,
  emailValidation,
  nameValidation,
};
