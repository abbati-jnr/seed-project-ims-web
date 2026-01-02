'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getCleaningEvent,
  startCleaning,
  addCleaningOutput,
  completeCleaning,
  cancelCleaning,
} from '@/lib/api/cleaning';
import { getSeedClasses } from '@/lib/api/seed-classes';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CleaningStatusBadge, LotStatusBadge } from '@/components/data-display/status-badge';
import { useToast } from '@/lib/hooks/use-toast';
import { useAuthStore } from '@/lib/stores/auth-store';
import { formatQuantity, formatDateTime } from '@/lib/utils/format';
import {
  ArrowLeft,
  Play,
  Plus,
  Trash2,
  CheckCircle,
  XCircle,
  Package,
  Sparkles,
  Scale,
} from 'lucide-react';

interface CleaningDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function CleaningDetailPage({ params }: CleaningDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuthStore();

  const [showAddOutput, setShowAddOutput] = useState(false);
  const [newOutputClass, setNewOutputClass] = useState('');
  const [newOutputQuantity, setNewOutputQuantity] = useState('');

  const [showComplete, setShowComplete] = useState(false);
  const [wasteQuantity, setWasteQuantity] = useState('');
  const [completeNotes, setCompleteNotes] = useState('');

  const [showCancel, setShowCancel] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const { data: event, isLoading } = useQuery({
    queryKey: ['cleaning-event', id],
    queryFn: () => getCleaningEvent(id),
  });

  const { data: seedClasses } = useQuery({
    queryKey: ['seed-classes'],
    queryFn: () => getSeedClasses(),
  });

  const startMutation = useMutation({
    mutationFn: () => startCleaning(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cleaning-event', id] });
      queryClient.invalidateQueries({ queryKey: ['cleaning-events'] });
      toast({ title: 'Success', description: 'Cleaning started' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to start cleaning', type: 'error' });
    },
  });

  const addOutputMutation = useMutation({
    mutationFn: () =>
      addCleaningOutput(id, {
        seed_class: newOutputClass,
        output_quantity: parseFloat(newOutputQuantity),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cleaning-event', id] });
      toast({ title: 'Success', description: 'Output lot added' });
      setShowAddOutput(false);
      setNewOutputClass('');
      setNewOutputQuantity('');
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to add output', type: 'error' });
    },
  });

  const completeMutation = useMutation({
    mutationFn: () =>
      completeCleaning(id, {
        waste_quantity: parseFloat(wasteQuantity),
        notes: completeNotes || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cleaning-event', id] });
      queryClient.invalidateQueries({ queryKey: ['cleaning-events'] });
      queryClient.invalidateQueries({ queryKey: ['lots'] });
      toast({ title: 'Success', description: 'Cleaning completed and output lots created' });
      setShowComplete(false);
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to complete cleaning', type: 'error' });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: () => cancelCleaning(id, cancelReason || undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cleaning-event', id] });
      queryClient.invalidateQueries({ queryKey: ['cleaning-events'] });
      toast({ title: 'Success', description: 'Cleaning cancelled' });
      setShowCancel(false);
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to cancel cleaning', type: 'error' });
    },
  });

  const isOwner = event?.cleaning_officer.id === user?.id;
  const canStart = event?.status === 'draft' && isOwner;
  const canAddOutput = event?.status === 'in_progress' && isOwner;
  const canComplete = event?.status === 'in_progress' && isOwner && (event?.output_lots.length ?? 0) > 0;
  const canCancel = (event?.status === 'draft' || event?.status === 'in_progress') && isOwner;

  // Calculate totals
  const totalOutput = parseFloat(event?.total_output || '0');
  const inputQuantity = parseFloat(event?.input_quantity || '0');
  const currentWaste = parseFloat(event?.waste_quantity || '0');
  const remainingQuantity = inputQuantity - totalOutput - currentWaste;

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

  if (!event) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Cleaning event not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/cleaning">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <PageHeader
          title={`Cleaning: ${event.input_lot.lot_number}`}
          description={`${event.input_lot?.seed_product?.crop || '-'} - ${event.input_lot?.seed_product?.variety || '-'}`}
          actions={
            <div className="flex gap-2">
              {canStart && (
                <Button
                  onClick={() => startMutation.mutate()}
                  disabled={startMutation.isPending}
                  className="gap-2"
                >
                  {startMutation.isPending ? <Spinner size="sm" /> : <Play className="h-4 w-4" />}
                  Start Cleaning
                </Button>
              )}
              {canCancel && (
                <Button
                  variant="outline"
                  onClick={() => setShowCancel(true)}
                  className="gap-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                >
                  <XCircle className="h-4 w-4" />
                  Cancel
                </Button>
              )}
              {canComplete && (
                <Button onClick={() => setShowComplete(true)} className="gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Complete
                </Button>
              )}
            </div>
          }
        />
      </div>

      {/* Cancel Dialog */}
      {showCancel && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Cancel Cleaning</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Reason (optional)</label>
              <textarea
                className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Enter reason for cancellation..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowCancel(false)}>
                Back
              </Button>
              <Button
                variant="destructive"
                onClick={() => cancelMutation.mutate()}
                disabled={cancelMutation.isPending}
              >
                {cancelMutation.isPending && <Spinner size="sm" className="mr-2" />}
                Confirm Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Complete Dialog */}
      {showComplete && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle>Complete Cleaning</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-muted p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Input Quantity:</span>
                <span className="font-medium">{formatQuantity(event.input_quantity)} kg</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Total Output:</span>
                <span className="font-medium">{formatQuantity(event.total_output)} kg</span>
              </div>
              <div className="flex justify-between text-sm border-t pt-2">
                <span>Remaining (for waste):</span>
                <span className="font-medium">{formatQuantity(remainingQuantity.toString())} kg</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Waste Quantity (kg) *</label>
              <Input
                type="number"
                step="0.01"
                value={wasteQuantity}
                onChange={(e) => setWasteQuantity(e.target.value)}
                placeholder="0.00"
              />
              <p className="text-xs text-muted-foreground">
                Expected waste based on input and outputs: {formatQuantity(remainingQuantity.toString())} kg
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Notes</label>
              <textarea
                className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Add completion notes..."
                value={completeNotes}
                onChange={(e) => setCompleteNotes(e.target.value)}
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowComplete(false)}>
                Back
              </Button>
              <Button
                onClick={() => completeMutation.mutate()}
                disabled={!wasteQuantity || completeMutation.isPending}
              >
                {completeMutation.isPending && <Spinner size="sm" className="mr-2" />}
                Complete Cleaning
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Cleaning Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Cleaning Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-4">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Status</dt>
                <dd>
                  <CleaningStatusBadge status={event.status} />
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Input Quantity</dt>
                <dd className="font-bold text-lg">{formatQuantity(event.input_quantity)} kg</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Total Output</dt>
                <dd className="font-medium">{formatQuantity(event.total_output)} kg</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Waste Quantity</dt>
                <dd className="font-medium">{formatQuantity(event.waste_quantity)} kg</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Cleaning Officer</dt>
                <dd className="font-medium">{event.cleaning_officer.full_name}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Created At</dt>
                <dd>{formatDateTime(event.created_at)}</dd>
              </div>
              {event.completed_at && (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Completed At</dt>
                  <dd>{formatDateTime(event.completed_at)}</dd>
                </div>
              )}
              {event.notes && (
                <div className="pt-2 border-t">
                  <dt className="text-muted-foreground mb-1">Notes</dt>
                  <dd className="text-sm">{event.notes}</dd>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>

        {/* Input Lot */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Input Lot
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-4">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Lot Number</dt>
                <dd>
                  {event.input_lot ? (
                    <Link
                      href={`/inventory/lots/${event.input_lot.id}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {event.input_lot.lot_number}
                    </Link>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Seed Product</dt>
                <dd className="font-medium">
                  {event.input_lot?.seed_product?.crop || '-'} - {event.input_lot?.seed_product?.variety || '-'}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Seed Class</dt>
                <dd className="font-medium">{event.input_lot?.seed_class?.name_display || '-'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Warehouse</dt>
                <dd className="font-medium">
                  {event.input_lot?.warehouse?.code || '-'} - {event.input_lot?.warehouse?.name || '-'}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Lot Status</dt>
                <dd>
                  <LotStatusBadge status={event.input_lot.status} />
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>

      {/* Output Lots */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5" />
            Output Lots ({event.output_lots.length})
          </CardTitle>
          {canAddOutput && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddOutput(true)}
              className="gap-1"
            >
              <Plus className="h-4 w-4" />
              Add Output
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {/* Add Output Form */}
          {showAddOutput && (
            <div className="rounded-lg border p-4 mb-4 space-y-4">
              <h4 className="font-medium">Add Output Lot</h4>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Seed Class *</label>
                  <Select value={newOutputClass} onValueChange={setNewOutputClass}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select seed class" />
                    </SelectTrigger>
                    <SelectContent>
                      {seedClasses?.results.map((sc) => (
                        <SelectItem key={sc.id} value={sc.id}>
                          {sc.name_display}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Quantity (kg) *</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={newOutputQuantity}
                    onChange={(e) => setNewOutputQuantity(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" size="sm" onClick={() => setShowAddOutput(false)}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={() => addOutputMutation.mutate()}
                  disabled={!newOutputClass || !newOutputQuantity || addOutputMutation.isPending}
                >
                  {addOutputMutation.isPending && <Spinner size="sm" className="mr-2" />}
                  Add
                </Button>
              </div>
            </div>
          )}

          {event.output_lots.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No output lots added yet
            </p>
          ) : (
            <div className="space-y-3">
              {event.output_lots.map((output) => (
                <div
                  key={output.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div>
                    {output.output_lot ? (
                      <Link
                        href={`/inventory/lots/${output.output_lot.id}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {output.output_lot.lot_number}
                      </Link>
                    ) : (
                      <span className="font-medium text-muted-foreground">Pending lot creation</span>
                    )}
                    <p className="text-sm text-muted-foreground">{output.seed_class?.name_display || '-'}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">{formatQuantity(output.output_quantity)} kg</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Summary */}
          {event.output_lots.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Output:</span>
                <span className="font-bold">{formatQuantity(event.total_output)} kg</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-muted-foreground">Remaining from input:</span>
                <span className="font-medium">{formatQuantity(remainingQuantity.toString())} kg</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
