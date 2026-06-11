'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CreditCard, Loader2 } from 'lucide-react';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="flex flex-col flex-1 items-center justify-center min-h-screen bg-slate-950 text-slate-400">
      <div className="flex flex-col items-center space-y-4">
        <CreditCard className="h-12 w-12 text-indigo-500 animate-bounce" />
        <h2 className="text-xl font-bold text-white">Innov Pay</h2>
        <div className="flex items-center space-x-2 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Chargement du portail...</span>
        </div>
      </div>
    </div>
  );
}
