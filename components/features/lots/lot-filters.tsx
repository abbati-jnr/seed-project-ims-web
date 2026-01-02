'use client';

import { useQuery } from '@tanstack/react-query';
import { getWarehouses } from '@/lib/api/warehouses';
import { getSeedClasses } from '@/lib/api/seed-classes';
import { getSeedProducts } from '@/lib/api/seed-products';
import { SearchInput } from '@/components/data-display/search-input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import type { LotFilters as LotFiltersType } from '@/types/api';

interface LotFiltersProps {
  filters: LotFiltersType;
  onFiltersChange: (filters: LotFiltersType) => void;
}

export function LotFilters({ filters, onFiltersChange }: LotFiltersProps) {
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

  const updateFilter = (key: keyof LotFiltersType, value: string | undefined) => {
    onFiltersChange({ ...filters, [key]: value, page: 1 });
  };

  const clearFilters = () => {
    onFiltersChange({ page: 1, page_size: filters.page_size });
  };

  const hasActiveFilters =
    filters.search || filters.warehouse || filters.seed_class || filters.status || filters.source_type;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <SearchInput
          value={filters.search || ''}
          onChange={(value) => updateFilter('search', value || undefined)}
          placeholder="Search lots..."
          className="w-full sm:w-64"
        />

        <Select
          value={filters.warehouse || 'all'}
          onValueChange={(value) => updateFilter('warehouse', value === 'all' ? undefined : value)}
        >
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="All Warehouses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Warehouses</SelectItem>
            {warehouses?.results.map((warehouse) => (
              <SelectItem key={warehouse.id} value={warehouse.id}>
                {warehouse.code} - {warehouse.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.seed_class || 'all'}
          onValueChange={(value) => updateFilter('seed_class', value === 'all' ? undefined : value)}
        >
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="All Seed Classes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Seed Classes</SelectItem>
            {seedClasses?.results.map((seedClass) => (
              <SelectItem key={seedClass.id} value={seedClass.id}>
                {seedClass.name_display}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.status || 'all'}
          onValueChange={(value) => updateFilter('status', value === 'all' ? undefined : value)}
        >
          <SelectTrigger className="w-full sm:w-36">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="stored">Stored</SelectItem>
            <SelectItem value="cleaned">Cleaned</SelectItem>
            <SelectItem value="issued">Issued</SelectItem>
            <SelectItem value="exhausted">Exhausted</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.source_type || 'all'}
          onValueChange={(value) => updateFilter('source_type', value === 'all' ? undefined : value)}
        >
          <SelectTrigger className="w-full sm:w-36">
            <SelectValue placeholder="All Sources" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sources</SelectItem>
            <SelectItem value="internal">Internal</SelectItem>
            <SelectItem value="in_grower">In-Grower</SelectItem>
            <SelectItem value="out_grower">Out-Grower</SelectItem>
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
            <X className="h-4 w-4" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}
