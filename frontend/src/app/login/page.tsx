'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CreditCard, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { apiClient } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // If token exists, auto-redirect
    if (localStorage.getItem('accessToken')) {
      router.push('/dashboard');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await apiClient.post('/auth/login', { email, password });
      localStorage.setItem('accessToken', res.data.accessToken);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      router.push('/dashboard');
    } catch (err: any) {
      setError(
        err.response?.data?.message || 
        'Échec de la connexion. Veuillez vérifier vos identifiants.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex-1 flex flex-col justify-center min-h-screen bg-[#f5f7fa] px-6 py-12 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-[#0a2463]/5 border border-[#0a2463]/10 mb-6">
          <CreditCard className="h-10 w-10 text-[#0a2463]" />
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight text-[#00103e] sm:text-4xl">
          Innov<span className="text-[#ea580c]">Pay</span>
        </h2>
        <p className="mt-2 text-sm text-[#5c6470]">
          Connectez-vous à votre portail marchand
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]">
        <div className="bg-white px-6 py-12 shadow-card border border-[#e2e5ea] rounded-2xl sm:px-12">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 flex items-start space-x-3 text-rose-700 text-sm">
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-xs font-bold text-[#5c6470] uppercase tracking-wider">
                Adresse email
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-xl bg-[#f5f7fa] border border-[#e2e5ea] py-3 px-4 text-[#0f1214] placeholder-[#8b919d] focus:border-[#0a2463] focus:outline-none transition sm:text-sm"
                  placeholder="admin@eshop.td"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-xs font-bold text-[#5c6470] uppercase tracking-wider">
                  Mot de passe
                </label>
              </div>
              <div className="mt-2">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-xl bg-[#f5f7fa] border border-[#e2e5ea] py-3 px-4 text-[#0f1214] placeholder-[#8b919d] focus:border-[#0a2463] focus:outline-none transition sm:text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="flex w-full justify-center items-center rounded-xl bg-[#0a2463] hover:bg-[#1a3a72] px-3 py-3 text-sm font-semibold text-white shadow-md transition duration-200 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                ) : (
                  <>
                    Se connecter
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          <p className="mt-8 text-center text-sm text-[#5c6470]">
            Nouveau sur Innov Pay ?{' '}
            <Link href="/register" className="font-semibold text-[#ea580c] hover:underline">
              Créer un compte marchand
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
