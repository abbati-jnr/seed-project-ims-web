import { api } from './client';
import { LOT_ENDPOINTS } from './endpoints';
import type { PaginatedResponse, LotFilters } from '@/types/api';
import type { Lot } from '@/types/models';

export async function getLots(filters?: LotFilters): Promise<PaginatedResponse<Lot>> {
  return api.get<PaginatedResponse<Lot>>(LOT_ENDPOINTS.LIST, filters as Record<string, string | number | boolean | undefined>);
}

export async function getLot(id: string): Promise<Lot> {
  return api.get<Lot>(LOT_ENDPOINTS.DETAIL(id));
}

export interface LotTraceResponse {
  id: string;
  lot_number: string;
  seed_product_name: string;
  source_type: string;
  source_reference: string;
  initial_quantity: string;
  current_quantity: string;
  status: string;
  srv_info: {
    srv_number: string;
    receiving_officer: string;
    approved_at: string;
  } | null;
  siv_items: Array<{
    siv_number: string;
    quantity: string;
    recipient_name: string;
    purpose: string;
    approved_at: string;
  }>;
  cleaning_input: Array<{
    cleaning_id: string;
    input_quantity: string;
    completed_at: string;
  }>;
  cleaning_output: {
    cleaning_id: string;
    output_quantity: string;
    completed_at: string;
  } | null;
  parent_lot_info: {
    id: string;
    lot_number: string;
    current_quantity: string;
  } | null;
  child_lots: Array<{
    id: string;
    lot_number: string;
    current_quantity: string;
  }>;
  created_at: string;
}

export async function getLotTrace(id: string): Promise<LotTraceResponse> {
  return api.get<LotTraceResponse>(LOT_ENDPOINTS.TRACE(id));
}

export interface LotMovement {
  type: 'received' | 'issued' | 'cleaning';
  document_number: string;
  quantity: string;
  balance_after: string;
  date: string;
  notes: string;
}

export interface LotMovementsResponse {
  lot_number: string;
  movements: LotMovement[];
}

export async function getLotMovements(id: string): Promise<LotMovementsResponse> {
  return api.get<LotMovementsResponse>(LOT_ENDPOINTS.MOVEMENTS(id));
}
