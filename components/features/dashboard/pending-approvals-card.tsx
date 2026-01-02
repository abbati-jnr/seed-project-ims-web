'use client';

import Link from 'next/link';
import { AlertCircle, ChevronRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Badge, Skeleton } from '@/components/ui';
import type { DashboardResponse } from '@/types/api';

interface PendingApprovalsCardProps {
  data?: DashboardResponse;
  isLoading?: boolean;
}

export function PendingApprovalsCard({ data, isLoading }: PendingApprovalsCardProps) {
  const pendingApprovals = data?.pending_approvals;
  const total = pendingApprovals?.total ?? 0;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Pending Approvals
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Pending Approvals
          </CardTitle>
          {total > 0 && (
            <Badge variant="warning">{total} pending</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {total === 0 ? (
          <p className="text-sm text-muted-foreground">
            No pending approvals at this time.
          </p>
        ) : (
          <div className="space-y-3">
            {(pendingApprovals?.srvs ?? 0) > 0 && (
              <Link
                href="/approvals?type=srv"
                className="flex items-center justify-between rounded-lg border border-border p-3 transition-colors hover:bg-muted"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100 text-yellow-600">
                    {pendingApprovals?.srvs}
                  </div>
                  <div>
                    <p className="font-medium">SRV Approvals</p>
                    <p className="text-sm text-muted-foreground">
                      Store Receiving Vouchers
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </Link>
            )}
            {(pendingApprovals?.sivs ?? 0) > 0 && (
              <Link
                href="/approvals?type=siv"
                className="flex items-center justify-between rounded-lg border border-border p-3 transition-colors hover:bg-muted"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100 text-yellow-600">
                    {pendingApprovals?.sivs}
                  </div>
                  <div>
                    <p className="font-medium">SIV Approvals</p>
                    <p className="text-sm text-muted-foreground">
                      Store Issuing Vouchers
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </Link>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
