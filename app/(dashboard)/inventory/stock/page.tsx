'use client';

import { useQuery } from '@tanstack/react-query';
import { getStockSummary } from '@/lib/api/reports';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatQuantity } from '@/lib/utils/format';
import { Package, Warehouse, Layers, Leaf } from 'lucide-react';

export default function StockSummaryPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['stock-summary'],
    queryFn: () => getStockSummary(),
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Stock Summary" description="Overview of seed inventory by warehouse, class, and product" />
        <div className="grid gap-6 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Stock Summary"
        description="Overview of seed inventory by warehouse, class, and product"
      />

      {/* Total Summary */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Package className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Lots</p>
              <p className="text-2xl font-bold">{data?.totals.lot_count || 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Layers className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Quantity</p>
              <p className="text-2xl font-bold">{formatQuantity(data?.totals.total_quantity)} kg</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* By Warehouse */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Warehouse className="h-5 w-5" />
              By Warehouse
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data?.by_warehouse.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No data available</p>
            ) : (
              <div className="space-y-4">
                {data?.by_warehouse.map((warehouse) => {
                  const total = parseFloat(data.totals.total_quantity || '0');
                  const qty = parseFloat(warehouse.total_quantity);
                  const percentage = total > 0 ? (qty / total) * 100 : 0;

                  return (
                    <div key={warehouse.warehouse_code} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>
                          <span className="font-medium">{warehouse.warehouse_code}</span>
                          <span className="text-muted-foreground"> - {warehouse.warehouse_name}</span>
                        </span>
                        <span className="font-medium">{formatQuantity(warehouse.total_quantity)} kg</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{warehouse.lot_count} lots</span>
                        <span>{percentage.toFixed(1)}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* By Seed Class */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Leaf className="h-5 w-5" />
              By Seed Class
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data?.by_seed_class.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No data available</p>
            ) : (
              <div className="space-y-4">
                {data?.by_seed_class.map((seedClass) => {
                  const total = parseFloat(data.totals.total_quantity || '0');
                  const qty = parseFloat(seedClass.total_quantity);
                  const percentage = total > 0 ? (qty / total) * 100 : 0;

                  const classColors: Record<string, string> = {
                    breeder: 'bg-purple-500',
                    foundation: 'bg-blue-500',
                    certified: 'bg-green-500',
                  };

                  return (
                    <div key={seedClass.seed_class} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium capitalize">{seedClass.seed_class}</span>
                        <span className="font-medium">{formatQuantity(seedClass.total_quantity)} kg</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className={`h-full rounded-full transition-all ${classColors[seedClass.seed_class] || 'bg-primary'}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{seedClass.lot_count} lots</span>
                        <span>{percentage.toFixed(1)}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* By Seed Product */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              By Seed Product
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data?.by_seed_product.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No data available</p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {data?.by_seed_product.map((product, index) => (
                  <div
                    key={index}
                    className="rounded-lg border p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{product.crop}</p>
                        <p className="text-sm text-muted-foreground">{product.variety}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatQuantity(product.total_quantity)} kg</p>
                        <p className="text-sm text-muted-foreground">{product.lot_count} lots</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
