import { BaseApiResponse } from './base.types';
import { User } from './user.types';

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

export interface AuthResponseData {
  user: User;
  tokens: AuthTokens;
}

export type LoginResponse = BaseApiResponse<AuthResponseData>;
