'use client';

import { useQuery } from '@tanstack/react-query';
import { getWarehouses } from '@/lib/api/warehouses';
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
import type { SIVFilters as SIVFiltersType } from '@/types/api';

interface SIVFiltersProps {
  filters: SIVFiltersType;
  onFiltersChange: (filters: SIVFiltersType) => void;
}

export function SIVFilters({ filters, onFiltersChange }: SIVFiltersProps) {
  const { data: warehouses } = useQuery({
    queryKey: ['warehouses'],
    queryFn: () => getWarehouses(),
  });

  const updateFilter = (key: keyof SIVFiltersType, value: string | undefined) => {
    onFiltersChange({ ...filters, [key]: value, page: 1 });
  };

  const clearFilters = () => {
    onFiltersChange({ page: 1, page_size: filters.page_size });
  };

  const hasActiveFilters =
    filters.search || filters.warehouse || filters.status || filters.purpose;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <SearchInput
          value={filters.search || ''}
          onChange={(value) => updateFilter('search', value || undefined)}
          placeholder="Search SIV..."
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
          value={filters.status || 'all'}
          onValueChange={(value) => updateFilter('status', value === 'all' ? undefined : value)}
        >
          <SelectTrigger className="w-full sm:w-36">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.purpose || 'all'}
          onValueChange={(value) => updateFilter('purpose', value === 'all' ? undefined : value)}
        >
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="All Purposes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Purposes</SelectItem>
            <SelectItem value="sales">Sales</SelectItem>
            <SelectItem value="distribution">Distribution</SelectItem>
            <SelectItem value="research">Research</SelectItem>
            <SelectItem value="transfer">Transfer</SelectItem>
            <SelectItem value="disposal">Disposal</SelectItem>
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
