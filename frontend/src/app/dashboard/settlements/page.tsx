'use client';

import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Coins, Landmark, Phone, Send, Loader2, AlertCircle, CheckCircle, Wallet, ShieldCheck, ArrowUpRight, X } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { apiClient } from '@/lib/api';

export default function SettlementsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
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
        if (!payoutPhone) throw new Error('Le numéro de téléphone de réception est requis.');
        payload.payoutPhone = payoutPhone;
      } else {
        if (!bankName || !accountName || !accountNumber) {
          throw new Error('Tous les champs du compte bancaire sont requis.');
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
      setTimeout(() => {
        setSuccess(false);
        setIsModalOpen(false);
      }, 2000);
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || err.message || 'Une erreur est survenue lors de la demande.');
    },
  });

  const formatXaf = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XAF', minimumFractionDigits: 0 }).format(amount);
  };

  const balance = dashboardStats?.metrics?.balance || 0;
  const pendingBalance = dashboardStats?.metrics?.pendingBalance || 0;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Règlements & Finance</h1>
            <p className="text-slate-400 mt-1">Transférez vos soldes sécurisés vers votre Mobile Money ou compte bancaire.</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm px-5 py-3 rounded-2xl shadow-lg shadow-indigo-600/20 transition-all duration-200"
          >
            <ArrowUpRight className="h-4.5 w-4.5" />
            Demander un Reversement
          </button>
        </div>

        {/* Financial Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-slate-900 border border-emerald-500/20 bg-gradient-to-br from-emerald-600/10 to-teal-600/5 flex items-center justify-between">
            <div className="space-y-2">
              <span className="text-sm font-semibold text-slate-400">Solde Disponible</span>
              <h3 className="text-3xl font-bold text-white tracking-tight">{formatXaf(balance)}</h3>
              <p className="text-xs text-slate-500">Prêt à être reversé immédiatement</p>
            </div>
            <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-emerald-400">
              <Wallet className="h-6 w-6" />
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900 border border-amber-500/20 bg-gradient-to-br from-amber-600/10 to-orange-600/5 flex items-center justify-between">
            <div className="space-y-2">
              <span className="text-sm font-semibold text-slate-400">Solde Bloqué / En cours</span>
              <h3 className="text-3xl font-bold text-white tracking-tight">{formatXaf(pendingBalance)}</h3>
              <p className="text-xs text-slate-500">Volume en attente de réconciliation</p>
            </div>
            <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-amber-400">
              <Coins className="h-6 w-6" />
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-2.5">
            <div>
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Conditions de Reversement</span>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Les virements Mobile Money (Airtel, Moov) sont traités sous 2 heures ouvrées. Les virements GIMAC/bancaires prennent 24 à 48 heures selon la banque de réception.
              </p>
            </div>
            <span className="text-[10px] text-slate-500 font-medium italic">Frais fixes par reversement : 0 FCFA</span>
          </div>
        </div>

        {/* Settlements History Table */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-3xl p-6 shadow-2xl space-y-6">
          <h3 className="text-lg font-bold text-white">Historique complet des reversements</h3>

          {isLoading ? (
            <div className="space-y-4 py-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-slate-950/50 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-800 text-left text-sm text-slate-300">
                <thead>
                  <tr className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    <th className="py-4 px-4">Référence</th>
                    <th className="py-4 px-4">Montant Net</th>
                    <th className="py-4 px-4">Commissions Agglomérées</th>
                    <th className="py-4 px-4">Destination</th>
                    <th className="py-4 px-4">Statut</th>
                    <th className="py-4 px-4 text-right">Date de demande</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {settlements && settlements.length > 0 ? (
                    settlements.map((settlement: any) => (
                      <tr key={settlement.id} className="hover:bg-slate-800/20 transition-all duration-150">
                        <td className="py-4 px-4 font-mono text-xs text-white font-semibold">
                          SET-{settlement.id.substring(0, 8).toUpperCase()}
                        </td>
                        <td className="py-4 px-4 font-bold text-emerald-400">{formatXaf(settlement.amount)}</td>
                        <td className="py-4 px-4 text-xs text-slate-400">{formatXaf(settlement.feeTotal)}</td>
                        <td className="py-4 px-4 text-xs text-slate-300">
                          {settlement.payoutPhone ? (
                            <span className="flex items-center gap-1.5">
                              <Phone className="h-3.5 w-3.5 text-slate-500" />
                              Mobile (+235) {settlement.payoutPhone}
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5">
                              <Landmark className="h-3.5 w-3.5 text-slate-500" />
                              {settlement.bankDetails?.bankName || 'Banque locale'}
                            </span>
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
                            {settlement.status === 'PROCESSED' ? 'Traitée' : 'En attente'}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right text-xs text-slate-500 font-medium">
                          {new Date(settlement.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-500">
                        Aucune demande de reversement enregistrée pour le moment.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Payout Request Modal Popup */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800/80 rounded-3xl p-6 sm:p-8 w-full max-w-lg shadow-2xl relative space-y-6">
            <button 
              onClick={() => {
                setError('');
                setSuccess(false);
                setIsModalOpen(false);
              }}
              className="absolute right-4 top-4 p-2 text-slate-400 hover:text-white bg-slate-950 border border-slate-850 rounded-xl transition"
            >
              <X className="h-5 w-5" />
            </button>

            <div>
              <h3 className="text-xl font-bold text-white">Créer un Ordre de Reversement</h3>
              <p className="text-xs text-slate-500 mt-1">Saisissez vos coordonnées financières pour virer votre solde disponible.</p>
            </div>

            <hr className="border-slate-800" />

            {success && (
              <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 flex items-start space-x-3 text-emerald-400 text-sm">
                <CheckCircle className="h-5 w-5 shrink-0 mt-0.5" />
                <span>Demande de reversement initiée avec succès ! Traitement sous 2h.</span>
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
                <label className="text-xs font-semibold text-slate-400">Numéro Airtel, Moov ou Orange</label>
                <input
                  type="text"
                  required
                  value={payoutPhone}
                  onChange={(e) => setPayoutPhone(e.target.value)}
                  placeholder="+235 66 12 34 56"
                  className="w-full bg-slate-950/80 border border-slate-800 text-white rounded-2xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400">Banque locale (ex. Ecobank Tchad, UBA)</label>
                  <input
                    type="text"
                    required
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="Ecobank Tchad"
                    className="w-full bg-slate-950/80 border border-slate-800 text-white rounded-2xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-400">Nom du compte</label>
                    <input
                      type="text"
                      required
                      value={accountName}
                      onChange={(e) => setAccountName(e.target.value)}
                      placeholder="E-Shop Sarl"
                      className="w-full bg-slate-950/80 border border-slate-800 text-white rounded-2xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-400">RIB / IBAN</label>
                    <input
                      type="text"
                      required
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      placeholder="TD92 30006 00010 12345678901 22"
                      className="w-full bg-slate-950/80 border border-slate-800 text-white rounded-2xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    />
                  </div>
                </div>
              </div>
            )}

            <hr className="border-slate-800" />

            <div className="flex justify-between items-center text-sm font-semibold">
              <span className="text-slate-400">Montant Reversé (Net)</span>
              <span className="text-emerald-400 text-base font-bold">{formatXaf(balance)}</span>
            </div>

            <button
              onClick={() => requestMutation.mutate()}
              disabled={requestMutation.isPending || balance <= 0}
              className="w-full inline-flex justify-center items-center py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-2xl shadow-lg transition duration-200 disabled:opacity-50"
            >
              {requestMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Confirmer et Initier le Virement
            </button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
