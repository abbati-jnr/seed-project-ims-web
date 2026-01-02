'use client';

import { Warehouse } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Skeleton } from '@/components/ui';
import type { DashboardResponse } from '@/types/api';

interface StockByWarehouseProps {
  data?: DashboardResponse;
  isLoading?: boolean;
}

export function StockByWarehouse({ data, isLoading }: StockByWarehouseProps) {
  const warehouses = data?.stock_by_warehouse ?? [];

  const formatQuantity = (qty: string) => {
    const num = parseFloat(qty);
    return num.toLocaleString(undefined, { maximumFractionDigits: 2 });
  };

  // Calculate total for percentage bar
  const total = warehouses.reduce((sum, w) => sum + parseFloat(w.total_quantity), 0);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Warehouse className="h-5 w-5" />
            Stock by Warehouse
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Warehouse className="h-5 w-5" />
          Stock by Warehouse
        </CardTitle>
      </CardHeader>
      <CardContent>
        {warehouses.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No warehouse data available.
          </p>
        ) : (
          <div className="space-y-4">
            {warehouses.map((warehouse) => {
              const percentage = total > 0
                ? (parseFloat(warehouse.total_quantity) / total) * 100
                : 0;

              return (
                <div key={warehouse.warehouse_code} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">
                        Warehouse {warehouse.warehouse_code}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {warehouse.warehouse_name}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-foreground">
                        {formatQuantity(warehouse.total_quantity)} kg
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {percentage.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
