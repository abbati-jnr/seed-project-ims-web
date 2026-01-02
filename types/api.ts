import type { User } from './models';

// Paginated Response
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Auth Responses
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface LogoutResponse {
  detail: string;
}

export interface ChangePasswordRequest {
  old_password: string;
  new_password: string;
}

// API Error
export interface ApiErrorResponse {
  detail?: string;
  [key: string]: string | string[] | undefined;
}

// Dashboard Response
export interface DashboardResponse {
  stock: {
    total_lots: number;
    total_quantity: string;
    low_stock_alerts: number;
  };
  recent_activity: {
    srvs_created: number;
    sivs_created: number;
    cleaning_events: number;
  };
  pending_approvals: {
    srvs: number;
    sivs: number;
    total: number;
  };
  stock_by_warehouse: Array<{
    warehouse_code: string;
    warehouse_name: string;
    total_quantity: string;
  }>;
}

// Stock Summary Response
export interface StockSummaryResponse {
  totals: {
    lot_count: number;
    total_quantity: string;
  };
  by_warehouse: Array<{
    warehouse_code: string;
    warehouse_name: string;
    lot_count: number;
    total_quantity: string;
  }>;
  by_seed_class: Array<{
    seed_class: string;
    lot_count: number;
    total_quantity: string;
  }>;
  by_seed_product: Array<{
    crop: string;
    variety: string;
    lot_count: number;
    total_quantity: string;
  }>;
}

// SRV Summary Response
export interface SRVSummaryResponse {
  total: number;
  by_status: {
    draft: number;
    pending: number;
    approved: number;
    rejected: number;
  };
  total_quantity_received: string;
}

// SIV Summary Response
export interface SIVSummaryResponse {
  total: number;
  by_status: {
    draft: number;
    pending: number;
    approved: number;
    rejected: number;
  };
  total_quantity_issued: string;
}

// Cleaning Summary Response
export interface CleaningSummaryResponse {
  total_events: number;
  by_status: {
    draft: number;
    in_progress: number;
    completed: number;
    cancelled: number;
  };
  total_input: string;
  total_output: string;
  total_waste: string;
  efficiency_percentage: number;
}

// Query Parameters
export interface PaginationParams {
  page?: number;
  page_size?: number;
}

export interface LotFilters extends PaginationParams {
  warehouse?: string;
  seed_product?: string;
  seed_class?: string;
  status?: string;
  source_type?: string;
  search?: string;
  ordering?: string;
}

export interface SRVFilters extends PaginationParams {
  warehouse?: string;
  status?: string;
  source_type?: string;
  receiving_officer?: number;
  search?: string;
  ordering?: string;
}

export interface SIVFilters extends PaginationParams {
  warehouse?: string;
  status?: string;
  purpose?: string;
  recipient_type?: string;
  issuing_officer?: number;
  search?: string;
  ordering?: string;
}

export interface CleaningFilters extends PaginationParams {
  input_lot?: string;
  status?: string;
  cleaning_officer?: number;
  ordering?: string;
}

export interface ReportFilters {
  [key: string]: string | undefined;
  warehouse?: string;
  status?: string;
  purpose?: string;
  start_date?: string;
  end_date?: string;
}
