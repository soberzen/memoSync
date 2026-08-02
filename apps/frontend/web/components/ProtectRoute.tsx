'use client';

import type { PropsWithChildren } from 'react';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/context/AuthContext';
import { LumaSpin } from '@/components/ui/luma-spin';

export default function ProtectRoute({ children }: PropsWithChildren) {
  const { loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading || isAuthenticated) {
      return;
    }

    const redirect = `${window.location.pathname}${window.location.search}`;
    router.replace(`/login?redirect=${encodeURIComponent(redirect)}`);
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <LumaSpin />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return children;
}
