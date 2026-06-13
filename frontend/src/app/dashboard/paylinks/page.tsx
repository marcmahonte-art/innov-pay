'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Link2, Plus, Copy, Trash2, Check, ExternalLink } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { apiClient } from '@/lib/api';

export default function PayLinksPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [isReusable, setIsReusable] = useState(true);
  const [expiresAt, setExpiresAt] = useState('');
  const [maxPayments, setMaxPayments] = useState('');
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

  const formatXaf = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XAF', minimumFractionDigits: 0 }).format(amount);
  };

  const isMutating = createMutation.isPending || deleteMutation.isPending;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-[#00103e] tracking-tight">Liens de Paiement</h1>
            <p className="text-[#5c6470] text-sm">Créez et partagez des liens de paiement pour vendre vos produits ou services sur les réseaux sociaux.</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center justify-center bg-[#0a2463] hover:bg-[#1a3a72] text-white font-semibold text-sm px-5 py-3 rounded-xl shadow-md transition-base shrink-0 self-start sm:self-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Créer un Lien de Paiement
          </button>
        </div>

        {/* PayLinks List */}
        <div className="bg-white border border-[#e2e5ea] rounded-2xl p-6 shadow-card">
          <h3 className="text-lg font-bold text-[#00103e] mb-6">Vos Liens de Paiement</h3>

          {isLoading ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-16 bg-[#f0f2f5] rounded-xl" />
              <div className="h-16 bg-[#f0f2f5] rounded-xl" />
            </div>
          ) : payLinks && payLinks.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[#e2e5ea] text-left text-sm text-[#3c3f4a]">
                <thead>
                  <tr className="text-xs font-bold text-[#5c6470] uppercase tracking-wider">
                    <th className="py-3.5 px-4">Titre / Description</th>
                    <th className="py-3.5 px-4">Montant</th>
                    <th className="py-3.5 px-4">Type</th>
                    <th className="py-3.5 px-4">Paiements Réussis</th>
                    <th className="py-3.5 px-4">Statut</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e2e5ea]">
                  {payLinks.map((link: any) => {
                    return (
                      <tr key={link.id} className="hover:bg-[#f0f2f5] transition">
                        <td className="py-4 px-4">
                          <div className="font-bold text-[#00103e]">{link.title}</div>
                          {link.description && <div className="text-xs text-[#8b919d] mt-0.5">{link.description}</div>}
                        </td>
                        <td className="py-4 px-4 font-bold text-[#0f1214] tabular-nums">
                          {hideBalances ? '••••••' : `${parseFloat(link.amount).toLocaleString('fr-FR')} ${link.currency}`}
                        </td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center rounded-lg px-2 py-0.5 text-xs font-semibold ${
                            link.isReusable 
                              ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                              : 'bg-purple-50 text-purple-700 border border-purple-200'
                          }`}>
                            {link.isReusable ? 'Multi-usage' : 'Usage unique'}
                          </span>
                        </td>
                        <td className="py-4 px-4 font-mono text-xs text-[#3c3f4a] font-semibold">
                          {link.totalPaid} {link.maxPayments ? `/ ${link.maxPayments}` : ''}
                        </td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold border ${
                            link.status === 'ACTIVE'
                              ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20'
                              : link.status === 'PAID'
                              ? 'bg-blue-500/10 text-blue-700 border-blue-500/20'
                              : 'bg-rose-500/10 text-rose-700 border-rose-500/20'
                          }`}>
                            {link.status === 'ACTIVE' ? 'Actif' : link.status === 'PAID' ? 'Payé' : 'Annulé'}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right flex justify-end items-center space-x-2">
                          <button
                            onClick={() => handleCopy(link.slug)}
                            title="Copier le lien"
                            className="p-2 bg-[#f5f7fa] text-[#0a2463] hover:bg-[#e4e7ea] border border-[#e2e5ea] rounded-lg transition"
                          >
                            {copiedSlug === link.slug ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                          </button>
                          <a
                            href={`/pay/${link.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Ouvrir le lien"
                            className="p-2 bg-[#f5f7fa] text-[#5c6470] hover:text-[#00103e] border border-[#e2e5ea] rounded-lg transition"
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
                            className="p-2 bg-[#ffdad6]/40 text-[#B91C1C] hover:bg-[#B91C1C] hover:text-white border border-[#ffdad6] rounded-lg transition disabled:opacity-50"
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
            <div className="py-8 text-center text-[#8b919d]">
              Aucun lien de paiement actif. Cliquez sur le bouton ci-dessus pour en créer un.
            </div>
          )}
        </div>

        {/* Create PayLink Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <div className="bg-white border border-[#e2e5ea] rounded-2xl w-full max-w-lg p-6 shadow-modal space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-[#00103e] flex items-center">
                  <Link2 className="h-5 w-5 text-[#ea580c] mr-2" />
                  Nouveau Lien de Paiement
                </h3>
                <button onClick={() => setShowCreateModal(false)} className="text-[#5c6470] hover:text-[#00103e] font-bold text-xl">&times;</button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#5c6470] uppercase tracking-wider mb-2">Titre du paiement</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="ex: Abonnements Premium de formation"
                    className="w-full bg-[#f5f7fa] border border-[#e2e5ea] rounded-xl py-2 px-3 text-[#0f1214] text-sm focus:outline-none focus:border-[#0a2463] transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#5c6470] uppercase tracking-wider mb-2">Description (facultatif)</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Donnez plus de détails sur le paiement"
                    className="w-full bg-[#f5f7fa] border border-[#e2e5ea] rounded-xl py-2 px-3 text-[#0f1214] text-sm focus:outline-none focus:border-[#0a2463] transition h-20"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#5c6470] uppercase tracking-wider mb-2">Montant (FCFA)</label>
                    <input
                      type="number"
                      required
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="ex: 15000"
                      className="w-full bg-[#f5f7fa] border border-[#e2e5ea] rounded-xl py-2 px-3 text-[#0f1214] text-sm focus:outline-none focus:border-[#0a2463] transition font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#5c6470] uppercase tracking-wider mb-2">Limite de paiements</label>
                    <input
                      type="number"
                      value={maxPayments}
                      onChange={(e) => setMaxPayments(e.target.value)}
                      placeholder="Illimité"
                      className="w-full bg-[#f5f7fa] border border-[#e2e5ea] rounded-xl py-2 px-3 text-[#0f1214] text-sm focus:outline-none focus:border-[#0a2463] transition"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-3 bg-[#f5f7fa] border border-[#e2e5ea] p-4 rounded-xl">
                  <input
                    type="checkbox"
                    id="reusable"
                    checked={isReusable}
                    onChange={(e) => setIsReusable(e.target.checked)}
                    className="w-4 h-4 accent-[#0a2463] cursor-pointer"
                  />
                  <label htmlFor="reusable" className="text-xs text-[#3c3f4a] cursor-pointer">
                    <span className="font-bold text-[#00103e] block">Lien multi-usage</span>
                    Autoriser plusieurs clients à payer via ce même lien.
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#5c6470] uppercase tracking-wider mb-2">Date d'expiration (facultatif)</label>
                  <input
                    type="datetime-local"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    className="w-full bg-[#f5f7fa] border border-[#e2e5ea] rounded-xl py-2 px-3 text-[#0f1214] text-sm focus:outline-none focus:border-[#0a2463] transition"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="py-2 px-6 bg-[#f0f2f5] hover:bg-[#e4e7ea] text-[#00103e] border border-[#e2e5ea] text-sm font-bold rounded-xl transition"
                >
                  Annuler
                </button>
                <button
                  onClick={() => createMutation.mutate()}
                  disabled={!title || !amount || isMutating}
                  className="py-2 px-6 bg-[#0a2463] hover:bg-[#1a3a72] text-white text-sm font-bold rounded-xl transition"
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
