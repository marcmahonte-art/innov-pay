'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart3, TrendingUp, DollarSign, RefreshCw, Zap, CheckCircle2, Clock, Percent } from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import DashboardLayout from '@/components/DashboardLayout';
import { apiClient } from '@/lib/api';

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState<'volume' | 'transactions' | 'methods' | 'settlements' | 'latency'>('volume');
  const [hideBalances, setHideBalances] = useState(false);

  React.useEffect(() => {
    const checkVisibility = () => {
      setHideBalances(localStorage.getItem('hideBalances') === 'true');
    };
    checkVisibility();
    window.addEventListener('balanceVisibilityChanged', checkVisibility);
    return () => {
      window.removeEventListener('balanceVisibilityChanged', checkVisibility);
    };
  }, []);

  // Fetch Advanced Analytics
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['advancedAnalytics'],
    queryFn: async () => {
      const res = await apiClient.get('/merchants/analytics');
      return res.data;
    },
  });

  const COLORS = ['#00103e', '#c94400', '#15803d', '#475b9c', '#92400e'];

  const formatXaf = (val: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XAF', minimumFractionDigits: 0 }).format(val);
  };

  const tabs = [
    { id: 'volume', name: 'Volume de transaction', icon: DollarSign },
    { id: 'transactions', name: 'Nombre d\'opérations', icon: BarChart3 },
    { id: 'methods', name: 'Canaux de paiement', icon: Percent },
    { id: 'settlements', name: 'Règlements & Liquidités', icon: CheckCircle2 },
    { id: 'latency', name: 'Disponibilité & Latence', icon: Zap },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 font-sans">
        
        {/* Page Header */}
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-[#00103e] tracking-tight">Business Intelligence & Analyses</h1>
          <p className="text-[#5c6470] text-sm">Visualisez les performances de votre entreprise, la répartition des paiements et le comportement de vos clients.</p>
        </div>

        {/* Tab Row */}
        <div className="flex items-center overflow-x-auto border-b border-[#e2e5ea] no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 pb-3 pt-1 px-4 border-b-2 text-xs font-bold whitespace-nowrap transition ${
                  isActive 
                    ? 'border-[#ea580c] text-[#ea580c]' 
                    : 'border-transparent text-[#8b919d] hover:text-[#0f1214]'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-[#5c6470] space-y-4">
            <RefreshCw className="h-8 w-8 animate-spin text-[#0a2463]" />
            <p className="text-sm font-semibold">Génération des rapports d'analyse...</p>
          </div>
        ) : analytics ? (
          <div className="space-y-6">
            
            {/* Active Tab Chart Container */}
            <div className="bg-white border border-[#e2e5ea] rounded-2xl p-6 shadow-card">
              
              {activeTab === 'volume' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-base font-bold text-[#00103e]">Volume financier (30 derniers jours)</h3>
                      <p className="text-xs text-[#5c6470]">Comparatif quotidien des entrées (Crédits) et des retraits (Débits).</p>
                    </div>
                  </div>
                  <div className="h-[320px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={analytics.volumeChart}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 10 }} />
                        <YAxis axisLine={false} tickLine={false} tickFormatter={(v) => `${v/1000}k`} tick={{ fill: '#9CA3AF', fontSize: 10 }} />
                        <Tooltip formatter={(v: any) => [hideBalances ? '••••••' : formatXaf(v), '']} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                        <Legend />
                        <Line type="monotone" name="Volume encaissé" dataKey="credit" stroke="#15803D" strokeWidth={3} dot={false} activeDot={{ r: 5 }} />
                        <Line type="monotone" name="Volume retiré" dataKey="debit" stroke="#B91C1C" strokeWidth={3} dot={false} activeDot={{ r: 5 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {activeTab === 'transactions' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-base font-bold text-[#00103e]">Historique des transactions</h3>
                      <p className="text-xs text-[#5c6470]">Nombre quotidien d'opérations réussies vs échouées.</p>
                    </div>
                  </div>
                  <div className="h-[320px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analytics.transactionsChart}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 10 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 10 }} />
                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                        <Legend />
                        <Bar name="Succès" dataKey="success" fill="#15803D" radius={[4, 4, 0, 0]} />
                        <Bar name="Échecs" dataKey="failed" fill="#B91C1C" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {activeTab === 'methods' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-base font-bold text-[#00103e]">Part des canaux de paiement</h3>
                      <p className="text-xs text-[#5c6470]">Répartition du volume total par opérateur mobile et cartes bancaires.</p>
                    </div>
                    <div className="space-y-2">
                      {analytics.methodsShare?.map((item: any, idx: number) => (
                        <div key={item.name} className="flex items-center justify-between text-xs font-semibold p-2.5 rounded-lg bg-[#f5f7fa]">
                          <div className="flex items-center space-x-2">
                            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                            <span className="uppercase">{item.name}</span>
                          </div>
                          <span className="tabular-nums font-bold">{hideBalances ? '••••••' : formatXaf(item.value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={analytics.methodsShare || []}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          {analytics.methodsShare?.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(v) => [hideBalances ? '••••••' : formatXaf(Number(v)), '']} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {activeTab === 'settlements' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-base font-bold text-[#00103e]">Statuts des Règlements</h3>
                      <p className="text-xs text-[#5c6470]">Volume des fonds déjà virés vers vos comptes bancaires vs en attente.</p>
                    </div>
                    <div className="space-y-2">
                      {analytics.settlementsStatus?.map((item: any, idx: number) => (
                        <div key={item.name} className="flex items-center justify-between text-xs font-semibold p-2.5 rounded-lg bg-[#f5f7fa]">
                          <div className="flex items-center space-x-2">
                            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[(idx + 2) % COLORS.length] }} />
                            <span>{item.name}</span>
                          </div>
                          <span className="tabular-nums font-bold">{hideBalances ? '••••••' : formatXaf(item.value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={analytics.settlementsStatus || []}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          {analytics.settlementsStatus?.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(v) => [hideBalances ? '••••••' : formatXaf(Number(v)), '']} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {activeTab === 'latency' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-[#00103e]">Santé & Latence des opérateurs</h3>
                    <p className="text-xs text-[#5c6470]">Temps de réponse moyen (en millisecondes) lors de l'envoi de push USSD.</p>
                  </div>
                  <div className="space-y-4">
                    {analytics.operatorLatency?.map((item: any) => {
                      const maxL = 500;
                      const pct = Math.min((item.latency / maxL) * 100, 100);
                      const color = item.latency > 350 ? 'bg-rose-600' : item.latency > 200 ? 'bg-amber-500' : 'bg-emerald-600';
                      return (
                        <div key={item.name} className="space-y-1.5">
                          <div className="flex justify-between text-xs font-bold text-slate-700">
                            <span>{item.name}</span>
                            <span className="font-mono">{item.latency} ms</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-2">
                            <div className={`${color} h-2 rounded-full transition-all duration-300`} style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>

            {/* Bottom Tip */}
            <div className="bg-[#f5f7fa] border border-[#e2e5ea] p-5 rounded-2xl flex items-start space-x-3">
              <div className="h-9 w-9 rounded-full bg-blue-50 text-[#0a2463] flex items-center justify-center shrink-0">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div className="space-y-1 text-xs">
                <h4 className="font-bold text-[#00103e]">Optimisation des Conversions</h4>
                <p className="text-[#5c6470] leading-relaxed">
                  L'opérateur <strong>Konoom Money</strong> affiche la latence la plus basse (120ms), ce qui favorise un taux de succès de paiement supérieur de 15% par rapport aux autres réseaux CEMAC. Mettez en avant ce moyen de paiement sur vos intégrations.
                </p>
              </div>
            </div>

          </div>
        ) : (
          <div className="py-8 text-center text-[#8b919d]">
            Impossible de charger les données d'analyse.
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
