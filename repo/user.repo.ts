import { BaseApiResponse, PaginationMeta } from '@/types/base.types';
import {
  CreateUserInput,
  GetPaginatedUserResponse,
  GetUserResponse,
  UpdateUserInput,
  User,
  UserQuery,
} from '@/types/user.types';
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

class UserRepo {
  /**
   * Fetch paginated list of users with optional filtering and search
   */
  async listUsers({
    query,
    onSuccess,
    onError,
  }: {
    query?: UserQuery;
    onSuccess: (users: User[], total?: number, meta?: PaginationMeta) => void;
    onError: (message: string) => void;
  }): Promise<{ users: User[]; total: number; meta?: PaginationMeta } | undefined> {
    try {
      const params = {
        ...query,
        ...(query?.searchTerm || query?.search
          ? { searchTerm: query.searchTerm || query.search }
          : {}),
      };

      const response = await clientApi.get<GetPaginatedUserResponse | User[]>('/users', {
        params,
      });

      let userList: User[] = [];
      let totalCount = 0;
      let meta: PaginationMeta | undefined;

      const raw = response as unknown as Record<string, unknown>;

      if (Array.isArray(raw)) {
        userList = raw as User[];
        totalCount = userList.length;
      } else if (Array.isArray(raw?.data)) {
        userList = raw.data as User[];
        meta = raw?.meta as PaginationMeta | undefined;
        totalCount = (meta?.total as number) ?? (raw.total as number) ?? userList.length;
      } else if (raw?.data && typeof raw.data === 'object') {
        const dataObj = raw.data as Record<string, unknown>;
        if (Array.isArray(dataObj.users)) {
          userList = dataObj.users as User[];
          totalCount =
            (dataObj.total as number) ||
            ((dataObj.meta as Record<string, unknown>)?.total as number) ||
            ((dataObj.pagination as Record<string, unknown>)?.total as number) ||
            userList.length;
        }
      } else if (Array.isArray(raw?.users)) {
        userList = raw.users as User[];
        totalCount = (raw.total as number) || userList.length;
      }

      onSuccess(userList, totalCount, meta);
      return { users: userList, total: totalCount, meta };
    } catch (error) {
      const message = handleApiError(error, 'Failed to fetch users list');
      onError(message);
      return undefined;
    }
  }

  /**
   * Fetch a single user by their ID
   */
  async getUserById({
    id,
    onSuccess,
    onError,
  }: {
    id: string;
    onSuccess: (user: User) => void;
    onError: (message: string) => void;
  }): Promise<User | undefined> {
    try {
      const response = await clientApi.get<GetUserResponse | User>(`/users/${id}`);

      const user =
        (response as BaseApiResponse<User>)?.data &&
        typeof (response as BaseApiResponse<User>).data === 'object'
          ? (response as BaseApiResponse<User>).data
          : (response as User);

      if (!user) {
        throw new Error('User not found.');
      }

      onSuccess(user);
      return user;
    } catch (error) {
      const message = handleApiError(error, `Failed to load user details for ID: ${id}`);
      onError(message);
      return undefined;
    }
  }

  /**
   * Create a new user record
   */
  async createUser({
    data,
    onSuccess,
    onError,
  }: {
    data: CreateUserInput;
    onSuccess: (user: User) => void;
    onError: (message: string) => void;
  }): Promise<User | undefined> {
    try {
      const sanitized = cleanPayload(data as unknown as Record<string, unknown>);
      const response = await clientApi.post<GetUserResponse | User>('/users', sanitized);

      const user =
        (response as BaseApiResponse<User>)?.data &&
        typeof (response as BaseApiResponse<User>).data === 'object'
          ? (response as BaseApiResponse<User>).data
          : (response as User);

      onSuccess(user);
      return user;
    } catch (error) {
      const message = handleApiError(error, 'Failed to create user');
      onError(message);
      return undefined;
    }
  }

  /**
   * Update an existing user record by ID
   */
  async updateUser({
    id,
    data,
    onSuccess,
    onError,
  }: {
    id: string;
    data: UpdateUserInput;
    onSuccess: (user: User) => void;
    onError: (message: string) => void;
  }): Promise<User | undefined> {
    try {
      const sanitized = cleanPayload(data as unknown as Record<string, unknown>);
      // Try PATCH first, standard for partial resource updates
      const response = await clientApi.patch<GetUserResponse | User>(
        `/users/${id}`,
        sanitized,
      );

      const user =
        (response as BaseApiResponse<User>)?.data &&
        typeof (response as BaseApiResponse<User>).data === 'object'
          ? (response as BaseApiResponse<User>).data
          : (response as User);

      onSuccess(user);
      return user;
    } catch (error) {
      const message = handleApiError(error, `Failed to update user ID: ${id}`);
      onError(message);
      return undefined;
    }
  }

  /**
   * Delete a user by ID
   */
  async deleteUser({
    id,
    onSuccess,
    onError,
  }: {
    id: string;
    onSuccess: () => void;
    onError: (message: string) => void;
  }): Promise<boolean> {
    try {
      await clientApi.delete<BaseApiResponse<null> | void>(`/users/${id}`);
      onSuccess();
      return true;
    } catch (error) {
      const message = handleApiError(error, `Failed to delete user ID: ${id}`);
      onError(message);
      return false;
    }
  }

  /**
   * Fetch effective permissions, role defaults, direct overrides, and catalog for a user
   * GET /api/users/:id/permissions
   */
  async getUserPermissions({
    userId,
    onSuccess,
    onError,
  }: {
    userId: string;
    onSuccess: (data: import('@/types/permission.types').UserEffectivePermissionsResponse) => void;
    onError: (message: string) => void;
  }): Promise<import('@/types/permission.types').UserEffectivePermissionsResponse | undefined> {
    try {
      const response = await clientApi.get<
        BaseApiResponse<import('@/types/permission.types').UserEffectivePermissionsResponse>
      >(`/users/${userId}/permissions`);

      const data =
        (response as BaseApiResponse<import('@/types/permission.types').UserEffectivePermissionsResponse>)?.data &&
        typeof (response as BaseApiResponse<import('@/types/permission.types').UserEffectivePermissionsResponse>).data === 'object'
          ? (response as BaseApiResponse<import('@/types/permission.types').UserEffectivePermissionsResponse>).data
          : (response as unknown as import('@/types/permission.types').UserEffectivePermissionsResponse);

      onSuccess(data);
      return data;
    } catch (error) {
      const message = handleApiError(error, `Failed to fetch permissions for user ID: ${userId}`);
      onError(message);
      return undefined;
    }
  }

  /**
   * Update permissions or explicit overrides for a user
   * PUT /api/users/:id/permissions
   */
  async updateUserPermissions({
    userId,
    data,
    onSuccess,
    onError,
  }: {
    userId: string;
    data: import('@/types/permission.types').UpdateUserPermissionsInput;
    onSuccess: (updated: import('@/types/permission.types').UserEffectivePermissionsResponse) => void;
    onError: (message: string) => void;
  }): Promise<import('@/types/permission.types').UserEffectivePermissionsResponse | undefined> {
    try {
      const response = await clientApi.put<
        BaseApiResponse<import('@/types/permission.types').UserEffectivePermissionsResponse>
      >(`/users/${userId}/permissions`, data);

      const resData =
        (response as BaseApiResponse<import('@/types/permission.types').UserEffectivePermissionsResponse>)?.data &&
        typeof (response as BaseApiResponse<import('@/types/permission.types').UserEffectivePermissionsResponse>).data === 'object'
          ? (response as BaseApiResponse<import('@/types/permission.types').UserEffectivePermissionsResponse>).data
          : (response as unknown as import('@/types/permission.types').UserEffectivePermissionsResponse);

      onSuccess(resData);
      return resData;
    } catch (error) {
      const message = handleApiError(error, `Failed to update permissions for user ID: ${userId}`);
      onError(message);
      return undefined;
    }
  }

  /**
   * Reset user's custom permissions back to default role permissions
   * POST /api/users/:id/permissions/reset
   */
  async resetUserPermissions({
    userId,
    onSuccess,
    onError,
  }: {
    userId: string;
    onSuccess: (result: import('@/types/permission.types').UserEffectivePermissionsResponse) => void;
    onError: (message: string) => void;
  }): Promise<import('@/types/permission.types').UserEffectivePermissionsResponse | undefined> {
    try {
      const response = await clientApi.post<
        BaseApiResponse<import('@/types/permission.types').UserEffectivePermissionsResponse>
      >(`/users/${userId}/permissions/reset`, {});

      const resData =
        (response as BaseApiResponse<import('@/types/permission.types').UserEffectivePermissionsResponse>)?.data &&
        typeof (response as BaseApiResponse<import('@/types/permission.types').UserEffectivePermissionsResponse>).data === 'object'
          ? (response as BaseApiResponse<import('@/types/permission.types').UserEffectivePermissionsResponse>).data
          : (response as unknown as import('@/types/permission.types').UserEffectivePermissionsResponse);

      onSuccess(resData);
      return resData;
    } catch (error) {
      const message = handleApiError(error, `Failed to reset permissions for user ID: ${userId}`);
      onError(message);
      return undefined;
    }
  }
}

export const userRepo = new UserRepo();
export { UserRepo };
export default userRepo;

