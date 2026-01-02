'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getWarehouses } from '@/lib/api/warehouses';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar, Download, X } from 'lucide-react';
import type { ReportFilters as ReportFiltersType } from '@/types/api';

interface ReportFiltersProps {
  filters: ReportFiltersType;
  onFiltersChange: (filters: ReportFiltersType) => void;
  showWarehouse?: boolean;
  showStatus?: boolean;
  showPurpose?: boolean;
  showDateRange?: boolean;
  onExport?: () => void;
}

export function ReportFilters({
  filters,
  onFiltersChange,
  showWarehouse = false,
  showStatus = false,
  showPurpose = false,
  showDateRange = true,
  onExport,
}: ReportFiltersProps) {
  const { data: warehouses } = useQuery({
    queryKey: ['warehouses'],
    queryFn: () => getWarehouses(),
    enabled: showWarehouse,
  });

  const updateFilter = (key: keyof ReportFiltersType, value: string | undefined) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = Object.values(filters).some((v) => v !== undefined);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        {showDateRange && (
          <>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <Input
                type="date"
                value={filters.start_date || ''}
                onChange={(e) => updateFilter('start_date', e.target.value || undefined)}
                className="w-40"
              />
              <span className="text-muted-foreground">to</span>
              <Input
                type="date"
                value={filters.end_date || ''}
                onChange={(e) => updateFilter('end_date', e.target.value || undefined)}
                className="w-40"
              />
            </div>
          </>
        )}

        {showWarehouse && (
          <Select
            value={filters.warehouse || 'all'}
            onValueChange={(value) => updateFilter('warehouse', value === 'all' ? undefined : value)}
          >
            <SelectTrigger className="w-44">
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
        )}

        {showStatus && (
          <Select
            value={filters.status || 'all'}
            onValueChange={(value) => updateFilter('status', value === 'all' ? undefined : value)}
          >
            <SelectTrigger className="w-36">
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
        )}

        {showPurpose && (
          <Select
            value={filters.purpose || 'all'}
            onValueChange={(value) => updateFilter('purpose', value === 'all' ? undefined : value)}
          >
            <SelectTrigger className="w-40">
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
        )}

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
            <X className="h-4 w-4" />
            Clear
          </Button>
        )}

        {onExport && (
          <Button variant="outline" size="sm" onClick={onExport} className="gap-2 ml-auto">
            <Download className="h-4 w-4" />
            Export
          </Button>
        )}
      </div>
    </div>
  );
}
