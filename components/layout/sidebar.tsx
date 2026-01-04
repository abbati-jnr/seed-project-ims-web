'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { ChevronDown, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useUIStore } from '@/lib/stores/ui-store';
import { useAuthStore } from '@/lib/stores/auth-store';
import { navigation, filterNavigationByRole, type NavItem } from '@/config/navigation';
import { siteConfig } from '@/config/site';

interface SidebarNavItemProps {
  item: NavItem;
  isCollapsed: boolean;
}

function SidebarNavItem({ item, isCollapsed }: SidebarNavItemProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = item.children && item.children.length > 0;

  const isActive = item.href
    ? pathname === item.href
    : item.children?.some((child) => pathname === child.href);

  const Icon = item.icon;

  if (hasChildren && !isCollapsed) {
    return (
      <div className="space-y-1">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors',
            isActive
              ? 'bg-primary/10 text-primary'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          )}
        >
          <span className="flex items-center gap-3">
            <Icon className="h-5 w-5 shrink-0" />
            <span>{item.label}</span>
          </span>
          <ChevronDown
            className={cn(
              'h-4 w-4 shrink-0 transition-transform',
              isOpen && 'rotate-180'
            )}
          />
        </button>
        {isOpen && (
          <div className="ml-4 space-y-1 border-l border-border pl-4">
            {item.children?.map((child) => (
              <Link
                key={child.href}
                href={child.href!}
                className={cn(
                  'block rounded-md px-3 py-2 text-sm transition-colors',
                  pathname === child.href
                    ? 'bg-primary/10 font-medium text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                {child.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  const content = (
    <>
      <Icon className="h-5 w-5 shrink-0" />
      {!isCollapsed && <span>{item.label}</span>}
      {item.badge && !isCollapsed && (
        <span className="ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1.5 text-xs font-medium text-primary-foreground">
          3
        </span>
      )}
    </>
  );

  if (item.href) {
    return (
      <Link
        href={item.href}
        className={cn(
          'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
          isActive
            ? 'bg-primary/10 text-primary'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground',
          isCollapsed && 'justify-center'
        )}
        title={isCollapsed ? item.label : undefined}
      >
        {content}
      </Link>
    );
  }

  return null;
}

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebarCollapsed } = useUIStore();
  const user = useAuthStore((state) => state.user);

  const filteredNavigation = filterNavigationByRole(navigation, user?.role);

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen border-r border-border bg-card transition-all duration-300',
        sidebarCollapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-border px-4">
          <Link href="/overview" className="flex items-center gap-2">
            <Image
              src="/logo.jpeg"
              alt={siteConfig.name}
              width={32}
              height={32}
              className="rounded-lg"
            />
            {!sidebarCollapsed && (
              <span className="font-semibold text-foreground">
                {siteConfig.shortName}
              </span>
            )}
          </Link>
          <button
            onClick={toggleSidebarCollapsed}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <ChevronLeft
              className={cn(
                'h-5 w-5 transition-transform',
                sidebarCollapsed && 'rotate-180'
              )}
            />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3">
          <div className="space-y-1">
            {filteredNavigation.map((item) => (
              <SidebarNavItem
                key={item.label}
                item={item}
                isCollapsed={sidebarCollapsed}
              />
            ))}
          </div>
        </nav>

        {/* User Info */}
        {user && !sidebarCollapsed && (
          <div className="border-t border-border p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                {user.first_name[0]}
                {user.last_name[0]}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                  {user.full_name}
                </p>
                <p className="truncate text-xs text-muted-foreground capitalize">
                  {user.role.replace('_', ' ')}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
