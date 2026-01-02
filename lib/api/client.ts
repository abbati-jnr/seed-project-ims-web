import { API_BASE_URL, AUTH_TOKEN_KEY } from '@/lib/utils/constants';
import type { ApiErrorResponse } from '@/types/api';

export class ApiError extends Error {
  status: number;
  data: ApiErrorResponse | null;

  constructor(status: number, message: string, data: ApiErrorResponse | null = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }

  static async fromResponse(response: Response): Promise<ApiError> {
    let data: ApiErrorResponse | null = null;
    let message = `Request failed with status ${response.status}`;

    try {
      data = await response.json();
      if (data?.detail) {
        message = data.detail;
      }
    } catch {
      // Response may not be JSON
    }

    return new ApiError(response.status, message, data);
  }
}

function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setAuthToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  // Also set as cookie for middleware
  document.cookie = `${AUTH_TOKEN_KEY}=${token}; path=/; max-age=86400; SameSite=Lax`;
}

export function clearAuthToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(AUTH_TOKEN_KEY);
  document.cookie = `${AUTH_TOKEN_KEY}=; path=/; max-age=0`;
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined>;
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { body, params, headers: customHeaders, ...restOptions } = options;
  const token = getAuthToken();

  // Build URL with query params
  let url = `${API_BASE_URL}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...customHeaders,
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Token ${token}`;
  }

  const response = await fetch(url, {
    ...restOptions,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  // Handle 204 No Content
  if (response.status === 204) {
    return {} as T;
  }

  // Handle errors
  if (!response.ok) {
    throw await ApiError.fromResponse(response);
  }

  return response.json();
}

// Convenience methods
export const api = {
  get: <T>(endpoint: string, params?: Record<string, string | number | boolean | undefined>) =>
    apiClient<T>(endpoint, { method: 'GET', params }),

  post: <T>(endpoint: string, body?: unknown) =>
    apiClient<T>(endpoint, { method: 'POST', body }),

  put: <T>(endpoint: string, body?: unknown) =>
    apiClient<T>(endpoint, { method: 'PUT', body }),

  patch: <T>(endpoint: string, body?: unknown) =>
    apiClient<T>(endpoint, { method: 'PATCH', body }),

  delete: <T>(endpoint: string) =>
    apiClient<T>(endpoint, { method: 'DELETE' }),
};
