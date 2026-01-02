import { Suspense } from 'react';
import { LoginForm } from '@/components/features/auth/login-form';
import { Spinner } from '@/components/ui';

export const metadata = {
  title: 'Sign In - Seed Project IMS',
  description: 'Sign in to access the Seed Project Inventory Management System',
};

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Spinner size="lg" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
