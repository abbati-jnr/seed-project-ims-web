'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getWarehouses, createWarehouse, updateWarehouse } from '@/lib/api/warehouses';
import { PageHeader } from '@/components/layout/page-header';
import { DataTable, type Column } from '@/components/data-display/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/lib/hooks/use-toast';
import { formatDate } from '@/lib/utils/format';
import { Plus, Pencil, Search } from 'lucide-react';
import type { Warehouse } from '@/types/models';

interface WarehouseFormData {
  code: string;
  name: string;
  address: string;
}

export default function WarehousesPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);
  const [formData, setFormData] = useState<WarehouseFormData>({
    code: '',
    name: '',
    address: '',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['warehouses', search],
    queryFn: () => getWarehouses({ search: search || undefined }),
  });

  const createMutation = useMutation({
    mutationFn: createWarehouse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
      toast({ type: 'success', title: 'Warehouse created successfully' });
      handleCloseDialog();
    },
    onError: () => {
      toast({ type: 'error', title: 'Failed to create warehouse' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<WarehouseFormData & { is_active: boolean }> }) =>
      updateWarehouse(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
      toast({ type: 'success', title: 'Warehouse updated successfully' });
      handleCloseDialog();
    },
    onError: () => {
      toast({ type: 'error', title: 'Failed to update warehouse' });
    },
  });

  const handleOpenCreate = () => {
    setEditingWarehouse(null);
    setFormData({ code: '', name: '', address: '' });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (warehouse: Warehouse) => {
    setEditingWarehouse(warehouse);
    setFormData({
      code: warehouse.code,
      name: warehouse.name,
      address: warehouse.address || '',
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingWarehouse(null);
    setFormData({ code: '', name: '', address: '' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingWarehouse) {
      updateMutation.mutate({ id: editingWarehouse.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleToggleActive = (warehouse: Warehouse) => {
    updateMutation.mutate({
      id: warehouse.id,
      data: { is_active: !warehouse.is_active },
    });
  };

  const columns: Column<Warehouse>[] = [
    {
      key: 'code',
      header: 'Code',
      render: (warehouse) => (
        <span className="font-mono font-medium">{warehouse.code}</span>
      ),
    },
    {
      key: 'name',
      header: 'Name',
      render: (warehouse) => warehouse.name,
    },
    {
      key: 'address',
      header: 'Address',
      render: (warehouse) => warehouse.address || '-',
    },
    {
      key: 'location_count',
      header: 'Locations',
      render: (warehouse) => warehouse.location_count,
    },
    {
      key: 'is_active',
      header: 'Status',
      render: (warehouse) => (
        <Badge variant={warehouse.is_active ? 'default' : 'secondary'}>
          {warehouse.is_active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'created_at',
      header: 'Created',
      render: (warehouse) => formatDate(warehouse.created_at),
    },
    {
      key: 'actions',
      header: '',
      render: (warehouse) => (
        <div className="flex items-center gap-2 justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenEdit(warehouse);
            }}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleToggleActive(warehouse);
            }}
          >
            {warehouse.is_active ? 'Deactivate' : 'Activate'}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Warehouses"
        description="Manage warehouse locations for seed storage"
        actions={
          <Button onClick={handleOpenCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Warehouse
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search warehouses..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={data?.results || []}
            keyField="id"
            isLoading={isLoading}
            emptyMessage="No warehouses found"
          />
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingWarehouse ? 'Edit Warehouse' : 'Add Warehouse'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Code</label>
                <Input
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="e.g., WH-001"
                  required
                  disabled={!!editingWarehouse}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Main Warehouse"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Address</label>
                <Input
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="e.g., 123 Industrial Rd"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending
                  ? 'Saving...'
                  : editingWarehouse
                  ? 'Update'
                  : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
