'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CreditCard, Loader2, AlertCircle, Eye, EyeOff, Copy, CheckCircle } from 'lucide-react';
import { apiClient } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [adminName, setAdminName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Secret Key recovery block
  const [secretKey, setSecretKey] = useState('');
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await apiClient.post('/auth/register', {
        businessName,
        email,
        phone,
        address: address || undefined,
        adminName,
        password,
      });

      // Save token & user profile
      localStorage.setItem('accessToken', res.data.accessToken);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      
      // Store secret key in state to show to user
      setSecretKey(res.data.initialSecretKey);
    } catch (err: any) {
      setError(
        err.response?.data?.message || 
        'Une erreur est survenue lors de la création de votre compte.'
      );
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(secretKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (secretKey) {
    return (
      <main className="flex-1 flex flex-col justify-center min-h-screen bg-[#f5f7fa] px-6 py-12 lg:px-8 font-sans">
        <div className="sm:mx-auto sm:w-full sm:max-w-xl">
          <div className="bg-white border border-[#e2e5ea] shadow-card rounded-2xl p-8 sm:p-12 text-center space-y-6">
            <div className="inline-flex p-3 bg-emerald-50 text-emerald-600 rounded-full">
              <CheckCircle className="h-12 w-12" />
            </div>
            <h2 className="text-2xl font-bold text-[#00103e]">Compte Marchand Créé avec Succès !</h2>
            
            <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl text-rose-700 text-sm text-left">
              <AlertCircle className="h-5 w-5 inline mr-2 align-bottom" />
              <strong>ATTENTION :</strong> Copiez votre clé secrète ci-dessous et conservez-la en lieu sûr. 
              Pour votre sécurité, nous ne pourrons plus vous la réafficher.
            </div>

            <div className="relative bg-[#f5f7fa] p-4 rounded-xl border border-[#e2e5ea] font-mono text-xs flex justify-between items-center text-[#0f1214] break-all select-all">
              <span className="pr-12 text-left">{secretKey}</span>
              <button 
                onClick={handleCopy}
                className="absolute right-3 top-3 p-2 text-[#5c6470] hover:text-[#00103e] bg-white border border-[#e2e5ea] rounded-lg shrink-0 transition"
              >
                {copied ? <span className="text-emerald-600 text-xs font-semibold">Copié !</span> : <Copy className="h-4 w-4" />}
              </button>
            </div>

            <button
              onClick={() => router.push('/dashboard')}
              className="w-full py-3 bg-[#0a2463] hover:bg-[#1a3a72] text-white font-semibold rounded-xl transition shadow-md"
            >
              Accéder au Dashboard
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 flex flex-col justify-center min-h-screen bg-[#f5f7fa] px-6 py-12 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-[#0a2463]/5 border border-[#0a2463]/10 mb-6">
          <CreditCard className="h-10 w-10 text-[#0a2463]" />
        </div>
        <h2 className="text-3xl font-bold tracking-tight text-[#00103e]">
          Innov<span className="text-[#ea580c]">Pay</span>
        </h2>
        <p className="mt-2 text-sm text-[#5c6470]">
          Enregistrez votre entreprise et commencez à accepter les paiements
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white px-6 py-10 shadow-card border border-[#e2e5ea] rounded-2xl sm:px-10">
          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 flex items-start space-x-3 text-rose-700 text-sm">
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#5c6470] uppercase tracking-wider">Nom de l'entreprise</label>
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="mt-1 block w-full rounded-xl bg-[#f5f7fa] border border-[#e2e5ea] text-[#0f1214] text-sm py-2.5 px-3 focus:outline-none focus:border-[#0a2463] transition"
                  placeholder="E-Shop Sarl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5c6470] uppercase tracking-wider">Téléphone de l'entreprise</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1 block w-full rounded-xl bg-[#f5f7fa] border border-[#e2e5ea] text-[#0f1214] text-sm py-2.5 px-3 focus:outline-none focus:border-[#0a2463] transition font-mono"
                  placeholder="+23566000000"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#5c6470] uppercase tracking-wider">Adresse de l'entreprise</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="mt-1 block w-full rounded-xl bg-[#f5f7fa] border border-[#e2e5ea] text-[#0f1214] text-sm py-2.5 px-3 focus:outline-none focus:border-[#0a2463] transition"
                placeholder="Quartier Chagoua, N'Djamena, Tchad"
              />
            </div>

            <hr className="border-[#e2e5ea]" />

            <div>
              <label className="block text-xs font-bold text-[#5c6470] uppercase tracking-wider">Nom de l'administrateur</label>
              <input
                type="text"
                required
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                className="mt-1 block w-full rounded-xl bg-[#f5f7fa] border border-[#e2e5ea] text-[#0f1214] text-sm py-2.5 px-3 focus:outline-none focus:border-[#0a2463] transition"
                placeholder="Ali Mahamat"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#5c6470] uppercase tracking-wider">Email professionnel</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-xl bg-[#f5f7fa] border border-[#e2e5ea] text-[#0f1214] text-sm py-2.5 px-3 focus:outline-none focus:border-[#0a2463] transition"
                placeholder="admin@eshop.td"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#5c6470] uppercase tracking-wider">Mot de passe</label>
              <div className="relative mt-1">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-xl bg-[#f5f7fa] border border-[#e2e5ea] text-[#0f1214] text-sm py-2.5 px-3 pr-10 focus:outline-none focus:border-[#0a2463] transition"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#5c6470] hover:text-[#0f1214]"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-3 bg-[#0a2463] hover:bg-[#1a3a72] text-white font-semibold rounded-xl shadow-md transition duration-200 disabled:opacity-50"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : "Créer mon compte marchand"}
              </button>
            </div>
          </form>

          <p className="mt-6 text-center text-sm text-[#5c6470]">
            Déjà inscrit ?{' '}
            <Link href="/login" className="font-semibold text-[#ea580c] hover:underline">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
