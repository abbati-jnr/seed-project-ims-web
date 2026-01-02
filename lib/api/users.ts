import { api } from './client';
import { USER_ENDPOINTS } from './endpoints';
import type { PaginatedResponse, PaginationParams } from '@/types/api';
import type { User, UserRole } from '@/types/models';

export interface UserFilters extends PaginationParams {
  role?: UserRole;
  is_active?: boolean;
  search?: string;
}

export async function getUsers(filters?: UserFilters): Promise<PaginatedResponse<User>> {
  return api.get<PaginatedResponse<User>>(
    USER_ENDPOINTS.LIST,
    filters as Record<string, string | boolean | number | undefined>
  );
}

export async function getUser(id: number): Promise<User> {
  return api.get<User>(USER_ENDPOINTS.DETAIL(id));
}

export interface CreateUserData {
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  phone?: string;
  password: string;
}

export async function createUser(data: CreateUserData): Promise<User> {
  return api.post<User>(USER_ENDPOINTS.LIST, data);
}

export interface UpdateUserData {
  email?: string;
  first_name?: string;
  last_name?: string;
  role?: UserRole;
  phone?: string;
}

export async function updateUser(id: number, data: UpdateUserData): Promise<User> {
  return api.put<User>(USER_ENDPOINTS.DETAIL(id), data);
}

export async function activateUser(id: number): Promise<{ detail: string }> {
  return api.post<{ detail: string }>(USER_ENDPOINTS.ACTIVATE(id), {});
}

export async function deactivateUser(id: number): Promise<{ detail: string }> {
  return api.post<{ detail: string }>(USER_ENDPOINTS.DEACTIVATE(id), {});
}
