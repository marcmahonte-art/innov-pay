'use client';

import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Users, UserPlus, Shield, Check, X, ShieldAlert, Trash2, Key, ListFilter } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { apiClient } from '@/lib/api';

export default function TeamPage() {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState('CAISSIER');

  // Fetch team members
  const { data: team, isLoading: isTeamLoading, refetch: refetchTeam } = useQuery({
    queryKey: ['team'],
    queryFn: async () => {
      const res = await apiClient.get('/merchants/team');
      return res.data;
    },
  });

  // Fetch audit logs
  const { data: auditLogs, isLoading: isLogsLoading } = useQuery({
    queryKey: ['auditLogs'],
    queryFn: async () => {
      const res = await apiClient.get('/merchants/audit-logs');
      return res.data;
    },
  });

  // Invite member Mutation
  const inviteMutation = useMutation({
    mutationFn: async () => {
      const res = await apiClient.post('/merchants/team/invite', {
        email: inviteEmail,
        name: inviteName,
        role: inviteRole,
      });
      return res.data;
    },
    onSuccess: () => {
      setShowInviteModal(false);
      setInviteEmail('');
      setInviteName('');
      setInviteRole('CAISSIER');
      refetchTeam();
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || 'Une erreur est survenue.');
    },
  });

  // Delete team member Mutation
  const deleteMutation = useMutation({
    mutationFn: async (userId: string) => {
      const res = await apiClient.delete(`/merchants/team/${userId}`);
      return res.data;
    },
    onSuccess: () => {
      refetchTeam();
    },
  });

  // Toggle active/inactive status
  const toggleStatusMutation = useMutation({
    mutationFn: async ({ userId, isActive }: { userId: string; isActive: boolean }) => {
      const res = await apiClient.patch(`/merchants/team/${userId}`, { isActive });
      return res.data;
    },
    onSuccess: () => {
      refetchTeam();
    },
  });

  const isMutating = inviteMutation.isPending || deleteMutation.isPending || toggleStatusMutation.isPending;

  return (
    <DashboardLayout>
      <div className="space-y-6 font-sans">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-[#00103e] tracking-tight">Gestion des Rôles & Équipe</h1>
            <p className="text-[#5c6470] text-sm">Gérez les accès et les permissions de vos collaborateurs (comptables, caissiers) au sein d'Innov Pay.</p>
          </div>
          <button
            onClick={() => setShowInviteModal(true)}
            className="flex items-center justify-center bg-[#0a2463] hover:bg-[#1a3a72] text-white font-semibold text-sm px-5 py-3 rounded-xl shadow-md transition-base self-start sm:self-auto"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Inviter un Collaborateur
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-[#e2e5ea] shadow-card">
            <span className="text-[10px] font-bold text-[#8b919d] uppercase tracking-wider block">Membres total</span>
            <span className="text-2xl font-black text-[#00103e] mt-1 block">{team?.length || 0}</span>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-[#e2e5ea] shadow-card">
            <span className="text-[10px] font-bold text-[#8b919d] uppercase tracking-wider block">Rôles actifs</span>
            <span className="text-2xl font-black text-[#00103e] mt-1 block">
              {team ? new Set(team.map((t: any) => t.role)).size : 0}
            </span>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-[#e2e5ea] shadow-card">
            <span className="text-[10px] font-bold text-[#8b919d] uppercase tracking-wider block">Membres actifs</span>
            <span className="text-2xl font-black text-emerald-700 mt-1 block">
              {team?.filter((t: any) => t.isActive).length || 0}
            </span>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-[#e2e5ea] shadow-card">
            <span className="text-[10px] font-bold text-[#8b919d] uppercase tracking-wider block">Actions loggées</span>
            <span className="text-2xl font-black text-[#ea580c] mt-1 block">{auditLogs?.length || 0}</span>
          </div>
        </div>

        {/* Main Section split */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Members list */}
          <div className="lg:col-span-2 bg-white border border-[#e2e5ea] rounded-2xl p-6 shadow-card space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-[#00103e]">Membres de l'organisation</h3>
            </div>

            {isTeamLoading ? (
              <div className="space-y-4 animate-pulse">
                <div className="h-14 bg-[#f0f2f5] rounded-xl" />
                <div className="h-14 bg-[#f0f2f5] rounded-xl" />
              </div>
            ) : team && team.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-[#e2e5ea] text-left text-sm text-[#3c3f4a]">
                  <thead>
                    <tr className="text-xs font-bold text-[#5c6470] uppercase tracking-wider">
                      <th className="py-3.5 px-4">Collaborateur</th>
                      <th className="py-3.5 px-4">Rôle</th>
                      <th className="py-3.5 px-4">Statut</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e2e5ea]">
                    {team.map((member: any) => (
                      <tr key={member.id} className="hover:bg-[#f0f2f5] transition">
                        <td className="py-4 px-4">
                          <div className="font-bold text-[#00103e]">{member.name}</div>
                          <div className="text-xs text-[#8b919d] mt-0.5">{member.email}</div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="inline-flex items-center rounded-lg bg-blue-50 text-[#0a2463] border border-blue-100 px-2 py-0.5 text-xs font-bold">
                            {member.role.replace('MERCHANT_', '')}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold border ${
                            member.isActive 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                              : 'bg-rose-50 text-rose-700 border-rose-100'
                          }`}>
                            {member.isActive ? 'Actif' : 'Désactivé'}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right flex justify-end items-center space-x-2">
                          <button
                            onClick={() => toggleStatusMutation.mutate({ userId: member.id, isActive: !member.isActive })}
                            disabled={isMutating || member.role === 'MERCHANT_OWNER'}
                            className={`p-1.5 border rounded-lg transition text-xs font-semibold ${
                              member.isActive 
                                ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border-rose-200' 
                                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200'
                            } disabled:opacity-40`}
                          >
                            {member.isActive ? 'Suspendre' : 'Activer'}
                          </button>
                          
                          <button
                            onClick={() => {
                              if (confirm('Voulez-vous révoquer l\'accès de ce collaborateur ?')) {
                                deleteMutation.mutate(member.id);
                              }
                            }}
                            disabled={isMutating || member.role === 'MERCHANT_OWNER'}
                            className="p-1.5 bg-[#ffdad6]/40 text-[#B91C1C] hover:bg-[#B91C1C] hover:text-white border border-[#ffdad6] rounded-lg transition disabled:opacity-40"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-8 text-center text-[#8b919d]">
                Aucun collaborateur enregistré.
              </div>
            )}
          </div>

          {/* Audit log sidebar */}
          <div className="bg-white border border-[#e2e5ea] rounded-2xl p-6 shadow-card space-y-6">
            <div className="border-b border-[#e2e5ea] pb-4">
              <h3 className="text-lg font-bold text-[#00103e]">Journal d'Audit</h3>
              <p className="text-xs text-[#5c6470] mt-0.5">Dernières actions administratives enregistrées.</p>
            </div>

            {isLogsLoading ? (
              <div className="space-y-4 animate-pulse">
                <div className="h-12 bg-[#f0f2f5] rounded-xl" />
                <div className="h-12 bg-[#f0f2f5] rounded-xl" />
              </div>
            ) : auditLogs && auditLogs.length > 0 ? (
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
                {auditLogs.map((log: any) => (
                  <div key={log.id} className="p-3 bg-[#f5f7fa] border border-[#e2e5ea] rounded-xl space-y-1.5 text-xs text-[#3c3f4a]">
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-[#00103e]">{log.user?.name || 'Système'}</span>
                      <span className="text-[10px] text-[#8b919d]">
                        {new Date(log.createdAt).toLocaleDateString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="font-semibold text-slate-700">{log.action}</p>
                    <p className="text-[11px] text-[#5c6470] italic">"{log.details}"</p>
                    {log.ipAddress && (
                      <span className="text-[9px] text-slate-400 block font-mono">IP: {log.ipAddress}</span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-[#8b919d] text-xs">
                Aucun log enregistré dans le journal.
              </div>
            )}
          </div>
        </div>

        {/* Invite Modal */}
        {showInviteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <div className="bg-white border border-[#e2e5ea] rounded-2xl w-full max-w-md p-6 shadow-modal space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-[#00103e] flex items-center">
                  <UserPlus className="h-5 w-5 text-[#ea580c] mr-2" />
                  Inviter un Membre d'Équipe
                </h3>
                <button onClick={() => setShowInviteModal(false)} className="text-[#5c6470] hover:text-[#00103e] font-bold text-xl">&times;</button>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-[#5c6470] uppercase tracking-wider mb-2">Nom Complet</label>
                  <input
                    type="text"
                    required
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                    placeholder="ex: Haroun Mahamat"
                    className="w-full bg-[#f5f7fa] border border-[#e2e5ea] rounded-xl py-2 px-3 text-[#0f1214] text-sm focus:outline-none focus:border-[#0a2463] transition"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#5c6470] uppercase tracking-wider mb-2">Email de connexion</label>
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="exemple@boite.td"
                    className="w-full bg-[#f5f7fa] border border-[#e2e5ea] rounded-xl py-2 px-3 text-[#0f1214] text-sm focus:outline-none focus:border-[#0a2463] transition"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#5c6470] uppercase tracking-wider mb-2">Rôle Assigné</label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="w-full bg-[#f5f7fa] border border-[#e2e5ea] rounded-xl py-2 px-3 text-[#0f1214] text-sm focus:outline-none focus:border-[#0a2463] transition"
                  >
                    <option value="CAISSIER">Caissier (Peut faire des demandes et payouts simples)</option>
                    <option value="COMPTABLE">Comptable (Accès rapports et écritures financières)</option>
                    <option value="DEVELOPER">Développeur (Accès clés API et webhooks)</option>
                    <option value="MERCHANT_ADMIN">Admin Boutique (Permissions de modification globales)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="py-2 px-6 bg-[#f0f2f5] hover:bg-[#e4e7ea] text-[#00103e] border border-[#e2e5ea] text-xs font-bold rounded-xl transition"
                >
                  Annuler
                </button>
                <button
                  onClick={() => inviteMutation.mutate()}
                  disabled={!inviteName || !inviteEmail || isMutating}
                  className="py-2 px-6 bg-[#0a2463] hover:bg-[#1a3a72] text-white text-xs font-bold rounded-xl transition disabled:opacity-50"
                >
                  Envoyer l'invitation
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
