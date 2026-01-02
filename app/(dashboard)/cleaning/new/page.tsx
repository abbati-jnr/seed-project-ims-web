'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { CleaningForm } from '@/components/features/cleaning/cleaning-form';

export default function NewCleaningPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/cleaning">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <PageHeader
          title="New Cleaning Event"
          description="Create a new seed cleaning operation"
        />
      </div>

      <CleaningForm />
    </div>
  );
}
