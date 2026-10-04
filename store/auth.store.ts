import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import Cookies from 'js-cookie';
import {
  AuthResponseData,
  AuthTokens,
  isAllowedDashboardRole,
} from '@/types/auth.types';
import { User } from '@/types/user.types';

interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isHydrated: boolean;

  // Pure state actions
  setAuth: (data: AuthResponseData, rememberMe?: boolean) => void;
  clearAuth: () => void;
  setUser: (user: User | null) => void;
  setTokens: (tokens: AuthTokens | null, rememberMe?: boolean) => void;
  setHydrated: (hydrated: boolean) => void;

  // Role and permission getters
  isAdmin: () => boolean;
  isSuperAdmin: () => boolean;
  hasPermission: (permission: string) => boolean;
}

const COOKIE_OPTIONS = {
  path: '/',
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      tokens: null,
      isAuthenticated: false,
      isHydrated: false,

      setHydrated: (hydrated: boolean) => set({ isHydrated: hydrated }),

      setAuth: (data: AuthResponseData, rememberMe = false) => {
        const { user, tokens } = data;
        const isAuth = !!user && isAllowedDashboardRole(user.role);

        const cookieOpts = rememberMe
          ? { ...COOKIE_OPTIONS, expires: 30 }
          : COOKIE_OPTIONS;

        // Synchronize cookies for proxy / server authentication
        if (tokens.accessToken) {
          Cookies.set('access_token', tokens.accessToken, cookieOpts);
        }
        if (tokens.refreshToken) {
          Cookies.set('refresh_token', tokens.refreshToken, cookieOpts);
        }
        if (user.role) {
          Cookies.set('user_role', user.role, cookieOpts);
        }

        set({
          user,
          tokens,
          isAuthenticated: isAuth,
        });
      },

      clearAuth: () => {
        // Clear all session cookies
        Cookies.remove('access_token', COOKIE_OPTIONS);
        Cookies.remove('refresh_token', COOKIE_OPTIONS);
        Cookies.remove('user_role', COOKIE_OPTIONS);

        // Reset store state
        set({
          user: null,
          tokens: null,
          isAuthenticated: false,
        });
      },

      setUser: (user: User | null) => {
        const isAuth = !!user && isAllowedDashboardRole(user.role);
        set({ user, isAuthenticated: isAuth });
        if (user?.role) {
          Cookies.set('user_role', user.role, COOKIE_OPTIONS);
        } else {
          Cookies.remove('user_role', COOKIE_OPTIONS);
        }
      },

      setTokens: (tokens: AuthTokens | null, rememberMe = false) => {
        const cookieOpts = rememberMe
          ? { ...COOKIE_OPTIONS, expires: 30 }
          : COOKIE_OPTIONS;

        set({ tokens });
        if (tokens?.accessToken) {
          Cookies.set('access_token', tokens.accessToken, cookieOpts);
        } else {
          Cookies.remove('access_token', COOKIE_OPTIONS);
        }
        if (tokens?.refreshToken) {
          Cookies.set('refresh_token', tokens.refreshToken, cookieOpts);
        } else {
          Cookies.remove('refresh_token', COOKIE_OPTIONS);
        }
      },

      isAdmin: () => {
        const user = get().user;
        return isAllowedDashboardRole(user?.role);
      },

      isSuperAdmin: () => {
        const user = get().user;
        return user?.role === 'SUPER_ADMIN';
      },

      hasPermission: (permission: string) => {
        const user = get().user;
        if (!user) return false;
        if (user.role === 'SUPER_ADMIN') return true;
        return (
          Array.isArray(user.permissions) && user.permissions.includes(permission)
        );
      },
    }),
    {
      name: 'admin-auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);
