// User Roles
export type UserRole = 'admin' | 'manager' | 'storekeeper' | 'qa' | 'sales';

// Lot & Document Statuses
export type LotStatus = 'stored' | 'cleaned' | 'issued' | 'exhausted';
export type DocumentStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'cancelled';
export type CleaningStatus = 'draft' | 'in_progress' | 'completed' | 'cancelled';

// Source & Recipient Types
export type SourceType = 'internal' | 'in_grower' | 'out_grower';
export type RecipientType = 'customer' | 'grower' | 'internal';
export type IssuePurpose = 'sales' | 'distribution' | 'research' | 'transfer' | 'disposal';
export type SeedClassType = 'breeder' | 'foundation' | 'certified';

// User
export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  full_name: string;
  phone: string;
  is_active: boolean;
  created_at: string;
}

export interface UserSummary {
  id: number;
  email: string;
  full_name: string;
}

// Warehouse & Location
export interface Warehouse {
  id: string;
  code: string;
  name: string;
  address: string;
  is_active: boolean;
  location_count: number;
  created_at: string;
}

export interface WarehouseSummary {
  id: string;
  code: string;
  name: string;
}

export interface Location {
  id: string;
  warehouse: string;
  warehouse_code: string;
  code: string;
  name: string;
  is_active: boolean;
  created_at: string;
}

// Seed Class & Product
export interface SeedClass {
  id: string;
  name: SeedClassType;
  name_display: string;
  description: string;
  is_active: boolean;
  created_at: string;
}

export interface SeedClassSummary {
  id: string;
  name: SeedClassType;
  name_display: string;
}

export interface SeedProduct {
  id: string;
  code: string;
  crop: string;
  variety: string;
  display_name: string;
  description: string;
  is_active: boolean;
  created_at: string;
}

export interface SeedProductSummary {
  id: string;
  code: string;
  crop: string;
  variety: string;
  display_name: string;
}

// Lot
export interface Lot {
  id: string;
  lot_number: string;
  seed_product: SeedProductSummary;
  seed_class: SeedClassSummary;
  warehouse: WarehouseSummary;
  source_type: SourceType;
  source_reference: string;
  initial_quantity: string;
  current_quantity: string;
  status: LotStatus;
  parent_lot: string | null;
  parent_lot_number: string | null;
  notes: string;
  created_by: UserSummary;
  created_at: string;
  updated_at: string;
}

export interface LotSummary {
  id: string;
  lot_number: string;
  seed_product_name: string;
  current_quantity: string;
}

export interface LotDetail {
  id: string;
  lot_number: string;
  seed_product: SeedProductSummary;
  seed_class: SeedClassSummary;
  current_quantity: string;
}

// SRV (Store Receiving Voucher)
export interface SRVItem {
  id: string;
  seed_product: SeedProductSummary;
  seed_class: SeedClassSummary;
  source_type: SourceType;
  source_reference: string;
  quantity: string;
  lot: string | null;
  lot_number: string | null;
}

export interface SRV {
  id: string;
  srv_number: string;
  warehouse: WarehouseSummary;
  source_type: SourceType;
  supplier_name: string | null;
  supplier_contact: string | null;
  vehicle_number: string | null;
  receiving_officer: UserSummary;
  status: DocumentStatus;
  items: SRVItem[];
  total_quantity: string;
  approved_by: UserSummary | null;
  approved_at: string | null;
  rejection_reason: string | null;
  notes: string;
  created_at: string;
}

export interface SRVListItem {
  id: string;
  srv_number: string;
  warehouse: string;
  warehouse_code: string;
  source_type: SourceType;
  receiving_officer: number;
  receiving_officer_name: string;
  status: DocumentStatus;
  item_count: number;
  total_quantity: string;
  approved_by: number | null;
  approved_by_name: string | null;
  approved_at: string | null;
  created_at: string;
}

// SIV (Store Issuing Voucher)
export interface SIVItem {
  id: string;
  lot: LotDetail;
  quantity: string;
}

export interface SIV {
  id: string;
  siv_number: string;
  warehouse: WarehouseSummary;
  issuing_officer: UserSummary;
  recipient_type: RecipientType;
  recipient_name: string;
  recipient_contact: string | null;
  destination: string | null;
  vehicle_number: string | null;
  purpose: IssuePurpose;
  status: DocumentStatus;
  items: SIVItem[];
  total_quantity: string;
  approved_by: UserSummary | null;
  approved_at: string | null;
  rejection_reason: string | null;
  notes: string;
  created_at: string;
}

export interface SIVListItem {
  id: string;
  siv_number: string;
  warehouse: string;
  warehouse_code: string;
  issuing_officer: number;
  issuing_officer_name: string;
  recipient_type: RecipientType;
  recipient_name: string;
  purpose: IssuePurpose;
  status: DocumentStatus;
  item_count: number;
  total_quantity: string;
  approved_by: number | null;
  approved_by_name: string | null;
  approved_at: string | null;
  created_at: string;
}

// Cleaning Event
export interface CleaningOutputLot {
  id: string;
  seed_class: SeedClassSummary;
  output_lot: LotSummary | null;
  output_quantity: string;
}

export interface CleaningEvent {
  id: string;
  input_lot: Lot;
  input_quantity: string;
  waste_quantity: string;
  cleaning_officer: UserSummary;
  status: CleaningStatus;
  output_lots: CleaningOutputLot[];
  total_output: string;
  completed_at: string | null;
  notes: string;
  created_at: string;
}

export interface CleaningEventListItem {
  id: string;
  input_lot: string;
  input_lot_number: string;
  input_quantity: string;
  waste_quantity: string;
  total_output: string;
  cleaning_officer: number;
  cleaning_officer_name: string;
  status: CleaningStatus;
  output_count: number;
  completed_at: string | null;
  created_at: string;
}

// Approval Request
export interface ApprovalRequest {
  id: number;
  model_name: 'SRV' | 'SIV';
  object_id: string;
  requested_by: number;
  requested_by_name: string;
  status: 'pending' | 'approved' | 'rejected';
  threshold_exceeded: string;
  requested_at: string;
  approved_by: number | null;
  approved_by_name: string | null;
  approved_at: string | null;
  notes: string;
}

// Audit Log
export interface AuditLog {
  id: number;
  action: string;
  model_name: string;
  object_id: string;
  user: number;
  user_name: string;
  before_data: Record<string, unknown> | null;
  after_data: Record<string, unknown> | null;
  ip_address: string;
  user_agent: string;
  timestamp: string;
  notes: string;
}
