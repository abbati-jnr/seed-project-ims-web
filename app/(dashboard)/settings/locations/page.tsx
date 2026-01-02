'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getLocations, createLocation, updateLocation } from '@/lib/api/locations';
import { getWarehouses } from '@/lib/api/warehouses';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/lib/hooks/use-toast';
import { formatDate } from '@/lib/utils/format';
import { Plus, Pencil, Search } from 'lucide-react';
import type { Location } from '@/types/models';

interface LocationFormData {
  warehouse: string;
  code: string;
  name: string;
}

export default function LocationsPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [warehouseFilter, setWarehouseFilter] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [formData, setFormData] = useState<LocationFormData>({
    warehouse: '',
    code: '',
    name: '',
  });

  const { data: warehouses } = useQuery({
    queryKey: ['warehouses'],
    queryFn: () => getWarehouses(),
  });

  const { data, isLoading } = useQuery({
    queryKey: ['locations', search, warehouseFilter],
    queryFn: () =>
      getLocations({
        search: search || undefined,
        warehouse: warehouseFilter === 'all' ? undefined : warehouseFilter || undefined,
      }),
  });

  const createMutation = useMutation({
    mutationFn: createLocation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      toast({ type: 'success', title: 'Location created successfully' });
      handleCloseDialog();
    },
    onError: () => {
      toast({ type: 'error', title: 'Failed to create location' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<LocationFormData & { is_active: boolean }> }) =>
      updateLocation(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      toast({ type: 'success', title: 'Location updated successfully' });
      handleCloseDialog();
    },
    onError: () => {
      toast({ type: 'error', title: 'Failed to update location' });
    },
  });

  const handleOpenCreate = () => {
    setEditingLocation(null);
    setFormData({ warehouse: '', code: '', name: '' });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (location: Location) => {
    setEditingLocation(location);
    setFormData({
      warehouse: location.warehouse,
      code: location.code,
      name: location.name,
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingLocation(null);
    setFormData({ warehouse: '', code: '', name: '' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingLocation) {
      updateMutation.mutate({
        id: editingLocation.id,
        data: { code: formData.code, name: formData.name },
      });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleToggleActive = (location: Location) => {
    updateMutation.mutate({
      id: location.id,
      data: { is_active: !location.is_active },
    });
  };

  const columns: Column<Location>[] = [
    {
      key: 'code',
      header: 'Code',
      render: (location) => (
        <span className="font-mono font-medium">{location.code}</span>
      ),
    },
    {
      key: 'name',
      header: 'Name',
      render: (location) => location.name,
    },
    {
      key: 'warehouse',
      header: 'Warehouse',
      render: (location) => location.warehouse_code,
    },
    {
      key: 'is_active',
      header: 'Status',
      render: (location) => (
        <Badge variant={location.is_active ? 'default' : 'secondary'}>
          {location.is_active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'created_at',
      header: 'Created',
      render: (location) => formatDate(location.created_at),
    },
    {
      key: 'actions',
      header: '',
      render: (location) => (
        <div className="flex items-center gap-2 justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenEdit(location);
            }}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleToggleActive(location);
            }}
          >
            {location.is_active ? 'Deactivate' : 'Activate'}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Locations"
        description="Manage storage locations within warehouses"
        actions={
          <Button onClick={handleOpenCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Location
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search locations..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={warehouseFilter || 'all'} onValueChange={setWarehouseFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Warehouses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Warehouses</SelectItem>
                {warehouses?.results.map((wh) => (
                  <SelectItem key={wh.id} value={wh.id}>
                    {wh.code} - {wh.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={data?.results || []}
            keyField="id"
            isLoading={isLoading}
            emptyMessage="No locations found"
          />
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingLocation ? 'Edit Location' : 'Add Location'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Warehouse</label>
                <Select
                  value={formData.warehouse}
                  onValueChange={(value) =>
                    setFormData({ ...formData, warehouse: value })
                  }
                  disabled={!!editingLocation}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select warehouse" />
                  </SelectTrigger>
                  <SelectContent>
                    {warehouses?.results.map((wh) => (
                      <SelectItem key={wh.id} value={wh.id}>
                        {wh.code} - {wh.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Code</label>
                <Input
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value })
                  }
                  placeholder="e.g., A-01"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., Aisle A, Row 1"
                  required
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
                  : editingLocation
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
