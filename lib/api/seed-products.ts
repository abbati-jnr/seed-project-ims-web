import { api } from './client';
import { SEED_PRODUCT_ENDPOINTS } from './endpoints';
import type { PaginatedResponse, PaginationParams } from '@/types/api';
import type { SeedProduct } from '@/types/models';

export interface SeedProductFilters extends PaginationParams {
  crop?: string;
  is_active?: boolean;
  search?: string;
}

export async function getSeedProducts(filters?: SeedProductFilters): Promise<PaginatedResponse<SeedProduct>> {
  return api.get<PaginatedResponse<SeedProduct>>(SEED_PRODUCT_ENDPOINTS.LIST, filters as Record<string, string | boolean | undefined>);
}

export async function getSeedProduct(id: string): Promise<SeedProduct> {
  return api.get<SeedProduct>(SEED_PRODUCT_ENDPOINTS.DETAIL(id));
}

export async function createSeedProduct(data: {
  code: string;
  crop: string;
  variety: string;
  description?: string;
}): Promise<SeedProduct> {
  return api.post<SeedProduct>(SEED_PRODUCT_ENDPOINTS.LIST, data);
}

export async function updateSeedProduct(
  id: string,
  data: Partial<{ code: string; crop: string; variety: string; description: string; is_active: boolean }>
): Promise<SeedProduct> {
  return api.put<SeedProduct>(SEED_PRODUCT_ENDPOINTS.DETAIL(id), data);
}
