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

export interface UserPermissionItemState {
  name: string;
  displayName: string;
  description: string;
  module: string;
  action: string;
  isInheritedFromRole: boolean;
  isOverridden: boolean;
  isGranted: boolean;
}

export interface UserEffectivePermissionsResponse {
  userId: string;
  role: string;
  hasCustomPermissions: boolean;
  rolePermissions: string[];
  directPermissions: Array<{
    permission: string;
    displayName: string;
    isGranted: boolean;
  }>;
  effectivePermissions: string[];
  catalog: UserPermissionItemState[];
  groupedCatalog: Record<string, UserPermissionItemState[]>;
}

export interface UpdateUserPermissionsInput {
  permissions?: string[];
  overrides?: Array<{
    permission: string;
    isGranted: boolean;
  }>;
  resetToDefault?: boolean;
}

export type GetUserPermissionsApiResponse = BaseApiResponse<UserEffectivePermissionsResponse>;

