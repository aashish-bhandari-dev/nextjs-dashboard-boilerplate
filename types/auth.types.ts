export type AllowedRole = 'SUPER_ADMIN' | 'ADMIN';

export const ALLOWED_DASHBOARD_ROLES: AllowedRole[] = ['SUPER_ADMIN', 'ADMIN'];

export function isAllowedDashboardRole(role?: string | null): boolean {
  if (!role) return false;
  return ALLOWED_DASHBOARD_ROLES.includes(role as AllowedRole);
}

export interface LoginInput {
  identifier: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  tokenType?: string;
  expiresIn?: number;
}

export interface User {
  id: string;
  firstName: string;
  lastName?: string | null;
  fullName: string;
  username?: string | null;
  email: string;
  phone?: string | null;
  image?: string | null;
  bio?: string | null;
  gender?: string | null;
  dateOfBirth?: Date | string | null;
  locale?: string;
  timezone?: string;
  role: string;
  hasCustomPermissions?: boolean;
  isActive: boolean;
  isDeactivated: boolean;
  isEmailVerified: boolean;
  emailVerifiedAt?: Date | string | null;
  isPhoneVerified: boolean;
  phoneVerifiedAt?: Date | string | null;
  provider: string;
  permissions: string[];
  lastLoginAt?: Date | string | null;
  metadata?: Record<string, unknown>;
  createdAt: Date | string;
  updatedAt?: Date | string;
}

export interface AuthResponseData {
  user: User;
  tokens: AuthTokens;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  statusCode?: number;
  errors?: unknown[];
}
