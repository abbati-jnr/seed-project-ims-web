'use client';

import { use } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, History, Package } from 'lucide-react';
import { getLot, getLotMovements } from '@/lib/api/lots';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { LotStatusBadge, SourceTypeBadge } from '@/components/data-display/status-badge';
import { formatQuantity, formatDate, formatDateTime } from '@/lib/utils/format';

interface LotDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function LotDetailPage({ params }: LotDetailPageProps) {
  const { id } = use(params);

  const { data: lot, isLoading: isLoadingLot } = useQuery({
    queryKey: ['lot', id],
    queryFn: () => getLot(id),
  });

  const { data: movements, isLoading: isLoadingMovements } = useQuery({
    queryKey: ['lot-movements', id],
    queryFn: () => getLotMovements(id),
  });

  if (isLoadingLot) {
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

  if (!lot) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Lot not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/inventory/lots">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <PageHeader
          title={lot.lot_number}
          description={`${lot.seed_product?.display_name || '-'} - ${lot.seed_class?.name_display || '-'}`}
          actions={
            <Link href={`/inventory/lots/${id}/trace`}>
              <Button variant="outline" className="gap-2">
                <History className="h-4 w-4" />
                View Trace
              </Button>
            </Link>
          }
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Lot Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Lot Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-4">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Status</dt>
                <dd><LotStatusBadge status={lot.status} /></dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Warehouse</dt>
                <dd className="font-medium">{lot.warehouse?.code || '-'} - {lot.warehouse?.name || '-'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Source Type</dt>
                <dd><SourceTypeBadge type={lot.source_type} /></dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Source Reference</dt>
                <dd className="font-medium">{lot.source_reference || '-'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Initial Quantity</dt>
                <dd className="font-medium">{formatQuantity(lot.initial_quantity)} kg</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Current Quantity</dt>
                <dd className="font-bold text-lg">{formatQuantity(lot.current_quantity)} kg</dd>
              </div>
              {lot.parent_lot_number && (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Parent Lot</dt>
                  <dd>
                    <Link
                      href={`/inventory/lots/${lot.parent_lot}`}
                      className="text-primary hover:underline"
                    >
                      {lot.parent_lot_number}
                    </Link>
                  </dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Created By</dt>
                <dd className="font-medium">{lot.created_by.full_name}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Created At</dt>
                <dd>{formatDateTime(lot.created_at)}</dd>
              </div>
              {lot.notes && (
                <div className="pt-2 border-t">
                  <dt className="text-muted-foreground mb-1">Notes</dt>
                  <dd className="text-sm">{lot.notes}</dd>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>

        {/* Movement History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Recent Movements
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingMovements ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : movements?.movements.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No movements recorded yet
              </p>
            ) : (
              <div className="space-y-3">
                {movements?.movements.slice(0, 5).map((movement, index) => (
                  <div
                    key={index}
                    className="flex items-start justify-between rounded-lg border p-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex h-2 w-2 rounded-full ${
                            movement.type === 'received'
                              ? 'bg-green-500'
                              : movement.type === 'issued'
                              ? 'bg-red-500'
                              : 'bg-blue-500'
                          }`}
                        />
                        <span className="font-medium capitalize">{movement.type}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {movement.document_number}
                      </p>
                      {movement.notes && (
                        <p className="text-sm text-muted-foreground">{movement.notes}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-medium ${
                          movement.type === 'received'
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        {movement.type === 'received' ? '+' : ''}
                        {formatQuantity(movement.quantity)} kg
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(movement.date)}
                      </p>
                    </div>
                  </div>
                ))}
                {movements && movements.movements.length > 5 && (
                  <Link href={`/inventory/lots/${id}/trace`}>
                    <Button variant="ghost" className="w-full">
                      View all {movements.movements.length} movements
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
