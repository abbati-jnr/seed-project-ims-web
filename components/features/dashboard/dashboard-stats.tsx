'use client';

import { Package, FileInput, FileOutput, Sparkles } from 'lucide-react';
import { Card, CardContent, Skeleton } from '@/components/ui';
import type { DashboardResponse } from '@/types/api';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ReactNode;
  loading?: boolean;
}

function StatCard({ title, value, description, icon, loading }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <p className="text-2xl font-bold text-foreground">{value}</p>
            )}
            {description && !loading && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface DashboardStatsProps {
  data?: DashboardResponse;
  isLoading?: boolean;
}

export function DashboardStats({ data, isLoading }: DashboardStatsProps) {
  const formatQuantity = (qty: string | undefined) => {
    if (!qty) return '0';
    const num = parseFloat(qty);
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toLocaleString();
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Lots"
        value={data?.stock.total_lots ?? 0}
        description={`${formatQuantity(data?.stock.total_quantity)} kg in stock`}
        icon={<Package className="h-6 w-6" />}
        loading={isLoading}
      />
      <StatCard
        title="Recent SRVs"
        value={data?.recent_activity.srvs_created ?? 0}
        description="Created this period"
        icon={<FileInput className="h-6 w-6" />}
        loading={isLoading}
      />
      <StatCard
        title="Recent SIVs"
        value={data?.recent_activity.sivs_created ?? 0}
        description="Created this period"
        icon={<FileOutput className="h-6 w-6" />}
        loading={isLoading}
      />
      <StatCard
        title="Cleaning Events"
        value={data?.recent_activity.cleaning_events ?? 0}
        description="In progress"
        icon={<Sparkles className="h-6 w-6" />}
        loading={isLoading}
      />
    </div>
  );
}
