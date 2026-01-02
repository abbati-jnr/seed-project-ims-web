'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSIV, submitSIV, approveSIV, rejectSIV } from '@/lib/api/siv';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import { DocumentStatusBadge, PurposeBadge } from '@/components/data-display/status-badge';
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
  User,
} from 'lucide-react';

interface SIVDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function SIVDetailPage({ params }: SIVDetailPageProps) {
  const { id } = use(params);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuthStore();
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  const { data: siv, isLoading } = useQuery({
    queryKey: ['siv', id],
    queryFn: () => getSIV(id),
  });

  const submitMutation = useMutation({
    mutationFn: () => submitSIV(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['siv', id] });
      queryClient.invalidateQueries({ queryKey: ['sivs'] });
      toast({ title: 'Success', description: 'SIV submitted for approval' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to submit SIV', type: 'error' });
    },
  });

  const approveMutation = useMutation({
    mutationFn: () => approveSIV(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['siv', id] });
      queryClient.invalidateQueries({ queryKey: ['sivs'] });
      queryClient.invalidateQueries({ queryKey: ['lots'] });
      toast({ title: 'Success', description: 'SIV approved and stock issued' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to approve SIV', type: 'error' });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: () => rejectSIV(id, rejectReason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['siv', id] });
      queryClient.invalidateQueries({ queryKey: ['sivs'] });
      toast({ title: 'Success', description: 'SIV rejected' });
      setShowRejectDialog(false);
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to reject SIV', type: 'error' });
    },
  });

  const canEdit = siv?.status === 'draft' && siv?.issuing_officer.id === user?.id;
  const canSubmit = siv?.status === 'draft' && siv?.issuing_officer.id === user?.id;
  const canApprove =
    siv?.status === 'pending' &&
    (user?.role === 'admin' || user?.role === 'manager') &&
    siv?.issuing_officer.id !== user?.id;

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

  if (!siv) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">SIV not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/issuing">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <PageHeader
          title={siv.siv_number}
          description={`${siv.warehouse?.code || '-'} - ${siv.warehouse?.name || '-'}`}
          actions={
            <div className="flex gap-2">
              {canEdit && (
                <Link href={`/issuing/${id}/edit`}>
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
            <CardTitle className="text-destructive">Reject SIV</CardTitle>
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
        {/* SIV Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              SIV Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-4">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Status</dt>
                <dd>
                  <DocumentStatusBadge status={siv.status} />
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Purpose</dt>
                <dd>
                  <PurposeBadge purpose={siv.purpose} />
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Total Quantity</dt>
                <dd className="font-bold text-lg">{formatQuantity(siv.total_quantity)} kg</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Issuing Officer</dt>
                <dd className="font-medium">{siv.issuing_officer.full_name}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Created At</dt>
                <dd>{formatDateTime(siv.created_at)}</dd>
              </div>
              {siv.approved_by && (
                <>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Approved By</dt>
                    <dd className="font-medium">{siv.approved_by.full_name}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Approved At</dt>
                    <dd>{formatDateTime(siv.approved_at)}</dd>
                  </div>
                </>
              )}
              {siv.rejection_reason && (
                <div className="pt-2 border-t">
                  <dt className="text-muted-foreground mb-1">Rejection Reason</dt>
                  <dd className="text-sm text-destructive">{siv.rejection_reason}</dd>
                </div>
              )}
              {siv.notes && (
                <div className="pt-2 border-t">
                  <dt className="text-muted-foreground mb-1">Notes</dt>
                  <dd className="text-sm">{siv.notes}</dd>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>

        {/* Recipient & Transport Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Recipient & Transport
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-4">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Recipient Name</dt>
                <dd className="font-medium">{siv.recipient_name}</dd>
              </div>
              {siv.recipient_contact && (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Recipient Contact</dt>
                  <dd>{siv.recipient_contact}</dd>
                </div>
              )}
              {siv.destination && (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Destination</dt>
                  <dd>{siv.destination}</dd>
                </div>
              )}
              {siv.vehicle_number && (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Vehicle Number</dt>
                  <dd className="font-medium">{siv.vehicle_number}</dd>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>
      </div>

      {/* Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Items ({siv.items.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {siv.items.map((item, index) => (
              <div
                key={index}
                className="flex items-start justify-between rounded-lg border p-4"
              >
                <div>
                  {item.lot ? (
                    <Link
                      href={`/inventory/lots/${item.lot.id}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {item.lot.lot_number}
                    </Link>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                  <p className="text-sm text-muted-foreground">
                    {item.lot?.seed_product?.crop || '-'} - {item.lot?.seed_product?.variety || '-'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {item.lot?.seed_class?.name_display || '-'}
                  </p>
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
