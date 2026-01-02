'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getSRVs } from '@/lib/api/srv';
import { PageHeader } from '@/components/layout/page-header';
import { DataTable, type Column } from '@/components/data-display/data-table';
import { SRVFilters } from '@/components/features/srv/srv-filters';
import { DocumentStatusBadge, SourceTypeBadge } from '@/components/data-display/status-badge';
import { Button } from '@/components/ui/button';
import { formatQuantity, formatDate } from '@/lib/utils/format';
import { Plus } from 'lucide-react';
import type { SRVFilters as SRVFiltersType } from '@/types/api';
import type { SRVListItem } from '@/types/models';

export default function ReceivingPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<SRVFiltersType>({
    page: 1,
    page_size: 20,
    ordering: '-created_at',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['srvs', filters],
    queryFn: () => getSRVs(filters),
  });

  const columns: Column<SRVListItem>[] = [
    {
      key: 'srv_number',
      header: 'SRV Number',
      sortable: true,
      render: (srv) => (
        <span className="font-medium text-primary">{srv.srv_number}</span>
      ),
    },
    {
      key: 'warehouse',
      header: 'Warehouse',
      render: (srv) => <span>{srv.warehouse_code}</span>,
    },
    {
      key: 'source_type',
      header: 'Source',
      render: (srv) => <SourceTypeBadge type={srv.source_type} />,
    },
    {
      key: 'items',
      header: 'Items',
      render: (srv) => (
        <div>
          <div className="font-medium">{srv.item_count} item(s)</div>
          <div className="text-sm text-muted-foreground">
            {formatQuantity(srv.total_quantity)} kg total
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (srv) => <DocumentStatusBadge status={srv.status} />,
    },
    {
      key: 'receiving_officer',
      header: 'Receiving Officer',
      render: (srv) => srv.receiving_officer_name,
    },
    {
      key: 'created_at',
      header: 'Created',
      sortable: true,
      render: (srv) => formatDate(srv.created_at),
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
        title="Store Receiving Vouchers"
        description="Manage seed receiving operations"
        actions={
          <Link href="/receiving/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New SRV
            </Button>
          </Link>
        }
      />

      <SRVFilters filters={filters} onFiltersChange={setFilters} />

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
        onRowClick={(srv) => router.push(`/receiving/${srv.id}`)}
        emptyMessage="No SRVs found"
      />
    </div>
  );
}
