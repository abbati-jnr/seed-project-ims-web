'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { X, Leaf, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useUIStore } from '@/lib/stores/ui-store';
import { useAuthStore } from '@/lib/stores/auth-store';
import { navigation, filterNavigationByRole, type NavItem } from '@/config/navigation';
import { siteConfig } from '@/config/site';
import { useState } from 'react';

interface MobileNavItemProps {
  item: NavItem;
  onNavigate: () => void;
}

function MobileNavItem({ item, onNavigate }: MobileNavItemProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = item.children && item.children.length > 0;

  const isActive = item.href
    ? pathname === item.href
    : item.children?.some((child) => pathname === child.href);

  const Icon = item.icon;

  if (hasChildren) {
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
                onClick={onNavigate}
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

  if (item.href) {
    return (
      <Link
        href={item.href}
        onClick={onNavigate}
        className={cn(
          'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
          isActive
            ? 'bg-primary/10 text-primary'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
        )}
      >
        <Icon className="h-5 w-5 shrink-0" />
        <span>{item.label}</span>
        {item.badge && (
          <span className="ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1.5 text-xs font-medium text-primary-foreground">
            3
          </span>
        )}
      </Link>
    );
  }

  return null;
}

export function MobileNav() {
  const pathname = usePathname();
  const { mobileMenuOpen, setMobileMenuOpen } = useUIStore();
  const user = useAuthStore((state) => state.user);

  const filteredNavigation = filterNavigationByRole(navigation, user?.role);

  // Close menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname, setMobileMenuOpen]);

  // Prevent scroll when menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  if (!mobileMenuOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* Drawer */}
      <div className="absolute left-0 top-0 h-full w-72 bg-card shadow-xl animate-in slide-in-from-left">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex h-16 items-center justify-between border-b border-border px-4">
            <Link
              href="/overview"
              className="flex items-center gap-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Leaf className="h-5 w-5" />
              </div>
              <span className="font-semibold text-foreground">
                {siteConfig.shortName}
              </span>
            </Link>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-3">
            <div className="space-y-1">
              {filteredNavigation.map((item) => (
                <MobileNavItem
                  key={item.label}
                  item={item}
                  onNavigate={() => setMobileMenuOpen(false)}
                />
              ))}
            </div>
          </nav>

          {/* User Info */}
          {user && (
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
      </div>
    </div>
  );
}
