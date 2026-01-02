import { api, setAuthToken, clearAuthToken } from './client';
import { AUTH_ENDPOINTS } from './endpoints';
import type { LoginRequest, LoginResponse, LogoutResponse, ChangePasswordRequest } from '@/types/api';
import type { User } from '@/types/models';

export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>(AUTH_ENDPOINTS.LOGIN, credentials);
  setAuthToken(response.token);
  return response;
}

export async function logout(): Promise<LogoutResponse> {
  try {
    const response = await api.post<LogoutResponse>(AUTH_ENDPOINTS.LOGOUT);
    return response;
  } finally {
    clearAuthToken();
  }
}

export async function getProfile(): Promise<User> {
  return api.get<User>(AUTH_ENDPOINTS.ME);
}

export async function updateProfile(data: Partial<User>): Promise<User> {
  return api.put<User>(AUTH_ENDPOINTS.ME, data);
}

export async function changePassword(data: ChangePasswordRequest): Promise<{ detail: string }> {
  return api.post<{ detail: string }>(AUTH_ENDPOINTS.CHANGE_PASSWORD, data);
}
