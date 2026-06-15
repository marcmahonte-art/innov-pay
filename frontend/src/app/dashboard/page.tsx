'use client';

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CreditCard, TrendingUp, Users, Wallet, ShieldCheck, ArrowRightLeft, Coins } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { apiClient } from '@/lib/api';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

export default function DashboardOverviewPage() {
  const [selectedCountry, setSelectedCountry] = useState('TD');
  const [hideBalances, setHideBalances] = useState(false);
  const [isSandbox, setIsSandbox] = useState(false);

  // Sync balance hiding state from localStorage / custom events
  useEffect(() => {
    const checkVisibility = () => {
      setHideBalances(localStorage.getItem('hideBalances') === 'true');
    };
    checkVisibility();
    window.addEventListener('balanceVisibilityChanged', checkVisibility);
    return () => {
      window.removeEventListener('balanceVisibilityChanged', checkVisibility);
    };
  }, []);

  // Sync sandbox mode state from localStorage / custom events
  useEffect(() => {
    const checkSandbox = () => {
      setIsSandbox(localStorage.getItem('isSandbox') === 'true');
    };
    checkSandbox();
    window.addEventListener('sandboxModeChanged', checkSandbox);
    return () => {
      window.removeEventListener('sandboxModeChanged', checkSandbox);
    };
  }, []);

  const countries = [
    { code: 'TD', name: 'Tchad', flag: '🇹🇩' },
    { code: 'CM', name: 'Cameroun', flag: '🇨🇲' },
    { code: 'GA', name: 'Gabon', flag: '🇬🇦' },
    { code: 'CG', name: 'Congo', flag: '🇨🇬' },
    { code: 'CF', name: 'RCA', flag: '🇨🇫' },
    { code: 'GQ', name: 'Guinée Éq.', flag: '🇬🇶' }
  ];

  // 1. Fetch dashboard metrics
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboardStats', isSandbox],
    queryFn: async () => {
      const res = await apiClient.get(`/merchants/dashboard?isLive=${!isSandbox}`);
      return res.data;
    },
  });

  // 2. Fetch recent payments
  const { data: recentPayments, isLoading: paymentsLoading } = useQuery({
    queryKey: ['recentPayments', isSandbox],
    queryFn: async () => {
      const res = await apiClient.get(`/dashboard/payments?limit=5&isLive=${!isSandbox}`);
      return res.data;
    },
  });

  const isLoading = statsLoading || paymentsLoading;

  // Render XAF formatted currency
  const formatXaf = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XAF', minimumFractionDigits: 0 }).format(amount);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        
        {/* Sandbox Warning Banner */}
        {isSandbox && (
          <div className="bg-amber-500/10 border border-amber-500/20 text-[#ea580c] rounded-2xl p-4 flex items-center space-x-3 text-xs select-none">
            <span className="font-extrabold uppercase tracking-wider bg-[#ea580c] text-white px-2 py-0.5 rounded-lg text-[9px]">Mode Test</span>
            <span>Vous visualisez des données factices de simulation. Les paiements réels ne sont pas débités.</span>
          </div>
        )}

        {/* Page title and country selector */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-[#00103e] tracking-tight">Vue d'ensemble</h1>
            <p className="text-[#5c6470] text-sm">Suivez les performances de vos ventes et gérez vos encaissements.</p>
          </div>
          
          {/* Country Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {countries.map((c) => {
              const isSelected = selectedCountry === c.code;
              return (
                <button
                  key={c.code}
                  onClick={() => setSelectedCountry(c.code)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-150 ${
                    isSelected 
                      ? 'bg-[#ea580c] text-white shadow-md' 
                      : 'bg-white border border-[#e2e5ea] text-[#3c3f4a] hover:bg-[#f0f2f5]'
                  }`}
                >
                  <span>{c.flag}</span> {c.name}
                </button>
              );
            })}
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-[140px] bg-white border border-[#e2e5ea] rounded-2xl" />
            ))}
          </div>
        ) : (
          <>
            {/* Bento Grid Balance Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Solde Principal - Navy Gradient */}
              <div className="bg-gradient-to-br from-[#0a2463] to-[#1a3a72] text-white p-5 rounded-2xl shadow-card relative overflow-hidden flex flex-col justify-between h-[140px] transition-base hover:shadow-card-hover">
                <div>
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-semibold text-[#c8d3e8] uppercase tracking-wider">Solde Principal {selectedCountry}</span>
                    <Wallet className="h-5 w-5 text-[#8fa3c8]" />
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight mt-3 tabular-nums">
                    {hideBalances ? '••••••' : formatXaf(stats?.metrics?.balance || 0)}
                  </h2>
                </div>
                <div className="text-[10px] text-[#c8d3e8] font-medium">Prêt pour reversement</div>
              </div>

              {/* Volume Traité */}
              <div className="bg-white border border-[#e2e5ea] p-5 rounded-2xl shadow-card hover:shadow-card-hover transition-base flex flex-col justify-between h-[140px]">
                <div>
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-semibold text-[#5c6470] uppercase tracking-wider">Volume Traité (Net)</span>
                    <div className="p-2 rounded-lg bg-[#0a2463]/5 text-[#0a2463]">
                      <TrendingUp className="h-5 w-5" />
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-[#00103e] tracking-tight mt-3 tabular-nums">
                    {hideBalances ? '••••••' : formatXaf(stats?.metrics?.totalVolume || 0)}
                  </h2>
                </div>
                <div className="text-[10px] text-[#8b919d] font-medium">Volume global</div>
              </div>

              {/* Transactions Totales */}
              <div className="bg-white border border-[#e2e5ea] p-5 rounded-2xl shadow-card hover:shadow-card-hover transition-base flex flex-col justify-between h-[140px]">
                <div>
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-semibold text-[#5c6470] uppercase tracking-wider">Transactions</span>
                    <div className="p-2 rounded-lg bg-[#ea580c]/5 text-[#ea580c]">
                      <ArrowRightLeft className="h-5 w-5" />
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-[#00103e] tracking-tight mt-3 tabular-nums">
                    {stats?.metrics?.totalTransactions || 0}
                  </h2>
                </div>
                <div className="text-[10px] text-[#8b919d] font-medium">Taux de succès: {stats?.metrics?.successRate?.toFixed(1)}%</div>
              </div>

              {/* Encours (En attente) */}
              <div className="bg-white border border-[#e2e5ea] p-5 rounded-2xl shadow-card hover:shadow-card-hover transition-base flex flex-col justify-between h-[140px]">
                <div>
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-semibold text-[#5c6470] uppercase tracking-wider">Encours (En attente)</span>
                    <div className="p-2 rounded-lg bg-[#92400e]/5 text-[#92400e]">
                      <Coins className="h-5 w-5" />
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-[#00103e] tracking-tight mt-3 tabular-nums">
                    {hideBalances ? '••••••' : formatXaf(stats?.metrics?.pendingBalance || 0)}
                  </h2>
                </div>
                <div className="text-[10px] text-[#8b919d] font-medium">Transactions non réconciliées</div>
              </div>

            </div>

            {/* Visual Analytics Chart & Compliance Card */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Chart Card */}
              <div className="lg:col-span-2 bg-white border border-[#e2e5ea] rounded-2xl p-6 shadow-card flex flex-col space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-[#00103e]">Activité de Paiement (7 Derniers Jours)</h3>
                  <p className="text-xs text-[#5c6470]">Représentation du volume quotidien cumulé des transactions acceptées (FCFA).</p>
                </div>
                
                <div className="h-80 w-full font-mono text-xs">
                  {stats?.dailyVolume && stats.dailyVolume.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={stats.dailyVolume}>
                        <defs>
                          <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0a2463" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#0a2463" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#eaedf0" />
                        <XAxis dataKey="date" stroke="#8b919d" />
                        <YAxis stroke="#8b919d" tickFormatter={(v) => `${v / 1000}k`} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e5ea', borderRadius: '12px', color: '#0f1214' }}
                          formatter={(value) => [`${value} FCFA`, 'Volume']}
                        />
                        <Area type="monotone" dataKey="volume" stroke="#0a2463" strokeWidth={3} fillOpacity={1} fill="url(#colorVolume)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-[#8b919d]">
                      Pas de données disponibles pour cette période.
                    </div>
                  )}
                </div>
              </div>

              {/* Compliance / Sandbox Tips */}
              <div className="bg-white border border-[#e2e5ea] rounded-2xl p-6 flex flex-col justify-between shadow-card space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-[#00103e]">Intégration et Conformité</h3>
                  <p className="text-xs text-[#5c6470] mt-1">État actuel de vos fonctionnalités API et de conformité.</p>
                </div>

                <div className="space-y-4 flex-1 mt-4">
                  <div className="flex items-center justify-between p-3.5 bg-[#f0f2f5] border border-[#e2e5ea] rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-[#ea580c]/10 text-[#ea580c] rounded-xl">
                        <ShieldCheck className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-[#00103e]">Statut KYC</h4>
                        <p className="text-xs text-[#5c6470]">Vérification de l'entreprise</p>
                      </div>
                    </div>
                    <span className="inline-flex items-center rounded-full bg-amber-50/10 px-2.5 py-1 text-xs font-bold text-amber-600 border border-amber-500/20">
                      En attente
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3.5 bg-[#f0f2f5] border border-[#e2e5ea] rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-[#0a2463]/10 text-[#0a2463] rounded-xl">
                        <CreditCard className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-[#00103e]">Routage CEMAC</h4>
                        <p className="text-xs text-[#5c6470]">Moteur intelligent activé</p>
                      </div>
                    </div>
                    <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-600 border border-emerald-500/20">
                      Actif
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#0a2463]/5 border border-[#0a2463]/10 text-[#0a2463] text-xs leading-relaxed">
                  <strong>Astuce API:</strong> Réalisez des simulations de test en passant vos clés secrètes avec le préfixe <code>sk_test_</code>.
                </div>
              </div>

            </div>

            {/* Recent Payments Ledger */}
            <div className="bg-white border border-[#e2e5ea] rounded-2xl p-6 shadow-card space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-[#00103e]">Paiements Récents</h3>
                  <p className="text-xs text-[#5c6470]">Les 5 dernières opérations reçues sur vos canaux.</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-[#e2e5ea] text-left text-sm text-[#3c3f4a]">
                  <thead>
                    <tr className="text-xs font-bold text-[#5c6470] uppercase tracking-wider">
                      <th className="py-3.5 px-4">Référence</th>
                      <th className="py-3.5 px-4">Client</th>
                      <th className="py-3.5 px-4">Canal</th>
                      <th className="py-3.5 px-4">Montant</th>
                      <th className="py-3.5 px-4">Statut</th>
                      <th className="py-3.5 px-4 text-right">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e2e5ea]">
                    {recentPayments?.data && recentPayments.data.length > 0 ? (
                      recentPayments.data.map((payment: any) => (
                        <tr key={payment.id} className="hover:bg-[#f0f2f5] transition">
                          <td className="py-4 px-4 font-mono text-xs text-[#00103e] font-semibold">{payment.merchantReference}</td>
                          <td className="py-4 px-4">
                            <div className="flex flex-col">
                              <span className="text-xs font-semibold text-[#0f1214]">{payment.customerEmail}</span>
                              <span className="text-xs text-[#5c6470]">{payment.customerPhone || 'N/A'}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className="inline-flex items-center rounded-lg bg-[#f0f2f5] px-2 py-1 text-xs font-semibold border border-[#e2e5ea] text-[#3c3f4a]">
                              {payment.paymentMethod === 'KONOOM_MONEY' ? 'KONOOM Mobile Money' : payment.paymentMethod}
                            </span>
                          </td>
                          <td className="py-4 px-4 font-bold text-[#15803D] tabular-nums">{formatXaf(payment.amount)}</td>
                          <td className="py-4 px-4">
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold border ${
                              payment.status === 'SUCCESS' 
                                ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20' 
                                : payment.status === 'PENDING'
                                ? 'bg-amber-500/10 text-amber-700 border-amber-500/20'
                                : 'bg-rose-500/10 text-rose-700 border-rose-500/20'
                            }`}>
                              {payment.status === 'SUCCESS' ? 'Succès' : payment.status === 'PENDING' ? 'En attente' : 'Échoué'}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-right text-xs text-[#8b919d] font-medium">
                            {new Date(payment.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-[#8b919d]">
                          Aucun paiement enregistré pour le moment.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
