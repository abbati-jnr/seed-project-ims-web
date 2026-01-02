import { api } from './client';
import { WAREHOUSE_ENDPOINTS } from './endpoints';
import type { PaginatedResponse } from '@/types/api';
import type { Warehouse } from '@/types/models';

export interface WarehouseFilters {
  is_active?: boolean;
  search?: string;
}

export async function getWarehouses(filters?: WarehouseFilters): Promise<PaginatedResponse<Warehouse>> {
  return api.get<PaginatedResponse<Warehouse>>(WAREHOUSE_ENDPOINTS.LIST, filters as Record<string, string | boolean | undefined>);
}

export async function getWarehouse(id: string): Promise<Warehouse> {
  return api.get<Warehouse>(WAREHOUSE_ENDPOINTS.DETAIL(id));
}

export async function createWarehouse(data: {
  code: string;
  name: string;
  address?: string;
}): Promise<Warehouse> {
  return api.post<Warehouse>(WAREHOUSE_ENDPOINTS.LIST, data);
}

export async function updateWarehouse(
  id: string,
  data: Partial<{ code: string; name: string; address: string; is_active: boolean }>
): Promise<Warehouse> {
  return api.put<Warehouse>(WAREHOUSE_ENDPOINTS.DETAIL(id), data);
}
