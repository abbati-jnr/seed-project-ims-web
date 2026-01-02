import {
  LayoutDashboard,
  Package,
  PackagePlus,
  PackageMinus,
  Sparkles,
  CheckCircle,
  BarChart3,
  Settings,
  type LucideIcon,
} from 'lucide-react';
import type { UserRole } from '@/types/models';

export interface NavItem {
  label: string;
  href?: string;
  icon: LucideIcon;
  roles: UserRole[];
  badge?: 'pending_approvals';
  children?: Omit<NavItem, 'icon' | 'children'>[];
}

export const navigation: NavItem[] = [
  {
    label: 'Overview',
    href: '/overview',
    icon: LayoutDashboard,
    roles: ['admin', 'manager', 'storekeeper', 'qa', 'sales'],
  },
  {
    label: 'Inventory',
    icon: Package,
    roles: ['admin', 'manager', 'storekeeper', 'qa', 'sales'],
    children: [
      {
        label: 'Lots',
        href: '/inventory/lots',
        roles: ['admin', 'manager', 'storekeeper', 'qa', 'sales'],
      },
      {
        label: 'Stock Summary',
        href: '/inventory/stock',
        roles: ['admin', 'manager', 'storekeeper', 'qa', 'sales'],
      },
    ],
  },
  {
    label: 'Receiving (SRV)',
    icon: PackagePlus,
    roles: ['admin', 'manager', 'storekeeper'],
    children: [
      {
        label: 'All SRVs',
        href: '/receiving',
        roles: ['admin', 'manager', 'storekeeper'],
      },
      {
        label: 'Create New',
        href: '/receiving/new',
        roles: ['admin', 'manager', 'storekeeper'],
      },
    ],
  },
  {
    label: 'Issuing (SIV)',
    icon: PackageMinus,
    roles: ['admin', 'manager', 'storekeeper', 'sales'],
    children: [
      {
        label: 'All SIVs',
        href: '/issuing',
        roles: ['admin', 'manager', 'storekeeper', 'sales'],
      },
      {
        label: 'Create New',
        href: '/issuing/new',
        roles: ['admin', 'manager', 'storekeeper', 'sales'],
      },
    ],
  },
  {
    label: 'Cleaning',
    icon: Sparkles,
    roles: ['admin', 'manager', 'qa'],
    children: [
      {
        label: 'All Events',
        href: '/cleaning',
        roles: ['admin', 'manager', 'qa'],
      },
      {
        label: 'Create New',
        href: '/cleaning/new',
        roles: ['admin', 'manager', 'qa'],
      },
    ],
  },
  {
    label: 'Approvals',
    href: '/approvals',
    icon: CheckCircle,
    roles: ['admin', 'manager'],
    badge: 'pending_approvals',
  },
  {
    label: 'Reports',
    icon: BarChart3,
    roles: ['admin', 'manager', 'storekeeper', 'qa', 'sales'],
    children: [
      {
        label: 'SRV Register',
        href: '/reports/srv-register',
        roles: ['admin', 'manager', 'storekeeper', 'qa', 'sales'],
      },
      {
        label: 'SIV Register',
        href: '/reports/siv-register',
        roles: ['admin', 'manager', 'storekeeper', 'qa', 'sales'],
      },
      {
        label: 'Cleaning Summary',
        href: '/reports/cleaning-summary',
        roles: ['admin', 'manager', 'storekeeper', 'qa', 'sales'],
      },
      {
        label: 'Seed Distribution',
        href: '/reports/seed-distribution',
        roles: ['admin', 'manager', 'storekeeper', 'qa', 'sales'],
      },
    ],
  },
  {
    label: 'Settings',
    icon: Settings,
    roles: ['admin'],
    children: [
      {
        label: 'Warehouses',
        href: '/settings/warehouses',
        roles: ['admin'],
      },
      {
        label: 'Locations',
        href: '/settings/locations',
        roles: ['admin'],
      },
      {
        label: 'Seed Classes',
        href: '/settings/seed-classes',
        roles: ['admin'],
      },
      {
        label: 'Seed Products',
        href: '/settings/seed-products',
        roles: ['admin'],
      },
      {
        label: 'Users',
        href: '/settings/users',
        roles: ['admin'],
      },
    ],
  },
];

export function filterNavigationByRole(items: NavItem[], role: UserRole | undefined): NavItem[] {
  if (!role) return [];

  return items
    .filter((item) => item.roles.includes(role))
    .map((item) => ({
      ...item,
      children: item.children?.filter((child) => child.roles.includes(role)),
    }));
}
