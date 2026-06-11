'use client';

import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Coins, Landmark, Phone, Send, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { apiClient } from '@/lib/api';

export default function SettlementsPage() {
  const [destination, setDestination] = useState<'MOBILE' | 'BANK'>('MOBILE');
  const [payoutPhone, setPayoutPhone] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // 1. Fetch available balance from dashboard metrics
  const { data: dashboardStats, refetch: refetchStats } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      const res = await apiClient.get('/merchants/dashboard');
      return res.data;
    },
  });

  // 2. Fetch settlements history
  const { data: settlements, isLoading, refetch: refetchHistory } = useQuery({
    queryKey: ['settlements'],
    queryFn: async () => {
      const res = await apiClient.get('/settlements');
      return res.data;
    },
  });

  // 3. Request Settlement Payout Mutation
  const requestMutation = useMutation({
    mutationFn: async () => {
      setError('');
      setSuccess(false);
      
      const payload: any = {};
      if (destination === 'MOBILE') {
        if (!payoutPhone) throw new Error('Téléphone de réception requis');
        payload.payoutPhone = payoutPhone;
      } else {
        if (!bankName || !accountName || !accountNumber) {
          throw new Error('Tous les champs bancaires sont requis');
        }
        payload.bankDetails = { bankName, accountName, accountNumber };
      }

      const res = await apiClient.post('/settlements/request', payload);
      return res.data;
    },
    onSuccess: () => {
      setSuccess(true);
      setPayoutPhone('');
      setBankName('');
      setAccountName('');
      setAccountNumber('');
      refetchStats();
      refetchHistory();
    },
    onError: (err: any) => {
      setError(err.message || 'Une erreur est survenue lors de la demande de reversement.');
    },
  });

  const formatXaf = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XAF', minimumFractionDigits: 0 }).format(amount);
  };

  const balance = dashboardStats?.metrics?.balance || 0;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Règlements & Reversements</h1>
          <p className="text-slate-400 mt-1">Transférez vos fonds collectés vers votre compte Mobile Money ou compte bancaire local.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Withdrawal Request Form */}
          <div className="lg:col-span-1 bg-slate-900 border border-slate-800/80 rounded-3xl p-6 shadow-2xl flex flex-col justify-between space-y-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white">Demander un Reversement</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Solde actuel disponible : <strong className="text-emerald-400 font-bold">{formatXaf(balance)}</strong>
                </p>
              </div>

              {success && (
                <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 flex items-start space-x-3 text-emerald-400 text-sm">
                  <CheckCircle className="h-5 w-5 shrink-0 mt-0.5" />
                  <span>Demande soumise avec succès ! Les fonds seront transférés sous 24h.</span>
                </div>
              )}

              {error && (
                <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-4 flex items-start space-x-3 text-rose-400 text-sm">
                  <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Destination selector tabs */}
              <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-950 rounded-2xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setDestination('MOBILE')}
                  className={`flex items-center justify-center py-2.5 rounded-xl text-xs font-bold transition duration-200 ${
                    destination === 'MOBILE' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Mobile Money
                </button>
                <button
                  type="button"
                  onClick={() => setDestination('BANK')}
                  className={`flex items-center justify-center py-2.5 rounded-xl text-xs font-bold transition duration-200 ${
                    destination === 'BANK' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Landmark className="h-4 w-4 mr-2" />
                  Compte Bancaire
                </button>
              </div>

              {/* Dynamic Inputs */}
              {destination === 'MOBILE' ? (
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400">Numéro de téléphone récepteur (Airtel, Moov ou Orange)</label>
                  <input
                    type="text"
                    required
                    value={payoutPhone}
                    onChange={(e) => setPayoutPhone(e.target.value)}
                    placeholder="+23566000000"
                    className="w-full bg-slate-950/80 border-slate-800 text-white rounded-xl py-3 px-4 text-sm focus:ring-indigo-500"
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-400">Banque locale (ex. UBA, Ecobank, Orabank)</label>
                    <input
                      type="text"
                      required
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      placeholder="Ecobank Tchad"
                      className="w-full bg-slate-950/80 border-slate-800 text-white rounded-xl py-3 px-4 text-sm focus:ring-indigo-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-400">Nom du compte (Titulaire)</label>
                    <input
                      type="text"
                      required
                      value={accountName}
                      onChange={(e) => setAccountName(e.target.value)}
                      placeholder="E-Shop Sarl"
                      className="w-full bg-slate-950/80 border-slate-800 text-white rounded-xl py-3 px-4 text-sm focus:ring-indigo-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-400">Numéro de Compte (RIB / IBAN)</label>
                    <input
                      type="text"
                      required
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      placeholder="TD92 30006 00010 12345678901 22"
                      className="w-full bg-slate-950/80 border-slate-800 text-white rounded-xl py-3 px-4 text-sm focus:ring-indigo-500"
                    />
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => requestMutation.mutate()}
              disabled={requestMutation.isPending || balance <= 0}
              className="w-full flex justify-center items-center py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-lg transition duration-200 disabled:opacity-50"
            >
              {requestMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
              Initier le Transfert
            </button>
          </div>

          {/* Settlements History */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800/80 rounded-3xl p-6 shadow-2xl space-y-6">
            <h3 className="text-lg font-bold text-white">Historique de Reversements</h3>

            {isLoading ? (
              <div className="space-y-4">
                <div className="h-12 bg-slate-950/50 rounded-2xl animate-pulse" />
                <div className="h-12 bg-slate-950/50 rounded-2xl animate-pulse" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-800 text-left text-sm text-slate-300">
                  <thead>
                    <tr className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      <th className="py-3.5 px-4">ID Règlement</th>
                      <th className="py-3.5 px-4">Montant Net</th>
                      <th className="py-3.5 px-4">Frais Agglomérés</th>
                      <th className="py-3.5 px-4">Destination</th>
                      <th className="py-3.5 px-4">Statut</th>
                      <th className="py-3.5 px-4 text-right">Créé le</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850">
                    {settlements && settlements.length > 0 ? (
                      settlements.map((settlement: any) => (
                        <tr key={settlement.id} className="hover:bg-slate-850/25 transition">
                          <td className="py-4 px-4 font-mono text-xs text-white">{settlement.id.substring(0, 8)}...</td>
                          <td className="py-4 px-4 font-bold text-emerald-400">{formatXaf(settlement.amount)}</td>
                          <td className="py-4 px-4 text-xs text-slate-400">{formatXaf(settlement.feeTotal)}</td>
                          <td className="py-4 px-4 text-xs font-medium text-slate-300">
                            {settlement.payoutPhone ? (
                              <span className="flex items-center"><Phone className="h-3 w-3 mr-1 text-slate-500" /> {settlement.payoutPhone}</span>
                            ) : (
                              <span className="flex items-center"><Landmark className="h-3 w-3 mr-1 text-slate-500" /> {settlement.bankDetails?.bankName || 'Banque'}</span>
                            )}
                          </td>
                          <td className="py-4 px-4">
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold border ${
                              settlement.status === 'PROCESSED' 
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                                : settlement.status === 'PENDING'
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                            }`}>
                              {settlement.status}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-right text-xs text-slate-500 font-medium">
                            {new Date(settlement.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-500">
                          Aucun reversement demandé pour le moment.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
