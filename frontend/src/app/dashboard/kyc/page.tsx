'use client';

import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { ShieldCheck, FileCheck, UploadCloud, AlertCircle, Clock, XCircle, Info, Loader2, CheckCircle } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { apiClient } from '@/lib/api';

export default function KycPage() {
  const [docType, setDocType] = useState<'RCCM' | 'NIF' | 'ID_CARD'>('RCCM');
  const [mockFileUrl, setMockFileUrl] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Fetch KYC status and documents
  const { data: kycData, isLoading, refetch } = useQuery({
    queryKey: ['kycDocs'],
    queryFn: async () => {
      const res = await apiClient.get('/kyc/documents');
      return res.data;
    },
  });

  // Upload KYC Document Mutation
  const uploadMutation = useMutation({
    mutationFn: async () => {
      setError('');
      setSuccess(false);

      if (!mockFileUrl) throw new Error('Veuillez spécifier l\'URL du document à soumettre');

      const res = await apiClient.post('/kyc/upload', {
        type: docType,
        fileUrl: mockFileUrl,
      });
      return res.data;
    },
    onSuccess: () => {
      setSuccess(true);
      setMockFileUrl('');
      refetch();
    },
    onError: (err: any) => {
      setError(err.message || 'Échec de la soumission du document.');
    },
  });

  const getDocStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-400 border border-emerald-500/20"><FileCheck className="h-3 w-3 mr-1" /> Validé</span>;
      case 'PENDING':
        return <span className="inline-flex items-center rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-bold text-amber-400 border border-amber-500/20"><Clock className="h-3 w-3 mr-1" /> En cours d'analyse</span>;
      case 'REJECTED':
        return <span className="inline-flex items-center rounded-full bg-rose-500/10 px-2.5 py-0.5 text-xs font-bold text-rose-400 border border-rose-500/20"><XCircle className="h-3 w-3 mr-1" /> Rejeté</span>;
      default:
        return <span className="inline-flex items-center rounded-full bg-slate-500/10 px-2.5 py-0.5 text-xs font-bold text-slate-400 border border-slate-500/20">Non soumis</span>;
    }
  };

  const docLabels = {
    RCCM: 'Registre du Commerce (RCCM)',
    NIF: 'Numéro d\'Identification Fiscale (NIF)',
    ID_CARD: 'Pièce d\'identité du gérant (CNI/Passeport)',
  };

  const globalStatus = kycData?.kycStatus || 'UNVERIFIED';

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Conformité KYC</h1>
          <p className="text-slate-400 mt-1">Conformément à la réglementation COBAC en zone CEMAC, soumettez vos documents d'entreprise pour activer vos clés de production.</p>
        </div>

        {/* Global Compliance Status Banner */}
        <div className={`p-6 rounded-3xl border flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 ${
          globalStatus === 'APPROVED'
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
            : globalStatus === 'PENDING'
            ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
            : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
        }`}>
          <div className="flex items-start space-x-3">
            <ShieldCheck className="h-8 w-8 shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-bold text-white">Statut du Compte Marchand : {globalStatus}</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {globalStatus === 'APPROVED'
                  ? 'Félicitations ! Vos fonctionnalités de production en direct sont déverrouillées.'
                  : globalStatus === 'PENDING'
                  ? 'Vos documents sont en cours d\'analyse par notre service conformité. Délai estimé: 24h.'
                  : 'Veuillez soumettre vos justificatifs pour déverrouiller vos clés LIVE.'
                }
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Submission Panel */}
          <div className="lg:col-span-1 bg-slate-900 border border-slate-800/80 rounded-3xl p-6 shadow-2xl flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white">Soumettre un document</h3>
              
              {success && (
                <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 flex items-start space-x-3 text-emerald-400 text-sm">
                  <CheckCircle className="h-5 w-5 shrink-0 mt-0.5" />
                  <span>Document transmis avec succès ! Notre équipe va l'examiner.</span>
                </div>
              )}

              {error && (
                <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-4 flex items-start space-x-3 text-rose-400 text-sm">
                  <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400">Type de document</label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value as any)}
                  className="w-full bg-slate-950/80 border-slate-800 text-slate-300 rounded-xl py-3 px-4 text-sm focus:ring-indigo-500"
                >
                  <option value="RCCM">Registre du Commerce (RCCM)</option>
                  <option value="NIF">Numéro d'Identification Fiscale (NIF)</option>
                  <option value="ID_CARD">Pièce d'Identité du gérant</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400">URL du fichier justificatif</label>
                <input
                  type="text"
                  required
                  value={mockFileUrl}
                  onChange={(e) => setMockFileUrl(e.target.value)}
                  placeholder="https://s3.stockage.com/eshop/rccm.pdf"
                  className="w-full bg-slate-950/80 border-slate-800 text-white rounded-xl py-3 px-4 text-sm focus:ring-indigo-500"
                />
              </div>

              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-850 flex items-start space-x-2 text-slate-400 text-[10px]">
                <Info className="h-4 w-4 shrink-0 text-slate-500" />
                <span>Simulez le dépôt en spécifiant une URL de document factice ou hébergé.</span>
              </div>
            </div>

            <button
              onClick={() => uploadMutation.mutate()}
              disabled={uploadMutation.isPending}
              className="w-full flex justify-center items-center py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-lg transition duration-200 disabled:opacity-50"
            >
              {uploadMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <UploadCloud className="h-4 w-4 mr-2" />}
              Téléverser le Document
            </button>
          </div>

          {/* Verification Progress / Document logs */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800/80 rounded-3xl p-6 shadow-2xl space-y-6">
            <h3 className="text-lg font-bold text-white">Justificatifs Transmis</h3>

            {isLoading ? (
              <div className="space-y-4">
                <div className="h-14 bg-slate-950/50 rounded-2xl animate-pulse" />
                <div className="h-14 bg-slate-950/50 rounded-2xl animate-pulse" />
              </div>
            ) : (
              <div className="space-y-4">
                {/* Visual checkpoints of core items */}
                {['RCCM', 'NIF', 'ID_CARD'].map((type) => {
                  const submittedDoc = kycData?.documents?.find((d: any) => d.type === type);
                  return (
                    <div 
                      key={type}
                      className="flex items-center justify-between p-4 bg-slate-950/80 border border-slate-850 rounded-2xl"
                    >
                      <div>
                        <h4 className="text-sm font-bold text-white">{docLabels[type as keyof typeof docLabels]}</h4>
                        {submittedDoc ? (
                          <div className="mt-1 flex items-center space-x-2">
                            <a 
                              href={submittedDoc.fileUrl} 
                              target="_blank" 
                              rel="noreferrer"
                              className="text-[10px] text-indigo-400 hover:underline font-mono truncate max-w-[200px] sm:max-w-xs"
                            >
                              Voir le fichier transmis
                            </a>
                            {submittedDoc.notes && (
                              <span className="text-[10px] text-rose-400">({submittedDoc.notes})</span>
                            )}
                          </div>
                        ) : (
                          <p className="text-[10px] text-slate-500 mt-1">Requis pour validation globale.</p>
                        )}
                      </div>

                      <div>
                        {submittedDoc ? getDocStatusBadge(submittedDoc.status) : getDocStatusBadge('NOT_SUBMITTED')}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
