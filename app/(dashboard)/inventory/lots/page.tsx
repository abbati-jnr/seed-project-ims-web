'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getLots } from '@/lib/api/lots';
import { PageHeader } from '@/components/layout/page-header';
import { DataTable, type Column } from '@/components/data-display/data-table';
import { LotFilters } from '@/components/features/lots/lot-filters';
import { LotStatusBadge, SourceTypeBadge } from '@/components/data-display/status-badge';
import { formatQuantity, formatDate } from '@/lib/utils/format';
import type { LotFilters as LotFiltersType } from '@/types/api';
import type { Lot } from '@/types/models';

export default function LotsPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<LotFiltersType>({
    page: 1,
    page_size: 20,
    ordering: '-created_at',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['lots', filters],
    queryFn: () => getLots(filters),
  });

  const columns: Column<Lot>[] = [
    {
      key: 'lot_number',
      header: 'Lot Number',
      sortable: true,
      render: (lot) => (
        <span className="font-medium text-primary">{lot.lot_number}</span>
      ),
    },
    {
      key: 'seed_product',
      header: 'Seed Product',
      render: (lot) => (
        <div>
          <div className="font-medium">{lot.seed_product?.crop || '-'}</div>
          <div className="text-sm text-muted-foreground">{lot.seed_product?.variety || '-'}</div>
        </div>
      ),
    },
    {
      key: 'seed_class',
      header: 'Class',
      render: (lot) => lot.seed_class?.name_display || '-',
    },
    {
      key: 'warehouse',
      header: 'Warehouse',
      render: (lot) => (
        <span>
          {lot.warehouse?.code || '-'} - {lot.warehouse?.name || '-'}
        </span>
      ),
    },
    {
      key: 'source_type',
      header: 'Source',
      render: (lot) => <SourceTypeBadge type={lot.source_type} />,
    },
    {
      key: 'current_quantity',
      header: 'Quantity',
      sortable: true,
      className: 'text-right',
      render: (lot) => (
        <div className="text-right">
          <div className="font-medium">{formatQuantity(lot.current_quantity)} kg</div>
          <div className="text-sm text-muted-foreground">
            of {formatQuantity(lot.initial_quantity)} kg
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (lot) => <LotStatusBadge status={lot.status} />,
    },
    {
      key: 'created_at',
      header: 'Created',
      sortable: true,
      render: (lot) => formatDate(lot.created_at),
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
        title="Lots"
        description="View and manage seed inventory lots"
      />

      <LotFilters filters={filters} onFiltersChange={setFilters} />

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
        onRowClick={(lot) => router.push(`/inventory/lots/${lot.id}`)}
        emptyMessage="No lots found"
      />
    </div>
  );
}
