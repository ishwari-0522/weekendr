'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';
import SkeletonLoader from '../components/ui/SkeletonLoader';

/**
 * ProtectedRoute: Interceptor component enforcing authentication on guarded page roots.
 */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      // Save intended path for post-login redirect
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('redirect_to', pathname);
      }
      router.push('/login');
    }
  }, [isAuthenticated, loading, pathname, router]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-8 space-y-6">
        <SkeletonLoader count={1} className="h-10 w-2/3" />
        <SkeletonLoader count={3} className="h-24 w-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return <>{children}</>;
}
