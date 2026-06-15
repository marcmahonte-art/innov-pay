'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { User, Shield, Bell, Key, Save, Check, RefreshCw, Eye, EyeOff, Plus, Trash2, Smartphone, Monitor } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { apiClient } from '@/lib/api';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'general' | 'securite' | 'notifications' | 'api'>('general');
  const [hideBalances, setHideBalances] = useState(false);

  // General tab form inputs
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  // Security tab password input
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [is2FaEnabled, setIs2FaEnabled] = useState(false);

  // Notifications toggles
  const [notifPayments, setNotifPayments] = useState(true);
  const [notifReports, setNotifReports] = useState(true);
  const [notifSecurity, setNotifSecurity] = useState(true);

  // Webhooks URL input
  const [webhookUrl, setWebhookUrl] = useState('');
  
  // API key visibility
  const [showSecretKey, setShowSecretKey] = useState<Record<string, boolean>>({});

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

  // Fetch Merchant Profile
  const { data: profile, isLoading: isProfileLoading, refetch: refetchProfile } = useQuery({
    queryKey: ['merchantProfile'],
    queryFn: async () => {
      const res = await apiClient.get('/merchants/profile');
      return res.data;
    },
  });

  // Sync profile details when fetched
  useEffect(() => {
    if (profile) {
      setBusinessName(profile.businessName || '');
      setEmail(profile.email || '');
      setPhone(profile.phone || '');
      setAddress(profile.address || '');
    }
  }, [profile]);

  // Fetch API Keys
  const { data: apiKeys, isLoading: isKeysLoading, refetch: refetchKeys } = useQuery({
    queryKey: ['apiKeys'],
    queryFn: async () => {
      const res = await apiClient.get('/merchants/api-keys');
      return res.data;
    },
  });

  // Fetch Webhook configuration
  const { data: webhookConfig, refetch: refetchWebhook } = useQuery({
    queryKey: ['webhookConfig'],
    queryFn: async () => {
      const res = await apiClient.get('/webhooks');
      return res.data;
    },
    retry: false,
  });

  useEffect(() => {
    if (webhookConfig) {
      setWebhookUrl(webhookConfig.url || '');
    }
  }, [webhookConfig]);

  // Update Profile Mutation
  const updateProfileMutation = useMutation({
    mutationFn: async () => {
      const res = await apiClient.patch('/merchants/profile', {
        businessName,
        phone,
        address,
      });
      return res.data;
    },
    onSuccess: () => {
      alert('Profil mis à jour avec succès !');
      refetchProfile();
    },
    onError: (err: any) => {
      alert(`Erreur de mise à jour: ${err.response?.data?.message || err.message}`);
    },
  });

  // Generate API Key Mutation
  const generateKeyMutation = useMutation({
    mutationFn: async (isLive: boolean) => {
      const res = await apiClient.post('/merchants/api-keys', { isLive });
      return res.data;
    },
    onSuccess: (data) => {
      alert(`Nouvelle clé générée avec succès ! Gardez votre clé secrète en lieu sûr :\n\n${data.secretKey}`);
      refetchKeys();
    },
    onError: (err: any) => {
      alert(`Erreur: ${err.response?.data?.message || err.message}`);
    },
  });

  // Revoke API Key Mutation
  const revokeKeyMutation = useMutation({
    mutationFn: async (keyId: string) => {
      const res = await apiClient.delete(`/merchants/api-keys/${keyId}`);
      return res.data;
    },
    onSuccess: () => {
      alert('Clé API révoquée avec succès.');
      refetchKeys();
    },
    onError: (err: any) => {
      alert(`Erreur: ${err.response?.data?.message || err.message}`);
    },
  });

  // Save Webhook URL Mutation
  const saveWebhookMutation = useMutation({
    mutationFn: async () => {
      const res = await apiClient.post('/webhooks', {
        url: webhookUrl,
        events: ['payment.success', 'payment.failed'],
      });
      return res.data;
    },
    onSuccess: () => {
      alert('Configuration du webhook sauvegardée avec succès !');
      refetchWebhook();
    },
    onError: (err: any) => {
      alert(`Erreur: ${err.response?.data?.message || err.message}`);
    },
  });

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate();
  };

  const handleSaveWebhook = (e: React.FormEvent) => {
    e.preventDefault();
    saveWebhookMutation.mutate();
  };

  const toggleSecretVisibility = (keyId: string) => {
    setShowSecretKey((prev) => ({
      ...prev,
      [keyId]: !prev[keyId],
    }));
  };

  const isSaving = updateProfileMutation.isPending || saveWebhookMutation.isPending;

  return (
    <DashboardLayout>
      <div className="space-y-6 font-sans">
        
        {/* Page Header */}
        <div className="flex justify-between items-end mb-8">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-[#00103e] tracking-tight">Paramètres</h2>
            <p className="text-[#5c6470] text-sm">Gérez votre profil, votre sécurité et vos intégrations API.</p>
          </div>
          {activeTab === 'general' && (
            <button
              onClick={handleSaveGeneral}
              disabled={isSaving}
              className="bg-[#0a2463] hover:bg-[#1a3a72] text-white px-6 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-md transition disabled:opacity-50"
            >
              {isSaving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Enregistrer les modifications
            </button>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-[#e2e5ea] flex gap-8 mb-8 overflow-x-auto no-scrollbar">
          {[
            { id: 'general', name: 'Général', icon: User },
            { id: 'securite', name: 'Sécurité', icon: Shield },
            { id: 'notifications', name: 'Notifications', icon: Bell },
            { id: 'api', name: 'API & Webhooks', icon: Key },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-3 px-1 text-xs font-bold transition whitespace-nowrap flex items-center gap-2 border-b-2 ${
                  isActive
                    ? 'border-[#ea580c] text-[#ea580c]'
                    : 'border-transparent text-[#8b919d] hover:text-[#00103e]'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.name}
              </button>
            );
          })}
        </div>

        {/* 1. GENERAL TAB */}
        {activeTab === 'general' && (
          <div className="space-y-6">
            
            {/* Merchant Profile Details */}
            <div className="bg-white rounded-2xl p-6 border border-[#e2e5ea] shadow-card">
              <h3 className="text-sm font-bold text-[#00103e] mb-6 flex items-center gap-2">
                <User className="h-4 w-4 text-[#ea580c]" />
                Profil Marchand
              </h3>

              {isProfileLoading ? (
                <div className="space-y-4 animate-pulse">
                  <div className="h-10 bg-[#f0f2f5] rounded-xl" />
                  <div className="h-10 bg-[#f0f2f5] rounded-xl" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Left: Logo upload mockup */}
                  <div className="flex flex-col items-center justify-center border-2 border-dashed border-[#e2e5ea] rounded-2xl p-8 bg-[#f5f7fa] hover:border-[#ea580c] transition duration-150 cursor-pointer">
                    <div className="w-20 h-20 bg-white border border-[#e2e5ea] rounded-xl flex items-center justify-center text-lg font-black text-[#0a2463] mb-4">
                      {businessName.slice(0, 2).toUpperCase()}
                    </div>
                    <p className="text-xs font-bold text-[#0a2463]">Changer le logo</p>
                    <p className="text-[10px] text-[#8b919d] mt-1">PNG, JPG max 5MB</p>
                  </div>

                  {/* Right: Profile fields */}
                  <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#5c6470] uppercase">Nom de l'entreprise</label>
                      <input
                        type="text"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        className="w-full px-4 py-2 bg-white border border-[#e2e5ea] rounded-xl text-xs focus:outline-none focus:border-[#0a2463] transition"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#5c6470] uppercase">Email de contact</label>
                      <input
                        type="email"
                        disabled
                        value={email}
                        className="w-full px-4 py-2 bg-[#f5f7fa] border border-[#e2e5ea] rounded-xl text-xs text-[#8b919d] cursor-not-allowed"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#5c6470] uppercase">ID Marchand Unique</label>
                      <input
                        type="text"
                        disabled
                        value={profile?.id || ''}
                        className="w-full px-4 py-2 bg-[#f5f7fa] border border-[#e2e5ea] rounded-xl text-xs text-[#8b919d] cursor-not-allowed font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#5c6470] uppercase">Téléphone</label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-4 py-2 bg-white border border-[#e2e5ea] rounded-xl text-xs focus:outline-none focus:border-[#0a2463] transition"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#5c6470] uppercase">Adresse</label>
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full px-4 py-2 bg-white border border-[#e2e5ea] rounded-xl text-xs focus:outline-none focus:border-[#0a2463] transition"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>
        )}

        {/* 2. SECURITY TAB */}
        {activeTab === 'securite' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Update Password */}
              <div className="bg-white rounded-2xl p-6 border border-[#e2e5ea] shadow-card space-y-4">
                <h3 className="text-sm font-bold text-[#00103e] flex items-center gap-2">
                  <Shield className="h-4 w-4 text-[#ea580c]" />
                  Modifier le mot de passe
                </h3>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#5c6470] uppercase">Mot de passe actuel</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full px-4 py-2 border border-[#e2e5ea] rounded-xl text-xs focus:outline-none focus:border-[#0a2463]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#5c6470] uppercase">Nouveau mot de passe</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-2 border border-[#e2e5ea] rounded-xl text-xs focus:outline-none focus:border-[#0a2463]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#5c6470] uppercase">Confirmer le nouveau mot de passe</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-2 border border-[#e2e5ea] rounded-xl text-xs focus:outline-none focus:border-[#0a2463]"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      alert('Mot de passe mis à jour !');
                      setCurrentPassword('');
                      setNewPassword('');
                      setConfirmPassword('');
                    }}
                    className="w-full py-2.5 bg-[#f0f2f5] hover:bg-[#e4e7ea] text-[#00103e] font-bold rounded-xl text-xs transition border border-[#e2e5ea]"
                  >
                    Mettre à jour le mot de passe
                  </button>
                </div>
              </div>

              {/* 2FA Configuration */}
              <div className="bg-white rounded-2xl p-6 border border-[#e2e5ea] shadow-card flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <h3 className="text-sm font-bold text-[#00103e] flex items-center gap-2">
                      <Shield className="h-4 w-4 text-[#ea580c]" />
                      Authentification 2FA
                    </h3>
                    <span className="px-2 py-0.5 bg-[#95f8a7]/20 text-[#005323] text-[9px] font-bold rounded-full uppercase">Recommandé</span>
                  </div>
                  <p className="text-xs text-[#5c6470] leading-relaxed">
                    L'authentification à deux facteurs ajoute une couche de sécurité supplémentaire en exigeant plus qu'un simple mot de passe lors de vos connexions et transferts financiers.
                  </p>
                </div>
                <div className="flex items-center justify-between p-4 bg-[#0a2463]/5 rounded-xl border border-[#0a2463]/10 mt-6">
                  <div>
                    <p className="text-xs font-bold text-[#00103e]">Statut : {is2FaEnabled ? 'Activé' : 'Désactivé'}</p>
                    <p className="text-[10px] text-[#5c6470] mt-0.5">Sécurisez votre compte maintenant</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIs2FaEnabled(!is2FaEnabled)}
                    className="px-4 py-2 bg-[#0a2463] text-white font-bold rounded-lg text-xs hover:bg-[#1a3a72] transition"
                  >
                    {is2FaEnabled ? 'Désactiver' : 'Activer'}
                  </button>
                </div>
              </div>

            </div>

            {/* Active Sessions */}
            <div className="bg-white rounded-2xl border border-[#e2e5ea] shadow-card overflow-hidden">
              <div className="p-6 border-b border-[#e2e5ea]">
                <h3 className="text-sm font-bold text-[#00103e] flex items-center gap-2">
                  <Monitor className="h-4 w-4 text-[#ea580c]" />
                  Sessions actives
                </h3>
              </div>
              <table className="w-full text-left text-xs text-[#3c3f4a]">
                <thead className="bg-[#f5f7fa] font-bold text-[#5c6470] uppercase">
                  <tr>
                    <th className="px-6 py-3">Appareil</th>
                    <th className="px-6 py-3">Lieu</th>
                    <th className="px-6 py-3">Adresse IP</th>
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e2e5ea]">
                  <tr className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Monitor className="h-4 w-4 text-[#5c6470]" />
                        <span className="font-semibold text-[#00103e]">MacBook Pro M2</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[#5c6470]">N'Djaména, Tchad</td>
                    <td className="px-6 py-4 text-[#5c6470] font-mono">41.203.22.14</td>
                    <td className="px-6 py-4 text-[#5c6470]">Aujourd'hui, 10:45</td>
                    <td className="px-6 py-4 text-emerald-700 font-bold">Session actuelle</td>
                  </tr>
                  <tr className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Smartphone className="h-4 w-4 text-[#5c6470]" />
                        <span className="font-semibold text-[#00103e]">iPhone 14 Pro</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[#5c6470]">N'Djaména, Tchad</td>
                    <td className="px-6 py-4 text-[#5c6470] font-mono">154.72.164.20</td>
                    <td className="px-6 py-4 text-[#5c6470]">Hier, 18:20</td>
                    <td className="px-6 py-4">
                      <button type="button" onClick={() => alert('Session déconnectée')} className="text-rose-600 font-bold hover:underline">Déconnecter</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* 3. NOTIFICATIONS TAB */}
        {activeTab === 'notifications' && (
          <div className="max-w-2xl bg-white border border-[#e2e5ea] rounded-2xl shadow-card p-6 space-y-6">
            <h3 className="text-sm font-bold text-[#00103e] flex items-center gap-2">
              <Bell className="h-4 w-4 text-[#ea580c]" />
              Préférences de notification
            </h3>

            <div className="space-y-6">
              
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-[#00103e]">Paiements reçus</p>
                  <p className="text-[10px] text-[#5c6470]">Être alerté pour chaque nouvelle transaction (Email/SMS).</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifPayments}
                  onChange={(e) => setNotifPayments(e.target.checked)}
                  className="rounded border-[#e2e5ea] text-[#0a2463] focus:ring-[#0a2463] h-4 w-4"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-[#00103e]">Rapports hebdomadaires</p>
                  <p className="text-[10px] text-[#5c6470]">Recevez un résumé de votre activité chaque lundi matin.</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifReports}
                  onChange={(e) => setNotifReports(e.target.checked)}
                  className="rounded border-[#e2e5ea] text-[#0a2463] focus:ring-[#0a2463] h-4 w-4"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-[#00103e]">Alertes de sécurité</p>
                  <p className="text-[10px] text-[#5c6470]">Notifications en cas de connexion suspecte ou modification d'accès.</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifSecurity}
                  onChange={(e) => setNotifSecurity(e.target.checked)}
                  className="rounded border-[#e2e5ea] text-[#0a2463] focus:ring-[#0a2463] h-4 w-4"
                />
              </div>

            </div>
          </div>
        )}

        {/* 4. API & WEBHOOKS TAB */}
        {activeTab === 'api' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* API Keys */}
              <div className="bg-white rounded-2xl p-6 border border-[#e2e5ea] shadow-card space-y-6">
                <div className="flex justify-between items-start">
                  <h3 className="text-sm font-bold text-[#00103e] flex items-center gap-2">
                    <Key className="h-4 w-4 text-[#ea580c]" />
                    Clés d'API
                  </h3>
                  <button
                    onClick={() => generateKeyMutation.mutate(true)}
                    className="inline-flex items-center text-xs font-bold text-[#0a2463] hover:underline"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    Générer une clé Live
                  </button>
                </div>

                {isKeysLoading ? (
                  <div className="space-y-3 animate-pulse">
                    <div className="h-10 bg-[#f0f2f5] rounded-xl" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {apiKeys && apiKeys.length > 0 ? (
                      apiKeys.map((key: any) => (
                        <div key={key.id} className="p-3 bg-[#f5f7fa] rounded-xl border border-[#e2e5ea] space-y-3">
                          <div className="flex justify-between items-center">
                            <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                              key.isLive
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}>
                              {key.isLive ? 'Live / Réel' : 'Test / Sandbox'}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm('Voulez-vous révoquer définitivement cette clé API ?')) {
                                  revokeKeyMutation.mutate(key.id);
                                }
                              }}
                              className="text-rose-600 hover:text-rose-700 font-bold text-[10px] flex items-center"
                            >
                              <Trash2 className="h-3.5 w-3.5 mr-1" /> Révoquer
                            </button>
                          </div>
                          
                          <div className="space-y-1 text-xs">
                            <span className="text-[10px] font-bold text-[#8b919d] uppercase">Clé Publique</span>
                            <div className="relative">
                              <input
                                type="text"
                                readOnly
                                value={key.publicKey}
                                className="w-full px-3 py-1.5 bg-white border border-[#e2e5ea] rounded-lg text-[10px] font-mono focus:outline-none"
                              />
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-4 text-center text-[#8b919d] text-xs">Aucune clé API active.</div>
                    )}
                  </div>
                )}
              </div>

              {/* Webhooks Config */}
              <div className="bg-white rounded-2xl p-6 border border-[#e2e5ea] shadow-card space-y-6">
                <h3 className="text-sm font-bold text-[#00103e] flex items-center gap-2">
                  <Key className="h-4 w-4 text-[#ea580c]" />
                  Configuration Webhook
                </h3>

                <form onSubmit={handleSaveWebhook} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#5c6470] uppercase">URL du Webhook de production</label>
                    <input
                      type="url"
                      required
                      value={webhookUrl}
                      onChange={(e) => setWebhookUrl(e.target.value)}
                      placeholder="https://api.monsite.com/webhooks/innovpay"
                      className="w-full px-4 py-2 border border-[#e2e5ea] rounded-xl text-xs focus:outline-none focus:border-[#0a2463] transition"
                    />
                    <p className="text-[9px] text-[#8b919d] italic mt-1">Les événements POST de paiements seront transmis à cette URL.</p>
                  </div>
                  <button
                    type="submit"
                    disabled={saveWebhookMutation.isPending}
                    className="w-full bg-[#0a2463] hover:bg-[#1a3a72] text-white py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2"
                  >
                    {saveWebhookMutation.isPending && <RefreshCw className="h-4 w-4 animate-spin" />}
                    Sauvegarder l'URL du webhook
                  </button>
                </form>
              </div>

            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
