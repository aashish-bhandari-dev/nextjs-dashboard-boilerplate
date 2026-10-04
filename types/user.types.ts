import { BaseApiResponse, BasePaginatedResponse } from './base.types';

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
  roleId?: string;
  hasCustomPermissions?: boolean;
  isActive: boolean;
  isDeactivated: boolean;
  isEmailVerified: boolean;
  emailVerifiedAt?: Date | string | null;
  isPhoneVerified: boolean;
  phoneVerifiedAt?: Date | string | null;
  provider: string;
  providerId?: string | null;
  permissions: string[];
  lastLoginAt?: Date | string | null;
  metadata?: Record<string, unknown>;
  createdAt: Date | string;
  updatedAt?: Date | string;
}

export interface CreateUserInput {
  firstName: string;
  lastName?: string | null;
  username?: string | null;
  email: string;
  password?: string;
  phone?: string | null;
  role?: string;
  roleId?: string;
  image?: string | null;
  bio?: string | null;
  gender?: string | null;
  dateOfBirth?: Date | string | null;
  locale?: string;
  timezone?: string;
  provider?: string;
  providerId?: string | null;
  isActive?: boolean;
  isDeactivated?: boolean;
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
  metadata?: Record<string, unknown> | null;
}

export interface UpdateUserInput extends Partial<CreateUserInput> {
  id?: string;
}

export interface UserQuery extends Record<string, string | number | boolean | undefined> {
  page?: number;
  limit?: number;
  searchTerm?: string;
  search?: string;
  role?: string;
  provider?: string;
  isActive?: boolean;
  isEmailVerified?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export type GetPaginatedUserResponse = BasePaginatedResponse<User>;
export type GetUserResponse = BaseApiResponse<User>;
