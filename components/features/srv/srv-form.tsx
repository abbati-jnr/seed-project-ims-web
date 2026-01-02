'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createSRV, updateSRV } from '@/lib/api/srv';
import { getWarehouses } from '@/lib/api/warehouses';
import { getSeedClasses } from '@/lib/api/seed-classes';
import { getSeedProducts } from '@/lib/api/seed-products';
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
import { Plus, Trash2 } from 'lucide-react';
import type { SRV } from '@/types/models';

const srvItemSchema = z.object({
  seed_product: z.string().min(1, 'Seed product is required'),
  seed_class: z.string().min(1, 'Seed class is required'),
  quantity: z.number().positive('Quantity must be positive'),
  source_reference: z.string().optional(),
});

const srvFormSchema = z.object({
  warehouse: z.string().min(1, 'Warehouse is required'),
  source_type: z.enum(['internal', 'in_grower', 'out_grower']),
  supplier_name: z.string().optional(),
  supplier_contact: z.string().optional(),
  vehicle_number: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(srvItemSchema).min(1, 'At least one item is required'),
});

type SRVFormData = z.infer<typeof srvFormSchema>;

interface SRVFormProps {
  srv?: SRV;
  mode: 'create' | 'edit';
}

export function SRVForm({ srv, mode }: SRVFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: warehouses } = useQuery({
    queryKey: ['warehouses'],
    queryFn: () => getWarehouses(),
  });

  const { data: seedClasses } = useQuery({
    queryKey: ['seed-classes'],
    queryFn: () => getSeedClasses(),
  });

  const { data: seedProducts } = useQuery({
    queryKey: ['seed-products'],
    queryFn: () => getSeedProducts(),
  });

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SRVFormData>({
    resolver: zodResolver(srvFormSchema),
    defaultValues: srv
      ? {
          warehouse: srv.warehouse?.id || '',
          source_type: srv.source_type,
          supplier_name: srv.supplier_name || '',
          supplier_contact: srv.supplier_contact || '',
          vehicle_number: srv.vehicle_number || '',
          notes: srv.notes || '',
          items: srv.items.map((item) => ({
            seed_product: item.seed_product?.id || '',
            seed_class: item.seed_class?.id || '',
            quantity: parseFloat(item.quantity),
            source_reference: item.source_reference || '',
          })),
        }
      : {
          warehouse: '',
          source_type: 'internal',
          supplier_name: '',
          supplier_contact: '',
          vehicle_number: '',
          notes: '',
          items: [{ seed_product: '', seed_class: '', quantity: 0, source_reference: '' }],
        },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const sourceType = watch('source_type');

  const createMutation = useMutation({
    mutationFn: createSRV,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['srvs'] });
      toast({ title: 'Success', description: 'SRV created successfully' });
      router.push('/receiving');
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to create SRV', type: 'error' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: SRVFormData) => updateSRV(srv!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['srvs'] });
      queryClient.invalidateQueries({ queryKey: ['srv', srv!.id] });
      toast({ title: 'Success', description: 'SRV updated successfully' });
      router.push(`/receiving/${srv!.id}`);
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to update SRV', type: 'error' });
    },
  });

  const onSubmit = async (data: SRVFormData) => {
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
                onValueChange={(value) => setValue('warehouse', value)}
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
              <label className="text-sm font-medium">Source Type *</label>
              <Select
                value={watch('source_type')}
                onValueChange={(value: 'internal' | 'in_grower' | 'out_grower') =>
                  setValue('source_type', value)
                }
              >
                <SelectTrigger className={errors.source_type ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Select source type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="internal">Internal</SelectItem>
                  <SelectItem value="in_grower">In-Grower</SelectItem>
                  <SelectItem value="out_grower">Out-Grower</SelectItem>
                </SelectContent>
              </Select>
              {errors.source_type && (
                <p className="text-sm text-destructive">{errors.source_type.message}</p>
              )}
            </div>
          </div>

          {/* Supplier info for external sources */}
          {sourceType !== 'internal' && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Supplier Name</label>
                <Input {...register('supplier_name')} placeholder="Enter supplier name" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Supplier Contact</label>
                <Input {...register('supplier_contact')} placeholder="Enter contact info" />
              </div>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
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
            onClick={() =>
              append({ seed_product: '', seed_class: '', quantity: 0, source_reference: '' })
            }
            className="gap-1"
          >
            <Plus className="h-4 w-4" />
            Add Item
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {errors.items?.root && (
            <p className="text-sm text-destructive">{errors.items.root.message}</p>
          )}

          {fields.map((field, index) => (
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

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Seed Product *</label>
                  <Select
                    value={watch(`items.${index}.seed_product`)}
                    onValueChange={(value) => setValue(`items.${index}.seed_product`, value)}
                  >
                    <SelectTrigger
                      className={errors.items?.[index]?.seed_product ? 'border-destructive' : ''}
                    >
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent>
                      {seedProducts?.results.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.crop} - {product.variety}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.items?.[index]?.seed_product && (
                    <p className="text-sm text-destructive">
                      {errors.items[index]?.seed_product?.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Seed Class *</label>
                  <Select
                    value={watch(`items.${index}.seed_class`)}
                    onValueChange={(value) => setValue(`items.${index}.seed_class`, value)}
                  >
                    <SelectTrigger
                      className={errors.items?.[index]?.seed_class ? 'border-destructive' : ''}
                    >
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      {seedClasses?.results.map((seedClass) => (
                        <SelectItem key={seedClass.id} value={seedClass.id}>
                          {seedClass.name_display}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.items?.[index]?.seed_class && (
                    <p className="text-sm text-destructive">
                      {errors.items[index]?.seed_class?.message}
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
                  {errors.items?.[index]?.quantity && (
                    <p className="text-sm text-destructive">
                      {errors.items[index]?.quantity?.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Source Reference</label>
                  <Input
                    {...register(`items.${index}.source_reference`)}
                    placeholder="e.g., PO number"
                  />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Spinner size="sm" className="mr-2" />}
          {mode === 'create' ? 'Create SRV' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
}
