'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { LumaSpin } from '@/components/ui/luma-spin';

export default function HomePage() {
  const { loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === '/') {
      if (!loading) {
        if (!isAuthenticated) {
          router.replace('/login');
        } else {
          // router.replace('/dashboard');
        }
      }
    }
  }, [loading, isAuthenticated, router, pathname]);

  if (pathname !== '/') {
    return null;
  }

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <LumaSpin />
        <p className="text-muted-foreground">正在加载 墨同文档...</p>
      </div>
    </div>
  );
}
