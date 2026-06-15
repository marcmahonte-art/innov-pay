'use client';

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, ChevronLeft, ChevronRight, X, Clipboard, Check, RefreshCw, Download } from 'lucide-react';
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
  const [hideBalances, setHideBalances] = useState(false);
  const [isSandbox, setIsSandbox] = useState(false);

  // Sync balance hiding state from localStorage
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

  // Fetch payments
  const offset = (page - 1) * limit;
  const { data: paymentsData, isLoading, refetch } = useQuery({
    queryKey: ['payments', search, status, method, startDate, endDate, page, isSandbox],
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
          isLive: !isSandbox,
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
      <div className="space-y-6">
        
        {/* Sandbox Warning Banner */}
        {isSandbox && (
          <div className="bg-amber-500/10 border border-amber-500/20 text-[#ea580c] rounded-2xl p-4 flex items-center space-x-3 text-xs select-none">
            <span className="font-extrabold uppercase tracking-wider bg-[#ea580c] text-white px-2 py-0.5 rounded-lg text-[9px]">Mode Test</span>
            <span>Vous visualisez des données factices de simulation. Les paiements réels ne sont pas débités.</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-[#00103e] tracking-tight">Transactions</h1>
            <p className="text-[#5c6470] text-sm">Recherchez, filtrez et exportez vos transactions en temps réel.</p>
          </div>
          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-2 bg-[#0a2463] hover:bg-[#1a3a72] text-white font-semibold text-sm px-5 py-3 rounded-xl shadow-md transition-base"
          >
            <Download className="h-4 w-4" />
            Exporter en CSV
          </button>
        </div>

        {/* Filters grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 bg-white p-4 border border-[#e2e5ea] rounded-2xl shadow-card">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-[#8b919d]" />
            <input
              type="text"
              placeholder="Rechercher (Email, Tél, Réf)..."
              value={search}
              onChange={handleSearchChange}
              className="w-full bg-[#f5f7fa] border border-[#e2e5ea] text-[#0f1214] rounded-xl py-2 pl-9 pr-4 text-sm focus:outline-none focus:border-[#0a2463] transition"
            />
          </div>

          <div>
            <select
              value={status}
              onChange={handleFilterChange(setStatus)}
              className="w-full bg-[#f5f7fa] border border-[#e2e5ea] text-[#3c3f4a] rounded-xl py-2 px-3 text-sm focus:outline-none focus:border-[#0a2463] transition"
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
              className="w-full bg-[#f5f7fa] border border-[#e2e5ea] text-[#3c3f4a] rounded-xl py-2 px-3 text-sm focus:outline-none focus:border-[#0a2463] transition"
            >
              <option value="">Tous les Canaux</option>
              <option value="AIRTEL_MONEY">Airtel Money</option>
              <option value="KONOOM_MONEY">Konoom Mobile Money</option>
              <option value="MOOV_MONEY">Moov Money</option>
              <option value="VISA">Carte Visa</option>
              <option value="MASTERCARD">Carte Mastercard</option>
            </select>
          </div>

          <div>
            <input
              type="date"
              value={startDate}
              onChange={handleFilterChange(setStartDate)}
              className="w-full bg-[#f5f7fa] border border-[#e2e5ea] text-[#3c3f4a] rounded-xl py-2 px-3 text-sm focus:outline-none focus:border-[#0a2463] transition"
              title="Date de début"
            />
          </div>

          <div>
            <input
              type="date"
              value={endDate}
              onChange={handleFilterChange(setEndDate)}
              className="w-full bg-[#f5f7fa] border border-[#e2e5ea] text-[#3c3f4a] rounded-xl py-2 px-3 text-sm focus:outline-none focus:border-[#0a2463] transition"
              title="Date de fin"
            />
          </div>
        </div>

        {/* Table Ledger */}
        <div className="bg-white border border-[#e2e5ea] rounded-2xl p-6 shadow-card">
          {isLoading ? (
            <div className="space-y-4 py-8 animate-pulse">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-12 bg-[#f0f2f5] rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[#e2e5ea] text-left text-sm text-[#3c3f4a]">
                <thead>
                  <tr className="text-xs font-bold text-[#5c6470] uppercase tracking-wider">
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
                <tbody className="divide-y divide-[#e2e5ea]">
                  {paymentsData?.data && paymentsData.data.length > 0 ? (
                    paymentsData.data.map((payment: any) => (
                      <tr 
                        key={payment.id} 
                        onClick={() => setSelectedPayment(payment)}
                        className="hover:bg-[#f0f2f5] cursor-pointer transition-all duration-150"
                      >
                        <td className="py-4 px-4 font-mono text-xs text-[#00103e] font-semibold">{payment.merchantReference}</td>
                        <td className="py-4 px-4">
                          <div className="flex flex-col">
                            <span className="text-xs font-semibold text-[#0f1214]">{payment.customerEmail}</span>
                            <span className="text-xs text-[#5c6470]">{payment.customerPhone || 'N/A'}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="inline-flex items-center rounded-lg bg-[#f0f2f5] px-2 py-0.5 text-[11px] border border-[#e2e5ea] font-medium text-[#3c3f4a]">
                            {payment.paymentMethod === 'KONOOM_MONEY' ? 'Konoom Mobile Money' : payment.paymentMethod}
                          </span>
                        </td>
                        <td className="py-4 px-4 font-bold text-[#0f1214] tabular-nums">
                          {hideBalances ? '••••••' : formatXaf(payment.amount)}
                        </td>
                        <td className="py-4 px-4 text-xs text-[#B91C1C] tabular-nums">
                          {hideBalances ? '••••••' : `-${formatXaf(payment.fee)}`}
                        </td>
                        <td className="py-4 px-4 font-bold text-[#15803D] tabular-nums">
                          {hideBalances ? '••••••' : formatXaf(payment.netAmount)}
                        </td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold border ${
                            payment.status === 'SUCCESS' 
                              ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20' 
                              : payment.status === 'PENDING'
                              ? 'bg-amber-500/10 text-amber-750 border-amber-500/20'
                              : payment.status === 'REFUNDED'
                              ? 'bg-indigo-500/10 text-indigo-700 border-indigo-500/20'
                              : 'bg-rose-500/10 text-rose-700 border-rose-500/20'
                          }`}>
                            {payment.status === 'SUCCESS' ? 'Succès' : payment.status === 'PENDING' ? 'En attente' : payment.status === 'REFUNDED' ? 'Remboursé' : 'Échoué'}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right text-xs text-[#8b919d] font-medium">
                          {new Date(payment.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-[#8b919d]">
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
            <div className="flex items-center justify-between border-t border-[#e2e5ea] pt-6 mt-6">
              <span className="text-xs text-[#8b919d] font-medium">
                Page {page} sur {totalPages} (Total: {paymentsData?.total} transactions)
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="p-2 border border-[#e2e5ea] rounded-xl text-[#8b919d] hover:bg-[#f0f2f5] disabled:opacity-40 transition"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                  className="p-2 border border-[#e2e5ea] rounded-xl text-[#8b919d] hover:bg-[#f0f2f5] disabled:opacity-40 transition"
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
          
          <div className="relative w-full max-w-md bg-white border-l border-[#e2e5ea] h-full flex flex-col justify-between shadow-modal p-6 sm:p-8 space-y-6 overflow-y-auto">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-[#00103e]">Détails de la Transaction</h3>
                <button 
                  onClick={() => setSelectedPayment(null)}
                  className="p-2 text-[#5c6470] hover:text-[#00103e] bg-[#f5f7fa] border border-[#e2e5ea] rounded-xl transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <p className="text-[11px] font-mono text-[#8b919d] mt-2">UUID: {selectedPayment.id}</p>
            </div>

            <hr className="border-[#e2e5ea]" />

            <div className="space-y-5 flex-1">
              <div className="flex justify-between items-center bg-[#f5f7fa] p-3.5 rounded-2xl border border-[#e2e5ea]">
                <div>
                  <span className="text-[11px] text-[#8b919d] block">Référence Marchand</span>
                  <span className="text-sm font-mono text-[#00103e] font-semibold">{selectedPayment.merchantReference}</span>
                </div>
                <button
                  onClick={() => copyToClipboard(selectedPayment.merchantReference, 'ref')}
                  className="p-1.5 text-[#5c6470] hover:text-[#00103e] rounded"
                >
                  {copiedId === 'ref' ? <Check className="h-4 w-4 text-emerald-600" /> : <Clipboard className="h-4 w-4" />}
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-[#5c6470]">Client</span>
                  <div className="text-right">
                    <p className="text-sm text-[#0f1214] font-medium">{selectedPayment.customerEmail}</p>
                    <p className="text-xs text-[#8b919d]">{selectedPayment.customerPhone || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-[#5c6470]">Mode de Règlement</span>
                  <span className="text-xs font-semibold text-[#3c3f4a] bg-[#f0f2f5] px-2 py-0.5 rounded border border-[#e2e5ea]">
                    {selectedPayment.paymentMethod === 'KONOOM_MONEY' ? 'Konoom Mobile Money' : selectedPayment.paymentMethod}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-[#5c6470]">Statut</span>
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold border ${
                    selectedPayment.status === 'SUCCESS' 
                      ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20' 
                      : selectedPayment.status === 'PENDING'
                      ? 'bg-amber-500/10 text-amber-700 border-amber-500/20'
                      : selectedPayment.status === 'REFUNDED'
                      ? 'bg-indigo-500/10 text-indigo-700 border-indigo-500/20'
                      : 'bg-rose-500/10 text-rose-700 border-rose-500/20'
                  }`}>
                    {selectedPayment.status === 'SUCCESS' ? 'Succès' : selectedPayment.status === 'PENDING' ? 'En attente' : selectedPayment.status === 'REFUNDED' ? 'Remboursé' : 'Échoué'}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-[#5c6470]">Date</span>
                  <span className="text-sm text-[#0f1214] font-medium">
                    {new Date(selectedPayment.createdAt).toLocaleString('fr-FR')}
                  </span>
                </div>
              </div>

              <hr className="border-[#e2e5ea]" />

              <div className="bg-[#f5f7fa] p-4 rounded-2xl border border-[#e2e5ea] space-y-2.5">
                <div className="flex justify-between text-xs text-[#5c6470]">
                  <span>Montant Brut</span>
                  <span>{hideBalances ? '••••••' : formatXaf(selectedPayment.amount)}</span>
                </div>
                <div className="flex justify-between text-xs text-[#B91C1C]">
                  <span>Commission (Innov Pay)</span>
                  <span>{hideBalances ? '••••••' : `-${formatXaf(selectedPayment.fee)}`}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-[#0f1214] border-t border-[#e2e5ea] pt-2">
                  <span>Montant Net</span>
                  <span className="text-emerald-600">{hideBalances ? '••••••' : formatXaf(selectedPayment.netAmount)}</span>
                </div>
              </div>

              {selectedPayment.status === 'SUCCESS' && (
                <button
                  onClick={() => handleRefund(selectedPayment.id)}
                  disabled={refunding}
                  className="w-full inline-flex items-center justify-center gap-2 bg-rose-50 border border-rose-250 hover:bg-rose-100/50 text-rose-600 text-sm font-semibold py-3 px-4 rounded-xl transition"
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

