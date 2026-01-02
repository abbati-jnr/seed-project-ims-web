'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { getPendingSRVs } from '@/lib/api/srv';
import { getPendingSIVs } from '@/lib/api/siv';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { SourceTypeBadge, PurposeBadge } from '@/components/data-display/status-badge';
import { formatQuantity, formatDate } from '@/lib/utils/format';
import { FileInput, FileOutput, CheckCircle, Clock } from 'lucide-react';
import type { SRVListItem, SIVListItem } from '@/types/models';

type TabType = 'all' | 'srv' | 'siv';

export default function ApprovalsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('all');

  const { data: pendingSRVs, isLoading: isLoadingSRVs } = useQuery({
    queryKey: ['pending-srvs'],
    queryFn: () => getPendingSRVs(),
  });

  const { data: pendingSIVs, isLoading: isLoadingSIVs } = useQuery({
    queryKey: ['pending-sivs'],
    queryFn: () => getPendingSIVs(),
  });

  const isLoading = isLoadingSRVs || isLoadingSIVs;
  const srvCount = pendingSRVs?.count || 0;
  const sivCount = pendingSIVs?.count || 0;
  const totalCount = srvCount + sivCount;

  const showSRVs = activeTab === 'all' || activeTab === 'srv';
  const showSIVs = activeTab === 'all' || activeTab === 'siv';

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pending Approvals"
        description="Review and approve pending documents"
        actions={
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <span className="text-lg font-bold">{totalCount}</span>
            <span className="text-muted-foreground">pending</span>
          </div>
        }
      />

      {/* Tabs */}
      <div className="flex gap-2">
        <Button
          variant={activeTab === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveTab('all')}
        >
          All ({totalCount})
        </Button>
        <Button
          variant={activeTab === 'srv' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveTab('srv')}
          className="gap-2"
        >
          <FileInput className="h-4 w-4" />
          SRV ({srvCount})
        </Button>
        <Button
          variant={activeTab === 'siv' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveTab('siv')}
          className="gap-2"
        >
          <FileOutput className="h-4 w-4" />
          SIV ({sivCount})
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : totalCount === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <CheckCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">All caught up!</h3>
            <p className="text-muted-foreground">No pending approvals at the moment.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Pending SRVs */}
          {showSRVs && srvCount > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileInput className="h-5 w-5 text-green-600" />
                  Store Receiving Vouchers ({srvCount})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {pendingSRVs?.results.map((srv) => (
                    <SRVApprovalItem key={srv.id} srv={srv} />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Pending SIVs */}
          {showSIVs && sivCount > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileOutput className="h-5 w-5 text-red-600" />
                  Store Issuing Vouchers ({sivCount})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {pendingSIVs?.results.map((siv) => (
                    <SIVApprovalItem key={siv.id} siv={siv} />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

function SRVApprovalItem({ srv }: { srv: SRVListItem }) {
  return (
    <Link
      href={`/receiving/${srv.id}`}
      className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/50 transition-colors"
    >
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-primary">{srv.srv_number}</span>
          <SourceTypeBadge type={srv.source_type} />
        </div>
        <p className="text-sm text-muted-foreground">
          {srv.warehouse_code} • {srv.item_count} item(s) • {formatQuantity(srv.total_quantity)} kg
        </p>
        <p className="text-sm text-muted-foreground">
          By {srv.receiving_officer_name} • {formatDate(srv.created_at)}
        </p>
      </div>
      <div>
        <Badge variant="warning">Pending</Badge>
      </div>
    </Link>
  );
}

function SIVApprovalItem({ siv }: { siv: SIVListItem }) {
  return (
    <Link
      href={`/issuing/${siv.id}`}
      className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/50 transition-colors"
    >
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-primary">{siv.siv_number}</span>
          <PurposeBadge purpose={siv.purpose} />
        </div>
        <p className="text-sm text-muted-foreground">
          {siv.warehouse_code} • {siv.item_count} item(s) • {formatQuantity(siv.total_quantity)} kg
        </p>
        <p className="text-sm text-muted-foreground">
          To {siv.recipient_name} • By {siv.issuing_officer_name} • {formatDate(siv.created_at)}
        </p>
      </div>
      <div>
        <Badge variant="warning">Pending</Badge>
      </div>
    </Link>
  );
}
