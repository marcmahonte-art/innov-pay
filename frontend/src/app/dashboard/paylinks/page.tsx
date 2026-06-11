'use client';

import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Link2, Plus, Copy, Trash2, Calendar, Check, ExternalLink, QrCode } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { apiClient } from '@/lib/api';

export default function PayLinksPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const [showQrCode, setShowQrCode] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [isReusable, setIsReusable] = useState(true);
  const [expiresAt, setExpiresAt] = useState('');
  const [maxPayments, setMaxPayments] = useState('');

  // Fetch PayLinks
  const { data: payLinks, isLoading, refetch } = useQuery({
    queryKey: ['payLinks'],
    queryFn: async () => {
      const res = await apiClient.get('/dashboard/paylinks');
      return res.data;
    },
  });

  // Create PayLink Mutation
  const createMutation = useMutation({
    mutationFn: async () => {
      const payload: any = {
        title,
        description: description || undefined,
        amount: parseFloat(amount),
        isReusable,
      };
      if (expiresAt) payload.expiresAt = new Date(expiresAt).toISOString();
      if (maxPayments) payload.maxPayments = parseInt(maxPayments, 10);

      const res = await apiClient.post('/dashboard/paylinks', payload);
      return res.data;
    },
    onSuccess: () => {
      setShowCreateModal(false);
      resetForm();
      refetch();
    },
  });

  // Delete PayLink Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/dashboard/paylinks/${id}`);
    },
    onSuccess: () => {
      refetch();
    },
  });

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setAmount('');
    setIsReusable(true);
    setExpiresAt('');
    setMaxPayments('');
  };

  const handleCopy = (slug: string) => {
    const fullUrl = `${window.location.origin}/pay/${slug}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  const isMutating = createMutation.isPending || deleteMutation.isPending;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Liens de Paiement</h1>
            <p className="text-slate-400 mt-1">Créez et partagez des liens de paiement pour vendre vos produits ou services sur les réseaux sociaux.</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center justify-center bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-5 rounded-2xl text-sm transition shadow-lg shadow-indigo-600/10 shrink-0 self-start md:self-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Créer un Lien de Paiement
          </button>
        </div>

        {/* PayLinks Grid/List */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-3xl p-6 shadow-2xl">
          <h3 className="text-lg font-bold text-white mb-6">Vos Liens de Paiement</h3>

          {isLoading ? (
            <div className="space-y-4">
              <div className="h-16 bg-slate-950/50 rounded-2xl animate-pulse" />
              <div className="h-16 bg-slate-950/50 rounded-2xl animate-pulse" />
            </div>
          ) : payLinks && payLinks.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-800 text-left text-sm text-slate-300">
                <thead>
                  <tr className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    <th className="py-3.5 px-4">Titre / Description</th>
                    <th className="py-3.5 px-4">Montant</th>
                    <th className="py-3.5 px-4">Type</th>
                    <th className="py-3.5 px-4">Paiements Réussis</th>
                    <th className="py-3.5 px-4">Statut</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {payLinks.map((link: any) => {
                    const fullUrl = typeof window !== 'undefined' ? `${window.location.origin}/pay/${link.slug}` : '';
                    return (
                      <tr key={link.id} className="hover:bg-slate-850/25 transition">
                        <td className="py-4 px-4">
                          <div className="font-bold text-white">{link.title}</div>
                          {link.description && <div className="text-xs text-slate-500 mt-0.5">{link.description}</div>}
                        </td>
                        <td className="py-4 px-4 font-semibold text-white">
                          {parseFloat(link.amount).toLocaleString('fr-FR')} {link.currency}
                        </td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center rounded-lg px-2 py-0.5 text-xs font-semibold ${
                            link.isReusable 
                              ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' 
                              : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                          }`}>
                            {link.isReusable ? 'Multi-usage' : 'Usage unique'}
                          </span>
                        </td>
                        <td className="py-4 px-4 font-mono text-xs">
                          {link.totalPaid} {link.maxPayments ? `/ ${link.maxPayments}` : ''}
                        </td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center rounded-lg px-2.5 py-0.5 text-xs font-bold border ${
                            link.status === 'ACTIVE'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : link.status === 'PAID'
                              ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                              : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          }`}>
                            {link.status === 'ACTIVE' ? 'Actif' : link.status === 'PAID' ? 'Payé' : 'Annulé'}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right flex justify-end items-center space-x-2">
                          <button
                            onClick={() => handleCopy(link.slug)}
                            title="Copier le lien"
                            className="p-2 bg-slate-950 text-indigo-400 hover:text-white border border-slate-800 hover:border-slate-700 rounded-xl transition"
                          >
                            {copiedSlug === link.slug ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                          </button>
                          <a
                            href={`/pay/${link.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Ouvrir le lien"
                            className="p-2 bg-slate-950 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700 rounded-xl transition"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                          <button
                            onClick={() => {
                              if (confirm('Voulez-vous désactiver définitivement ce lien de paiement ?')) {
                                deleteMutation.mutate(link.id);
                              }
                            }}
                            title="Supprimer le lien"
                            disabled={isMutating}
                            className="p-2 bg-slate-950 text-rose-400 hover:text-rose-300 border border-slate-800 hover:border-rose-950 rounded-xl transition disabled:opacity-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-8 text-center text-slate-500">
              Aucun lien de paiement actif. Cliquez sur le bouton ci-dessus pour en créer un.
            </div>
          )}
        </div>

        {/* Create PayLink Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <div className="bg-slate-900 border border-slate-850 rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white flex items-center">
                  <Link2 className="h-5 w-5 text-indigo-500 mr-2 animate-pulse" />
                  Nouveau Lien de Paiement
                </h3>
                <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white font-bold">&times;</button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Titre du paiement</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="ex: Abonnements Premium de formation"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white text-sm focus:border-indigo-500 focus:outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Description (facultatif)</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Donnez plus de détails sur le paiement"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white text-sm focus:border-indigo-500 focus:outline-none transition h-20"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Montant (FCFA)</label>
                    <input
                      type="number"
                      required
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="ex: 15000"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white text-sm focus:border-indigo-500 focus:outline-none transition font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Limite de paiements</label>
                    <input
                      type="number"
                      value={maxPayments}
                      onChange={(e) => setMaxPayments(e.target.value)}
                      placeholder="Illimité"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white text-sm focus:border-indigo-500 focus:outline-none transition"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-3 bg-slate-950 border border-slate-850 p-4 rounded-2xl">
                  <input
                    type="checkbox"
                    id="reusable"
                    checked={isReusable}
                    onChange={(e) => setIsReusable(e.target.checked)}
                    className="w-5 h-5 accent-indigo-600 rounded-md shrink-0 cursor-pointer"
                  />
                  <label htmlFor="reusable" className="text-sm text-slate-350 cursor-pointer">
                    <span className="font-bold text-white block">Lien multi-usage</span>
                    Autoriser plusieurs clients à payer via ce même lien.
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Date d'expiration (facultatif)</label>
                  <input
                    type="datetime-local"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white text-sm focus:border-indigo-500 focus:outline-none transition"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="py-3 px-6 bg-slate-800 hover:bg-slate-755 text-white text-sm font-bold rounded-2xl transition"
                >
                  Annuler
                </button>
                <button
                  onClick={() => createMutation.mutate()}
                  disabled={!title || !amount || isMutating}
                  className="py-3 px-6 bg-indigo-600 hover:bg-indigo-550 disabled:bg-slate-800 disabled:text-slate-500 text-white text-sm font-bold rounded-2xl transition"
                >
                  Créer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
