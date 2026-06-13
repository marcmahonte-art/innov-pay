'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CreditCard, Search, Calendar, ChevronLeft, ChevronRight, X, User, ArrowRightLeft, Download, Clipboard, Check, RefreshCw } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { apiClient } from '@/lib/api';

export default function PaymentsPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [method, setMethod] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;
  
  // Selected transaction for details side drawer
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [refunding, setRefunding] = useState(false);

  // Fetch payments
  const offset = (page - 1) * limit;
  const { data: paymentsData, isLoading, refetch } = useQuery({
    queryKey: ['payments', search, status, method, startDate, endDate, page],
    queryFn: async () => {
      const res = await apiClient.get('/dashboard/payments', {
        params: {
          search: search || undefined,
          status: status || undefined,
          method: method || undefined,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
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
    setPage(1);
  };

  const handleFilterChange = (setter: any) => (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    setter(e.target.value);
    setPage(1);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportCsv = () => {
    if (!paymentsData?.data || paymentsData.data.length === 0) {
      alert('Aucune transaction disponible pour l\'export.');
      return;
    }

    const headers = ['ID', 'Reference Marchand', 'Client Email', 'Client Tel', 'Methode', 'Montant Brut', 'Commission', 'Net', 'Statut', 'Date Creation'];
    const rows = paymentsData.data.map((p: any) => [
      p.id,
      p.merchantReference,
      p.customerEmail,
      p.customerPhone || '',
      p.paymentMethod,
      p.amount,
      p.fee,
      p.netAmount,
      p.status,
      p.createdAt,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((r: any) => r.map((val: any) => `"${String(val).replace(/"/g, '""')}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `innovpay_exports_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRefund = async (paymentId: string) => {
    if (!window.confirm('Voulez-vous vraiment rembourser cette transaction ? Les fonds seront déduits de votre solde.')) {
      return;
    }
    setRefunding(true);
    try {
      await apiClient.post(`/payments/${paymentId}/refund`);
      alert('Remboursement initié avec succès !');
      refetch();
      setSelectedPayment(null);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erreur lors du remboursement');
    } finally {
      setRefunding(false);
    }
  };

  const totalPages = paymentsData ? Math.ceil(paymentsData.total / limit) : 0;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Transactions</h1>
            <p className="text-slate-400 mt-1">Recherchez, filtrez et exportez vos transactions en temps réel.</p>
          </div>
          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm px-5 py-3 rounded-2xl shadow-lg shadow-indigo-600/20 transition-all duration-200"
          >
            <Download className="h-4 w-4" />
            Exporter en CSV
          </button>
        </div>

        {/* Filters grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 bg-slate-900/40 p-4 border border-slate-800/80 rounded-3xl backdrop-blur-xl">
          <div className="relative">
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Rechercher (Email, Tél, Réf)..."
              value={search}
              onChange={handleSearchChange}
              className="w-full bg-slate-950/80 border border-slate-800 text-white rounded-2xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>

          <div>
            <select
              value={status}
              onChange={handleFilterChange(setStatus)}
              className="w-full bg-slate-950/80 border border-slate-800 text-slate-300 rounded-2xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
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
              className="w-full bg-slate-950/80 border border-slate-800 text-slate-300 rounded-2xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            >
              <option value="">Tous les Canaux</option>
              <option value="AIRTEL_MONEY">Airtel Money</option>
              <option value="ORANGE_MONEY">Orange Money</option>
              <option value="MOOV_MONEY">Moov Money</option>
              <option value="VISA">Carte Visa</option>
              <option value="MASTERCARD">Carte Mastercard</option>
            </select>
          </div>

          <div className="relative">
            <input
              type="date"
              value={startDate}
              onChange={handleFilterChange(setStartDate)}
              className="w-full bg-slate-950/80 border border-slate-800 text-slate-300 rounded-2xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              title="Date de début"
            />
          </div>

          <div className="relative">
            <input
              type="date"
              value={endDate}
              onChange={handleFilterChange(setEndDate)}
              className="w-full bg-slate-950/80 border border-slate-800 text-slate-300 rounded-2xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              title="Date de fin"
            />
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
                    <th className="py-4 px-4">Référence</th>
                    <th className="py-4 px-4">Client</th>
                    <th className="py-4 px-4">Canal</th>
                    <th className="py-4 px-4">Brut</th>
                    <th className="py-4 px-4">Commission</th>
                    <th className="py-4 px-4">Net</th>
                    <th className="py-4 px-4">Statut</th>
                    <th className="py-4 px-4 text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {paymentsData?.data && paymentsData.data.length > 0 ? (
                    paymentsData.data.map((payment: any) => (
                      <tr 
                        key={payment.id} 
                        onClick={() => setSelectedPayment(payment)}
                        className="hover:bg-slate-800/40 cursor-pointer transition-all duration-150"
                      >
                        <td className="py-4 px-4 font-mono text-xs text-white font-semibold">{payment.merchantReference}</td>
                        <td className="py-4 px-4">
                          <div className="flex flex-col">
                            <span className="text-xs text-slate-300 font-semibold">{payment.customerEmail}</span>
                            <span className="text-xs text-slate-500">{payment.customerPhone || 'N/A'}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="inline-flex items-center rounded-lg bg-slate-950 px-2 py-0.5 text-[11px] border border-slate-800 font-medium text-slate-400">
                            {payment.paymentMethod}
                          </span>
                        </td>
                        <td className="py-4 px-4 font-bold text-white">{formatXaf(payment.amount)}</td>
                        <td className="py-4 px-4 text-xs text-rose-400">-{formatXaf(payment.fee)}</td>
                        <td className="py-4 px-4 font-bold text-emerald-400">{formatXaf(payment.netAmount)}</td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold border ${
                            payment.status === 'SUCCESS' 
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                              : payment.status === 'PENDING'
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                              : payment.status === 'REFUNDED'
                              ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
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
                      <td colSpan={8} className="py-12 text-center text-slate-500">
                        Aucune transaction enregistrée.
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

      {/* Transaction Details Sliding Side Drawer */}
      {selectedPayment && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-sm transition-all duration-300">
          <div className="absolute inset-0 cursor-pointer" onClick={() => setSelectedPayment(null)} />
          
          <div className="relative w-full max-w-md bg-slate-900 border-l border-slate-800 h-full flex flex-col justify-between shadow-2xl p-6 sm:p-8 space-y-6 overflow-y-auto">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">Détails de la Transaction</h3>
                <button 
                  onClick={() => setSelectedPayment(null)}
                  className="p-2 text-slate-400 hover:text-white bg-slate-950 border border-slate-850 rounded-xl transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <p className="text-[11px] font-mono text-slate-500 mt-2">UUID: {selectedPayment.id}</p>
            </div>

            <hr className="border-slate-800" />

            <div className="space-y-5 flex-1">
              <div className="flex justify-between items-center bg-slate-950 p-3.5 rounded-2xl border border-slate-850">
                <div>
                  <span className="text-[11px] text-slate-500 block">Référence Marchand</span>
                  <span className="text-sm font-mono text-white font-semibold">{selectedPayment.merchantReference}</span>
                </div>
                <button
                  onClick={() => copyToClipboard(selectedPayment.merchantReference, 'ref')}
                  className="p-1.5 text-slate-400 hover:text-white rounded"
                >
                  {copiedId === 'ref' ? <Check className="h-4 w-4 text-emerald-400" /> : <Clipboard className="h-4 w-4" />}
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-400">Client</span>
                  <div className="text-right">
                    <p className="text-sm text-white font-medium">{selectedPayment.customerEmail}</p>
                    <p className="text-xs text-slate-500">{selectedPayment.customerPhone || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-slate-400">Mode de Règlement</span>
                  <span className="text-xs font-semibold text-slate-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                    {selectedPayment.paymentMethod}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-slate-400">Statut</span>
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold border ${
                    selectedPayment.status === 'SUCCESS' 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                      : selectedPayment.status === 'PENDING'
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      : selectedPayment.status === 'REFUNDED'
                      ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                      : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                  }`}>
                    {selectedPayment.status}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-slate-400">Date</span>
                  <span className="text-sm text-slate-300 font-medium">
                    {new Date(selectedPayment.createdAt).toLocaleString('fr-FR')}
                  </span>
                </div>
              </div>

              <hr className="border-slate-850" />

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850 space-y-2.5">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Montant Brut</span>
                  <span>{formatXaf(selectedPayment.amount)}</span>
                </div>
                <div className="flex justify-between text-xs text-rose-400">
                  <span>Commission (Innov Pay)</span>
                  <span>-{formatXaf(selectedPayment.fee)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-white border-t border-slate-850 pt-2">
                  <span>Montant Net</span>
                  <span className="text-emerald-400">{formatXaf(selectedPayment.netAmount)}</span>
                </div>
              </div>

              {selectedPayment.status === 'SUCCESS' && (
                <button
                  onClick={() => handleRefund(selectedPayment.id)}
                  disabled={refunding}
                  className="w-full inline-flex items-center justify-center gap-2 bg-rose-950/40 border border-rose-900/50 hover:bg-rose-900/20 text-rose-400 text-sm font-semibold py-3 px-4 rounded-2xl transition"
                >
                  <RefreshCw className={`h-4 w-4 ${refunding ? 'animate-spin' : ''}`} />
                  Rembourser la transaction
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
