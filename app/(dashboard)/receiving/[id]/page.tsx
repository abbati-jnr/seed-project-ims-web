'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSRV, submitSRV, approveSRV, rejectSRV } from '@/lib/api/srv';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import { DocumentStatusBadge, SourceTypeBadge } from '@/components/data-display/status-badge';
import { useToast } from '@/lib/hooks/use-toast';
import { useAuthStore } from '@/lib/stores/auth-store';
import { formatQuantity, formatDateTime } from '@/lib/utils/format';
import {
  ArrowLeft,
  Edit,
  Send,
  CheckCircle,
  XCircle,
  Package,
  FileText,
  Truck,
} from 'lucide-react';

interface SRVDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function SRVDetailPage({ params }: SRVDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuthStore();
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  const { data: srv, isLoading } = useQuery({
    queryKey: ['srv', id],
    queryFn: () => getSRV(id),
  });

  const submitMutation = useMutation({
    mutationFn: () => submitSRV(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['srv', id] });
      queryClient.invalidateQueries({ queryKey: ['srvs'] });
      toast({ title: 'Success', description: 'SRV submitted for approval' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to submit SRV', type: 'error' });
    },
  });

  const approveMutation = useMutation({
    mutationFn: () => approveSRV(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['srv', id] });
      queryClient.invalidateQueries({ queryKey: ['srvs'] });
      queryClient.invalidateQueries({ queryKey: ['lots'] });
      toast({ title: 'Success', description: 'SRV approved and lots created' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to approve SRV', type: 'error' });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: () => rejectSRV(id, rejectReason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['srv', id] });
      queryClient.invalidateQueries({ queryKey: ['srvs'] });
      toast({ title: 'Success', description: 'SRV rejected' });
      setShowRejectDialog(false);
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to reject SRV', type: 'error' });
    },
  });

  const canEdit = srv?.status === 'draft' && srv?.receiving_officer.id === user?.id;
  const canSubmit = srv?.status === 'draft' && srv?.receiving_officer.id === user?.id;
  const canApprove =
    srv?.status === 'pending' &&
    (user?.role === 'admin' || user?.role === 'manager') &&
    srv?.receiving_officer.id !== user?.id;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (!srv) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">SRV not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/receiving">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <PageHeader
          title={srv.srv_number}
          description={`${srv.warehouse?.code || '-'} - ${srv.warehouse?.name || '-'}`}
          actions={
            <div className="flex gap-2">
              {canEdit && (
                <Link href={`/receiving/${id}/edit`}>
                  <Button variant="outline" className="gap-2">
                    <Edit className="h-4 w-4" />
                    Edit
                  </Button>
                </Link>
              )}
              {canSubmit && (
                <Button
                  onClick={() => submitMutation.mutate()}
                  disabled={submitMutation.isPending}
                  className="gap-2"
                >
                  {submitMutation.isPending ? (
                    <Spinner size="sm" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  Submit for Approval
                </Button>
              )}
              {canApprove && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setShowRejectDialog(true)}
                    disabled={rejectMutation.isPending}
                    className="gap-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                  >
                    <XCircle className="h-4 w-4" />
                    Reject
                  </Button>
                  <Button
                    onClick={() => approveMutation.mutate()}
                    disabled={approveMutation.isPending}
                    className="gap-2"
                  >
                    {approveMutation.isPending ? (
                      <Spinner size="sm" />
                    ) : (
                      <CheckCircle className="h-4 w-4" />
                    )}
                    Approve
                  </Button>
                </>
              )}
            </div>
          }
        />
      </div>

      {/* Reject Dialog */}
      {showRejectDialog && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Reject SRV</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Reason for rejection *</label>
              <textarea
                className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="Enter reason for rejection..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => rejectMutation.mutate()}
                disabled={!rejectReason || rejectMutation.isPending}
              >
                {rejectMutation.isPending && <Spinner size="sm" className="mr-2" />}
                Confirm Rejection
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* SRV Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              SRV Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-4">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Status</dt>
                <dd>
                  <DocumentStatusBadge status={srv.status} />
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Source Type</dt>
                <dd>
                  <SourceTypeBadge type={srv.source_type} />
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Total Quantity</dt>
                <dd className="font-bold text-lg">{formatQuantity(srv.total_quantity)} kg</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Receiving Officer</dt>
                <dd className="font-medium">{srv.receiving_officer.full_name}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Created At</dt>
                <dd>{formatDateTime(srv.created_at)}</dd>
              </div>
              {srv.approved_by && (
                <>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Approved By</dt>
                    <dd className="font-medium">{srv.approved_by.full_name}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Approved At</dt>
                    <dd>{formatDateTime(srv.approved_at)}</dd>
                  </div>
                </>
              )}
              {srv.rejection_reason && (
                <div className="pt-2 border-t">
                  <dt className="text-muted-foreground mb-1">Rejection Reason</dt>
                  <dd className="text-sm text-destructive">{srv.rejection_reason}</dd>
                </div>
              )}
              {srv.notes && (
                <div className="pt-2 border-t">
                  <dt className="text-muted-foreground mb-1">Notes</dt>
                  <dd className="text-sm">{srv.notes}</dd>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>

        {/* Supplier/Transport Info */}
        {(srv.supplier_name || srv.vehicle_number) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Supplier & Transport
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-4">
                {srv.supplier_name && (
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Supplier Name</dt>
                    <dd className="font-medium">{srv.supplier_name}</dd>
                  </div>
                )}
                {srv.supplier_contact && (
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Supplier Contact</dt>
                    <dd>{srv.supplier_contact}</dd>
                  </div>
                )}
                {srv.vehicle_number && (
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Vehicle Number</dt>
                    <dd className="font-medium">{srv.vehicle_number}</dd>
                  </div>
                )}
              </dl>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Items ({srv.items.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {srv.items.map((item, index) => (
              <div
                key={index}
                className="flex items-start justify-between rounded-lg border p-4"
              >
                <div>
                  <p className="font-medium">
                    {item.seed_product?.crop || '-'} - {item.seed_product?.variety || '-'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {item.seed_class?.name_display || '-'}
                  </p>
                  {item.source_reference && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Ref: {item.source_reference}
                    </p>
                  )}
                  {item.lot_number && (
                    <Link
                      href={`/inventory/lots/${item.lot}`}
                      className="text-sm text-primary hover:underline mt-1 block"
                    >
                      Lot: {item.lot_number}
                    </Link>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">{formatQuantity(item.quantity)} kg</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
