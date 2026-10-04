import { BaseApiResponse } from './base.types';

export interface PermissionDefinition {
  name: string;
  displayName: string;
  description: string;
  module: string;
  action: string;
}

export type GroupedPermissions = Record<string, PermissionDefinition[]>;

export type RolePermissionsMatrix = Record<string, string[]>;

export interface ListPermissionsQuery {
  grouped?: boolean;
  module?: string;
  searchTerm?: string;
}

export type GetPermissionsResponse = BaseApiResponse<PermissionDefinition[]>;
export type GetGroupedPermissionsResponse = BaseApiResponse<GroupedPermissions>;
export type GetRoleMatrixResponse = BaseApiResponse<RolePermissionsMatrix>;
