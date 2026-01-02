'use client';

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
import type { CleaningFilters as CleaningFiltersType } from '@/lib/api/cleaning';

interface CleaningFiltersProps {
  filters: CleaningFiltersType;
  onFiltersChange: (filters: CleaningFiltersType) => void;
}

export function CleaningFilters({ filters, onFiltersChange }: CleaningFiltersProps) {
  const updateFilter = (key: keyof CleaningFiltersType, value: string | undefined) => {
    onFiltersChange({ ...filters, [key]: value, page: 1 });
  };

  const clearFilters = () => {
    onFiltersChange({ page: 1, page_size: filters.page_size });
  };

  const hasActiveFilters = filters.search || filters.status;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <SearchInput
          value={filters.search || ''}
          onChange={(value) => updateFilter('search', value || undefined)}
          placeholder="Search cleaning events..."
          className="w-full sm:w-64"
        />

        <Select
          value={filters.status || 'all'}
          onValueChange={(value) => updateFilter('status', value === 'all' ? undefined : value)}
        >
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
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
