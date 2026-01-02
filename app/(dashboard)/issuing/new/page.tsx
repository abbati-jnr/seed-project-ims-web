'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { SIVForm } from '@/components/features/siv/siv-form';

export default function NewSIVPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/issuing">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <PageHeader
          title="Create New SIV"
          description="Record new seed issuing operation"
        />
      </div>

      <SIVForm mode="create" />
    </div>
  );
}
