'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createCleaningEvent } from '@/lib/api/cleaning';
import { getLots } from '@/lib/api/lots';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { useToast } from '@/lib/hooks/use-toast';
import { formatQuantity } from '@/lib/utils/format';
import type { Lot } from '@/types/models';

const cleaningFormSchema = z.object({
  input_lot: z.string().min(1, 'Input lot is required'),
  input_quantity: z.number().positive('Quantity must be positive'),
  notes: z.string().optional(),
});

type CleaningFormData = z.infer<typeof cleaningFormSchema>;

export function CleaningForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch available lots (stored status only)
  const { data: availableLots } = useQuery({
    queryKey: ['lots', { status: 'stored', page_size: 100 }],
    queryFn: () => getLots({ status: 'stored', page_size: 100 }),
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CleaningFormData>({
    resolver: zodResolver(cleaningFormSchema),
    defaultValues: {
      input_lot: '',
      input_quantity: 0,
      notes: '',
    },
  });

  const selectedLotId = watch('input_lot');
  const selectedLot = availableLots?.results.find((lot) => lot.id === selectedLotId);

  const createMutation = useMutation({
    mutationFn: createCleaningEvent,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cleaning-events'] });
      toast({ title: 'Success', description: 'Cleaning event created successfully' });
      router.push(`/cleaning/${data.id}`);
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to create cleaning event', type: 'error' });
    },
  });

  const onSubmit = async (data: CleaningFormData) => {
    setIsSubmitting(true);
    try {
      await createMutation.mutateAsync(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Cleaning Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Input Lot *</label>
              <Select
                value={watch('input_lot')}
                onValueChange={(value) => {
                  setValue('input_lot', value);
                  // Pre-fill quantity with available quantity
                  const lot = availableLots?.results.find((l) => l.id === value);
                  if (lot) {
                    setValue('input_quantity', parseFloat(lot.current_quantity));
                  }
                }}
              >
                <SelectTrigger className={errors.input_lot ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Select lot to clean" />
                </SelectTrigger>
                <SelectContent>
                  {availableLots?.results.map((lot) => (
                    <SelectItem key={lot.id} value={lot.id}>
                      <div className="flex flex-col">
                        <span>{lot.lot_number}</span>
                        <span className="text-xs text-muted-foreground">
                          {lot.seed_product?.crop || '-'} - {lot.seed_product?.variety || '-'} (
                          {formatQuantity(lot.current_quantity)} kg)
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.input_lot && (
                <p className="text-sm text-destructive">{errors.input_lot.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Input Quantity (kg) *</label>
              <Input
                type="number"
                step="0.01"
                {...register('input_quantity', { valueAsNumber: true })}
                className={errors.input_quantity ? 'border-destructive' : ''}
                placeholder="0.00"
              />
              {selectedLot && (
                <p className="text-xs text-muted-foreground">
                  Available: {formatQuantity(selectedLot.current_quantity)} kg
                </p>
              )}
              {errors.input_quantity && (
                <p className="text-sm text-destructive">{errors.input_quantity.message}</p>
              )}
            </div>
          </div>

          {selectedLot && (
            <div className="rounded-lg border bg-muted/50 p-4">
              <h4 className="font-medium mb-2">Selected Lot Details</h4>
              <div className="grid gap-2 text-sm sm:grid-cols-2">
                <div>
                  <span className="text-muted-foreground">Seed Product:</span>{' '}
                  <span className="font-medium">
                    {selectedLot.seed_product?.crop || '-'} - {selectedLot.seed_product?.variety || '-'}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Seed Class:</span>{' '}
                  <span className="font-medium">{selectedLot.seed_class?.name_display || '-'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Warehouse:</span>{' '}
                  <span className="font-medium">
                    {selectedLot.warehouse?.code || '-'} - {selectedLot.warehouse?.name || '-'}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Available Qty:</span>{' '}
                  <span className="font-medium">
                    {formatQuantity(selectedLot.current_quantity)} kg
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Notes</label>
            <textarea
              {...register('notes')}
              className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder="Add notes..."
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Spinner size="sm" className="mr-2" />}
          Create Cleaning Event
        </Button>
      </div>
    </form>
  );
}
