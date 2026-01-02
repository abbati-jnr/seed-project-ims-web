import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types/models';
import { AUTH_USER_KEY } from '@/lib/utils/constants';
import { login as apiLogin, logout as apiLogout, getProfile } from '@/lib/api/auth';
import { clearAuthToken } from '@/lib/api/client';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setUser: (user: User | null) => void;
  clearError: () => void;
  reset: () => void;
}

type AuthStore = AuthState & AuthActions;

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiLogin({ email, password });
          set({
            user: response.user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Login failed';
          set({ isLoading: false, error: message });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          await apiLogout();
        } catch {
          // Ignore logout errors
        } finally {
          clearAuthToken();
          set({ ...initialState });
        }
      },

      refreshUser: async () => {
        if (!get().isAuthenticated) return;

        set({ isLoading: true });
        try {
          const user = await getProfile();
          set({ user, isLoading: false });
        } catch {
          // Token may be invalid
          clearAuthToken();
          set({ ...initialState });
        }
      },

      setUser: (user: User | null) => {
        set({ user, isAuthenticated: !!user });
      },

      clearError: () => {
        set({ error: null });
      },

      reset: () => {
        clearAuthToken();
        set({ ...initialState });
      },
    }),
    {
      name: AUTH_USER_KEY,
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Selectors
export const selectUser = (state: AuthStore) => state.user;
export const selectIsAuthenticated = (state: AuthStore) => state.isAuthenticated;
export const selectIsLoading = (state: AuthStore) => state.isLoading;
export const selectAuthError = (state: AuthStore) => state.error;
export const selectUserRole = (state: AuthStore) => state.user?.role;
