'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { CreditCard, TrendingUp, Users, DollarSign, Wallet, ShieldCheck, ArrowRightLeft, ArrowUpRight } from 'lucide-react';
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
  // 1. Fetch dashboard metrics
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      const res = await apiClient.get('/merchants/dashboard');
      return res.data;
    },
  });

  // 2. Fetch recent payments
  const { data: recentPayments, isLoading: paymentsLoading } = useQuery({
    queryKey: ['recentPayments'],
    queryFn: async () => {
      const res = await apiClient.get('/dashboard/payments?limit=5');
      return res.data;
    },
  });

  const isLoading = statsLoading || paymentsLoading;

  // Render XAF formatted currency
  const formatXaf = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XAF', minimumFractionDigits: 0 }).format(amount);
  };

  const metricCards = stats ? [
    {
      title: 'Volume Traité (Net)',
      value: formatXaf(stats.metrics.totalVolume),
      change: 'Volume global',
      icon: TrendingUp,
      gradient: 'from-blue-600/20 to-indigo-600/10 border-blue-500/30',
      iconColor: 'text-blue-400',
    },
    {
      title: 'Transactions Totales',
      value: stats.metrics.totalTransactions,
      change: `Taux de succès: ${stats.metrics.successRate.toFixed(1)}%`,
      icon: ArrowRightLeft,
      gradient: 'from-purple-600/20 to-indigo-600/10 border-purple-500/30',
      iconColor: 'text-purple-400',
    },
    {
      title: 'Solde Disponible',
      value: formatXaf(stats.metrics.balance),
      change: 'Prêt pour règlement',
      icon: Wallet,
      gradient: 'from-emerald-600/20 to-teal-600/10 border-emerald-500/30',
      iconColor: 'text-emerald-400',
    },
    {
      title: 'Encours (En attente)',
      value: formatXaf(stats.metrics.pendingBalance),
      change: 'Transactions non réconciliées',
      icon: DollarSign,
      gradient: 'from-amber-600/20 to-orange-600/10 border-amber-500/30',
      iconColor: 'text-amber-400',
    },
  ] : [];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Vue d'ensemble</h1>
          <p className="text-slate-400 mt-1">Suivez les performances de vos ventes et gérez vos encaissements.</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-slate-900 border border-slate-800 rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {/* Metrics cards grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {metricCards.map((card, i) => (
                <div 
                  key={i} 
                  className={`relative p-6 rounded-3xl bg-slate-900 border backdrop-blur-xl bg-gradient-to-br ${card.gradient} flex items-center justify-between hover:scale-[1.02] transition duration-300 group`}
                >
                  <div className="space-y-2">
                    <span className="text-sm font-semibold text-slate-400">{card.title}</span>
                    <h3 className="text-2xl font-bold text-white tracking-tight">{card.value}</h3>
                    <p className="text-xs font-semibold text-slate-500 group-hover:text-slate-300 transition duration-300">{card.change}</p>
                  </div>
                  <div className={`p-3 rounded-2xl bg-slate-950/80 border border-slate-800 shrink-0 ${card.iconColor}`}>
                    <card.icon className="h-6 w-6" />
                  </div>
                </div>
              ))}
            </div>

            {/* Visual Analytics Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-slate-900 border border-slate-800/80 rounded-3xl p-6 shadow-2xl flex flex-col space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white">Activité de Paiement (7 Derniers Jours)</h3>
                  <p className="text-xs text-slate-400">Représentation du volume quotidien cumulé des transactions acceptées (FCFA).</p>
                </div>
                
                <div className="h-80 w-full font-mono text-xs">
                  {stats?.dailyVolume && stats.dailyVolume.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={stats.dailyVolume}>
                        <defs>
                          <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis dataKey="date" stroke="#64748b" />
                        <YAxis stroke="#64748b" tickFormatter={(v) => `${v / 1000}k`} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#f8fafc' }}
                          formatter={(value) => [`${value} FCFA`, 'Volume']}
                        />
                        <Area type="monotone" dataKey="volume" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorVolume)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-slate-500">
                      Pas de données disponibles pour cette période.
                    </div>
                  )}
                </div>
              </div>

              {/* Status and Health checks */}
              <div className="bg-slate-900 border border-slate-800/80 rounded-3xl p-6 flex flex-col justify-between shadow-2xl space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white">Intégration et Conformité</h3>
                  <p className="text-xs text-slate-400 mt-1">État actuel de vos fonctionnalités API et de conformité.</p>
                </div>

                <div className="space-y-4 flex-1 mt-4">
                  <div className="flex items-center justify-between p-3.5 bg-slate-950/80 border border-slate-800 rounded-2xl">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
                        <ShieldCheck className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">Status KYC</h4>
                        <p className="text-xs text-slate-400">Vérification de l'entreprise</p>
                      </div>
                    </div>
                    <span className="inline-flex items-center rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-bold text-amber-400 border border-amber-500/20">
                      En attente
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3.5 bg-slate-950/80 border border-slate-800 rounded-2xl">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl">
                        <CreditCard className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">Routage CEMAC</h4>
                        <p className="text-xs text-slate-400">Moteur intelligent activé</p>
                      </div>
                    </div>
                    <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-400 border border-emerald-500/20">
                      Actif
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-300 text-xs">
                  <strong>Astuce API:</strong> Réalisez des simulations de test en passant vos clés secrètes avec le préfixe <code>sk_test_</code>.
                </div>
              </div>
            </div>

            {/* Recent Payments Ledger */}
            <div className="bg-slate-900 border border-slate-800/80 rounded-3xl p-6 shadow-2xl space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">Paiements Récents</h3>
                  <p className="text-xs text-slate-400">Les 5 dernières opérations reçues sur vos canaux.</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-800 text-left text-sm text-slate-300">
                  <thead>
                    <tr className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      <th className="py-3.5 px-4">Référence</th>
                      <th className="py-3.5 px-4">Client</th>
                      <th className="py-3.5 px-4">Canal</th>
                      <th className="py-3.5 px-4">Montant</th>
                      <th className="py-3.5 px-4">Statut</th>
                      <th className="py-3.5 px-4 text-right">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850">
                    {recentPayments?.data && recentPayments.data.length > 0 ? (
                      recentPayments.data.map((payment: any) => (
                        <tr key={payment.id} className="hover:bg-slate-850/35 transition">
                          <td className="py-4 px-4 font-mono text-xs text-white">{payment.merchantReference}</td>
                          <td className="py-4 px-4">
                            <div className="flex flex-col">
                              <span className="text-xs text-slate-400">{payment.customerEmail}</span>
                              <span className="text-xs text-slate-500">{payment.customerPhone || 'N/A'}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className="inline-flex items-center rounded-lg bg-slate-950 px-2 py-1 text-xs font-semibold border border-slate-800">
                              {payment.paymentMethod}
                            </span>
                          </td>
                          <td className="py-4 px-4 font-bold text-white">{formatXaf(payment.amount)}</td>
                          <td className="py-4 px-4">
                            <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold border ${
                              payment.status === 'SUCCESS' 
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                                : payment.status === 'PENDING'
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                            }`}>
                              {payment.status}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-right text-xs text-slate-500">
                            {new Date(payment.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-500">
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
