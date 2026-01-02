'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getSeedDistribution } from '@/lib/api/reports';
import { PageHeader } from '@/components/layout/page-header';
import { ReportFilters } from '@/components/features/reports/report-filters';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatQuantity } from '@/lib/utils/format';
import { Users, Package, Target, TrendingUp } from 'lucide-react';
import type { ReportFilters as ReportFiltersType } from '@/types/api';

export default function SeedDistributionPage() {
  const [filters, setFilters] = useState<ReportFiltersType>({});

  const { data, isLoading } = useQuery({
    queryKey: ['seed-distribution', filters],
    queryFn: () => getSeedDistribution(filters),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Seed Distribution"
        description="Analysis of seed distribution by recipients and purposes"
      />

      <ReportFilters
        filters={filters}
        onFiltersChange={setFilters}
        showPurpose
        showDateRange
      />

      {isLoading ? (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardContent className="flex items-center gap-4 pt-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Distributions</p>
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
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* By Recipient Type */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  By Recipient Type
                </CardTitle>
              </CardHeader>
              <CardContent>
                {data?.by_recipient_type.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No data available
                  </p>
                ) : (
                  <div className="space-y-4">
                    {data?.by_recipient_type.map((item) => {
                      const total = parseFloat(data.summary.total_quantity || '0');
                      const qty = parseFloat(item.total_quantity);
                      const percentage = total > 0 ? (qty / total) * 100 : 0;

                      return (
                        <div key={item.recipient_type} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium capitalize">{item.recipient_type}</span>
                            <span className="font-medium">{formatQuantity(item.total_quantity)} kg</span>
                          </div>
                          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full rounded-full bg-primary transition-all"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>{item.siv_count} SIV(s)</span>
                            <span>{percentage.toFixed(1)}%</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* By Purpose */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  By Purpose
                </CardTitle>
              </CardHeader>
              <CardContent>
                {data?.by_purpose.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No data available
                  </p>
                ) : (
                  <div className="space-y-4">
                    {data?.by_purpose.map((item) => {
                      const total = parseFloat(data.summary.total_quantity || '0');
                      const qty = parseFloat(item.total_quantity);
                      const percentage = total > 0 ? (qty / total) * 100 : 0;

                      const purposeColors: Record<string, string> = {
                        sales: 'bg-blue-500',
                        distribution: 'bg-green-500',
                        research: 'bg-purple-500',
                        transfer: 'bg-orange-500',
                        disposal: 'bg-gray-500',
                      };

                      return (
                        <div key={item.purpose} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium capitalize">{item.purpose}</span>
                            <span className="font-medium">{formatQuantity(item.total_quantity)} kg</span>
                          </div>
                          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                            <div
                              className={`h-full rounded-full transition-all ${purposeColors[item.purpose] || 'bg-primary'}`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>{item.siv_count} SIV(s)</span>
                            <span>{percentage.toFixed(1)}%</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Top Recipients */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Top Recipients
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data?.top_recipients.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No data available
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                          Rank
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                          Recipient
                        </th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                          SIV Count
                        </th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                          Total Quantity
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {data?.top_recipients.map((row, index) => (
                        <tr key={index} className="border-b last:border-0">
                          <td className="px-4 py-3 text-sm">
                            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                              {index + 1}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm font-medium">{row.recipient_name}</td>
                          <td className="px-4 py-3 text-sm text-right">{row.siv_count}</td>
                          <td className="px-4 py-3 text-sm text-right font-medium">
                            {formatQuantity(row.total_quantity)} kg
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
