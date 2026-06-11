'use client';

import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Send, Plus, Trash2, CheckCircle2, XCircle, AlertCircle, RefreshCw, Layers } from 'lucide-react';
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

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Paiement de Masse</h1>
          <p className="text-slate-400 mt-1">Envoyez des fonds simultanément à des dizaines de bénéficiaires par Airtel Money, Orange, Moov ou Konoom.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form and Preview */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-900 border border-slate-800/80 rounded-3xl p-6 shadow-2xl">
              <h3 className="text-lg font-bold text-white mb-6">Ajouter un bénéficiaire</h3>
              
              <form onSubmit={handleAddItem} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Téléphone</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+235 60 00 00 00"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white text-sm focus:border-indigo-500 focus:outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Nom complet (facultatif)</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="ex: Jean Dupont"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white text-sm focus:border-indigo-500 focus:outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Montant (FCFA)</label>
                  <input
                    type="number"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="ex: 5000"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white text-sm focus:border-indigo-500 focus:outline-none transition font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Opérateur / Provider</label>
                  <select
                    value={provider}
                    onChange={(e) => setProvider(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white text-sm focus:border-indigo-500 focus:outline-none transition"
                  >
                    <option value="airtel_money">Airtel Money</option>
                    <option value="orange_money">Orange Money</option>
                    <option value="moov_money">Moov Money</option>
                    <option value="konoom_money">Konoom Mobile Money (Tchad)</option>
                  </select>
                </div>

                <div className="md:col-span-2 flex justify-end pt-2">
                  <button
                    type="submit"
                    className="flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 px-5 rounded-2xl text-sm transition shrink-0"
                  >
                    <Plus className="h-4 w-4 mr-2 text-indigo-400" />
                    Ajouter au batch
                  </button>
                </div>
              </form>
            </div>

            {/* Current Batch Preview */}
            <div className="bg-slate-900 border border-slate-800/80 rounded-3xl p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-white">Batch en cours d'envoi</h3>
                  <p className="text-xs text-slate-450 mt-1">{items.length} bénéficiaire(s) ajouté(s)</p>
                </div>
                {items.length > 0 && (
                  <div className="text-right">
                    <span className="text-xs text-slate-400">Total :</span>
                    <h4 className="text-lg font-extrabold text-indigo-400">{totalBatchAmount.toLocaleString('fr-FR')} FCFA</h4>
                  </div>
                )}
              </div>

              {items.length > 0 ? (
                <div className="space-y-4">
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm text-slate-300">
                      <thead>
                        <tr className="text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-2">
                          <th className="py-2.5">Téléphone</th>
                          <th className="py-2.5">Nom</th>
                          <th className="py-2.5">Opérateur</th>
                          <th className="py-2.5">Montant</th>
                          <th className="py-2.5 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-850">
                        {items.map((item, index) => (
                          <tr key={index} className="hover:bg-slate-850/10">
                            <td className="py-3 font-mono text-xs text-white">{item.recipientPhone}</td>
                            <td className="py-3">{item.recipientName}</td>
                            <td className="py-3 text-xs">
                              <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded-lg border border-slate-700">
                                {item.provider}
                              </span>
                            </td>
                            <td className="py-3 font-bold text-white">{item.amount.toLocaleString('fr-FR')} FCFA</td>
                            <td className="py-3 text-right">
                              <button
                                onClick={() => handleRemoveItem(index)}
                                className="p-1.5 text-rose-500 hover:text-white bg-slate-950 border border-slate-850 hover:bg-rose-950 rounded-xl transition"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="pt-4 border-t border-slate-800 flex justify-end">
                    <button
                      onClick={() => runPayoutMutation.mutate()}
                      disabled={runPayoutMutation.isPending}
                      className="flex items-center justify-center bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white font-bold py-3.5 px-6 rounded-2xl text-sm transition shadow-lg shadow-indigo-600/10"
                    >
                      {runPayoutMutation.isPending ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Traitement en cours...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Lancer le Paiement de Masse ({totalBatchAmount.toLocaleString('fr-FR')} FCFA)
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center text-slate-500">
                  Votre liste de bénéficiaires est vide. Utilisez le formulaire pour en ajouter.
                </div>
              )}
            </div>
          </div>

          {/* Past Batches List */}
          <div className="bg-slate-900 border border-slate-800/80 rounded-3xl p-6 shadow-2xl space-y-6">
            <h3 className="text-lg font-bold text-white flex items-center">
              <Layers className="h-5 w-5 text-indigo-500 mr-2" />
              Historique des Batches
            </h3>

            {isLoading ? (
              <div className="space-y-3">
                <div className="h-14 bg-slate-950/50 rounded-xl animate-pulse" />
                <div className="h-14 bg-slate-950/50 rounded-xl animate-pulse" />
              </div>
            ) : batches && batches.length > 0 ? (
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                {batches.map((batch: any) => (
                  <div
                    key={batch.id}
                    onClick={() => setSelectedBatchId(batch.id)}
                    className={`p-4 rounded-2xl border text-left cursor-pointer transition ${
                      selectedBatchId === batch.id
                        ? 'bg-indigo-600/10 border-indigo-500'
                        : 'bg-slate-950 border-slate-850 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono text-slate-500">{batch.id.substring(0, 8)}...</span>
                      <span className={`inline-flex items-center rounded-lg px-2 py-0.5 text-[10px] font-bold border ${
                        batch.status === 'COMPLETED'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : batch.status === 'PROCESSING'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      }`}>
                        {batch.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-white">{parseFloat(batch.totalAmount).toLocaleString('fr-FR')} {batch.currency}</h4>
                        <p className="text-[10px] text-slate-450 mt-0.5">
                          {new Date(batch.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] block text-slate-500">Succès / Échecs</span>
                        <span className="text-xs font-bold text-slate-300">{batch.successCount} / {batch.failedCount}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-slate-500 text-sm">
                Aucun batch exécuté pour le moment.
              </div>
            )}
          </div>
        </div>

        {/* Selected Batch Details Modal */}
        {selectedBatchId && selectedBatch && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <div className="bg-slate-900 border border-slate-850 rounded-3xl w-full max-w-3xl p-6 shadow-2xl space-y-6 max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white">Rapport du Batch de Paiement</h3>
                  <p className="text-xs font-mono text-slate-450 mt-1">ID: {selectedBatch.id}</p>
                </div>
                <button onClick={() => setSelectedBatchId(null)} className="text-slate-400 hover:text-white font-bold text-lg">&times;</button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-950 border border-slate-850 p-4 rounded-2xl">
                <div>
                  <span className="text-xs text-slate-500">Montant total</span>
                  <h4 className="text-base font-bold text-white">{parseFloat(selectedBatch.totalAmount).toLocaleString('fr-FR')} FCFA</h4>
                </div>
                <div>
                  <span className="text-xs text-slate-500">Frais Innov Pay</span>
                  <h4 className="text-base font-bold text-indigo-400">{parseFloat(selectedBatch.totalFees).toLocaleString('fr-FR')} FCFA</h4>
                </div>
                <div>
                  <span className="text-xs text-slate-500">Succès</span>
                  <h4 className="text-base font-bold text-emerald-400 flex items-center">
                    <CheckCircle2 className="h-4 w-4 mr-1 shrink-0" />
                    {selectedBatch.successCount}
                  </h4>
                </div>
                <div>
                  <span className="text-xs text-slate-500">Échecs (remboursés)</span>
                  <h4 className="text-base font-bold text-rose-400 flex items-center">
                    <XCircle className="h-4 w-4 mr-1 shrink-0" />
                    {selectedBatch.failedCount}
                  </h4>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-bold text-white">Lignes individuelles</h4>
                <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
                  <table className="min-w-full text-left text-xs text-slate-300">
                    <thead>
                      <tr className="text-slate-400 uppercase font-semibold border-b border-slate-800 pb-2">
                        <th className="py-2">Bénéficiaire</th>
                        <th className="py-2">Téléphone</th>
                        <th className="py-2">Montant</th>
                        <th className="py-2">Opérateur</th>
                        <th className="py-2">Statut</th>
                        <th className="py-2">Erreur / Réf</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850">
                      {selectedBatch.items.map((item: any) => (
                        <tr key={item.id} className="hover:bg-slate-850/10">
                          <td className="py-2.5 font-semibold text-white">{item.recipientName || 'Bénéficiaire'}</td>
                          <td className="py-2.5 font-mono">{item.recipientPhone}</td>
                          <td className="py-2.5 font-bold text-white">{parseFloat(item.amount).toLocaleString('fr-FR')} FCFA</td>
                          <td className="py-2.5 uppercase">{item.provider}</td>
                          <td className="py-2.5">
                            <span className={`inline-flex items-center rounded-lg px-2 py-0.5 text-[10px] font-bold border ${
                              item.status === 'SUCCESS'
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                            }`}>
                              {item.status === 'SUCCESS' ? 'Succès' : 'Échec'}
                            </span>
                          </td>
                          <td className="py-2.5 font-mono text-[10px] text-slate-500 max-w-[200px] truncate">
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
                  className="py-3 px-6 bg-slate-800 hover:bg-slate-755 text-white text-sm font-bold rounded-2xl transition"
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
