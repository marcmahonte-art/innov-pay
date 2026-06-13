'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Send, Plus, Trash2, CheckCircle2, XCircle, RefreshCw, Layers } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { apiClient } from '@/lib/api';

interface RecipientItem {
  recipientPhone: string;
  recipientName: string;
  amount: number;
  provider: string;
}

export default function BulkPayoutsPage() {
  const [items, setItems] = useState<RecipientItem[]>([]);
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);

  // Recipient form inputs
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [provider, setProvider] = useState('airtel_money');
  const [hideBalances, setHideBalances] = useState(false);

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

  // Fetch past batches
  const { data: batches, isLoading, refetch } = useQuery({
    queryKey: ['bulkPayouts'],
    queryFn: async () => {
      const res = await apiClient.get('/dashboard/bulk-payouts');
      return res.data;
    },
  });

  // Fetch active batch details
  const { data: selectedBatch, isLoading: isDetailsLoading } = useQuery({
    queryKey: ['bulkPayoutDetails', selectedBatchId],
    queryFn: async () => {
      if (!selectedBatchId) return null;
      const res = await apiClient.get(`/dashboard/bulk-payouts/${selectedBatchId}`);
      return res.data;
    },
    enabled: !!selectedBatchId,
  });

  // Create and Execute Mutation
  const runPayoutMutation = useMutation({
    mutationFn: async () => {
      // 1. Create bulk payout draft
      const draftRes = await apiClient.post('/dashboard/bulk-payouts', {
        items,
        currency: 'XAF',
      });
      const batchId = draftRes.data.id;

      // 2. Execute bulk payout
      const execRes = await apiClient.post(`/dashboard/bulk-payouts/${batchId}/execute`);
      return execRes.data;
    },
    onSuccess: (data) => {
      alert('Paiement de masse exécuté !');
      setItems([]);
      setSelectedBatchId(data.id);
      refetch();
    },
    onError: (err: any) => {
      alert(`Erreur d'exécution: ${err.response?.data?.message || err.message}`);
    },
  });

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !amount) return;

    setItems([
      ...items,
      {
        recipientPhone: phone,
        recipientName: name || 'Bénéficiaire',
        amount: parseFloat(amount),
        provider: provider.toUpperCase(),
      },
    ]);

    setPhone('');
    setName('');
    setAmount('');
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, idx) => idx !== index));
  };

  const totalBatchAmount = items.reduce((sum, item) => sum + item.amount, 0);

  const formatXaf = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XAF', minimumFractionDigits: 0 }).format(amount);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-[#00103e] tracking-tight">Paiement de Masse</h1>
          <p className="text-[#5c6470] text-sm">Envoyez des fonds simultanément à des dizaines de bénéficiaires par Airtel Money, Moov ou Konoom Mobile Money.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form and Preview */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-[#e2e5ea] rounded-2xl p-6 shadow-card">
              <h3 className="text-lg font-bold text-[#00103e] mb-6">Ajouter un bénéficiaire</h3>
              
              <form onSubmit={handleAddItem} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#5c6470] uppercase tracking-wider mb-2">Téléphone</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+235 60 00 00 00"
                    className="w-full bg-[#f5f7fa] border border-[#e2e5ea] text-[#0f1214] rounded-xl py-2 px-3 text-sm focus:outline-none focus:border-[#0a2463] transition font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#5c6470] uppercase tracking-wider mb-2">Nom complet (facultatif)</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="ex: Jean Dupont"
                    className="w-full bg-[#f5f7fa] border border-[#e2e5ea] text-[#0f1214] rounded-xl py-2 px-3 text-sm focus:outline-none focus:border-[#0a2463] transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#5c6470] uppercase tracking-wider mb-2">Montant (FCFA)</label>
                  <input
                    type="number"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="ex: 5000"
                    className="w-full bg-[#f5f7fa] border border-[#e2e5ea] text-[#0f1214] rounded-xl py-2 px-3 text-sm focus:outline-none focus:border-[#0a2463] transition font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#5c6470] uppercase tracking-wider mb-2">Opérateur / Provider</label>
                  <select
                    value={provider}
                    onChange={(e) => setProvider(e.target.value)}
                    className="w-full bg-[#f5f7fa] border border-[#e2e5ea] text-[#3c3f4a] rounded-xl py-2 px-3 text-sm focus:outline-none focus:border-[#0a2463] transition"
                  >
                    <option value="airtel_money">Airtel Money</option>
                    <option value="moov_money">Moov Money</option>
                    <option value="konoom_money">Konoom Mobile Money (Tchad)</option>
                  </select>
                </div>

                <div className="md:col-span-2 flex justify-end pt-2">
                  <button
                    type="submit"
                    className="flex items-center justify-center bg-[#f0f2f5] hover:bg-[#e4e7ea] text-[#00103e] border border-[#e2e5ea] font-bold py-2.5 px-5 rounded-xl text-sm transition shrink-0"
                  >
                    <Plus className="h-4 w-4 mr-2 text-[#ea580c]" />
                    Ajouter au batch
                  </button>
                </div>
              </form>
            </div>

            {/* Current Batch Preview */}
            <div className="bg-white border border-[#e2e5ea] rounded-2xl p-6 shadow-card">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-[#00103e]">Batch en cours d'envoi</h3>
                  <p className="text-xs text-[#8b919d] mt-1">{items.length} bénéficiaire(s) ajouté(s)</p>
                </div>
                {items.length > 0 && (
                  <div className="text-right">
                    <span className="text-xs text-[#5c6470]">Total :</span>
                    <h4 className="text-lg font-extrabold text-[#0a2463] tabular-nums">
                      {hideBalances ? '••••••' : `${totalBatchAmount.toLocaleString('fr-FR')} FCFA`}
                    </h4>
                  </div>
                )}
              </div>

              {items.length > 0 ? (
                <div className="space-y-4">
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm text-[#3c3f4a]">
                      <thead>
                        <tr className="text-xs font-semibold text-[#5c6470] uppercase tracking-wider border-b border-[#e2e5ea] pb-2">
                          <th className="py-2.5">Téléphone</th>
                          <th className="py-2.5">Nom</th>
                          <th className="py-2.5">Opérateur</th>
                          <th className="py-2.5">Montant</th>
                          <th className="py-2.5 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#e2e5ea]">
                        {items.map((item, index) => (
                          <tr key={index} className="hover:bg-[#f0f2f5]">
                            <td className="py-3 font-mono text-xs text-[#0f1214] font-semibold">{item.recipientPhone}</td>
                            <td className="py-3 text-[#0f1214] font-medium">{item.recipientName}</td>
                            <td className="py-3 text-xs">
                              <span className="bg-[#f0f2f5] text-[#3c3f4a] px-2 py-0.5 rounded border border-[#e2e5ea] font-medium">
                                {item.provider === 'KONOOM_MONEY' ? 'KONOOM' : item.provider}
                              </span>
                            </td>
                            <td className="py-3 font-bold text-[#0f1214] tabular-nums">
                              {hideBalances ? '••••••' : `${item.amount.toLocaleString('fr-FR')} FCFA`}
                            </td>
                            <td className="py-3 text-right">
                              <button
                                onClick={() => handleRemoveItem(index)}
                                className="p-1.5 text-[#B91C1C] hover:text-white bg-[#ffdad6]/40 border border-[#ffdad6] hover:bg-[#B91C1C] rounded-lg transition"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="pt-4 border-t border-[#e2e5ea] flex justify-end">
                    <button
                      onClick={() => runPayoutMutation.mutate()}
                      disabled={runPayoutMutation.isPending}
                      className="flex items-center justify-center bg-[#0a2463] hover:bg-[#1a3a72] text-white font-bold py-3 px-6 rounded-xl text-sm transition shadow-md"
                    >
                      {runPayoutMutation.isPending ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Traitement en cours...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Lancer le Paiement de Masse ({hideBalances ? '••••••' : `${totalBatchAmount.toLocaleString('fr-FR')} FCFA`})
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center text-[#8b919d] text-sm">
                  Votre liste de bénéficiaires est vide. Utilisez le formulaire pour en ajouter.
                </div>
              )}
            </div>
          </div>

          {/* Past Batches List */}
          <div className="bg-white border border-[#e2e5ea] rounded-2xl p-6 shadow-card space-y-6">
            <h3 className="text-lg font-bold text-[#00103e] flex items-center">
              <Layers className="h-5 w-5 text-[#ea580c] mr-2" />
              Historique des Batches
            </h3>

            {isLoading ? (
              <div className="space-y-3 animate-pulse">
                <div className="h-14 bg-[#f0f2f5] rounded-xl" />
                <div className="h-14 bg-[#f0f2f5] rounded-xl" />
              </div>
            ) : batches && batches.length > 0 ? (
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                {batches.map((batch: any) => (
                  <div
                    key={batch.id}
                    onClick={() => setSelectedBatchId(batch.id)}
                    className={`p-4 rounded-xl border text-left cursor-pointer transition ${
                      selectedBatchId === batch.id
                        ? 'bg-[#0a2463]/5 border-[#0a2463]'
                        : 'bg-[#f5f7fa] border-[#e2e5ea] hover:border-[#8b919d]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono text-[#8b919d]">{batch.id.substring(0, 8)}...</span>
                      <span className={`inline-flex items-center rounded-lg px-2 py-0.5 text-[10px] font-bold border ${
                        batch.status === 'COMPLETED'
                          ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20'
                          : batch.status === 'PROCESSING'
                          ? 'bg-amber-500/10 text-amber-700 border-amber-500/20 animate-pulse'
                          : 'bg-rose-500/10 text-rose-700 border-rose-500/20'
                      }`}>
                        {batch.status === 'COMPLETED' ? 'Terminé' : batch.status === 'PROCESSING' ? 'En cours' : 'Échoué'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-[#00103e] tabular-nums">
                          {hideBalances ? '••••••' : `${parseFloat(batch.totalAmount).toLocaleString('fr-FR')} ${batch.currency}`}
                        </h4>
                        <p className="text-[10px] text-[#8b919d] mt-0.5">
                          {new Date(batch.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] block text-[#8b919d]">Succès / Échecs</span>
                        <span className="text-xs font-bold text-[#3c3f4a]">{batch.successCount} / {batch.failedCount}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-[#8b919d] text-sm">
                Aucun batch exécuté pour le moment.
              </div>
            )}
          </div>
        </div>

        {/* Selected Batch Details Modal */}
        {selectedBatchId && selectedBatch && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <div className="bg-white border border-[#e2e5ea] rounded-2xl w-full max-w-3xl p-6 shadow-modal space-y-6 max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-[#00103e]">Rapport du Batch de Paiement</h3>
                  <p className="text-xs font-mono text-[#8b919d] mt-1">ID: {selectedBatch.id}</p>
                </div>
                <button onClick={() => setSelectedBatchId(null)} className="text-[#5c6470] hover:text-[#00103e] font-bold text-xl">&times;</button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-[#f5f7fa] border border-[#e2e5ea] p-4 rounded-xl">
                <div>
                  <span className="text-xs text-[#5c6470]">Montant total</span>
                  <h4 className="text-base font-bold text-[#00103e] tabular-nums">
                    {hideBalances ? '••••••' : `${parseFloat(selectedBatch.totalAmount).toLocaleString('fr-FR')} FCFA`}
                  </h4>
                </div>
                <div>
                  <span className="text-xs text-[#5c6470]">Frais Innov Pay</span>
                  <h4 className="text-base font-bold text-[#ea580c] tabular-nums">
                    {hideBalances ? '••••••' : `${parseFloat(selectedBatch.totalFees).toLocaleString('fr-FR')} FCFA`}
                  </h4>
                </div>
                <div>
                  <span className="text-xs text-[#5c6470]">Succès</span>
                  <h4 className="text-base font-bold text-[#15803D] flex items-center">
                    <CheckCircle2 className="h-4 w-4 mr-1 shrink-0" />
                    {selectedBatch.successCount}
                  </h4>
                </div>
                <div>
                  <span className="text-xs text-[#5c6470]">Échecs (remboursés)</span>
                  <h4 className="text-base font-bold text-[#B91C1C] flex items-center">
                    <XCircle className="h-4 w-4 mr-1 shrink-0" />
                    {selectedBatch.failedCount}
                  </h4>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-bold text-[#00103e]">Lignes individuelles</h4>
                <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
                  <table className="min-w-full text-left text-xs text-[#3c3f4a]">
                    <thead>
                      <tr className="text-[#5c6470] uppercase font-semibold border-b border-[#e2e5ea] pb-2">
                        <th className="py-2">Bénéficiaire</th>
                        <th className="py-2">Téléphone</th>
                        <th className="py-2">Montant</th>
                        <th className="py-2">Opérateur</th>
                        <th className="py-2">Statut</th>
                        <th className="py-2">Erreur / Réf</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e2e5ea]">
                      {selectedBatch.items.map((item: any) => (
                        <tr key={item.id} className="hover:bg-[#f0f2f5]">
                          <td className="py-2.5 font-semibold text-[#00103e]">{item.recipientName || 'Bénéficiaire'}</td>
                          <td className="py-2.5 font-mono text-[#0f1214] font-semibold">{item.recipientPhone}</td>
                          <td className="py-2.5 font-bold text-[#0f1214] tabular-nums">
                            {hideBalances ? '••••••' : `${parseFloat(item.amount).toLocaleString('fr-FR')} FCFA`}
                          </td>
                          <td className="py-2.5 uppercase font-medium">
                            {item.provider === 'KONOOM_MONEY' ? 'KONOOM' : item.provider}
                          </td>
                          <td className="py-2.5">
                            <span className={`inline-flex items-center rounded-lg px-2 py-0.5 text-[10px] font-bold border ${
                              item.status === 'SUCCESS'
                                ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20'
                                : 'bg-rose-500/10 text-rose-700 border-rose-500/20'
                            }`}>
                              {item.status === 'SUCCESS' ? 'Succès' : 'Échec'}
                            </span>
                          </td>
                          <td className="py-2.5 font-mono text-[10px] text-[#8b919d] max-w-[200px] truncate">
                            {item.status === 'SUCCESS' ? (item.providerRef || '-') : (item.errorMessage || 'Échec')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setSelectedBatchId(null)}
                  className="py-2.5 px-6 bg-[#f0f2f5] hover:bg-[#e4e7ea] text-[#00103e] border border-[#e2e5ea] text-sm font-bold rounded-xl transition"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
