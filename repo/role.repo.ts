import { BaseApiResponse, PaginationMeta } from '@/types/base.types';
import {
  CreateRoleInput,
  GetPaginatedRolesResponse,
  GetRoleResponse,
  Role,
  RoleQuery,
  UpdateRoleInput,
} from '@/types/role.types';
import { clientApi } from '@/lib/api/client-api';
import { handleApiError } from '@/lib/utils';

function cleanPayload<T extends Record<string, unknown>>(data: T): Partial<T> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value === null || value === undefined || value === '') {
      continue;
    }
    result[key] = value;
  }
  return result as Partial<T>;
}

class RoleRepo {
  /**
   * Fetch paginated list of roles with optional search query
   */
  async listRoles({
    query,
    onSuccess,
    onError,
  }: {
    query?: RoleQuery;
    onSuccess: (roles: Role[], total?: number, meta?: PaginationMeta) => void;
    onError: (message: string) => void;
  }): Promise<{ roles: Role[]; total: number; meta?: PaginationMeta } | undefined> {
    try {
      const response = await clientApi.get<GetPaginatedRolesResponse | Role[]>('/roles', {
        params: query,
      });

      let roleList: Role[] = [];
      let totalCount = 0;
      let meta: PaginationMeta | undefined;

      const raw = response as unknown as Record<string, unknown>;

      if (Array.isArray(raw)) {
        roleList = raw as Role[];
        totalCount = roleList.length;
      } else if (Array.isArray(raw?.data)) {
        roleList = raw.data as Role[];
        meta = raw?.meta as PaginationMeta | undefined;
        totalCount = meta?.total ?? (raw.total as number) ?? roleList.length;
      }

      onSuccess(roleList, totalCount, meta);
      return { roles: roleList, total: totalCount, meta };
    } catch (error) {
      const message = handleApiError(error, 'Failed to fetch roles list');
      onError(message);
      return undefined;
    }
  }

  /**
   * Fetch a single role by its ID
   */
  async getRoleById({
    id,
    onSuccess,
    onError,
  }: {
    id: string;
    onSuccess: (role: Role) => void;
    onError: (message: string) => void;
  }): Promise<Role | undefined> {
    try {
      const response = await clientApi.get<GetRoleResponse | Role>(`/roles/${id}`);

      const role =
        (response as BaseApiResponse<Role>)?.data &&
        typeof (response as BaseApiResponse<Role>).data === 'object'
          ? (response as BaseApiResponse<Role>).data
          : (response as Role);

      if (!role) {
        throw new Error('Role not found.');
      }

      onSuccess(role);
      return role;
    } catch (error) {
      const message = handleApiError(error, `Failed to load role details for ID: ${id}`);
      onError(message);
      return undefined;
    }
  }

  /**
   * Create a new custom role
   */
  async createRole({
    data,
    onSuccess,
    onError,
  }: {
    data: CreateRoleInput;
    onSuccess: (role: Role) => void;
    onError: (message: string) => void;
  }): Promise<Role | undefined> {
    try {
      const sanitized = cleanPayload(data as unknown as Record<string, unknown>);
      const response = await clientApi.post<GetRoleResponse | Role>('/roles', sanitized);

      const role =
        (response as BaseApiResponse<Role>)?.data &&
        typeof (response as BaseApiResponse<Role>).data === 'object'
          ? (response as BaseApiResponse<Role>).data
          : (response as Role);

      onSuccess(role);
      return role;
    } catch (error) {
      const message = handleApiError(error, 'Failed to create role');
      onError(message);
      return undefined;
    }
  }

  /**
   * Update an existing role by ID
   */
  async updateRole({
    id,
    data,
    onSuccess,
    onError,
  }: {
    id: string;
    data: UpdateRoleInput;
    onSuccess: (role: Role) => void;
    onError: (message: string) => void;
  }): Promise<Role | undefined> {
    try {
      const sanitized = cleanPayload(data as unknown as Record<string, unknown>);
      const response = await clientApi.patch<GetRoleResponse | Role>(
        `/roles/${id}`,
        sanitized,
      );

      const role =
        (response as BaseApiResponse<Role>)?.data &&
        typeof (response as BaseApiResponse<Role>).data === 'object'
          ? (response as BaseApiResponse<Role>).data
          : (response as Role);

      onSuccess(role);
      return role;
    } catch (error) {
      const message = handleApiError(error, `Failed to update role ID: ${id}`);
      onError(message);
      return undefined;
    }
  }

  /**
   * Assign or sync permissions for a role
   */
  async assignPermissions({
    id,
    permissions,
    onSuccess,
    onError,
  }: {
    id: string;
    permissions: string[];
    onSuccess: (role: Role) => void;
    onError: (message: string) => void;
  }): Promise<Role | undefined> {
    try {
      const response = await clientApi.put<GetRoleResponse | Role>(
        `/roles/${id}/permissions`,
        { permissions },
      );

      const role =
        (response as BaseApiResponse<Role>)?.data &&
        typeof (response as BaseApiResponse<Role>).data === 'object'
          ? (response as BaseApiResponse<Role>).data
          : (response as Role);

      onSuccess(role);
      return role;
    } catch (error) {
      const message = handleApiError(error, 'Failed to update role permissions');
      onError(message);
      return undefined;
    }
  }

  /**
   * Delete a custom role by ID
   */
  async deleteRole({
    id,
    onSuccess,
    onError,
  }: {
    id: string;
    onSuccess: () => void;
    onError: (message: string) => void;
  }): Promise<boolean> {
    try {
      await clientApi.delete<BaseApiResponse<null> | void>(`/roles/${id}`);
      onSuccess();
      return true;
    } catch (error) {
      const message = handleApiError(error, `Failed to delete role ID: ${id}`);
      onError(message);
      return false;
    }
  }
}

export const roleRepo = new RoleRepo();
export { RoleRepo };
export default roleRepo;
