'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ShieldCheck } from 'lucide-react';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('aegis_token');
    const isPublicRoute = pathname === '/' || pathname === '/login' || pathname === '/signup';

    if (!token && !isPublicRoute) {
      // Unauthenticated user trying to access protected route (e.g. /dashboard) -> redirect to /login
      setIsAuthorized(false);
      router.replace('/login');
    } else {
      setIsAuthorized(true);
    }
  }, [pathname, router]);

  if (!isAuthorized && pathname.startsWith('/dashboard')) {
    return (
      <div className="min-h-screen bg-[#040406] flex items-center justify-center text-white font-sans">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/40 animate-pulse">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div className="text-xs font-mono font-bold tracking-widest text-slate-400 uppercase">
            Verifying Aegis Zero-Trust Session...
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
