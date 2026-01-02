'use client';

import { use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getSIV } from '@/lib/api/siv';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { SIVForm } from '@/components/features/siv/siv-form';
import { ArrowLeft } from 'lucide-react';

interface EditSIVPageProps {
  params: Promise<{ id: string }>;
}

export default function EditSIVPage({ params }: EditSIVPageProps) {
  const { id } = use(params);
  const router = useRouter();

  const { data: siv, isLoading } = useQuery({
    queryKey: ['siv', id],
    queryFn: () => getSIV(id),
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

  if (!siv) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">SIV not found</p>
      </div>
    );
  }

  if (siv.status !== 'draft') {
    router.push(`/issuing/${id}`);
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/issuing/${id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <PageHeader
          title={`Edit ${siv.siv_number}`}
          description="Modify store issuing voucher"
        />
      </div>

      <SIVForm siv={siv} mode="edit" />
    </div>
  );
}
