import {
  AuthResponseData,
  isAllowedDashboardRole,
  LoginInput,
  LoginResponse,
} from '@/types/auth.types';
import { BaseApiResponse } from '@/types/base.types';
import { serverApi } from '@/lib/api/server-api';
import { handleApiError } from '@/lib/utils';

class AuthRepo {
  /**
   * Log in user using identifier (email, username, or phone) and password.
   * Uses serverApi as specified.
   * Validates that only users with role SUPER_ADMIN or ADMIN can access this dashboard.
   */
  async login({
    credentials,
    onSuccess,
    onError,
  }: {
    credentials: LoginInput;
    onSuccess: (data: AuthResponseData) => void;
    onError: (message: string) => void;
  }): Promise<AuthResponseData | undefined> {
    try {
      const response = await serverApi.post<LoginResponse | AuthResponseData>(
        '/auth/login',
        credentials
      );

      // Normalize response whether backend wrapped in BaseApiResponse or returned directly
      const authData: AuthResponseData =
        (response as BaseApiResponse<AuthResponseData>)?.data?.user &&
        (response as BaseApiResponse<AuthResponseData>)?.data?.tokens
          ? (response as BaseApiResponse<AuthResponseData>).data
          : (response as AuthResponseData);

      if (!authData?.user || !authData?.tokens) {
        throw new Error('Invalid authentication response structure received from server.');
      }

      // Role check: Only SUPER_ADMIN or ADMIN can access this dashboard
      if (!isAllowedDashboardRole(authData.user.role)) {
        const forbiddenMessage =
          'Access denied. Only administrators (SUPER_ADMIN or ADMIN) can access this dashboard.';
        onError(forbiddenMessage);
        return undefined;
      }

      onSuccess(authData);
      return authData;
    } catch (error) {
      const message = handleApiError(error, 'Login failed. Please check your credentials.');
      onError(message);
      return undefined;
    }
  }
}

export const authRepo = new AuthRepo();
export { AuthRepo };
export default authRepo;
