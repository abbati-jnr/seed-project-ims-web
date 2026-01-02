'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getSIVs } from '@/lib/api/siv';
import { PageHeader } from '@/components/layout/page-header';
import { DataTable, type Column } from '@/components/data-display/data-table';
import { SIVFilters } from '@/components/features/siv/siv-filters';
import { DocumentStatusBadge, PurposeBadge } from '@/components/data-display/status-badge';
import { Button } from '@/components/ui/button';
import { formatQuantity, formatDate } from '@/lib/utils/format';
import { Plus } from 'lucide-react';
import type { SIVFilters as SIVFiltersType } from '@/types/api';
import type { SIVListItem } from '@/types/models';

export default function IssuingPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<SIVFiltersType>({
    page: 1,
    page_size: 20,
    ordering: '-created_at',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['sivs', filters],
    queryFn: () => getSIVs(filters),
  });

  const columns: Column<SIVListItem>[] = [
    {
      key: 'siv_number',
      header: 'SIV Number',
      sortable: true,
      render: (siv) => (
        <span className="font-medium text-primary">{siv.siv_number}</span>
      ),
    },
    {
      key: 'warehouse',
      header: 'Warehouse',
      render: (siv) => <span>{siv.warehouse_code}</span>,
    },
    {
      key: 'purpose',
      header: 'Purpose',
      render: (siv) => <PurposeBadge purpose={siv.purpose} />,
    },
    {
      key: 'recipient_name',
      header: 'Recipient',
      render: (siv) => siv.recipient_name,
    },
    {
      key: 'items',
      header: 'Items',
      render: (siv) => (
        <div>
          <div className="font-medium">{siv.item_count} item(s)</div>
          <div className="text-sm text-muted-foreground">
            {formatQuantity(siv.total_quantity)} kg total
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (siv) => <DocumentStatusBadge status={siv.status} />,
    },
    {
      key: 'issuing_officer',
      header: 'Issuing Officer',
      render: (siv) => siv.issuing_officer_name,
    },
    {
      key: 'created_at',
      header: 'Created',
      sortable: true,
      render: (siv) => formatDate(siv.created_at),
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
        title="Store Issuing Vouchers"
        description="Manage seed issuing operations"
        actions={
          <Link href="/issuing/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New SIV
            </Button>
          </Link>
        }
      />

      <SIVFilters filters={filters} onFiltersChange={setFilters} />

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
        onRowClick={(siv) => router.push(`/issuing/${siv.id}`)}
        emptyMessage="No SIVs found"
      />
    </div>
  );
}
