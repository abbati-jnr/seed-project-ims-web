import { api } from './client';
import { SRV_ENDPOINTS } from './endpoints';
import type { PaginatedResponse, SRVFilters, SRVSummaryResponse } from '@/types/api';
import type { SRV, SRVListItem, SourceType } from '@/types/models';

export async function getSRVs(filters?: SRVFilters): Promise<PaginatedResponse<SRVListItem>> {
  return api.get<PaginatedResponse<SRVListItem>>(SRV_ENDPOINTS.LIST, filters as Record<string, string | number | boolean | undefined>);
}

export async function getSRV(id: string): Promise<SRV> {
  return api.get<SRV>(SRV_ENDPOINTS.DETAIL(id));
}

export interface CreateSRVData {
  warehouse: string;
  source_type: SourceType;
  supplier_name?: string;
  supplier_contact?: string;
  vehicle_number?: string;
  notes?: string;
  items: {
    seed_product: string;
    seed_class: string;
    quantity: number;
    source_reference?: string;
  }[];
}

export async function createSRV(data: CreateSRVData): Promise<SRV> {
  return api.post<SRV>(SRV_ENDPOINTS.LIST, data);
}

export async function updateSRV(
  id: string,
  data: Partial<CreateSRVData>
): Promise<SRV> {
  return api.put<SRV>(SRV_ENDPOINTS.DETAIL(id), data);
}

export async function deleteSRV(id: string): Promise<void> {
  return api.delete<void>(SRV_ENDPOINTS.DETAIL(id));
}

export interface AddSRVItemData {
  seed_product: string;
  seed_class: string;
  source_type: SourceType;
  source_reference: string;
  quantity: string;
}

export async function addSRVItem(srvId: string, data: AddSRVItemData): Promise<SRV> {
  return api.post<SRV>(SRV_ENDPOINTS.ADD_ITEM(srvId), data);
}

export async function removeSRVItem(srvId: string, itemId: string): Promise<SRV> {
  return api.delete<SRV>(SRV_ENDPOINTS.REMOVE_ITEM(srvId, itemId));
}

export async function submitSRV(id: string): Promise<{ detail: string; status: string }> {
  return api.post<{ detail: string; status: string }>(SRV_ENDPOINTS.SUBMIT(id));
}

export async function approveSRV(
  id: string,
  notes?: string
): Promise<{ detail: string; status: string; lots_created: string[] }> {
  return api.post<{ detail: string; status: string; lots_created: string[] }>(
    SRV_ENDPOINTS.APPROVE(id),
    notes ? { notes } : undefined
  );
}

export async function rejectSRV(
  id: string,
  reason: string
): Promise<{ detail: string; status: string }> {
  return api.post<{ detail: string; status: string }>(SRV_ENDPOINTS.REJECT(id), { reason });
}

export async function getPendingSRVs(): Promise<PaginatedResponse<SRVListItem>> {
  return api.get<PaginatedResponse<SRVListItem>>(SRV_ENDPOINTS.PENDING);
}

export async function getSRVSummary(): Promise<SRVSummaryResponse> {
  return api.get<SRVSummaryResponse>(SRV_ENDPOINTS.SUMMARY);
}
