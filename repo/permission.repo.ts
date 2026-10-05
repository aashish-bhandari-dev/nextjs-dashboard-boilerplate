import {
  GetGroupedPermissionsResponse,
  GetPermissionsResponse,
  GetRoleMatrixResponse,
  GroupedPermissions,
  ListPermissionsQuery,
  PermissionDefinition,
  RolePermissionsMatrix,
} from '@/types/permission.types';
import { clientApi } from '@/lib/api/client-api';
import { handleApiError } from '@/lib/utils';

class PermissionRepo {
  /**
   * Fetch all registered permissions in the system
   */
  async listPermissions({
    query,
    cacheTtlMs = 60000,
    onSuccess,
    onError,
  }: {
    query?: ListPermissionsQuery;
    cacheTtlMs?: number;
    onSuccess: (permissions: PermissionDefinition[]) => void;
    onError: (message: string) => void;
  }): Promise<PermissionDefinition[] | undefined> {
    try {
      const response = await clientApi.get<GetPermissionsResponse | PermissionDefinition[]>(
        '/permissions',
        { params: query, cacheTtlMs },
      );

      let items: PermissionDefinition[] = [];
      const raw = response as unknown as Record<string, unknown>;

      if (Array.isArray(raw)) {
        items = raw as PermissionDefinition[];
      } else if (Array.isArray(raw?.data)) {
        items = raw.data as PermissionDefinition[];
      }

      onSuccess(items);
      return items;
    } catch (error) {
      const message = handleApiError(error, 'Failed to fetch permissions catalog');
      onError(message);
      return undefined;
    }
  }

  /**
   * Fetch permissions catalog grouped by module (e.g. users, roles, settings, audit)
   */
  async listGroupedPermissions({
    query,
    cacheTtlMs = 60000,
    onSuccess,
    onError,
  }: {
    query?: Omit<ListPermissionsQuery, 'grouped'>;
    cacheTtlMs?: number;
    onSuccess: (grouped: GroupedPermissions) => void;
    onError: (message: string) => void;
  }): Promise<GroupedPermissions | undefined> {
    try {
      const response = await clientApi.get<
        GetGroupedPermissionsResponse | GroupedPermissions
      >('/permissions', {
        params: { ...query, grouped: true },
        cacheTtlMs,
      });

      let grouped: GroupedPermissions = {};
      const raw = response as unknown as Record<string, unknown>;

      if (raw?.data && typeof raw.data === 'object' && !Array.isArray(raw.data)) {
        grouped = raw.data as GroupedPermissions;
      } else if (typeof raw === 'object' && !Array.isArray(raw)) {
        grouped = raw as GroupedPermissions;
      }

      onSuccess(grouped);
      return grouped;
    } catch (error) {
      const message = handleApiError(error, 'Failed to fetch grouped permissions');
      onError(message);
      return undefined;
    }
  }

  /**
   * Fetch default role-permission matrix
   */
  async getRoleMatrix({
    onSuccess,
    onError,
  }: {
    onSuccess: (matrix: RolePermissionsMatrix) => void;
    onError: (message: string) => void;
  }): Promise<RolePermissionsMatrix | undefined> {
    try {
      const response = await clientApi.get<GetRoleMatrixResponse | RolePermissionsMatrix>(
        '/permissions/roles',
      );

      let matrix: RolePermissionsMatrix = {};
      const raw = response as unknown as Record<string, unknown>;

      if (raw?.data && typeof raw.data === 'object' && !Array.isArray(raw.data)) {
        matrix = raw.data as RolePermissionsMatrix;
      } else if (typeof raw === 'object' && !Array.isArray(raw)) {
        matrix = raw as RolePermissionsMatrix;
      }

      onSuccess(matrix);
      return matrix;
    } catch (error) {
      const message = handleApiError(error, 'Failed to fetch role permissions matrix');
      onError(message);
      return undefined;
    }
  }
}

export const permissionRepo = new PermissionRepo();
export { PermissionRepo };
export default permissionRepo;
