'use client';

import { use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getSRV } from '@/lib/api/srv';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { SRVForm } from '@/components/features/srv/srv-form';
import { ArrowLeft } from 'lucide-react';

interface EditSRVPageProps {
  params: Promise<{ id: string }>;
}

export default function EditSRVPage({ params }: EditSRVPageProps) {
  const { id } = use(params);
  const router = useRouter();

  const { data: srv, isLoading } = useQuery({
    queryKey: ['srv', id],
    queryFn: () => getSRV(id),
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!srv) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">SRV not found</p>
      </div>
    );
  }

  if (srv.status !== 'draft') {
    router.push(`/receiving/${id}`);
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/receiving/${id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <PageHeader
          title={`Edit ${srv.srv_number}`}
          description="Modify store receiving voucher"
        />
      </div>

      <SRVForm srv={srv} mode="edit" />
    </div>
  );
}
