'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCleaningSummaryReport } from '@/lib/api/reports';
import { PageHeader } from '@/components/layout/page-header';
import { ReportFilters } from '@/components/features/reports/report-filters';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatQuantity } from '@/lib/utils/format';
import { Sparkles, Package, Trash2, TrendingUp, BarChart3 } from 'lucide-react';
import type { ReportFilters as ReportFiltersType } from '@/types/api';

export default function CleaningSummaryPage() {
  const [filters, setFilters] = useState<ReportFiltersType>({});

  const { data, isLoading } = useQuery({
    queryKey: ['cleaning-summary-report', filters],
    queryFn: () => getCleaningSummaryReport(filters),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cleaning Summary"
        description="Seed cleaning operations analysis"
      />

      <ReportFilters
        filters={filters}
        onFiltersChange={setFilters}
        showDateRange
      />

      {isLoading ? (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
          <Skeleton className="h-64" />
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="flex items-center gap-4 pt-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Sparkles className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Events</p>
                  <p className="text-2xl font-bold">{data?.summary.total_events || 0}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-4 pt-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10 text-blue-600">
                  <Package className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Input</p>
                  <p className="text-2xl font-bold">
                    {formatQuantity(data?.summary.total_input)} kg
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-4 pt-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10 text-green-600">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Output</p>
                  <p className="text-2xl font-bold">
                    {formatQuantity(data?.summary.total_output)} kg
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-4 pt-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-500/10 text-orange-600">
                  <Trash2 className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Waste</p>
                  <p className="text-2xl font-bold">
                    {formatQuantity(data?.summary.total_waste)} kg
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Efficiency Card */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">Cleaning Efficiency</h3>
                <span className="text-3xl font-bold text-primary">
                  {data?.summary.efficiency_percentage.toFixed(1)}%
                </span>
              </div>
              <div className="h-4 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${data?.summary.efficiency_percentage || 0}%` }}
                />
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Percentage of input converted to output (excluding waste)
              </p>
            </CardContent>
          </Card>

          {/* Monthly Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Monthly Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data?.by_month.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No data available for the selected period
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                          Month
                        </th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                          Events
                        </th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                          Input (kg)
                        </th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                          Waste (kg)
                        </th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                          Waste %
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {data?.by_month.map((row, index) => {
                        const input = parseFloat(row.input_total);
                        const waste = parseFloat(row.waste_total);
                        const wastePercent = input > 0 ? (waste / input) * 100 : 0;

                        return (
                          <tr key={index} className="border-b last:border-0">
                            <td className="px-4 py-3 text-sm font-medium">{row.month}</td>
                            <td className="px-4 py-3 text-sm text-right">{row.event_count}</td>
                            <td className="px-4 py-3 text-sm text-right">
                              {formatQuantity(row.input_total)}
                            </td>
                            <td className="px-4 py-3 text-sm text-right">
                              {formatQuantity(row.waste_total)}
                            </td>
                            <td className="px-4 py-3 text-sm text-right text-muted-foreground">
                              {wastePercent.toFixed(1)}%
                            </td>
                          </tr>
                        );
                      })}
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
