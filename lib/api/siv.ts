import { api } from './client';
import { SIV_ENDPOINTS } from './endpoints';
import type { PaginatedResponse, SIVFilters, SIVSummaryResponse } from '@/types/api';
import type { SIV, SIVListItem, IssuePurpose } from '@/types/models';

export async function getSIVs(filters?: SIVFilters): Promise<PaginatedResponse<SIVListItem>> {
  return api.get<PaginatedResponse<SIVListItem>>(SIV_ENDPOINTS.LIST, filters as Record<string, string | number | boolean | undefined>);
}

export async function getSIV(id: string): Promise<SIV> {
  return api.get<SIV>(SIV_ENDPOINTS.DETAIL(id));
}

export interface CreateSIVData {
  warehouse: string;
  purpose: IssuePurpose;
  recipient_name: string;
  recipient_contact?: string;
  destination?: string;
  vehicle_number?: string;
  notes?: string;
  items: { lot: string; quantity: number }[];
}

export async function createSIV(data: CreateSIVData): Promise<SIV> {
  return api.post<SIV>(SIV_ENDPOINTS.LIST, data);
}

export async function updateSIV(
  id: string,
  data: Partial<CreateSIVData>
): Promise<SIV> {
  return api.put<SIV>(SIV_ENDPOINTS.DETAIL(id), data);
}

export async function deleteSIV(id: string): Promise<void> {
  return api.delete<void>(SIV_ENDPOINTS.DETAIL(id));
}

export interface AddSIVItemData {
  lot: string;
  quantity: string;
}

export async function addSIVItem(sivId: string, data: AddSIVItemData): Promise<SIV> {
  return api.post<SIV>(SIV_ENDPOINTS.ADD_ITEM(sivId), data);
}

export async function removeSIVItem(sivId: string, itemId: string): Promise<SIV> {
  return api.delete<SIV>(SIV_ENDPOINTS.REMOVE_ITEM(sivId, itemId));
}

export async function submitSIV(id: string): Promise<{ detail: string; status: string }> {
  return api.post<{ detail: string; status: string }>(SIV_ENDPOINTS.SUBMIT(id));
}

export async function approveSIV(
  id: string,
  notes?: string
): Promise<{ detail: string; status: string }> {
  return api.post<{ detail: string; status: string }>(
    SIV_ENDPOINTS.APPROVE(id),
    notes ? { notes } : undefined
  );
}

export async function rejectSIV(
  id: string,
  reason: string
): Promise<{ detail: string; status: string }> {
  return api.post<{ detail: string; status: string }>(SIV_ENDPOINTS.REJECT(id), { reason });
}

export async function getPendingSIVs(): Promise<PaginatedResponse<SIVListItem>> {
  return api.get<PaginatedResponse<SIVListItem>>(SIV_ENDPOINTS.PENDING);
}

export async function getSIVSummary(): Promise<SIVSummaryResponse> {
  return api.get<SIVSummaryResponse>(SIV_ENDPOINTS.SUMMARY);
}
