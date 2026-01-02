import { Badge } from '@/components/ui/badge';
import type { LotStatus, DocumentStatus, CleaningStatus } from '@/types/models';

// Lot Status Badge
const lotStatusConfig: Record<LotStatus, { label: string; variant: 'default' | 'secondary' | 'success' | 'warning' | 'info' | 'muted' }> = {
  stored: { label: 'Stored', variant: 'success' },
  cleaned: { label: 'Cleaned', variant: 'info' },
  issued: { label: 'Issued', variant: 'warning' },
  exhausted: { label: 'Exhausted', variant: 'muted' },
};

interface LotStatusBadgeProps {
  status: LotStatus;
}

export function LotStatusBadge({ status }: LotStatusBadgeProps) {
  const config = lotStatusConfig[status] || { label: status, variant: 'muted' as const };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

// Document Status Badge (SRV/SIV)
const documentStatusConfig: Record<DocumentStatus, { label: string; variant: 'default' | 'secondary' | 'success' | 'warning' | 'info' | 'muted' | 'destructive' }> = {
  draft: { label: 'Draft', variant: 'muted' },
  pending: { label: 'Pending', variant: 'warning' },
  approved: { label: 'Approved', variant: 'success' },
  rejected: { label: 'Rejected', variant: 'destructive' },
  cancelled: { label: 'Cancelled', variant: 'muted' },
};

interface DocumentStatusBadgeProps {
  status: DocumentStatus;
}

export function DocumentStatusBadge({ status }: DocumentStatusBadgeProps) {
  const config = documentStatusConfig[status] || { label: status, variant: 'muted' as const };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

// Cleaning Status Badge
const cleaningStatusConfig: Record<CleaningStatus, { label: string; variant: 'default' | 'secondary' | 'success' | 'warning' | 'info' | 'muted' }> = {
  draft: { label: 'Draft', variant: 'muted' },
  in_progress: { label: 'In Progress', variant: 'info' },
  completed: { label: 'Completed', variant: 'success' },
  cancelled: { label: 'Cancelled', variant: 'muted' },
};

interface CleaningStatusBadgeProps {
  status: CleaningStatus;
}

export function CleaningStatusBadge({ status }: CleaningStatusBadgeProps) {
  const config = cleaningStatusConfig[status] || { label: status, variant: 'muted' as const };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

// Source Type Badge
const sourceTypeConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'info' }> = {
  internal: { label: 'Internal', variant: 'default' },
  in_grower: { label: 'In-Grower', variant: 'secondary' },
  out_grower: { label: 'Out-Grower', variant: 'info' },
};

interface SourceTypeBadgeProps {
  type: string;
}

export function SourceTypeBadge({ type }: SourceTypeBadgeProps) {
  const config = sourceTypeConfig[type] || { label: type, variant: 'muted' as const };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

// Purpose Badge (SIV)
const purposeConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'info' | 'warning' | 'muted' }> = {
  sales: { label: 'Sales', variant: 'default' },
  distribution: { label: 'Distribution', variant: 'secondary' },
  research: { label: 'Research', variant: 'info' },
  transfer: { label: 'Transfer', variant: 'warning' },
  disposal: { label: 'Disposal', variant: 'muted' },
};

interface PurposeBadgeProps {
  purpose: string;
}

export function PurposeBadge({ purpose }: PurposeBadgeProps) {
  const config = purposeConfig[purpose] || { label: purpose, variant: 'muted' as const };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
