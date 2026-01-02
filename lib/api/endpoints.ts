// Authentication
export const AUTH_ENDPOINTS = {
  LOGIN: '/auth/login/',
  LOGOUT: '/auth/logout/',
  ME: '/auth/me/',
  CHANGE_PASSWORD: '/auth/change-password/',
} as const;

// Users
export const USER_ENDPOINTS = {
  LIST: '/users/',
  DETAIL: (id: number) => `/users/${id}/`,
  ACTIVATE: (id: number) => `/users/${id}/activate/`,
  DEACTIVATE: (id: number) => `/users/${id}/deactivate/`,
} as const;

// Warehouses
export const WAREHOUSE_ENDPOINTS = {
  LIST: '/warehouses/',
  DETAIL: (id: string) => `/warehouses/${id}/`,
} as const;

// Locations
export const LOCATION_ENDPOINTS = {
  LIST: '/locations/',
  DETAIL: (id: string) => `/locations/${id}/`,
} as const;

// Seed Classes
export const SEED_CLASS_ENDPOINTS = {
  LIST: '/seed-classes/',
  DETAIL: (id: string) => `/seed-classes/${id}/`,
} as const;

// Seed Products
export const SEED_PRODUCT_ENDPOINTS = {
  LIST: '/seed-products/',
  DETAIL: (id: string) => `/seed-products/${id}/`,
} as const;

// Lots
export const LOT_ENDPOINTS = {
  LIST: '/lots/',
  DETAIL: (id: string) => `/lots/${id}/`,
  TRACE: (id: string) => `/lots/${id}/trace/`,
  MOVEMENTS: (id: string) => `/lots/${id}/movements/`,
} as const;

// SRV (Store Receiving Voucher)
export const SRV_ENDPOINTS = {
  LIST: '/srv/',
  DETAIL: (id: string) => `/srv/${id}/`,
  ADD_ITEM: (id: string) => `/srv/${id}/add_item/`,
  REMOVE_ITEM: (id: string, itemId: string) => `/srv/${id}/remove_item/${itemId}/`,
  SUBMIT: (id: string) => `/srv/${id}/submit/`,
  APPROVE: (id: string) => `/srv/${id}/approve/`,
  REJECT: (id: string) => `/srv/${id}/reject/`,
  PENDING: '/srv/pending/',
  SUMMARY: '/srv/summary/',
} as const;

// SIV (Store Issuing Voucher)
export const SIV_ENDPOINTS = {
  LIST: '/siv/',
  DETAIL: (id: string) => `/siv/${id}/`,
  ADD_ITEM: (id: string) => `/siv/${id}/add_item/`,
  REMOVE_ITEM: (id: string, itemId: string) => `/siv/${id}/remove_item/${itemId}/`,
  SUBMIT: (id: string) => `/siv/${id}/submit/`,
  APPROVE: (id: string) => `/siv/${id}/approve/`,
  REJECT: (id: string) => `/siv/${id}/reject/`,
  PENDING: '/siv/pending/',
  SUMMARY: '/siv/summary/',
} as const;

// Cleaning Events
export const CLEANING_ENDPOINTS = {
  LIST: '/cleaning/',
  DETAIL: (id: string) => `/cleaning/${id}/`,
  START: (id: string) => `/cleaning/${id}/start/`,
  ADD_OUTPUT: (id: string) => `/cleaning/${id}/add_output/`,
  REMOVE_OUTPUT: (id: string, outputId: string) => `/cleaning/${id}/remove_output/${outputId}/`,
  COMPLETE: (id: string) => `/cleaning/${id}/complete/`,
  CANCEL: (id: string) => `/cleaning/${id}/cancel/`,
  SUMMARY: '/cleaning/summary/',
} as const;

// Approvals
export const APPROVAL_ENDPOINTS = {
  LIST: '/approvals/',
  DETAIL: (id: number) => `/approvals/${id}/`,
  APPROVE: (id: number) => `/approvals/${id}/approve/`,
  REJECT: (id: number) => `/approvals/${id}/reject/`,
  PENDING: '/approvals/pending/',
  SUMMARY: '/approvals/summary/',
} as const;

// Audit Logs
export const AUDIT_ENDPOINTS = {
  LIST: '/audit-logs/',
  DETAIL: (id: number) => `/audit-logs/${id}/`,
  MY_ACTIVITY: '/audit-logs/my_activity/',
  SUMMARY: '/audit-logs/summary/',
} as const;

// Reports
export const REPORT_ENDPOINTS = {
  DASHBOARD: '/reports/dashboard/',
  STOCK_SUMMARY: '/reports/stock-summary/',
  SRV_REGISTER: '/reports/srv-register/',
  SIV_REGISTER: '/reports/siv-register/',
  CLEANING_SUMMARY: '/reports/cleaning-summary/',
  SEED_DISTRIBUTION: '/reports/seed-distribution/',
} as const;
