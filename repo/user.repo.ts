import { ApiResponse } from '@/types/auth.types';
import {
  CreateUserInput,
  PaginatedUsersData,
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
    onSuccess: (users: User[], total?: number) => void;
    onError: (message: string) => void;
  }): Promise<{ users: User[]; total: number } | undefined> {
    try {
      const params = {
        ...query,
        ...(query?.searchTerm || query?.search
          ? { searchTerm: query.searchTerm || query.search }
          : {}),
      };

      const response = await clientApi.get<
        ApiResponse<PaginatedUsersData | User[]> | PaginatedUsersData | User[]
      >('/users', {
        params,
      });

      // Normalize various possible backend response wrappers
      let userList: User[] = [];
      let totalCount = 0;

      const raw = response as unknown as Record<string, unknown>;

      if (Array.isArray(raw)) {
        userList = raw as User[];
        totalCount = userList.length;
      } else if (Array.isArray(raw?.data)) {
        userList = raw.data as User[];
        const metaObj = raw?.meta as Record<string, unknown> | undefined;
        totalCount = (metaObj?.total as number) ?? (raw.total as number) ?? userList.length;
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

      onSuccess(userList, totalCount);
      return { users: userList, total: totalCount };
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
      const response = await clientApi.get<ApiResponse<User> | User>(`/users/${id}`);

      const user =
        (response as ApiResponse<User>)?.data &&
        typeof (response as ApiResponse<User>).data === 'object'
          ? (response as ApiResponse<User>).data
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
      const response = await clientApi.post<ApiResponse<User> | User>('/users', sanitized);

      const user =
        (response as ApiResponse<User>)?.data &&
        typeof (response as ApiResponse<User>).data === 'object'
          ? (response as ApiResponse<User>).data
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
      const response = await clientApi.patch<ApiResponse<User> | User>(
        `/users/${id}`,
        sanitized,
      );

      const user =
        (response as ApiResponse<User>)?.data &&
        typeof (response as ApiResponse<User>).data === 'object'
          ? (response as ApiResponse<User>).data
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
      await clientApi.delete(`/users/${id}`);
      onSuccess();
      return true;
    } catch (error) {
      const message = handleApiError(error, `Failed to delete user ID: ${id}`);
      onError(message);
      return false;
    }
  }
}

export const userRepo = new UserRepo();
export { UserRepo };
export default userRepo;
