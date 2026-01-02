'use client';

import { useToastContext, type ToastType } from '@/lib/providers/toast-provider';
import { useCallback } from 'react';

export function useToast() {
  const { addToast, removeToast, clearToasts } = useToastContext();

  const toast = useCallback(
    (options: { type?: ToastType; title: string; description?: string; duration?: number }) => {
      addToast({
        type: options.type ?? 'info',
        title: options.title,
        description: options.description,
        duration: options.duration,
      });
    },
    [addToast]
  );

  const success = useCallback(
    (title: string, description?: string) => {
      addToast({ type: 'success', title, description });
    },
    [addToast]
  );

  const error = useCallback(
    (title: string, description?: string) => {
      addToast({ type: 'error', title, description });
    },
    [addToast]
  );

  const warning = useCallback(
    (title: string, description?: string) => {
      addToast({ type: 'warning', title, description });
    },
    [addToast]
  );

  const info = useCallback(
    (title: string, description?: string) => {
      addToast({ type: 'info', title, description });
    },
    [addToast]
  );

  return {
    toast,
    success,
    error,
    warning,
    info,
    removeToast,
    clearToasts,
  };
}
