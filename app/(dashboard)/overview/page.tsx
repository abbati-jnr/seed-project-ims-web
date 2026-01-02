'use client';

import { useQuery } from '@tanstack/react-query';
import { getDashboard } from '@/lib/api/reports';
import { PageHeader } from '@/components/layout/page-header';
import { DashboardStats } from '@/components/features/dashboard/dashboard-stats';
import { PendingApprovalsCard } from '@/components/features/dashboard/pending-approvals-card';
import { StockByWarehouse } from '@/components/features/dashboard/stock-by-warehouse';
import { QuickActions } from '@/components/features/dashboard/quick-actions';
import { useAuthStore } from '@/lib/stores/auth-store';

export default function OverviewPage() {
  const user = useAuthStore((state) => state.user);

  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: getDashboard,
    refetchInterval: 60000, // Refresh every minute
  });

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${greeting()}, ${user?.first_name || 'User'}`}
        description="Here's an overview of your seed inventory operations"
      />

      {/* Stats Cards */}
      <DashboardStats data={data} isLoading={isLoading} />

      {/* Quick Actions */}
      <QuickActions />

      {/* Two Column Layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pending Approvals - Only show for admin/manager */}
        {(user?.role === 'admin' || user?.role === 'manager') && (
          <PendingApprovalsCard data={data} isLoading={isLoading} />
        )}

        {/* Stock by Warehouse */}
        <StockByWarehouse data={data} isLoading={isLoading} />
      </div>

      {/* Error State */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Failed to load dashboard data. Please try refreshing the page.
        </div>
      )}
    </div>
  );
}
