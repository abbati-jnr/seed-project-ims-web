'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth-store';

export function useAuth({ required = true }: { required?: boolean } = {}) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, refreshUser } = useAuthStore();

  useEffect(() => {
    // Try to refresh user on mount if we have persisted auth state
    if (isAuthenticated && !user) {
      refreshUser();
    }
  }, [isAuthenticated, user, refreshUser]);

  useEffect(() => {
    if (required && !isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [required, isLoading, isAuthenticated, router]);

  return {
    user,
    isAuthenticated,
    isLoading,
    isAdmin: user?.role === 'admin',
    isManager: user?.role === 'manager',
    isStorekeeper: user?.role === 'storekeeper',
    isQA: user?.role === 'qa',
    isSales: user?.role === 'sales',
  };
}
