'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSeedProducts, createSeedProduct, updateSeedProduct } from '@/lib/api/seed-products';
import { PageHeader } from '@/components/layout/page-header';
import { DataTable, type Column } from '@/components/data-display/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
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
import type { SeedProduct } from '@/types/models';

interface SeedProductFormData {
  code: string;
  crop: string;
  variety: string;
  description: string;
}

export default function SeedProductsPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<SeedProduct | null>(null);
  const [formData, setFormData] = useState<SeedProductFormData>({
    code: '',
    crop: '',
    variety: '',
    description: '',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['seed-products', search],
    queryFn: () => getSeedProducts({ search: search || undefined }),
  });

  const createMutation = useMutation({
    mutationFn: createSeedProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seed-products'] });
      toast({ type: 'success', title: 'Seed product created successfully' });
      handleCloseDialog();
    },
    onError: () => {
      toast({ type: 'error', title: 'Failed to create seed product' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<SeedProductFormData & { is_active: boolean }> }) =>
      updateSeedProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seed-products'] });
      toast({ type: 'success', title: 'Seed product updated successfully' });
      handleCloseDialog();
    },
    onError: () => {
      toast({ type: 'error', title: 'Failed to update seed product' });
    },
  });

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setFormData({ code: '', crop: '', variety: '', description: '' });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (product: SeedProduct) => {
    setEditingProduct(product);
    setFormData({
      code: product.code,
      crop: product.crop,
      variety: product.variety,
      description: product.description || '',
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingProduct(null);
    setFormData({ code: '', crop: '', variety: '', description: '' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleToggleActive = (product: SeedProduct) => {
    updateMutation.mutate({
      id: product.id,
      data: { is_active: !product.is_active },
    });
  };

  const columns: Column<SeedProduct>[] = [
    {
      key: 'code',
      header: 'Code',
      render: (product) => (
        <span className="font-mono font-medium">{product.code}</span>
      ),
    },
    {
      key: 'crop',
      header: 'Crop',
      render: (product) => product.crop,
    },
    {
      key: 'variety',
      header: 'Variety',
      render: (product) => product.variety,
    },
    {
      key: 'display_name',
      header: 'Display Name',
      render: (product) => product.display_name,
    },
    {
      key: 'is_active',
      header: 'Status',
      render: (product) => (
        <Badge variant={product.is_active ? 'default' : 'secondary'}>
          {product.is_active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'created_at',
      header: 'Created',
      render: (product) => formatDate(product.created_at),
    },
    {
      key: 'actions',
      header: '',
      render: (product) => (
        <div className="flex items-center gap-2 justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenEdit(product);
            }}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleToggleActive(product);
            }}
          >
            {product.is_active ? 'Deactivate' : 'Activate'}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Seed Products"
        description="Manage seed product varieties"
        actions={
          <Button onClick={handleOpenCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Seed Product
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search products..."
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
            emptyMessage="No seed products found"
          />
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? 'Edit Seed Product' : 'Add Seed Product'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Code</label>
                <Input
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value })
                  }
                  placeholder="e.g., WHEAT-001"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Crop</label>
                  <Input
                    value={formData.crop}
                    onChange={(e) =>
                      setFormData({ ...formData, crop: e.target.value })
                    }
                    placeholder="e.g., Wheat"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Variety</label>
                  <Input
                    value={formData.variety}
                    onChange={(e) =>
                      setFormData({ ...formData, variety: e.target.value })
                    }
                    placeholder="e.g., Hard Red Winter"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Input
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Optional description"
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
                  : editingProduct
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
