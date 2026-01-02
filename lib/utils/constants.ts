export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export const AUTH_TOKEN_KEY = 'ims_auth_token';
export const AUTH_USER_KEY = 'ims_auth_user';

export const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  STOREKEEPER: 'storekeeper',
  QA: 'qa',
  SALES: 'sales',
} as const;

export const LOT_STATUS = {
  STORED: 'stored',
  CLEANED: 'cleaned',
  ISSUED: 'issued',
  EXHAUSTED: 'exhausted',
} as const;

export const DOCUMENT_STATUS = {
  DRAFT: 'draft',
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled',
} as const;

export const CLEANING_STATUS = {
  DRAFT: 'draft',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export const SOURCE_TYPES = {
  INTERNAL: 'internal',
  IN_GROWER: 'in_grower',
  OUT_GROWER: 'out_grower',
} as const;

export const RECIPIENT_TYPES = {
  CUSTOMER: 'customer',
  GROWER: 'grower',
  INTERNAL: 'internal',
} as const;

export const ISSUE_PURPOSES = {
  SALE: 'sale',
  SETTLEMENT: 'settlement',
  TRANSFER: 'transfer',
} as const;

export const SEED_CLASS_TYPES = {
  BREEDER: 'breeder',
  FOUNDATION: 'foundation',
  CERTIFIED: 'certified',
} as const;
