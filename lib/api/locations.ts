import { api } from './client';
import { LOCATION_ENDPOINTS } from './endpoints';
import type { PaginatedResponse, PaginationParams } from '@/types/api';
import type { Location } from '@/types/models';

export interface LocationFilters extends PaginationParams {
  warehouse?: string;
  is_active?: boolean;
  search?: string;
}

export async function getLocations(filters?: LocationFilters): Promise<PaginatedResponse<Location>> {
  return api.get<PaginatedResponse<Location>>(
    LOCATION_ENDPOINTS.LIST,
    filters as Record<string, string | boolean | number | undefined>
  );
}

export async function getLocation(id: string): Promise<Location> {
  return api.get<Location>(LOCATION_ENDPOINTS.DETAIL(id));
}

export interface CreateLocationData {
  warehouse: string;
  code: string;
  name: string;
}

export async function createLocation(data: CreateLocationData): Promise<Location> {
  return api.post<Location>(LOCATION_ENDPOINTS.LIST, data);
}

export interface UpdateLocationData {
  code?: string;
  name?: string;
  is_active?: boolean;
}

export async function updateLocation(id: string, data: UpdateLocationData): Promise<Location> {
  return api.put<Location>(LOCATION_ENDPOINTS.DETAIL(id), data);
}

export async function deleteLocation(id: string): Promise<void> {
  return api.delete(LOCATION_ENDPOINTS.DETAIL(id));
}
