'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getSRVRegister } from '@/lib/api/reports';
import { PageHeader } from '@/components/layout/page-header';
import { ReportFilters } from '@/components/features/reports/report-filters';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { DocumentStatusBadge } from '@/components/data-display/status-badge';
import { formatQuantity, formatDate, formatDateTime } from '@/lib/utils/format';
import { FileInput, Package, TrendingUp } from 'lucide-react';
import type { ReportFilters as ReportFiltersType } from '@/types/api';
import type { DocumentStatus } from '@/types/models';

export default function SRVRegisterPage() {
  const [filters, setFilters] = useState<ReportFiltersType>({});

  const { data, isLoading } = useQuery({
    queryKey: ['srv-register', filters],
    queryFn: () => getSRVRegister(filters),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="SRV Register"
        description="Store Receiving Voucher register and summary"
      />

      <ReportFilters
        filters={filters}
        onFiltersChange={setFilters}
        showWarehouse
        showStatus
        showDateRange
      />

      {isLoading ? (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
          <Skeleton className="h-96" />
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardContent className="flex items-center gap-4 pt-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <FileInput className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total SRVs</p>
                  <p className="text-2xl font-bold">{data?.summary.total_srvs || 0}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-4 pt-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Package className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Quantity</p>
                  <p className="text-2xl font-bold">
                    {formatQuantity(data?.summary.total_quantity)} kg
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Register Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Register
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data?.register.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No records found for the selected filters
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                          SRV Number
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                          Warehouse
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                          Officer
                        </th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                          Items
                        </th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                          Quantity
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                          Created
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                          Approved
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {data?.register.map((row, index) => (
                        <tr key={index} className="border-b last:border-0">
                          <td className="px-4 py-3 text-sm font-medium text-primary">
                            {row.srv_number}
                          </td>
                          <td className="px-4 py-3 text-sm">{row.warehouse}</td>
                          <td className="px-4 py-3 text-sm">{row.receiving_officer}</td>
                          <td className="px-4 py-3 text-sm text-right">{row.item_count}</td>
                          <td className="px-4 py-3 text-sm text-right font-medium">
                            {formatQuantity(row.total_quantity)} kg
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <DocumentStatusBadge status={row.status as DocumentStatus} />
                          </td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">
                            {formatDate(row.created_at)}
                          </td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">
                            {row.approved_at ? (
                              <div>
                                <div>{row.approved_by}</div>
                                <div className="text-xs">{formatDate(row.approved_at)}</div>
                              </div>
                            ) : (
                              '-'
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
