'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getSIVRegister } from '@/lib/api/reports';
import { PageHeader } from '@/components/layout/page-header';
import { ReportFilters } from '@/components/features/reports/report-filters';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { DocumentStatusBadge, PurposeBadge } from '@/components/data-display/status-badge';
import { formatQuantity, formatDate } from '@/lib/utils/format';
import { FileOutput, Package, TrendingUp, PieChart } from 'lucide-react';
import type { ReportFilters as ReportFiltersType } from '@/types/api';
import type { DocumentStatus, IssuePurpose } from '@/types/models';

export default function SIVRegisterPage() {
  const [filters, setFilters] = useState<ReportFiltersType>({});

  const { data, isLoading } = useQuery({
    queryKey: ['siv-register', filters],
    queryFn: () => getSIVRegister(filters),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="SIV Register"
        description="Store Issuing Voucher register and summary"
      />

      <ReportFilters
        filters={filters}
        onFiltersChange={setFilters}
        showWarehouse
        showStatus
        showPurpose
        showDateRange
      />

      {isLoading ? (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
          <Skeleton className="h-96" />
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardContent className="flex items-center gap-4 pt-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <FileOutput className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total SIVs</p>
                  <p className="text-2xl font-bold">{data?.summary.total_sivs || 0}</p>
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
            <Card className="sm:col-span-2 lg:col-span-1">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-3">
                  <PieChart className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">By Purpose</p>
                </div>
                <div className="space-y-2">
                  {data?.summary.by_purpose.map((item) => (
                    <div key={item.purpose} className="flex justify-between text-sm">
                      <span className="capitalize">{item.purpose}</span>
                      <span className="font-medium">{item.count}</span>
                    </div>
                  ))}
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
                          SIV Number
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                          Warehouse
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                          Recipient
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                          Purpose
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
                      </tr>
                    </thead>
                    <tbody>
                      {data?.register.map((row, index) => (
                        <tr key={index} className="border-b last:border-0">
                          <td className="px-4 py-3 text-sm font-medium text-primary">
                            {row.siv_number}
                          </td>
                          <td className="px-4 py-3 text-sm">{row.warehouse}</td>
                          <td className="px-4 py-3 text-sm">
                            <div>{row.recipient_name}</div>
                            <div className="text-xs text-muted-foreground capitalize">
                              {row.recipient_type}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <PurposeBadge purpose={row.purpose as IssuePurpose} />
                          </td>
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
