'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { RefreshCw, Plus, Users, Calendar, Megaphone, Send, CheckCircle2, AlertTriangle, Trash2, Clock, Check } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { apiClient } from '@/lib/api';

export default function AutoCollectPage() {
  const [user, setUser] = useState<any>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [type, setType] = useState('MONTHLY');
  const [amount, setAmount] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reminderMsg, setReminderMsg] = useState('');
  const [frequency, setFrequency] = useState('7_DAYS_BEFORE,3_DAYS_BEFORE,D_DAY');
  
  // CSV raw members input: Name, Phone, Email, Amount
  const [membersCsv, setMembersCsv] = useState('');

  const [hideBalances, setHideBalances] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    const checkVisibility = () => {
      setHideBalances(localStorage.getItem('hideBalances') === 'true');
    };
    checkVisibility();
    window.addEventListener('balanceVisibilityChanged', checkVisibility);
    return () => {
      window.removeEventListener('balanceVisibilityChanged', checkVisibility);
    };
  }, []);

  // Fetch campaigns
  const { data: campaigns, isLoading, refetch } = useQuery({
    queryKey: ['campaigns', user?.merchantId],
    queryFn: async () => {
      const res = await apiClient.get(`/autocollect?merchantId=${user?.merchantId}`);
      return res.data;
    },
    enabled: !!user?.merchantId,
  });

  // Create Campaign Mutation
  const createMutation = useMutation({
    mutationFn: async () => {
      // Parse members CSV
      const members: any[] = [];
      const lines = membersCsv.split('\n');
      lines.forEach((line) => {
        const parts = line.split(',');
        if (parts.length >= 2) {
          members.push({
            name: parts[0].trim(),
            phone: parts[1].trim(),
            email: parts[2]?.trim() || undefined,
            amount: parts[3] ? parseFloat(parts[3].trim()) : parseFloat(amount),
          });
        }
      });

      const payload: any = {
        name,
        type,
        amount: amount ? parseFloat(amount) : null,
        reminderMsg: reminderMsg || undefined,
        frequency,
        members,
      };
      if (endDate) payload.endDate = new Date(endDate).toISOString();

      const res = await apiClient.post(`/autocollect?merchantId=${user?.merchantId}`, payload);
      return res.data;
    },
    onSuccess: () => {
      setShowCreateModal(false);
      resetForm();
      refetch();
    },
  });

  // Trigger manual reminders
  const remindMutation = useMutation({
    mutationFn: async ({ campaignId, memberId }: { campaignId: string; memberId?: string }) => {
      let url = `/autocollect/${campaignId}/remind?merchantId=${user?.merchantId}`;
      if (memberId) url += `&memberId=${memberId}`;
      const res = await apiClient.post(url);
      return res.data;
    },
    onSuccess: (data) => {
      alert(data.message || 'Rappels envoyés avec succès.');
    },
  });

  // Mark member as paid manually
  const markAsPaidMutation = useMutation({
    mutationFn: async ({ campaignId, memberId, status }: { campaignId: string; memberId: string; status: string }) => {
      const res = await apiClient.patch(`/autocollect/${campaignId}/members/${memberId}`, { status });
      return res.data;
    },
    onSuccess: () => {
      if (selectedCampaign) {
        // Refetch campaign details
        apiClient.get(`/autocollect/${selectedCampaign.id}`).then((res) => {
          setSelectedCampaign(res.data);
        });
      }
      refetch();
    },
  });

  // Delete Campaign
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/autocollect/${id}?merchantId=${user?.merchantId}`);
    },
    onSuccess: () => {
      setSelectedCampaign(null);
      refetch();
    },
  });

  const resetForm = () => {
    setName('');
    setType('MONTHLY');
    setAmount('');
    setEndDate('');
    setReminderMsg('');
    setFrequency('7_DAYS_BEFORE,3_DAYS_BEFORE,D_DAY');
    setMembersCsv('');
  };

  const handleCopyLink = (member: any) => {
    const text = `Bonjour ${member.name}, veuillez régler votre facture en cliquant sur ce lien sécurisé: https://innovpay.td/pay/direct-${member.id}`;
    navigator.clipboard.writeText(text);
    setCopiedLink(member.id);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const isMutating = createMutation.isPending || remindMutation.isPending || markAsPaidMutation.isPending || deleteMutation.isPending;

  return (
    <DashboardLayout>
      <div className="space-y-6 font-sans">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-[#00103e] tracking-tight">AutoCollect (Recouvrements)</h1>
            <p className="text-[#5c6470] text-sm">Créez des campagnes de facturation et de prélèvement récurrents avec relances SMS automatiques.</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center justify-center bg-[#0a2463] hover:bg-[#1a3a72] text-white font-semibold text-sm px-5 py-3 rounded-xl shadow-md transition-base self-start sm:self-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle Collecte
          </button>
        </div>

        {/* Campaign Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-[#e2e5ea] shadow-card">
            <span className="text-[10px] font-bold text-[#8b919d] uppercase tracking-wider block">Campagnes actives</span>
            <span className="text-2xl font-black text-[#00103e] mt-1 block">{campaigns?.length || 0}</span>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-[#e2e5ea] shadow-card">
            <span className="text-[10px] font-bold text-[#8b919d] uppercase tracking-wider block">Membres à facturer</span>
            <span className="text-2xl font-black text-[#00103e] mt-1 block">
              {campaigns?.reduce((sum: number, c: any) => sum + c.totalMembers, 0) || 0}
            </span>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-[#e2e5ea] shadow-card">
            <span className="text-[10px] font-bold text-[#8b919d] uppercase tracking-wider block">Taux de recouvrement</span>
            <span className="text-2xl font-black text-emerald-700 mt-1 block">
              {campaigns && campaigns.length > 0
                ? (
                    (campaigns.reduce((sum: number, c: any) => sum + c.paidMembers, 0) /
                      campaigns.reduce((sum: number, c: any) => sum + c.totalMembers, 0)) *
                    100
                  ).toFixed(1)
                : '0.0'}
              %
            </span>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-[#e2e5ea] shadow-card">
            <span className="text-[10px] font-bold text-[#8b919d] uppercase tracking-wider block">Volume recouvré</span>
            <span className="text-2xl font-black text-[#ea580c] mt-1 block">
              {hideBalances
                ? '••••••'
                : `${(campaigns?.reduce((sum: number, c: any) => sum + c.collectedAmount, 0) || 0).toLocaleString(
                    'fr-FR'
                  )} FCFA`}
            </span>
          </div>
        </div>

        {/* Main Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left table */}
          <div className="lg:col-span-2 bg-white border border-[#e2e5ea] rounded-2xl p-6 shadow-card space-y-6">
            <h3 className="text-lg font-bold text-[#00103e]">Vos Campagnes de Prélèvement</h3>

            {isLoading ? (
              <div className="space-y-4 animate-pulse">
                <div className="h-16 bg-[#f0f2f5] rounded-xl" />
                <div className="h-16 bg-[#f0f2f5] rounded-xl" />
              </div>
            ) : campaigns && campaigns.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-[#e2e5ea] text-left text-sm text-[#3c3f4a]">
                  <thead>
                    <tr className="text-xs font-bold text-[#5c6470] uppercase tracking-wider">
                      <th className="py-3 px-4">Nom de campagne</th>
                      <th className="py-3 px-4">Fréquence</th>
                      <th className="py-3 px-4">Montant Cible</th>
                      <th className="py-3 px-4">Membres</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e2e5ea]">
                    {campaigns.map((c: any) => {
                      const pct = c.totalMembers > 0 ? (c.paidMembers / c.totalMembers) * 100 : 0;
                      return (
                        <tr
                          key={c.id}
                          onClick={() => {
                            // Fetch full details
                            apiClient.get(`/autocollect/${c.id}?merchantId=${user?.merchantId}`).then((res) => {
                              setSelectedCampaign(res.data);
                            });
                          }}
                          className={`hover:bg-[#f0f2f5] cursor-pointer transition ${
                            selectedCampaign?.id === c.id ? 'bg-[#0a2463]/5' : ''
                          }`}
                        >
                          <td className="py-4 px-4">
                            <div className="font-bold text-[#00103e]">{c.name}</div>
                            <div className="text-[10px] text-[#8b919d] mt-0.5">Créé le {new Date(c.createdAt).toLocaleDateString('fr-FR')}</div>
                          </td>
                          <td className="py-4 px-4 font-semibold text-xs text-slate-600">
                            {c.type === 'MONTHLY' ? 'Mensuel' : c.type === 'SINGLE' ? 'Ponctuel' : 'Trimestriel'}
                          </td>
                          <td className="py-4 px-4 font-bold text-[#0f1214] tabular-nums">
                            {hideBalances ? '••••••' : `${c.collectedAmount.toLocaleString('fr-FR')} / ${c.totalAmount.toLocaleString('fr-FR')} FCFA`}
                            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1">
                              <div className="bg-[#ea580c] h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                            </div>
                          </td>
                          <td className="py-4 px-4 text-xs font-semibold text-slate-700">
                            {c.paidMembers} / {c.totalMembers}
                          </td>
                          <td className="py-4 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => remindMutation.mutate({ campaignId: c.id })}
                              title="Relancer tous les retardataires"
                              disabled={isMutating}
                              className="p-1.5 bg-[#f5f7fa] text-[#ea580c] hover:bg-[#ff7034]/15 border border-[#e2e5ea] rounded-lg transition"
                            >
                              <Megaphone className="h-4 w-4" />
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
                Aucune campagne de prélèvement. Cliquez sur le bouton ci-dessus pour en créer une.
              </div>
            )}
          </div>

          {/* Right sidebar details */}
          <div className="bg-white border border-[#e2e5ea] rounded-2xl p-6 shadow-card space-y-6">
            <h3 className="text-lg font-bold text-[#00103e]">Détail du Recouvrement</h3>
            
            {selectedCampaign ? (
              <div className="space-y-6 text-xs text-[#3c3f4a]">
                <div className="flex justify-between items-start border-b border-[#e2e5ea] pb-4">
                  <div>
                    <h4 className="text-sm font-extrabold text-[#00103e]">{selectedCampaign.name}</h4>
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{selectedCampaign.type}</span>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm('Voulez-vous supprimer définitivement cette campagne de prélèvement ?')) {
                        deleteMutation.mutate(selectedCampaign.id);
                      }
                    }}
                    className="p-2 text-rose-600 hover:bg-rose-50 border border-rose-100 rounded-lg transition"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {selectedCampaign.reminderMsg && (
                  <div className="p-3 bg-[#f5f7fa] border border-[#e2e5ea] rounded-xl space-y-1">
                    <span className="text-[9px] font-bold text-[#8b919d] uppercase block">Message de rappel</span>
                    <p className="text-[11px] font-medium leading-relaxed italic">"{selectedCampaign.reminderMsg}"</p>
                  </div>
                )}

                <div className="space-y-3">
                  <span className="text-[10px] font-bold text-[#8b919d] uppercase tracking-wider block">Membres & États</span>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                    {selectedCampaign.members?.map((m: any) => {
                      return (
                        <div key={m.id} className="p-3 bg-white border border-[#e2e5ea] rounded-xl flex items-center justify-between gap-2">
                          <div>
                            <span className="font-bold text-[#00103e] block">{m.name}</span>
                            <span className="text-[10px] text-slate-500 font-mono block">{m.phone}</span>
                            <span className="text-[10px] font-bold text-[#ea580c] block mt-0.5 tabular-nums">
                              {parseFloat(m.amount).toLocaleString('fr-FR')} FCFA
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-bold border ${
                              m.status === 'PAID'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : m.status === 'PENDING'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-rose-50 text-rose-700 border-rose-200'
                            }`}>
                              {m.status === 'PAID' ? 'Payé' : m.status === 'PENDING' ? 'En attente' : 'En retard'}
                            </span>
                            
                            {m.status !== 'PAID' ? (
                              <div className="flex space-x-1">
                                <button
                                  onClick={() => remindMutation.mutate({ campaignId: selectedCampaign.id, memberId: m.id })}
                                  title="Envoyer rappel SMS"
                                  className="p-1 bg-[#f5f7fa] border border-[#e2e5ea] rounded hover:bg-[#e4e7ea] transition"
                                >
                                  <Megaphone className="h-3.5 w-3.5 text-[#ea580c]" />
                                </button>
                                <button
                                  onClick={() => markAsPaidMutation.mutate({ campaignId: selectedCampaign.id, memberId: m.id, status: 'PAID' })}
                                  title="Marquer Payé"
                                  className="p-1 bg-emerald-50 border border-emerald-100 rounded hover:bg-emerald-100 transition"
                                >
                                  <Check className="h-3.5 w-3.5 text-emerald-700" />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleCopyLink(m)}
                                className="p-1 bg-slate-50 border border-slate-200 rounded text-slate-500 hover:text-[#00103e]"
                                title="Copier lien reçu"
                              >
                                {copiedLink === m.id ? <span className="text-[9px] font-bold text-emerald-600">Copié</span> : 'Reçu'}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-[#8b919d] text-xs">
                Sélectionnez une campagne à gauche pour en afficher les détails et gérer les membres.
              </div>
            )}
          </div>
        </div>

        {/* Create Campaign Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <div className="bg-white border border-[#e2e5ea] rounded-2xl w-full max-w-xl p-6 shadow-modal space-y-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-[#00103e] flex items-center">
                  <Megaphone className="h-5 w-5 text-[#ea580c] mr-2" />
                  Créer une Campagne AutoCollect
                </h3>
                <button onClick={() => setShowCreateModal(false)} className="text-[#5c6470] hover:text-[#00103e] font-bold text-xl">&times;</button>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-[#5c6470] uppercase tracking-wider mb-2">Nom de la Campagne</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="ex: Cotisations mensuelles - Association de N'Djaména"
                    className="w-full bg-[#f5f7fa] border border-[#e2e5ea] rounded-xl py-2 px-3 text-[#0f1214] text-sm focus:outline-none focus:border-[#0a2463] transition"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-[#5c6470] uppercase tracking-wider mb-2">Périodicité</label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="w-full bg-[#f5f7fa] border border-[#e2e5ea] rounded-xl py-2 px-3 text-[#0f1214] text-sm focus:outline-none focus:border-[#0a2463] transition"
                    >
                      <option value="MONTHLY">Mensuel</option>
                      <option value="TRIMESTRIAL">Trimestriel</option>
                      <option value="SINGLE">Ponctuel (Envoi unique)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-[#5c6470] uppercase tracking-wider mb-2">Montant par défaut (FCFA)</label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="ex: 15000"
                      className="w-full bg-[#f5f7fa] border border-[#e2e5ea] rounded-xl py-2 px-3 text-[#0f1214] text-sm focus:outline-none focus:border-[#0a2463] transition font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-[#5c6470] uppercase tracking-wider mb-2">Message personnalisé de relance (SMS/WhatsApp)</label>
                  <textarea
                    value={reminderMsg}
                    onChange={(e) => setReminderMsg(e.target.value)}
                    placeholder="ex: Bonjour [name], merci de régler votre cotisation de [amount] FCFA en cliquant ici : [link]"
                    className="w-full bg-[#f5f7fa] border border-[#e2e5ea] rounded-xl py-2 px-3 text-[#0f1214] text-sm focus:outline-none focus:border-[#0a2463] transition h-16"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#5c6470] uppercase tracking-wider mb-2">
                    Membres à facturer (Format CSV : Nom, Téléphone, Email, Montant optionnel)
                  </label>
                  <p className="text-[10px] text-slate-500 mb-2">Saisir un membre par ligne. Exemple : Adoum Haroun, +23566123456, adoum@mail.com, 15000</p>
                  <textarea
                    value={membersCsv}
                    onChange={(e) => setMembersCsv(e.target.value)}
                    placeholder="Nom, Téléphone, Email, Montant"
                    className="w-full bg-[#f5f7fa] border border-[#e2e5ea] rounded-xl py-2 px-3 text-[#0f1214] text-sm focus:outline-none focus:border-[#0a2463] transition h-28 font-mono text-[11px]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="py-2 px-6 bg-[#f0f2f5] hover:bg-[#e4e7ea] text-[#00103e] border border-[#e2e5ea] text-xs font-bold rounded-xl transition"
                >
                  Annuler
                </button>
                <button
                  onClick={() => createMutation.mutate()}
                  disabled={!name || !membersCsv || isMutating}
                  className="py-2 px-6 bg-[#0a2463] hover:bg-[#1a3a72] text-white text-xs font-bold rounded-xl transition disabled:opacity-50"
                >
                  Démarrer la collecte
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
