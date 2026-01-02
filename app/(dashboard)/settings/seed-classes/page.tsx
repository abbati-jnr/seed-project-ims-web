'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSeedClasses, createSeedClass, updateSeedClass } from '@/lib/api/seed-classes';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/lib/hooks/use-toast';
import { formatDate } from '@/lib/utils/format';
import { Plus, Pencil } from 'lucide-react';
import type { SeedClass, SeedClassType } from '@/types/models';

interface SeedClassFormData {
  name: SeedClassType;
  description: string;
}

const SEED_CLASS_OPTIONS: { value: SeedClassType; label: string }[] = [
  { value: 'breeder', label: 'Breeder' },
  { value: 'foundation', label: 'Foundation' },
  { value: 'certified', label: 'Certified' },
];

export default function SeedClassesPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<SeedClass | null>(null);
  const [formData, setFormData] = useState<SeedClassFormData>({
    name: 'breeder',
    description: '',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['seed-classes'],
    queryFn: () => getSeedClasses(),
  });

  const createMutation = useMutation({
    mutationFn: createSeedClass,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seed-classes'] });
      toast({ type: 'success', title: 'Seed class created successfully' });
      handleCloseDialog();
    },
    onError: () => {
      toast({ type: 'error', title: 'Failed to create seed class' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<SeedClassFormData & { is_active: boolean }> }) =>
      updateSeedClass(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seed-classes'] });
      toast({ type: 'success', title: 'Seed class updated successfully' });
      handleCloseDialog();
    },
    onError: () => {
      toast({ type: 'error', title: 'Failed to update seed class' });
    },
  });

  const handleOpenCreate = () => {
    setEditingClass(null);
    setFormData({ name: 'breeder', description: '' });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (seedClass: SeedClass) => {
    setEditingClass(seedClass);
    setFormData({
      name: seedClass.name,
      description: seedClass.description || '',
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingClass(null);
    setFormData({ name: 'breeder', description: '' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingClass) {
      updateMutation.mutate({
        id: editingClass.id,
        data: { description: formData.description },
      });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleToggleActive = (seedClass: SeedClass) => {
    updateMutation.mutate({
      id: seedClass.id,
      data: { is_active: !seedClass.is_active },
    });
  };

  const columns: Column<SeedClass>[] = [
    {
      key: 'name_display',
      header: 'Name',
      render: (seedClass) => (
        <span className="font-medium">{seedClass.name_display}</span>
      ),
    },
    {
      key: 'description',
      header: 'Description',
      render: (seedClass) => seedClass.description || '-',
    },
    {
      key: 'is_active',
      header: 'Status',
      render: (seedClass) => (
        <Badge variant={seedClass.is_active ? 'default' : 'secondary'}>
          {seedClass.is_active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'created_at',
      header: 'Created',
      render: (seedClass) => formatDate(seedClass.created_at),
    },
    {
      key: 'actions',
      header: '',
      render: (seedClass) => (
        <div className="flex items-center gap-2 justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenEdit(seedClass);
            }}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleToggleActive(seedClass);
            }}
          >
            {seedClass.is_active ? 'Deactivate' : 'Activate'}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Seed Classes"
        description="Manage seed classification categories"
        actions={
          <Button onClick={handleOpenCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Seed Class
          </Button>
        }
      />

      <Card>
        <CardContent className="pt-6">
          <DataTable
            columns={columns}
            data={data?.results || []}
            keyField="id"
            isLoading={isLoading}
            emptyMessage="No seed classes found"
          />
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingClass ? 'Edit Seed Class' : 'Add Seed Class'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Class Type</label>
                <Select
                  value={formData.name}
                  onValueChange={(value: SeedClassType) =>
                    setFormData({ ...formData, name: value })
                  }
                  disabled={!!editingClass}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {SEED_CLASS_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                  : editingClass
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
