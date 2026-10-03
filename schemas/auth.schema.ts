import { z } from 'zod';

/**
 * Zod validation schema for the Admin Login Form.
 */
export const loginFormSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(1, 'Administrator identifier is required'),
  password: z
    .string()
    .min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

// Convenient alias for direct usage
export const loginSchema = loginFormSchema;

// Inferred types from the form schema
export type LoginFormValues = z.infer<typeof loginFormSchema>;
export type LoginInput = z.infer<typeof loginFormSchema>;
