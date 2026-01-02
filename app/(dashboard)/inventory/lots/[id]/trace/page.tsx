'use client';

import { use } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, ArrowRight, FileInput, FileOutput, Sparkles, Package } from 'lucide-react';
import { getLotTrace } from '@/lib/api/lots';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatQuantity, formatDateTime } from '@/lib/utils/format';

interface LotTracePageProps {
  params: Promise<{ id: string }>;
}

export default function LotTracePage({ params }: LotTracePageProps) {
  const { id } = use(params);

  const { data: trace, isLoading } = useQuery({
    queryKey: ['lot-trace', id],
    queryFn: () => getLotTrace(id),
  });

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
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!trace) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Lot not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/inventory/lots/${id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <PageHeader
          title={`Trace: ${trace.lot_number}`}
          description={trace.seed_product_name}
        />
      </div>

      {/* Summary Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-sm text-muted-foreground">Source Type</p>
              <p className="font-medium capitalize">{trace.source_type.replace('_', '-')}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Source Reference</p>
              <p className="font-medium">{trace.source_reference || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Initial Quantity</p>
              <p className="font-medium">{formatQuantity(trace.initial_quantity)} kg</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Current Quantity</p>
              <p className="font-bold text-lg">{formatQuantity(trace.current_quantity)} kg</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <div className="space-y-4">
        {/* SRV Origin */}
        {trace.srv_info && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileInput className="h-5 w-5 text-green-600" />
                Received via SRV
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{trace.srv_info.srv_number}</p>
                  <p className="text-sm text-muted-foreground">
                    By {trace.srv_info.receiving_officer}
                  </p>
                </div>
                <div className="text-right">
                  <Badge variant="success">+{formatQuantity(trace.initial_quantity)} kg</Badge>
                  <p className="text-sm text-muted-foreground mt-1">
                    {formatDateTime(trace.srv_info.approved_at)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Parent Lot (if from cleaning) */}
        {trace.parent_lot_info && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Sparkles className="h-5 w-5 text-blue-600" />
                Created from Cleaning
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Parent Lot</p>
                  <Link
                    href={`/inventory/lots/${trace.parent_lot_info.id}`}
                    className="font-medium text-primary hover:underline"
                  >
                    {trace.parent_lot_info.lot_number}
                  </Link>
                </div>
                <div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">This Lot</p>
                  <p className="font-medium">{trace.lot_number}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Cleaning Events (as input) */}
        {trace.cleaning_input.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Sparkles className="h-5 w-5 text-blue-600" />
                Used in Cleaning ({trace.cleaning_input.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {trace.cleaning_input.map((cleaning, index) => (
                  <div key={index} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="font-medium">Cleaning Event</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDateTime(cleaning.completed_at)}
                      </p>
                    </div>
                    <Badge variant="warning">-{formatQuantity(cleaning.input_quantity)} kg</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* SIV Issues */}
        {trace.siv_items.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileOutput className="h-5 w-5 text-red-600" />
                Issued via SIV ({trace.siv_items.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {trace.siv_items.map((siv, index) => (
                  <div key={index} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="font-medium">{siv.siv_number}</p>
                      <p className="text-sm text-muted-foreground">
                        To {siv.recipient_name} ({siv.purpose})
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant="destructive">-{formatQuantity(siv.quantity)} kg</Badge>
                      <p className="text-sm text-muted-foreground mt-1">
                        {formatDateTime(siv.approved_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Child Lots (from cleaning) */}
        {trace.child_lots.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Package className="h-5 w-5 text-primary" />
                Child Lots ({trace.child_lots.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {trace.child_lots.map((child) => (
                  <Link
                    key={child.id}
                    href={`/inventory/lots/${child.id}`}
                    className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted transition-colors"
                  >
                    <div>
                      <p className="font-medium text-primary">{child.lot_number}</p>
                      <p className="text-sm text-muted-foreground">Created from cleaning</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatQuantity(child.current_quantity)} kg</p>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
