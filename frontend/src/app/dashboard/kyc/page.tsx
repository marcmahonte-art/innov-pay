'use client';

import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { ShieldCheck, FileCheck, UploadCloud, AlertCircle, Clock, XCircle, Info, Loader2, Check, Building, FileText, UserCheck, Eye } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { apiClient } from '@/lib/api';

export default function KycPage() {
  const [activeStep, setActiveStep] = useState(1);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Business info form details (Step 1)
  const [businessName, setBusinessName] = useState('');
  const [rccmNumber, setRccmNumber] = useState('');
  const [nifNumber, setNifNumber] = useState('');

  // Fetch KYC status and documents
  const { data: kycData, isLoading, refetch } = useQuery({
    queryKey: ['kycDocs'],
    queryFn: async () => {
      const res = await apiClient.get('/kyc/documents');
      return res.data;
    },
  });

  const getDocTypeForStep = (step: number): 'RCCM' | 'NIF' | 'ID_CARD' | null => {
    if (step === 2) return 'RCCM';
    if (step === 3) return 'NIF';
    if (step === 4) return 'ID_CARD';
    return null;
  };

  // Upload KYC Document Mutation
  const uploadMutation = useMutation({
    mutationFn: async () => {
      setError('');
      setSuccess(false);

      const docType = getDocTypeForStep(activeStep);
      if (!docType) throw new Error('Étape invalide pour le téléversement.');
      if (!selectedFile) throw new Error('Veuillez sélectionner un fichier justificatif.');

      // Check size limit: 10MB
      if (selectedFile.size > 10 * 1024 * 1024) {
        throw new Error('Le fichier est trop volumineux. La limite est de 10 Mo.');
      }

      // Check type: PDF, JPEG, PNG
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(selectedFile.type)) {
        throw new Error('Format de fichier invalide. PDF, PNG ou JPG uniquement.');
      }

      const formData = new FormData();
      formData.append('type', docType);
      formData.append('file', selectedFile);

      const res = await apiClient.post('/kyc/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return res.data;
    },
    onSuccess: () => {
      setSuccess(true);
      setSelectedFile(null);
      refetch();
      // Auto advance step after upload success
      setTimeout(() => {
        setSuccess(false);
        if (activeStep < 4) {
          setActiveStep(activeStep + 1);
        }
      }, 2000);
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || err.message || 'Échec de la soumission du document.');
    },
  });

  const getDocStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-250"><FileCheck className="h-3 w-3 mr-1" /> Validé</span>;
      case 'PENDING':
        return <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-700 border border-amber-250"><Clock className="h-3 w-3 mr-1" /> En attente</span>;
      case 'REJECTED':
        return <span className="inline-flex items-center rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-bold text-rose-700 border border-rose-250"><XCircle className="h-3 w-3 mr-1" /> Rejeté</span>;
      default:
        return <span className="inline-flex items-center rounded-full bg-[#f0f2f5] px-2.5 py-0.5 text-xs font-bold text-[#5c6470] border border-[#e2e5ea]">Non soumis</span>;
    }
  };

  const docLabels = {
    RCCM: 'Registre du Commerce (RCCM)',
    NIF: 'Identifiant Fiscale (NIF)',
    ID_CARD: 'Pièce d\'identité du gérant',
  };

  const steps = [
    { number: 1, label: 'Entreprise', icon: Building },
    { number: 2, label: 'Registre RCCM', icon: FileText },
    { number: 3, label: 'Déclaration NIF', icon: FileText },
    { number: 4, label: 'Pièce d\'identité', icon: UserCheck },
  ];

  const globalStatus = kycData?.kycStatus || 'UNVERIFIED';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setError('');
      setSuccess(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-[#00103e] tracking-tight">Vérification de Conformité (KYC)</h1>
          <p className="text-[#5c6470] text-sm">Conformément aux directives de la COBAC en zone CEMAC, veuillez soumettre vos documents pour activer votre compte de production.</p>
        </div>

        {/* Global Compliance Status Banner */}
        <div className={`p-6 rounded-2xl border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${
          globalStatus === 'APPROVED'
            ? 'bg-emerald-50 border-emerald-250 text-emerald-800'
            : globalStatus === 'PENDING'
            ? 'bg-amber-50 border-amber-250 text-amber-800'
            : 'bg-rose-50 border-rose-250 text-rose-800'
        }`}>
          <div className="flex items-start space-x-3.5">
            <ShieldCheck className="h-8 w-8 shrink-0 text-[#00103e] mt-0.5" />
            <div>
              <h3 className="text-lg font-bold text-[#00103e]">Statut du Compte Marchand : {
                globalStatus === 'APPROVED' ? 'Approuvé (LIVE)' :
                globalStatus === 'PENDING' ? 'En cours d\'analyse' : 'Non Vérifié (Sandbox)'
              }</h3>
              <p className="text-xs text-[#5c6470] mt-1">
                {globalStatus === 'APPROVED'
                  ? 'Félicitations ! Vos fonctionnalités de production en direct sont entièrement débloquées.'
                  : globalStatus === 'PENDING'
                  ? 'Vos justificatifs sont en cours de vérification par nos agents de conformité. Délai estimé : 24h.'
                  : 'Veuillez téléverser les documents requis ci-dessous pour lancer vos encaissements réels.'
                }
              </p>
            </div>
          </div>
        </div>

        {/* 4-Step Progress Indicator */}
        <div className="bg-white border border-[#e2e5ea] p-6 rounded-2xl shadow-card">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {steps.map((step, idx) => {
              const isCompleted = activeStep > step.number;
              const isActive = activeStep === step.number;
              return (
                <React.Fragment key={step.number}>
                  <button
                    onClick={() => setActiveStep(step.number)}
                    className="flex items-center gap-3 focus:outline-none group"
                  >
                    <div className={`flex items-center justify-center h-10 w-10 rounded-full border text-sm font-bold transition-all duration-200 ${
                      isCompleted 
                        ? 'bg-[#0a2463] border-[#0a2463] text-white' 
                        : isActive 
                        ? 'bg-[#0a2463]/10 border-[#0a2463] text-[#0a2463]' 
                        : 'bg-[#f5f7fa] border-[#e2e5ea] text-[#8b919d] group-hover:border-[#8b919d]'
                    }`}>
                      {isCompleted ? <Check className="h-4 w-4" /> : step.number}
                    </div>
                    <div className="text-left">
                      <p className={`text-xs font-bold uppercase tracking-wider ${
                        isActive ? 'text-[#0a2463]' : isCompleted ? 'text-[#3c3f4a]' : 'text-[#8b919d]'
                      }`}>{step.label}</p>
                    </div>
                  </button>
                  {idx < steps.length - 1 && (
                    <div className="hidden md:block flex-1 h-[2px] bg-[#e2e5ea]" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Submission Stepper Panel */}
          <div className="lg:col-span-2 bg-white border border-[#e2e5ea] rounded-2xl p-6 sm:p-8 shadow-card flex flex-col justify-between space-y-6">
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-[#00103e]">Étape {activeStep} : {
                activeStep === 1 ? 'Informations d\'Enregistrement' :
                activeStep === 2 ? 'Téléversement Registre du Commerce (RCCM)' :
                activeStep === 3 ? 'Téléversement Déclaration Fiscale (NIF)' :
                'Téléversement de la Pièce d\'Identité du Gérant'
              }</h3>

              {success && (
                <div className="rounded-xl bg-emerald-50 border border-emerald-250 p-4 flex items-start space-x-3 text-emerald-700 text-sm">
                  <ShieldCheck className="h-5 w-5 shrink-0 mt-0.5" />
                  <span>Fichier téléversé avec succès ! Soumission enregistrée.</span>
                </div>
              )}

              {error && (
                <div className="rounded-xl bg-rose-55 border border-rose-250 p-4 flex items-start space-x-3 text-rose-700 text-sm">
                  <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Step 1: Text Fields */}
              {activeStep === 1 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-[#5c6470] uppercase tracking-wider">Raison Sociale</label>
                      <input
                        type="text"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder="Ex: Société E-Commerce Tchad"
                        className="w-full bg-[#f5f7fa] border border-[#e2e5ea] text-[#0f1214] rounded-xl py-2 px-3 text-sm focus:outline-none focus:border-[#0a2463] transition"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-[#5c6470] uppercase tracking-wider">Numéro RCCM</label>
                      <input
                        type="text"
                        value={rccmNumber}
                        onChange={(e) => setRccmNumber(e.target.value)}
                        placeholder="Ex: RC/NDJ/2026/B-1234"
                        className="w-full bg-[#f5f7fa] border border-[#e2e5ea] text-[#0f1214] rounded-xl py-2 px-3 text-sm focus:outline-none focus:border-[#0a2463] transition"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#5c6470] uppercase tracking-wider">Numéro d'Identification Fiscale (NIF)</label>
                    <input
                      type="text"
                      value={nifNumber}
                      onChange={(e) => setNifNumber(e.target.value)}
                      placeholder="Ex: 3-123456-A"
                      className="w-full bg-[#f5f7fa] border border-[#e2e5ea] text-[#0f1214] rounded-xl py-2 px-3 text-sm focus:outline-none focus:border-[#0a2463] transition"
                    />
                  </div>
                  <div className="p-4 bg-[#f5f7fa] border border-[#e2e5ea] rounded-xl flex items-start space-x-3 text-[#5c6470] text-xs leading-relaxed">
                    <Info className="h-4 w-4 shrink-0 text-[#0a2463] mt-0.5" />
                    <span>Ces informations doivent correspondre exactement aux données indiquées sur vos justificatifs fiscaux et juridiques nationaux.</span>
                  </div>
                </div>
              )}

              {/* Steps 2, 3, 4: File Drag & Drop */}
              {activeStep > 1 && (
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-[#e2e5ea] hover:border-[#8b919d] bg-[#f5f7fa] rounded-2xl p-8 text-center transition duration-200 relative">
                    <input
                      type="file"
                      id="kyc-file-picker"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      accept=".pdf,.png,.jpg,.jpeg"
                    />
                    <div className="space-y-4">
                      <div className="flex justify-center">
                        <UploadCloud className="h-10 w-10 text-[#0a2463]" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#00103e]">
                          {selectedFile ? selectedFile.name : 'Sélectionner ou Glisser votre fichier'}
                        </p>
                        <p className="text-xs text-[#8b919d] mt-1">
                          PDF, PNG, JPG (Max. 10 Mo)
                        </p>
                      </div>
                      {selectedFile && (
                        <div className="inline-flex items-center rounded-lg bg-[#0a2463]/5 px-3 py-1 text-xs text-[#0a2463] font-semibold border border-[#0a2463]/10">
                          Taille : {(selectedFile.size / (1024 * 1024)).toFixed(2)} Mo
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center border-t border-[#e2e5ea] pt-6 mt-6">
              <button
                disabled={activeStep === 1}
                onClick={() => {
                  setError('');
                  setSuccess(false);
                  setActiveStep(activeStep - 1);
                }}
                className="py-2.5 px-6 border border-[#e2e5ea] hover:bg-[#f5f7fa] text-[#5c6470] hover:text-[#00103e] text-sm font-bold rounded-xl transition disabled:opacity-40"
              >
                Précédent
              </button>

              {activeStep === 1 ? (
                <button
                  onClick={() => setActiveStep(2)}
                  className="py-2.5 px-6 bg-[#0a2463] hover:bg-[#1a3a72] text-white text-sm font-bold rounded-xl shadow-md transition"
                >
                  Suivant
                </button>
              ) : (
                <button
                  onClick={() => uploadMutation.mutate()}
                  disabled={uploadMutation.isPending || !selectedFile}
                  className="inline-flex items-center justify-center py-2.5 px-6 bg-[#0a2463] hover:bg-[#1a3a72] text-white text-sm font-bold rounded-xl shadow-md disabled:opacity-50 transition"
                >
                  {uploadMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  Soumettre Étape {activeStep}
                </button>
              )}
            </div>
          </div>

          {/* Verification Progress / Document logs */}
          <div className="lg:col-span-1 bg-white border border-[#e2e5ea] rounded-2xl p-6 shadow-card space-y-6">
            <h3 className="text-lg font-bold text-[#00103e]">Justificatifs Transmis</h3>

            {isLoading ? (
              <div className="space-y-4 animate-pulse">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-[#f0f2f5] rounded-xl" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {['RCCM', 'NIF', 'ID_CARD'].map((type) => {
                  const submittedDoc = kycData?.documents?.find((d: any) => d.type === type);
                  return (
                    <div 
                      key={type}
                      className="p-4 bg-[#f5f7fa] border border-[#e2e5ea] rounded-xl space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-[#00103e] uppercase tracking-wider">{docLabels[type as keyof typeof docLabels]}</h4>
                        {submittedDoc ? getDocStatusBadge(submittedDoc.status) : getDocStatusBadge('NOT_SUBMITTED')}
                      </div>

                      {submittedDoc ? (
                        <div className="flex items-center justify-between border-t border-[#e2e5ea]/50 pt-2 mt-2">
                          <a 
                            href={submittedDoc.presignedUrl || submittedDoc.fileUrl} 
                            target="_blank" 
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs text-[#0a2463] hover:text-[#1a3a72] font-semibold"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            Visualiser le fichier
                          </a>
                          {submittedDoc.notes && (
                            <span className="text-[10px] text-rose-600 font-medium italic">Motif : {submittedDoc.notes}</span>
                          )}
                        </div>
                      ) : (
                        <p className="text-[10px] text-[#8b919d]">Obligatoire pour passer au mode de production LIVE.</p>
                      )}
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
