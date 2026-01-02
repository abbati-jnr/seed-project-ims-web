import { api } from './client';
import { SEED_CLASS_ENDPOINTS } from './endpoints';
import type { PaginatedResponse, PaginationParams } from '@/types/api';
import type { SeedClass, SeedClassType } from '@/types/models';

export interface SeedClassFilters extends PaginationParams {
  is_active?: boolean;
  search?: string;
}

export async function getSeedClasses(filters?: SeedClassFilters): Promise<PaginatedResponse<SeedClass>> {
  return api.get<PaginatedResponse<SeedClass>>(
    SEED_CLASS_ENDPOINTS.LIST,
    filters as Record<string, string | boolean | number | undefined>
  );
}

export async function getSeedClass(id: string): Promise<SeedClass> {
  return api.get<SeedClass>(SEED_CLASS_ENDPOINTS.DETAIL(id));
}

export async function createSeedClass(data: {
  name: SeedClassType;
  description?: string;
}): Promise<SeedClass> {
  return api.post<SeedClass>(SEED_CLASS_ENDPOINTS.LIST, data);
}

export async function updateSeedClass(
  id: string,
  data: Partial<{ name: SeedClassType; description: string; is_active: boolean }>
): Promise<SeedClass> {
  return api.put<SeedClass>(SEED_CLASS_ENDPOINTS.DETAIL(id), data);
}
