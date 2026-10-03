import { z } from 'zod';

/**
 * Zod validation schema for the User Form (Create & Edit).
 * Aligned with backend validation requirements and user-friendly messages.
 */
export const userFormSchema = (isEdit: boolean = false) =>
  z.object({
    firstName: z
      .string()
      .trim()
      .min(1, 'First name is required'),
    lastName: z.string().trim().optional(),
    username: z
      .string()
      .trim()
      .refine(
        (val) => !val || (val.length >= 3 && /^[a-zA-Z0-9_.-]+$/.test(val)),
        {
          message:
            'Username must be at least 3 characters and can only contain letters, numbers, dots, and underscores',
        },
      )
      .optional(),
    email: z
      .string()
      .trim()
      .min(1, 'Email address is required')
      .email('Invalid email address'),
    password: isEdit
      ? z
          .string()
          .refine((val) => !val || val.length >= 6, {
            message: 'Password must be at least 6 characters long if changed',
          })
          .optional()
      : z
          .string()
          .min(6, 'Password must be at least 6 characters long'),
    phone: z.string().trim().optional(),
    image: z
      .string()
      .trim()
      .refine(
        (val) =>
          !val ||
          val.startsWith('data:image/') ||
          /^https?:\/\/.+/i.test(val),
        {
          message: 'Please provide a valid image URL or uploaded file',
        },
      )
      .optional(),
    bio: z
      .string()
      .max(500, 'Bio cannot exceed 500 characters')
      .optional(),
    gender: z.string().optional(),
    dateOfBirth: z.string().optional(),
    locale: z.string().optional(),
    timezone: z.string().optional(),
    role: z.string().optional(),
    provider: z.string().optional(),
    providerId: z.string().optional(),
    isActive: z.boolean().optional(),
    isDeactivated: z.boolean().optional(),
    isEmailVerified: z.boolean().optional(),
    isPhoneVerified: z.boolean().optional(),
  });

// Pre-configured schemas for direct usage
export const createUserFormSchema = userFormSchema(false);
export const updateUserFormSchema = userFormSchema(true);

// Type inferred from the form schema
export type UserFormValues = z.infer<typeof createUserFormSchema>;
