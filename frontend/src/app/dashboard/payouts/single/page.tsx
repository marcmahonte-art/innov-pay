'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Send, CheckCircle2, AlertCircle, RefreshCw, Upload, Download, Smartphone, HelpCircle, Layers, Check } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { apiClient } from '@/lib/api';

export default function PayoutsPage() {
  const [activeTab, setActiveTab] = useState<'unitaire' | 'masse'>('unitaire');
  
  // Tab 1: Single Payout States
  const [operator, setOperator] = useState('AIRTEL');
  const [phone, setPhone] = useState('');
  const [singleAmount, setSingleAmount] = useState('');
  const [description, setDescription] = useState('');
  
  // Tab 2: Mass Payout wizard states (Step 1 to 4)
  const [wizardStep, setWizardStep] = useState(1);
  const [csvContent, setCsvContent] = useState('');
  const [progressPercent, setProgressPercent] = useState(0);

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

  // Fetch dashboard stats (for balance)
  const { data: stats, refetch: refetchStats } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      const res = await apiClient.get('/merchants/dashboard');
      return res.data;
    },
  });

  // Execute Single Payout (we call bulk-payout backend endpoint with exactly 1 item)
  const singlePayoutMutation = useMutation({
    mutationFn: async () => {
      if (!phone || !singleAmount) throw new Error('Téléphone et montant requis.');
      const items = [{
        recipientPhone: phone.startsWith('+235') ? phone : `+235${phone}`,
        recipientName: 'Destinataire Unique',
        amount: parseFloat(singleAmount),
        provider: operator.toLowerCase(),
      }];

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
    onSuccess: () => {
      alert('Envoi unitaire exécuté avec succès !');
      setPhone('');
      setSingleAmount('');
      setDescription('');
      refetchStats();
    },
    onError: (err: any) => {
      alert(`Erreur lors de l'envoi: ${err.response?.data?.message || err.message}`);
    },
  });

  const handleSingleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    singlePayoutMutation.mutate();
  };

  // Run bulk payout simulation timer for Step 3
  useEffect(() => {
    if (wizardStep === 3) {
      setProgressPercent(0);
      const interval = setInterval(() => {
        setProgressPercent((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => {
              setWizardStep(4);
            }, 600);
            return 100;
          }
          return prev + 25;
        });
      }, 800);
      return () => clearInterval(interval);
    }
  }, [wizardStep]);

  const handleCsvImport = () => {
    if (!csvContent) {
      alert('Veuillez copier/coller des lignes CSV.');
      return;
    }
    setWizardStep(2);
  };

  const handleExecuteMassPay = () => {
    setWizardStep(3);
  };

  const formatXaf = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XAF', minimumFractionDigits: 0 }).format(amount);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 font-sans">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-[#00103e] tracking-tight">Envoyer de l'argent</h2>
            <p className="text-[#5c6470] text-sm">Gérez vos envois unitaires ou exécutez des paiements de masse en toute sécurité.</p>
          </div>
          
          <div className="bg-white p-4 rounded-2xl shadow-card border border-[#e2e5ea] flex items-center gap-4">
            <div className="p-2.5 bg-[#0a2463]/5 rounded-xl text-[#0a2463]">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] text-[#8b919d] uppercase font-bold tracking-wider">Solde disponible</p>
              <h4 className="text-base font-extrabold text-[#0a2463] tabular-nums mt-0.5">
                {hideBalances ? '••••••' : formatXaf(stats?.metrics?.balance || 0)}
              </h4>
            </div>
          </div>
        </div>

        {/* Tabs Container */}
        <div className="bg-white rounded-2xl border border-[#e2e5ea] shadow-card overflow-hidden">
          <div className="flex border-b border-[#e2e5ea]">
            <button
              onClick={() => setActiveTab('unitaire')}
              className={`px-8 py-4 text-xs font-bold transition-all border-b-2 ${
                activeTab === 'unitaire'
                  ? 'border-[#0a2463] text-[#0a2463]'
                  : 'border-transparent text-[#8b919d] hover:text-[#00103e]'
              }`}
            >
              Envoi unitaire
            </button>
            <button
              onClick={() => setActiveTab('masse')}
              className={`px-8 py-4 text-xs font-bold transition-all border-b-2 ${
                activeTab === 'masse'
                  ? 'border-[#0a2463] text-[#0a2463]'
                  : 'border-transparent text-[#8b919d] hover:text-[#00103e]'
              }`}
            >
              Envoi en masse (MassePay)
            </button>
          </div>

          {/* TAB 1: ENVOI UNITAIRE */}
          {activeTab === 'unitaire' && (
            <div className="p-6 sm:p-8">
              <div className="max-w-2xl">
                <form onSubmit={handleSingleSubmit} className="space-y-6">
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-[#5c6470] uppercase tracking-wider block">Opérateur / Canal</label>
                      <div className="grid grid-cols-4 gap-2">
                        {['AIRTEL', 'MOOV', 'KONOOM', 'VISA'].map((op) => (
                          <button
                            key={op}
                            type="button"
                            onClick={() => setOperator(op)}
                            className={`border rounded-xl p-3 flex flex-col items-center justify-center gap-1 transition ${
                              operator === op
                                ? 'border-[#0a2463] bg-[#0a2463]/5 font-bold text-[#0a2463]'
                                : 'border-[#e2e5ea] bg-white hover:bg-slate-50 text-[#5c6470]'
                            }`}
                          >
                            <Smartphone className="h-5 w-5" />
                            <span className="text-[10px] font-bold mt-1 uppercase">{op === 'KONOOM' ? 'Konoom Money' : op.toLowerCase()}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-[#5c6470] uppercase tracking-wider block">Numéro du destinataire</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#8b919d]">+235</span>
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="60 00 00 00"
                          className="w-full pl-14 pr-4 py-3 bg-[#f5f7fa] border border-[#e2e5ea] text-[#0f1214] rounded-xl text-sm focus:outline-none focus:border-[#0a2463] transition font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-[#5c6470] uppercase tracking-wider block">Montant (FCFA)</label>
                      <input
                        type="number"
                        required
                        value={singleAmount}
                        onChange={(e) => setSingleAmount(e.target.value)}
                        placeholder="0"
                        className="w-full px-4 py-3 bg-[#f5f7fa] border border-[#e2e5ea] text-[#0f1214] rounded-xl text-lg font-bold focus:outline-none focus:border-[#0a2463] transition"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-[#5c6470] uppercase tracking-wider block">Motif / Description</label>
                      <input
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Ex: Paiement facture prestataire"
                        className="w-full px-4 py-3 bg-[#f5f7fa] border border-[#e2e5ea] text-[#0f1214] rounded-xl text-sm focus:outline-none focus:border-[#0a2463] transition"
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex items-center gap-4">
                    <button
                      type="submit"
                      disabled={singlePayoutMutation.isPending}
                      className="flex-1 bg-[#ea580c] hover:bg-[#c94400] text-white py-4 rounded-xl font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
                    >
                      {singlePayoutMutation.isPending ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                      Confirmer l'envoi
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPhone('');
                        setSingleAmount('');
                        setDescription('');
                      }}
                      className="px-8 py-4 border border-[#e2e5ea] hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-sm transition"
                    >
                      Annuler
                    </button>
                  </div>

                </form>
              </div>
            </div>
          )}

          {/* TAB 2: ENVOI EN MASSE (WIZARD) */}
          {activeTab === 'masse' && (
            <div className="p-6 sm:p-8">
              
              {/* Wizard Stepper */}
              <div className="flex items-center justify-between mb-12 max-w-4xl mx-auto">
                {[
                  { step: 1, label: 'Import CSV' },
                  { step: 2, label: 'Validation' },
                  { step: 3, label: 'Exécution' },
                  { step: 4, label: 'Rapport' },
                ].map((s) => {
                  const isCompleted = wizardStep > s.step;
                  const isActive = wizardStep === s.step;
                  return (
                    <div key={s.step} className="flex flex-col items-center gap-2 relative flex-1 last:flex-none">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold z-10 border transition ${
                        isCompleted
                          ? 'bg-[#15803D] border-[#15803D] text-white'
                          : isActive
                          ? 'bg-[#0a2463] border-[#0a2463] text-white'
                          : 'bg-[#f5f7fa] border-[#e2e5ea] text-[#8b919d]'
                      }`}>
                        {isCompleted ? <Check className="h-4 w-4" /> : s.step}
                      </div>
                      <span className={`text-xs font-bold transition ${
                        isActive ? 'text-[#0a2463]' : isCompleted ? 'text-emerald-700' : 'text-[#8b919d]'
                      }`}>{s.label}</span>
                      
                      {s.step < 4 && (
                        <div className="absolute top-5 left-1/2 w-full h-[2px] bg-[#e2e5ea] -z-0" />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* STEP 1: IMPORT CSV */}
              {wizardStep === 1 && (
                <div className="max-w-2xl mx-auto space-y-6">
                  <div className="border-2 border-dashed border-[#e2e5ea] hover:border-[#8b919d] rounded-2xl p-10 bg-[#f5f7fa]/50 text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-[#0a2463]/5 text-[#0a2463] flex items-center justify-center mx-auto">
                      <Upload className="h-8 w-8" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-[#00103e]">Copier/Coller les données bénéficiaires</h3>
                      <p className="text-xs text-[#8b919d] mt-1">Saisissez une ligne par destinataire. Format : Téléphone, Nom, Montant</p>
                    </div>
                    <textarea
                      value={csvContent}
                      onChange={(e) => setCsvContent(e.target.value)}
                      placeholder="ex: +23566123456, Ali Mahamat, 25000&#10;+23599223344, Amina Issa, 50000"
                      className="w-full h-32 bg-white border border-[#e2e5ea] rounded-xl p-3 text-xs font-mono focus:outline-none focus:border-[#0a2463] mt-2"
                    />
                  </div>
                  
                  <div className="p-4 bg-white border border-[#e2e5ea] rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg">
                        <Download className="h-5 w-5" />
                      </div>
                      <div className="text-xs text-left">
                        <p className="font-bold text-[#00103e]">Modèle d'importation CSV</p>
                        <p className="text-[#8b919d] mt-0.5">Utilisez notre modèle structuré standard.</p>
                      </div>
                    </div>
                    <button type="button" className="text-xs font-bold text-[#0a2463] hover:underline">Télécharger (CSV)</button>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={handleCsvImport}
                      className="bg-[#0a2463] hover:bg-[#1a3a72] text-white px-8 py-3 rounded-xl font-bold text-xs flex items-center gap-2 shadow-md transition"
                    >
                      Suivant
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: VALIDATION */}
              {wizardStep === 2 && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-4">
                    <div className="bg-white border border-[#e2e5ea] rounded-xl overflow-hidden shadow-sm">
                      <table className="min-w-full text-left text-xs text-[#3c3f4a]">
                        <thead className="bg-[#f5f7fa] font-bold text-[#5c6470] uppercase">
                          <tr>
                            <th className="px-6 py-3">Bénéficiaire</th>
                            <th className="px-6 py-3">Opérateur</th>
                            <th className="px-6 py-3">Montant</th>
                            <th className="px-6 py-3">Statut</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#e2e5ea]">
                          <tr>
                            <td className="px-6 py-4">
                              <p className="font-bold text-[#00103e]">Ali Mahamat</p>
                              <p className="text-[10px] text-[#8b919d] font-mono mt-0.5">+235 66 00 00 11</p>
                            </td>
                            <td className="px-6 py-4">Airtel</td>
                            <td className="px-6 py-4 font-bold text-[#0f1214]">25 000 FCFA</td>
                            <td className="px-6 py-4"><span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-full border border-emerald-200">Prêt</span></td>
                          </tr>
                          <tr>
                            <td className="px-6 py-4">
                              <p className="font-bold text-[#00103e]">Amina Issa</p>
                              <p className="text-[10px] text-[#8b919d] font-mono mt-0.5">+235 99 22 33 44</p>
                            </td>
                            <td className="px-6 py-4">Moov</td>
                            <td className="px-6 py-4 font-bold text-[#0f1214]">50 000 FCFA</td>
                            <td className="px-6 py-4"><span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-full border border-emerald-200">Prêt</span></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="bg-[#f5f7fa] border border-[#e2e5ea] p-6 rounded-2xl space-y-6">
                    <div>
                      <h4 className="font-bold text-[#00103e] text-sm">Résumé du lot</h4>
                      <div className="space-y-2 text-xs text-[#3c3f4a] mt-4">
                        <div className="flex justify-between">
                          <span className="text-[#5c6470]">Total lignes</span>
                          <span className="font-bold text-[#00103e]">2</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#5c6470]">Valides</span>
                          <span className="font-bold text-emerald-700">2</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#5c6470]">Montant total</span>
                          <span className="font-bold text-[#00103e]">75 000 FCFA</span>
                        </div>
                      </div>
                    </div>
                    
                    <button
                      type="button"
                      onClick={handleExecuteMassPay}
                      className="w-full bg-[#ea580c] hover:bg-[#c94400] text-white py-3 rounded-xl font-bold text-xs shadow-md transition"
                    >
                      Lancer l'exécution
                    </button>
                    <button
                      type="button"
                      onClick={() => setWizardStep(1)}
                      className="w-full border border-[#e2e5ea] hover:bg-white text-[#5c6470] py-2 rounded-xl text-xs font-bold transition"
                    >
                      Retour
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: EXECUTION */}
              {wizardStep === 3 && (
                <div className="max-w-md mx-auto text-center space-y-6 py-8">
                  <div className="relative w-40 h-40 mx-auto flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="80" cy="80" r="70" fill="transparent" stroke="#f0f2f5" strokeWidth="6" />
                      <circle
                        cx="80"
                        cy="80"
                        r="70"
                        fill="transparent"
                        stroke="#ea580c"
                        strokeWidth="6"
                        strokeDasharray={440}
                        strokeDashoffset={440 - (440 * progressPercent) / 100}
                        className="transition-all duration-500"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center">
                      <span className="text-3xl font-black text-[#00103e]">{progressPercent}%</span>
                      <span className="text-[10px] text-[#8b919d] font-bold">Traitement...</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#00103e]">Exécution du paiement de masse</h3>
                    <p className="text-xs text-[#8b919d] mt-1">Veuillez ne pas fermer cette fenêtre pendant l'opération.</p>
                  </div>
                </div>
              )}

              {/* STEP 4: REPORT */}
              {wizardStep === 4 && (
                <div className="max-w-2xl mx-auto text-center space-y-8 bg-white border border-[#e2e5ea] p-8 rounded-2xl shadow-card">
                  <div className="w-16 h-16 bg-emerald-50 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                    <Check className="h-8 w-8 stroke-[3px]" />
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-[#00103e]">Traitement terminé</h3>
                    <p className="text-xs text-[#8b919d]">Votre lot de paiement de masse a été traité avec succès.</p>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-[#f5f7fa] p-4 rounded-xl">
                      <span className="text-[10px] text-[#8b919d] font-bold uppercase block">Total</span>
                      <span className="text-lg font-bold text-[#00103e] mt-1 block">2</span>
                    </div>
                    <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                      <span className="text-[10px] text-emerald-700 font-bold uppercase block">Succès</span>
                      <span className="text-lg font-bold text-emerald-700 mt-1 block">2</span>
                    </div>
                    <div className="bg-[#f5f7fa] p-4 rounded-xl">
                      <span className="text-[10px] text-[#8b919d] font-bold uppercase block">Échecs</span>
                      <span className="text-lg font-bold text-rose-700 mt-1 block">0</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <button
                      type="button"
                      onClick={() => setWizardStep(1)}
                      className="flex-1 bg-[#0a2463] hover:bg-[#1a3a72] text-white py-3 rounded-xl font-bold text-xs shadow-md transition"
                    >
                      Nouvel envoi en masse
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('unitaire');
                        setWizardStep(1);
                      }}
                      className="flex-1 border border-[#e2e5ea] hover:bg-slate-50 text-[#00103e] py-3 rounded-xl font-bold text-xs transition"
                    >
                      Retour aux transferts
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}
        </div>

        {/* Bento Grid Insights (Bottom) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-[#e2e5ea] shadow-card lg:col-span-2 space-y-4">
            <h4 className="font-bold text-[#00103e] text-sm">Activité récente des envois</h4>
            <div className="divide-y divide-[#e2e5ea]">
              <div className="flex items-center justify-between py-3 hover:bg-slate-50 transition rounded-lg px-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-orange-50 text-[#ea580c] flex items-center justify-center shrink-0">
                    <Smartphone className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#00103e]">Transfert Airtel Money</p>
                    <p className="text-[10px] text-[#8b919d]">Destinataire: Mahamat Saleh (+235 66020401)</p>
                  </div>
                </div>
                <div className="text-right text-xs">
                  <p className="font-bold text-[#00103e]">15 000 FCFA</p>
                  <p className="text-[10px] text-[#8b919d] mt-0.5">Hier, 16:45</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#e2e5ea] shadow-card flex flex-col justify-between overflow-hidden relative">
            <div className="space-y-3 relative z-10">
              <div className="w-10 h-10 bg-orange-50 text-[#ea580c] rounded-xl flex items-center justify-center">
                <Send className="h-5 w-5" />
              </div>
              <h4 className="font-bold text-[#00103e] text-xs">Sécurisez vos transferts</h4>
              <p className="text-[10px] text-[#5c6470] leading-relaxed">
                Activez l'authentification à double facteur (2FA) pour tous vos virements dépassant 500 000 FCFA.
              </p>
              <button type="button" className="bg-[#0a2463] text-white text-[10px] font-bold px-3 py-1.5 rounded-lg hover:bg-[#1a3a72] transition">
                Activer 2FA
              </button>
            </div>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
