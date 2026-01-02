'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getCleaningEvents, type CleaningFilters as CleaningFiltersType } from '@/lib/api/cleaning';
import { PageHeader } from '@/components/layout/page-header';
import { DataTable, type Column } from '@/components/data-display/data-table';
import { CleaningFilters } from '@/components/features/cleaning/cleaning-filters';
import { CleaningStatusBadge } from '@/components/data-display/status-badge';
import { Button } from '@/components/ui/button';
import { formatQuantity, formatDate } from '@/lib/utils/format';
import { Plus } from 'lucide-react';
import type { CleaningEventListItem } from '@/types/models';

export default function CleaningPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<CleaningFiltersType>({
    page: 1,
    page_size: 20,
    ordering: '-created_at',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['cleaning-events', filters],
    queryFn: () => getCleaningEvents(filters),
  });

  const columns: Column<CleaningEventListItem>[] = [
    {
      key: 'input_lot_number',
      header: 'Input Lot',
      render: (event) => (
        <span className="font-medium text-primary">{event.input_lot_number}</span>
      ),
    },
    {
      key: 'input_quantity',
      header: 'Input Qty',
      className: 'text-right',
      render: (event) => (
        <span className="font-medium">{formatQuantity(event.input_quantity)} kg</span>
      ),
    },
    {
      key: 'output_count',
      header: 'Outputs',
      render: (event) => (
        <div>
          <div className="font-medium">{event.output_count} lot(s)</div>
          <div className="text-sm text-muted-foreground">
            {formatQuantity(event.total_output)} kg
          </div>
        </div>
      ),
    },
    {
      key: 'waste_quantity',
      header: 'Waste',
      className: 'text-right',
      render: (event) => (
        <span className="text-muted-foreground">{formatQuantity(event.waste_quantity)} kg</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (event) => <CleaningStatusBadge status={event.status} />,
    },
    {
      key: 'cleaning_officer_name',
      header: 'Officer',
      render: (event) => event.cleaning_officer_name,
    },
    {
      key: 'created_at',
      header: 'Created',
      sortable: true,
      render: (event) => formatDate(event.created_at),
    },
  ];

  const handleSort = (field: string) => {
    const currentOrder = filters.ordering;
    let newOrder: string;

    if (currentOrder === field) {
      newOrder = `-${field}`;
    } else if (currentOrder === `-${field}`) {
      newOrder = field;
    } else {
      newOrder = `-${field}`;
    }

    setFilters({ ...filters, ordering: newOrder });
  };

  const sortField = filters.ordering?.replace('-', '');
  const sortDirection = filters.ordering?.startsWith('-') ? 'desc' : 'asc';

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cleaning Events"
        description="Manage seed cleaning operations"
        actions={
          <Link href="/cleaning/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Cleaning
            </Button>
          </Link>
        }
      />

      <CleaningFilters filters={filters} onFiltersChange={setFilters} />

      <DataTable
        columns={columns}
        data={data?.results || []}
        keyField="id"
        isLoading={isLoading}
        page={filters.page}
        pageSize={filters.page_size}
        totalCount={data?.count || 0}
        onPageChange={(page) => setFilters({ ...filters, page })}
        onPageSizeChange={(pageSize) => setFilters({ ...filters, page_size: pageSize, page: 1 })}
        sortField={sortField}
        sortDirection={sortDirection as 'asc' | 'desc'}
        onSort={handleSort}
        onRowClick={(event) => router.push(`/cleaning/${event.id}`)}
        emptyMessage="No cleaning events found"
      />
    </div>
  );
}
