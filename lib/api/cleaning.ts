import { api } from './client';
import { CLEANING_ENDPOINTS } from './endpoints';
import type { PaginatedResponse } from '@/types/api';
import type { CleaningEvent, CleaningEventListItem, CleaningStatus, SeedClassType } from '@/types/models';

export interface CleaningFilters {
  page?: number;
  page_size?: number;
  status?: CleaningStatus;
  input_lot?: string;
  cleaning_officer?: number;
  search?: string;
  ordering?: string;
}

export async function getCleaningEvents(
  filters?: CleaningFilters
): Promise<PaginatedResponse<CleaningEventListItem>> {
  return api.get<PaginatedResponse<CleaningEventListItem>>(
    CLEANING_ENDPOINTS.LIST,
    filters as Record<string, string | number | boolean | undefined>
  );
}

export async function getCleaningEvent(id: string): Promise<CleaningEvent> {
  return api.get<CleaningEvent>(CLEANING_ENDPOINTS.DETAIL(id));
}

export interface CreateCleaningData {
  input_lot: string;
  input_quantity: number;
  notes?: string;
}

export async function createCleaningEvent(data: CreateCleaningData): Promise<CleaningEvent> {
  return api.post<CleaningEvent>(CLEANING_ENDPOINTS.LIST, data);
}

export async function startCleaning(id: string): Promise<{ detail: string; status: string }> {
  return api.post<{ detail: string; status: string }>(CLEANING_ENDPOINTS.START(id));
}

export interface AddOutputData {
  seed_class: string;
  output_quantity: number;
}

export async function addCleaningOutput(
  id: string,
  data: AddOutputData
): Promise<CleaningEvent> {
  return api.post<CleaningEvent>(CLEANING_ENDPOINTS.ADD_OUTPUT(id), data);
}

export async function removeCleaningOutput(
  id: string,
  outputId: string
): Promise<CleaningEvent> {
  return api.delete<CleaningEvent>(CLEANING_ENDPOINTS.REMOVE_OUTPUT(id, outputId));
}

export interface CompleteCleaningData {
  waste_quantity: number;
  notes?: string;
}

export async function completeCleaning(
  id: string,
  data: CompleteCleaningData
): Promise<{ detail: string; status: string; output_lots: string[] }> {
  return api.post<{ detail: string; status: string; output_lots: string[] }>(
    CLEANING_ENDPOINTS.COMPLETE(id),
    data
  );
}

export async function cancelCleaning(
  id: string,
  reason?: string
): Promise<{ detail: string; status: string }> {
  return api.post<{ detail: string; status: string }>(
    CLEANING_ENDPOINTS.CANCEL(id),
    reason ? { reason } : undefined
  );
}

export interface CleaningSummaryResponse {
  total: number;
  by_status: {
    draft: number;
    in_progress: number;
    completed: number;
    cancelled: number;
  };
  total_input_quantity: string;
  total_output_quantity: string;
  total_waste_quantity: string;
}

export async function getCleaningSummary(): Promise<CleaningSummaryResponse> {
  return api.get<CleaningSummaryResponse>(CLEANING_ENDPOINTS.SUMMARY);
}
