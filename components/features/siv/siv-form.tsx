'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createSIV, updateSIV } from '@/lib/api/siv';
import { getWarehouses } from '@/lib/api/warehouses';
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
import { Plus, Trash2 } from 'lucide-react';
import type { SIV, Lot } from '@/types/models';

const sivItemSchema = z.object({
  lot: z.string().min(1, 'Lot is required'),
  quantity: z.number().positive('Quantity must be positive'),
});

const sivFormSchema = z.object({
  warehouse: z.string().min(1, 'Warehouse is required'),
  purpose: z.enum(['sales', 'distribution', 'research', 'transfer', 'disposal']),
  recipient_name: z.string().min(1, 'Recipient name is required'),
  recipient_contact: z.string().optional(),
  destination: z.string().optional(),
  vehicle_number: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(sivItemSchema).min(1, 'At least one item is required'),
});

type SIVFormData = z.infer<typeof sivFormSchema>;

interface SIVFormProps {
  siv?: SIV;
  mode: 'create' | 'edit';
}

export function SIVForm({ siv, mode }: SIVFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: warehouses } = useQuery({
    queryKey: ['warehouses'],
    queryFn: () => getWarehouses(),
  });

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SIVFormData>({
    resolver: zodResolver(sivFormSchema),
    defaultValues: siv
      ? {
          warehouse: siv.warehouse?.id || '',
          purpose: siv.purpose,
          recipient_name: siv.recipient_name,
          recipient_contact: siv.recipient_contact || '',
          destination: siv.destination || '',
          vehicle_number: siv.vehicle_number || '',
          notes: siv.notes || '',
          items: siv.items.map((item) => ({
            lot: item.lot?.id || '',
            quantity: parseFloat(item.quantity),
          })),
        }
      : {
          warehouse: '',
          purpose: 'sales',
          recipient_name: '',
          recipient_contact: '',
          destination: '',
          vehicle_number: '',
          notes: '',
          items: [{ lot: '', quantity: 0 }],
        },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const selectedWarehouse = watch('warehouse');

  // Fetch available lots for selected warehouse
  const { data: availableLots } = useQuery({
    queryKey: ['lots', { warehouse: selectedWarehouse, status: 'stored' }],
    queryFn: () =>
      getLots({ warehouse: selectedWarehouse, status: 'stored', page_size: 100 }),
    enabled: !!selectedWarehouse,
  });

  const createMutation = useMutation({
    mutationFn: createSIV,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sivs'] });
      toast({ title: 'Success', description: 'SIV created successfully' });
      router.push('/issuing');
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to create SIV', type: 'error' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: SIVFormData) => updateSIV(siv!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sivs'] });
      queryClient.invalidateQueries({ queryKey: ['siv', siv!.id] });
      toast({ title: 'Success', description: 'SIV updated successfully' });
      router.push(`/issuing/${siv!.id}`);
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to update SIV', type: 'error' });
    },
  });

  const onSubmit = async (data: SIVFormData) => {
    setIsSubmitting(true);
    try {
      if (mode === 'create') {
        await createMutation.mutateAsync(data);
      } else {
        await updateMutation.mutateAsync(data);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get lot details for display
  const getLotDetails = (lotId: string): Lot | undefined => {
    return availableLots?.results.find((lot) => lot.id === lotId);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* General Information */}
      <Card>
        <CardHeader>
          <CardTitle>General Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Warehouse *</label>
              <Select
                value={watch('warehouse')}
                onValueChange={(value) => {
                  setValue('warehouse', value);
                  // Clear items when warehouse changes
                  setValue('items', [{ lot: '', quantity: 0 }]);
                }}
              >
                <SelectTrigger className={errors.warehouse ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Select warehouse" />
                </SelectTrigger>
                <SelectContent>
                  {warehouses?.results.map((warehouse) => (
                    <SelectItem key={warehouse.id} value={warehouse.id}>
                      {warehouse.code} - {warehouse.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.warehouse && (
                <p className="text-sm text-destructive">{errors.warehouse.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Purpose *</label>
              <Select
                value={watch('purpose')}
                onValueChange={(value: 'sales' | 'distribution' | 'research' | 'transfer' | 'disposal') =>
                  setValue('purpose', value)
                }
              >
                <SelectTrigger className={errors.purpose ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Select purpose" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sales">Sales</SelectItem>
                  <SelectItem value="distribution">Distribution</SelectItem>
                  <SelectItem value="research">Research</SelectItem>
                  <SelectItem value="transfer">Transfer</SelectItem>
                  <SelectItem value="disposal">Disposal</SelectItem>
                </SelectContent>
              </Select>
              {errors.purpose && (
                <p className="text-sm text-destructive">{errors.purpose.message}</p>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Recipient Name *</label>
              <Input
                {...register('recipient_name')}
                className={errors.recipient_name ? 'border-destructive' : ''}
                placeholder="Enter recipient name"
              />
              {errors.recipient_name && (
                <p className="text-sm text-destructive">{errors.recipient_name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Recipient Contact</label>
              <Input {...register('recipient_contact')} placeholder="Enter contact info" />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Destination</label>
              <Input {...register('destination')} placeholder="Enter destination" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Vehicle Number</label>
              <Input {...register('vehicle_number')} placeholder="Enter vehicle number" />
            </div>
          </div>

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

      {/* Items */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Items</CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ lot: '', quantity: 0 })}
            disabled={!selectedWarehouse}
            className="gap-1"
          >
            <Plus className="h-4 w-4" />
            Add Item
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {!selectedWarehouse && (
            <p className="text-sm text-muted-foreground text-center py-4">
              Please select a warehouse first
            </p>
          )}

          {errors.items?.root && (
            <p className="text-sm text-destructive">{errors.items.root.message}</p>
          )}

          {selectedWarehouse &&
            fields.map((field, index) => {
              const selectedLot = getLotDetails(watch(`items.${index}.lot`));

              return (
                <div key={field.id} className="rounded-lg border p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Item {index + 1}</span>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => remove(index)}
                        className="h-8 w-8 p-0 text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Lot *</label>
                      <Select
                        value={watch(`items.${index}.lot`)}
                        onValueChange={(value) => setValue(`items.${index}.lot`, value)}
                      >
                        <SelectTrigger
                          className={errors.items?.[index]?.lot ? 'border-destructive' : ''}
                        >
                          <SelectValue placeholder="Select lot" />
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
                      {errors.items?.[index]?.lot && (
                        <p className="text-sm text-destructive">
                          {errors.items[index]?.lot?.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Quantity (kg) *</label>
                      <Input
                        type="number"
                        step="0.01"
                        {...register(`items.${index}.quantity`)}
                        className={errors.items?.[index]?.quantity ? 'border-destructive' : ''}
                        placeholder="0.00"
                      />
                      {selectedLot && (
                        <p className="text-xs text-muted-foreground">
                          Available: {formatQuantity(selectedLot.current_quantity)} kg
                        </p>
                      )}
                      {errors.items?.[index]?.quantity && (
                        <p className="text-sm text-destructive">
                          {errors.items[index]?.quantity?.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {selectedLot && (
                    <div className="text-sm text-muted-foreground bg-muted p-2 rounded">
                      <span className="font-medium">{selectedLot.seed_product?.crop || '-'}</span> -{' '}
                      {selectedLot.seed_product?.variety || '-'} | {selectedLot.seed_class?.name_display || '-'}
                    </div>
                  )}
                </div>
              );
            })}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Spinner size="sm" className="mr-2" />}
          {mode === 'create' ? 'Create SIV' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
}
