'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CreditCard, Search, Calendar, ChevronLeft, ChevronRight, X, User, ArrowRightLeft } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { apiClient } from '@/lib/api';

export default function PaymentsPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [method, setMethod] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;
  
  // Selected transaction for details modal
  const [selectedPayment, setSelectedPayment] = useState<any>(null);

  // Fetch payments
  const offset = (page - 1) * limit;
  const { data: paymentsData, isLoading, refetch } = useQuery({
    queryKey: ['payments', search, status, method, page],
    queryFn: async () => {
      const res = await apiClient.get('/dashboard/payments', {
        params: {
          search: search || undefined,
          status: status || undefined,
          method: method || undefined,
          limit,
          offset,
        },
      });
      return res.data;
    },
  });

  const formatXaf = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XAF', minimumFractionDigits: 0 }).format(amount);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1); // Reset page to 1
  };

  const handleFilterChange = (setter: any) => (e: React.ChangeEvent<HTMLSelectElement>) => {
    setter(e.target.value);
    setPage(1);
  };

  const totalPages = paymentsData ? Math.ceil(paymentsData.total / limit) : 0;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Transactions</h1>
            <p className="text-slate-400 mt-1">Recherchez et filtrez l'historique complet de vos encaissements.</p>
          </div>
        </div>

        {/* Filters grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-900/40 p-4 border border-slate-800 rounded-3xl backdrop-blur-xl">
          <div className="relative">
            <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Rechercher (Email, Tél, Réf)..."
              value={search}
              onChange={handleSearchChange}
              className="w-full bg-slate-950/80 border-slate-800 text-white rounded-2xl py-3 pl-10 pr-4 text-sm focus:ring-indigo-500"
            />
          </div>

          <div>
            <select
              value={status}
              onChange={handleFilterChange(setStatus)}
              className="w-full bg-slate-950/80 border-slate-800 text-slate-300 rounded-2xl py-3 px-4 text-sm focus:ring-indigo-500"
            >
              <option value="">Tous les Statuts</option>
              <option value="SUCCESS">Succès (SUCCESS)</option>
              <option value="PENDING">En attente (PENDING)</option>
              <option value="FAILED">Échoué (FAILED)</option>
              <option value="REFUNDED">Remboursé (REFUNDED)</option>
            </select>
          </div>

          <div>
            <select
              value={method}
              onChange={handleFilterChange(setMethod)}
              className="w-full bg-slate-950/80 border-slate-800 text-slate-300 rounded-2xl py-3 px-4 text-sm focus:ring-indigo-500"
            >
              <option value="">Tous les Canaux</option>
              <option value="AIRTEL_MONEY">Airtel Money Chad</option>
              <option value="ORANGE_MONEY">Orange Money Chad</option>
              <option value="MOOV_MONEY">Moov Money Chad</option>
              <option value="VISA">Carte Visa</option>
              <option value="MASTERCARD">Carte Mastercard</option>
            </select>
          </div>
        </div>

        {/* Table Ledger */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-3xl p-6 shadow-2xl">
          {isLoading ? (
            <div className="space-y-4 py-8">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-12 bg-slate-950/50 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-800 text-left text-sm text-slate-300">
                <thead>
                  <tr className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    <th className="py-3.5 px-4">Référence</th>
                    <th className="py-3.5 px-4">Client</th>
                    <th className="py-3.5 px-4">Canal</th>
                    <th className="py-3.5 px-4">Montant Brut</th>
                    <th className="py-3.5 px-4">Commission</th>
                    <th className="py-3.5 px-4">Net</th>
                    <th className="py-3.5 px-4">Statut</th>
                    <th className="py-3.5 px-4 text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {paymentsData?.data && paymentsData.data.length > 0 ? (
                    paymentsData.data.map((payment: any) => (
                      <tr 
                        key={payment.id} 
                        onClick={() => setSelectedPayment(payment)}
                        className="hover:bg-slate-850/50 cursor-pointer transition"
                      >
                        <td className="py-4 px-4 font-mono text-xs text-white font-semibold">{payment.merchantReference}</td>
                        <td className="py-4 px-4">
                          <div className="flex flex-col">
                            <span className="text-xs text-slate-300 font-semibold">{payment.customerEmail}</span>
                            <span className="text-xs text-slate-500">{payment.customerPhone || 'N/A'}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="inline-flex items-center rounded-lg bg-slate-950 px-2 py-0.5 text-xs border border-slate-800 font-semibold text-slate-400">
                            {payment.paymentMethod}
                          </span>
                        </td>
                        <td className="py-4 px-4 font-bold text-white">{formatXaf(payment.amount)}</td>
                        <td className="py-4 px-4 text-xs text-rose-400 font-semibold">-{formatXaf(payment.fee)}</td>
                        <td className="py-4 px-4 font-bold text-emerald-400">{formatXaf(payment.netAmount)}</td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-extrabold border ${
                            payment.status === 'SUCCESS' 
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                              : payment.status === 'PENDING'
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                              : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          }`}>
                            {payment.status}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right text-xs text-slate-500 font-medium">
                          {new Date(payment.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-500">
                        Aucune transaction ne correspond à vos filtres.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-800 pt-6 mt-6">
              <span className="text-xs text-slate-500 font-medium">
                Page {page} sur {totalPages} (Total: {paymentsData?.total} transactions)
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="p-2 border border-slate-800 rounded-xl text-slate-400 hover:text-white disabled:opacity-40 transition"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                  className="p-2 border border-slate-800 rounded-xl text-slate-400 hover:text-white disabled:opacity-40 transition"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Transaction Details Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800/80 rounded-3xl p-6 sm:p-8 w-full max-w-lg shadow-2xl relative space-y-6">
            <button 
              onClick={() => setSelectedPayment(null)}
              className="absolute right-4 top-4 p-2 text-slate-400 hover:text-white bg-slate-950 border border-slate-800 rounded-xl transition"
            >
              <X className="h-5 w-5" />
            </button>

            <div>
              <h3 className="text-xl font-bold text-white">Détails de la Transaction</h3>
              <p className="text-xs text-slate-500 mt-1">Identifiant système: {selectedPayment.id}</p>
            </div>

            <hr className="border-slate-800" />

            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-slate-400 font-medium">Référence Marchand</span>
                <span className="text-sm font-mono text-white font-semibold">{selectedPayment.merchantReference}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm text-slate-400 font-medium">Client</span>
                <div className="text-right">
                  <p className="text-sm text-white font-semibold">{selectedPayment.customerEmail}</p>
                  <p className="text-xs text-slate-500">{selectedPayment.customerPhone || 'N/A'}</p>
                </div>
              </div>

              <div className="flex justify-between">
                <span className="text-sm text-slate-400 font-medium">Canal de Règlement</span>
                <span className="text-sm font-semibold text-slate-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">{selectedPayment.paymentMethod}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm text-slate-400 font-medium">Statut de la Transaction</span>
                <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold border ${
                  selectedPayment.status === 'SUCCESS' 
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                    : selectedPayment.status === 'PENDING'
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                }`}>
                  {selectedPayment.status}
                </span>
              </div>

              <hr className="border-slate-800" />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Montant Brut</span>
                  <span className="text-white font-semibold">{formatXaf(selectedPayment.amount)}</span>
                </div>
                <div className="flex justify-between text-sm text-rose-400">
                  <span>Frais de commission (Innov Pay)</span>
                  <span>-{formatXaf(selectedPayment.fee)}</span>
                </div>
                <div className="flex justify-between text-base font-bold border-t border-slate-850 pt-2">
                  <span className="text-slate-200">Montant Net Crédité</span>
                  <span className="text-emerald-400">{formatXaf(selectedPayment.netAmount)}</span>
                </div>
              </div>

              {selectedPayment.metadata && Object.keys(selectedPayment.metadata).length > 0 && (
                <>
                  <hr className="border-slate-800" />
                  <div>
                    <span className="text-xs text-slate-500 block mb-1">Métadonnées Supplémentaires</span>
                    <pre className="p-3 bg-slate-950 rounded-xl border border-slate-850 font-mono text-[10px] text-indigo-400 overflow-x-auto">
                      {JSON.stringify(selectedPayment.metadata, null, 2)}
                    </pre>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
