import { User } from './auth.types';

export type { User };

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

export interface PaginatedUsersData {
  users: User[];
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}
