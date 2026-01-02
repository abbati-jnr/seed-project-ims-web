import { format, formatDistanceToNow, parseISO } from 'date-fns';

/**
 * Format a date string to a readable format
 */
export function formatDate(dateString: string | null | undefined, formatStr = 'MMM d, yyyy'): string {
  if (!dateString) return '-';
  try {
    return format(parseISO(dateString), formatStr);
  } catch {
    return '-';
  }
}

/**
 * Format a date string with time
 */
export function formatDateTime(dateString: string | null | undefined): string {
  if (!dateString) return '-';
  try {
    return format(parseISO(dateString), 'MMM d, yyyy h:mm a');
  } catch {
    return '-';
  }
}

/**
 * Format a date as relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(dateString: string | null | undefined): string {
  if (!dateString) return '-';
  try {
    return formatDistanceToNow(parseISO(dateString), { addSuffix: true });
  } catch {
    return '-';
  }
}

/**
 * Format a quantity string with thousand separators
 */
export function formatQuantity(quantity: string | number | null | undefined, decimals = 2): string {
  if (quantity === null || quantity === undefined) return '-';
  const num = typeof quantity === 'string' ? parseFloat(quantity) : quantity;
  if (isNaN(num)) return '-';
  return num.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
}

/**
 * Format a quantity with unit (kg)
 */
export function formatQuantityWithUnit(quantity: string | number | null | undefined, unit = 'kg'): string {
  const formatted = formatQuantity(quantity);
  if (formatted === '-') return formatted;
  return `${formatted} ${unit}`;
}

/**
 * Format a number as currency (for future use)
 */
export function formatCurrency(amount: number | string, currency = 'NGN'): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '-';
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency,
  }).format(num);
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}

/**
 * Capitalize first letter
 */
export function capitalize(text: string): string {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

/**
 * Format user role for display
 */
export function formatRole(role: string): string {
  return role
    .split('_')
    .map(capitalize)
    .join(' ');
}

/**
 * Format source type for display
 */
export function formatSourceType(type: string): string {
  const map: Record<string, string> = {
    internal: 'Internal',
    in_grower: 'In-Grower',
    out_grower: 'Out-Grower',
  };
  return map[type] || type;
}

/**
 * Format purpose for display
 */
export function formatPurpose(purpose: string): string {
  return capitalize(purpose);
}

/**
 * Format recipient type for display
 */
export function formatRecipientType(type: string): string {
  return capitalize(type);
}
