import { BaseApiResponse, BasePaginatedResponse } from './base.types';

export interface Role {
  id: string;
  name: string;
  displayName: string;
  description?: string | null;
  hierarchy: number;
  isSystem: boolean;
  permissions: string[];
  usersCount?: number;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface CreateRoleInput {
  name: string;
  displayName: string;
  description?: string;
  hierarchy?: number;
  permissions?: string[];
}

export interface UpdateRoleInput {
  name?: string;
  displayName?: string;
  description?: string;
  hierarchy?: number;
  permissions?: string[];
}

export interface RoleQuery extends Record<string, string | number | boolean | undefined> {
  page?: number;
  limit?: number;
  searchTerm?: string;
}

export interface AssignRolePermissionsInput {
  permissions: string[];
}

export type GetPaginatedRolesResponse = BasePaginatedResponse<Role>;
export type GetRoleResponse = BaseApiResponse<Role>;
