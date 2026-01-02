'use client';

import Link from 'next/link';
import { Plus, FileInput, FileOutput, Sparkles } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Button } from '@/components/ui';
import { useAuthStore } from '@/lib/stores/auth-store';
import type { UserRole } from '@/types/models';

interface QuickAction {
  label: string;
  href: string;
  icon: React.ReactNode;
  roles: UserRole[];
  description: string;
}

const quickActions: QuickAction[] = [
  {
    label: 'New SRV',
    href: '/receiving/new',
    icon: <FileInput className="h-5 w-5" />,
    roles: ['admin', 'manager', 'storekeeper'],
    description: 'Create a new Store Receiving Voucher',
  },
  {
    label: 'New SIV',
    href: '/issuing/new',
    icon: <FileOutput className="h-5 w-5" />,
    roles: ['admin', 'manager', 'storekeeper', 'sales'],
    description: 'Create a new Store Issuing Voucher',
  },
  {
    label: 'New Cleaning',
    href: '/cleaning/new',
    icon: <Sparkles className="h-5 w-5" />,
    roles: ['admin', 'manager', 'qa'],
    description: 'Start a new cleaning event',
  },
];

export function QuickActions() {
  const user = useAuthStore((state) => state.user);
  const userRole = user?.role;

  const availableActions = quickActions.filter(
    (action) => userRole && action.roles.includes(userRole)
  );

  if (availableActions.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {availableActions.map((action) => (
            <Link key={action.href} href={action.href}>
              <Button
                variant="outline"
                className="h-auto w-full flex-col items-start gap-2 p-4 text-left"
              >
                <div className="flex items-center gap-2">
                  {action.icon}
                  <span className="font-medium">{action.label}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {action.description}
                </span>
              </Button>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
