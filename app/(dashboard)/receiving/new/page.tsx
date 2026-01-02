'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { SRVForm } from '@/components/features/srv/srv-form';

export default function NewSRVPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/receiving">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <PageHeader
          title="Create New SRV"
          description="Record new seed receiving operation"
        />
      </div>

      <SRVForm mode="create" />
    </div>
  );
}
