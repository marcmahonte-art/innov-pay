'use client';

import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Key, Copy, RotateCw, Trash2, CheckCircle, Loader2, Lock, ShieldAlert } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { apiClient } from '@/lib/api';

export default function ApiKeysPage() {
  const [newSecretKey, setNewSecretKey] = useState('');
  const [copied, setCopied] = useState(false);

  // Fetch API Keys
  const { data: apiKeys, isLoading, refetch } = useQuery({
    queryKey: ['apiKeys'],
    queryFn: async () => {
      const res = await apiClient.get('/merchants/api-keys');
      return res.data;
    },
  });

  // Fetch KYC status for production compliance check
  const { data: kycData } = useQuery({
    queryKey: ['kycDocs'],
    queryFn: async () => {
      const res = await apiClient.get('/kyc/documents');
      return res.data;
    },
  });

  const globalStatus = kycData?.kycStatus || 'UNVERIFIED';

  // Create API Key Mutation
  const createMutation = useMutation({
    mutationFn: async (isLive: boolean) => {
      const res = await apiClient.post('/merchants/api-keys', { isLive });
      return res.data;
    },
    onSuccess: (data) => {
      setNewSecretKey(data.secretKey);
      refetch();
    },
  });

  // Rotate API Key Mutation
  const rotateMutation = useMutation({
    mutationFn: async (keyId: string) => {
      const res = await apiClient.post(`/merchants/api-keys/${keyId}/rotate`);
      return res.data;
    },
    onSuccess: (data) => {
      setNewSecretKey(data.secretKey);
      refetch();
    },
  });

  // Revoke API Key Mutation
  const revokeMutation = useMutation({
    mutationFn: async (keyId: string) => {
      await apiClient.delete(`/merchants/api-keys/${keyId}`);
    },
    onSuccess: () => {
      refetch();
    },
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(newSecretKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isMutating = createMutation.isPending || rotateMutation.isPending || revokeMutation.isPending;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Clés API</h1>
          <p className="text-slate-400 mt-1">Gérez vos clés d'API publiques et secrètes pour intégrer Innov Pay dans vos applications.</p>
        </div>

        {/* Secret Key Disclosure Box */}
        {newSecretKey && (
          <div className="bg-slate-900 border-2 border-emerald-500/30 rounded-3xl p-6 shadow-2xl space-y-4 animate-pulse-once">
            <div className="flex items-center space-x-3 text-emerald-400">
              <CheckCircle className="h-6 w-6" />
              <h3 className="text-lg font-bold text-white">Nouvelle clé secrète générée !</h3>
            </div>
            
            <p className="text-sm text-slate-400">
              Veuillez la copier et la stocker de manière sécurisée. Nous ne pourrons plus vous la réafficher pour des raisons évidentes de sécurité.
            </p>

            <div className="relative bg-slate-950 p-4 rounded-2xl border border-slate-800 font-mono text-xs flex justify-between items-center text-slate-300 break-all select-all">
              <span className="pr-12">{newSecretKey}</span>
              <button 
                onClick={handleCopy}
                className="absolute right-3 top-3 p-2 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded-lg shrink-0 transition"
              >
                {copied ? <span className="text-emerald-400 text-xs font-semibold">Copié !</span> : <Copy className="h-4 w-4" />}
              </button>
            </div>

            <button
              onClick={() => setNewSecretKey('')}
              className="py-2.5 px-6 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition"
            >
              J'ai sauvegardé ma clé secrète
            </button>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => createMutation.mutate(false)}
              disabled={isMutating}
              className="flex items-center bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 px-5 rounded-2xl text-sm transition disabled:opacity-40"
            >
              {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Key className="h-4 w-4 mr-2 text-indigo-400" />}
              Générer Clé de Test (Sandbox)
            </button>
            
            <button
              onClick={() => createMutation.mutate(true)}
              disabled={isMutating || globalStatus !== 'APPROVED'}
              className="flex items-center bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-5 rounded-2xl text-sm transition shadow-lg shadow-indigo-600/10 disabled:opacity-40 disabled:cursor-not-allowed"
              title={globalStatus !== 'APPROVED' ? 'Veuillez soumettre vos documents de conformité KYC pour débloquer le mode production.' : 'Générer clé de production'}
            >
              {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Key className="h-4 w-4 mr-2" />}
              Générer Clé Live (Production)
            </button>
          </div>

          {globalStatus !== 'APPROVED' && (
            <div className="flex items-start space-x-2.5 p-4 bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs rounded-2xl max-w-2xl">
              <ShieldAlert className="h-4.5 w-4.5 shrink-0 text-amber-400 mt-0.5" />
              <div>
                <strong>Alerte de Conformité :</strong> La création de clés d'API réelles (LIVE) nécessite que votre dossier KYC d'entreprise soit entièrement validé. Rendez-vous sur la page <a href="/dashboard/kyc" className="underline font-bold text-white hover:text-indigo-200">Conformité KYC</a> pour régulariser votre situation.
              </div>
            </div>
          )}
        </div>

        {/* API Keys Table */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-3xl p-6 shadow-2xl">
          <h3 className="text-lg font-bold text-white mb-6">Vos Clés Publiques Actives</h3>

          {isLoading ? (
            <div className="space-y-4">
              <div className="h-12 bg-slate-950/50 rounded-2xl animate-pulse" />
              <div className="h-12 bg-slate-950/50 rounded-2xl animate-pulse" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-800 text-left text-sm text-slate-300">
                <thead>
                  <tr className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    <th className="py-3.5 px-4">Clé Publique</th>
                    <th className="py-3.5 px-4">Environnement</th>
                    <th className="py-3.5 px-4">Créée le</th>
                    <th className="py-3.5 px-4">Dernière utilisation</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {apiKeys && apiKeys.length > 0 ? (
                    apiKeys.map((key: any) => (
                      <tr key={key.id} className="hover:bg-slate-850/25 transition">
                        <td className="py-4 px-4 font-mono text-xs text-white">{key.publicKey}</td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center rounded-lg px-2.5 py-0.5 text-xs font-bold border ${
                            key.isLive 
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          }`}>
                            {key.isLive ? 'LIVE' : 'TEST'}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-xs text-slate-400">
                          {new Date(key.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="py-4 px-4 text-xs text-slate-500">
                          {key.lastUsedAt 
                            ? new Date(key.lastUsedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
                            : 'Jamais utilisée'
                          }
                        </td>
                        <td className="py-4 px-4 text-right flex justify-end space-x-3">
                          <button
                            onClick={() => {
                              if (confirm('Voulez-vous vraiment régénérer (tourner) cette clé ? La clé actuelle cessera de fonctionner immédiatement.')) {
                                rotateMutation.mutate(key.id);
                              }
                            }}
                            title="Tourner la clé"
                            disabled={isMutating}
                            className="p-2 bg-slate-950 text-indigo-400 hover:text-white border border-slate-800 hover:border-slate-700 rounded-xl transition disabled:opacity-50"
                          >
                            <RotateCw className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Voulez-vous révoquer définitivement cette clé d\'API ?')) {
                                revokeMutation.mutate(key.id);
                              }
                            }}
                            title="Révoquer la clé"
                            disabled={isMutating}
                            className="p-2 bg-slate-950 text-rose-400 hover:text-rose-300 border border-slate-800 hover:border-rose-950 rounded-xl transition disabled:opacity-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-500">
                        Aucune clé API active. Utilisez les boutons ci-dessus pour en créer.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
