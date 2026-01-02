import { api } from './client';
import { REPORT_ENDPOINTS } from './endpoints';
import type {
  DashboardResponse,
  StockSummaryResponse,
  CleaningSummaryResponse,
  ReportFilters,
} from '@/types/api';

export async function getDashboard(): Promise<DashboardResponse> {
  return api.get<DashboardResponse>(REPORT_ENDPOINTS.DASHBOARD);
}

export async function getStockSummary(
  filters?: Pick<ReportFilters, 'warehouse'>
): Promise<StockSummaryResponse> {
  return api.get<StockSummaryResponse>(REPORT_ENDPOINTS.STOCK_SUMMARY, filters);
}

export interface SRVRegisterResponse {
  summary: {
    total_srvs: number;
    total_quantity: string;
  };
  register: Array<{
    srv_number: string;
    warehouse: string;
    receiving_officer: string;
    status: string;
    item_count: number;
    total_quantity: string;
    created_at: string;
    approved_by: string | null;
    approved_at: string | null;
  }>;
}

export async function getSRVRegister(filters?: ReportFilters): Promise<SRVRegisterResponse> {
  return api.get<SRVRegisterResponse>(REPORT_ENDPOINTS.SRV_REGISTER, filters);
}

export interface SIVRegisterResponse {
  summary: {
    total_sivs: number;
    total_quantity: string;
    by_purpose: Array<{ purpose: string; count: number }>;
  };
  register: Array<{
    siv_number: string;
    warehouse: string;
    issuing_officer: string;
    recipient_type: string;
    recipient_name: string;
    purpose: string;
    status: string;
    item_count: number;
    total_quantity: string;
    created_at: string;
    approved_by: string | null;
    approved_at: string | null;
  }>;
}

export async function getSIVRegister(filters?: ReportFilters): Promise<SIVRegisterResponse> {
  return api.get<SIVRegisterResponse>(REPORT_ENDPOINTS.SIV_REGISTER, filters);
}

export interface CleaningReportResponse {
  summary: {
    total_events: number;
    total_input: string;
    total_waste: string;
    total_output: string;
    efficiency_percentage: number;
  };
  by_month: Array<{
    month: string;
    event_count: number;
    input_total: string;
    waste_total: string;
  }>;
}

export async function getCleaningSummaryReport(
  filters?: Pick<ReportFilters, 'start_date' | 'end_date'>
): Promise<CleaningReportResponse> {
  return api.get<CleaningReportResponse>(REPORT_ENDPOINTS.CLEANING_SUMMARY, filters);
}

export interface SeedDistributionResponse {
  summary: {
    total_sivs: number;
    total_quantity: string;
  };
  by_recipient_type: Array<{
    recipient_type: string;
    siv_count: number;
    total_quantity: string;
  }>;
  by_purpose: Array<{
    purpose: string;
    siv_count: number;
    total_quantity: string;
  }>;
  top_recipients: Array<{
    recipient_name: string;
    siv_count: number;
    total_quantity: string;
  }>;
}

export async function getSeedDistribution(
  filters?: Pick<ReportFilters, 'start_date' | 'end_date' | 'purpose'>
): Promise<SeedDistributionResponse> {
  return api.get<SeedDistributionResponse>(REPORT_ENDPOINTS.SEED_DISTRIBUTION, filters);
}
