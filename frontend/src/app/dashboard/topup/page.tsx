'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Wallet, Smartphone, Landmark, CreditCard, Bolt, Download, Copy, Check, Info, ArrowUpRight, HelpCircle, CheckCircle, ShieldCheck, RefreshCw } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { apiClient } from '@/lib/api';

export default function TopUpPage() {
  const [amount, setAmount] = useState('50000');
  const [method, setMethod] = useState<'momo' | 'bank' | 'card'>('momo');
  
  // Method detail states
  const [phone, setPhone] = useState('');
  const [operator, setOperator] = useState('Airtel Tchad');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  // Copy states
  const [copiedIban, setCopiedIban] = useState(false);
  const [copiedSwift, setCopiedSwift] = useState(false);

  // Success Modal
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [receiptRef, setReceiptRef] = useState('');

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

  // Top Up Mutation
  const topUpMutation = useMutation({
    mutationFn: async (topupAmount: number) => {
      const res = await apiClient.post('/merchants/topup', { amount: topupAmount });
      return res.data;
    },
    onSuccess: () => {
      refetchStats();
      const ref = `TX-${Math.floor(100000 + Math.random() * 900000)}`;
      setReceiptRef(ref);
      setShowSuccessModal(true);
    },
    onError: (err: any) => {
      alert(`Erreur lors du rechargement: ${err.response?.data?.message || err.message}`);
    },
  });

  const handleCopy = (text: string, type: 'iban' | 'swift') => {
    navigator.clipboard.writeText(text);
    if (type === 'iban') {
      setCopiedIban(true);
      setTimeout(() => setCopiedIban(false), 2000);
    } else {
      setCopiedSwift(true);
      setTimeout(() => setCopiedSwift(false), 2000);
    }
  };

  const handleConfirmTopUp = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('Veuillez saisir un montant valide.');
      return;
    }
    topUpMutation.mutate(parsedAmount);
  };

  const formatXaf = (val: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XAF', minimumFractionDigits: 0 }).format(val);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 font-sans">
        
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-[#00103e] tracking-tight">Recharger le compte</h2>
          <p className="text-[#5c6470] text-sm mt-1">Ajoutez des fonds en toute sécurité via nos multiples canaux de paiement.</p>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left: Form Section */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Top-up Form Card */}
            <div className="bg-white rounded-2xl border border-[#e2e5ea] p-6 shadow-card">
              <h3 className="text-sm font-bold text-[#00103e] mb-6 flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-[#ea580c]" />
                1. Détails du rechargement
              </h3>
              
              <form onSubmit={handleConfirmTopUp} className="space-y-6">
                
                {/* Amount Input */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-[#5c6470] uppercase tracking-wider">Montant à recharger (FCFA)</label>
                  <div className="relative flex items-center">
                    <input
                      type="number"
                      required
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0"
                      className="w-full pl-4 pr-16 py-4 bg-[#f5f7fa] border border-[#e2e5ea] rounded-xl text-xl font-bold focus:outline-none focus:border-[#0a2463] transition"
                    />
                    <span className="absolute right-4 text-xs font-bold text-[#8b919d]">XAF</span>
                  </div>
                  <div className="flex gap-2 pt-1">
                    {['10000', '50000', '100000'].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setAmount(val)}
                        className="px-4 py-1.5 rounded-full border border-[#e2e5ea] text-xs font-semibold text-[#5c6470] hover:bg-[#0a2463] hover:text-white hover:border-[#0a2463] transition-colors"
                      >
                        + {parseInt(val).toLocaleString('fr-FR')}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Payment Methods Grid */}
                <div className="space-y-3">
                  <label className="block text-[10px] font-bold text-[#5c6470] uppercase tracking-wider">2. Choisissez votre méthode</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    
                    {/* Mobile Money */}
                    <div
                      onClick={() => setMethod('momo')}
                      className={`cursor-pointer border rounded-xl p-4 transition relative flex flex-col items-center text-center gap-3 ${
                        method === 'momo' ? 'border-[#0a2463] bg-[#0a2463]/5' : 'border-[#e2e5ea] hover:bg-slate-55'
                      }`}
                    >
                      <div className="w-12 h-12 bg-orange-50 text-[#ea580c] rounded-full flex items-center justify-center">
                        <Smartphone className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#00103e]">Mobile Money</p>
                        <p className="text-[10px] text-[#8b919d] mt-0.5">Airtel, Moov, Konoom Mobile Money</p>
                      </div>
                      {method === 'momo' && (
                        <div className="absolute top-2 right-2 text-[#0a2463]">
                          <CheckCircle className="h-5 w-5 fill-[#0a2463] text-white" />
                        </div>
                      )}
                    </div>

                    {/* Bank Transfer */}
                    <div
                      onClick={() => setMethod('bank')}
                      className={`cursor-pointer border rounded-xl p-4 transition relative flex flex-col items-center text-center gap-3 ${
                        method === 'bank' ? 'border-[#0a2463] bg-[#0a2463]/5' : 'border-[#e2e5ea] hover:bg-slate-55'
                      }`}
                    >
                      <div className="w-12 h-12 bg-blue-50 text-[#0a2463] rounded-full flex items-center justify-center">
                        <Landmark className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#00103e]">Virement Bancaire</p>
                        <p className="text-[10px] text-[#8b919d] mt-0.5">Délai: 24h - 48h</p>
                      </div>
                      {method === 'bank' && (
                        <div className="absolute top-2 right-2 text-[#0a2463]">
                          <CheckCircle className="h-5 w-5 fill-[#0a2463] text-white" />
                        </div>
                      )}
                    </div>

                    {/* Credit Card */}
                    <div
                      onClick={() => setMethod('card')}
                      className={`cursor-pointer border rounded-xl p-4 transition relative flex flex-col items-center text-center gap-3 ${
                        method === 'card' ? 'border-[#0a2463] bg-[#0a2463]/5' : 'border-[#e2e5ea] hover:bg-slate-55'
                      }`}
                    >
                      <div className="w-12 h-12 bg-emerald-50 text-emerald-700 rounded-full flex items-center justify-center">
                        <CreditCard className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#00103e]">Carte Bancaire</p>
                        <p className="text-[10px] text-[#8b919d] mt-0.5">Visa, Mastercard</p>
                      </div>
                      {method === 'card' && (
                        <div className="absolute top-2 right-2 text-[#0a2463]">
                          <CheckCircle className="h-5 w-5 fill-[#0a2463] text-white" />
                        </div>
                      )}
                    </div>

                  </div>
                </div>

                {/* Method Details Box */}
                <div className="p-5 bg-[#f5f7fa] border border-dashed border-[#e2e5ea] rounded-xl">
                  
                  {/* Mobile Money Details */}
                  {method === 'momo' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="block text-[10px] font-bold text-[#5c6470] uppercase">Numéro de téléphone</label>
                          <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+235 66 00 00 00"
                            className="w-full border border-[#e2e5ea] bg-white rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-[#0a2463]"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[10px] font-bold text-[#5c6470] uppercase">Opérateur</label>
                          <select
                            value={operator}
                            onChange={(e) => setOperator(e.target.value)}
                            className="w-full border border-[#e2e5ea] bg-white rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-[#0a2463] text-[#3c3f4a]"
                          >
                            <option>Airtel Tchad</option>
                            <option>Moov Africa</option>
                            <option>Konoom Mobile Money</option>
                          </select>
                        </div>
                      </div>
                      <p className="text-[10px] text-[#8b919d] flex items-center gap-1.5 mt-2">
                        <Info className="h-3.5 w-3.5 text-[#0a2463]" />
                        Une notification push de validation de paiement sera envoyée sur ce téléphone.
                      </p>
                    </div>
                  )}

                  {/* Bank Details */}
                  {method === 'bank' && (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-white rounded-xl border border-[#e2e5ea]">
                        <div>
                          <p className="text-[10px] font-bold text-[#8b919d] uppercase">IBAN Innov Pay</p>
                          <p className="text-xs font-mono text-[#00103e] font-semibold">TD76 3000 1000 5000 1234 5678 901</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopy('TD76 3000 1000 5000 1234 5678 901', 'iban')}
                          className="p-2 text-[#0a2463] hover:bg-slate-50 border border-[#e2e5ea] rounded-lg transition"
                        >
                          {copiedIban ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-white rounded-xl border border-[#e2e5ea]">
                        <div>
                          <p className="text-[10px] font-bold text-[#8b919d] uppercase">Code SWIFT</p>
                          <p className="text-xs font-mono text-[#00103e] font-semibold">INNP TD NN</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopy('INNP TD NN', 'swift')}
                          className="p-2 text-[#0a2463] hover:bg-slate-50 border border-[#e2e5ea] rounded-lg transition"
                        >
                          {copiedSwift ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Card Details */}
                  {method === 'card' && (
                    <div className="grid grid-cols-3 gap-4">
                      <div className="col-span-3 space-y-1">
                        <label className="block text-[10px] font-bold text-[#5c6470] uppercase">Numéro de carte</label>
                        <input
                          type="text"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          placeholder="4000 1234 5678 9010"
                          className="w-full border border-[#e2e5ea] bg-white rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-[#0a2463]"
                        />
                      </div>
                      <div className="col-span-2 space-y-1">
                        <label className="block text-[10px] font-bold text-[#5c6470] uppercase">Date d'expiration</label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          placeholder="MM/YY"
                          className="w-full border border-[#e2e5ea] bg-white rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-[#0a2463]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-[#5c6470] uppercase">CVV</label>
                        <input
                          type="password"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          placeholder="•••"
                          maxLength={3}
                          className="w-full border border-[#e2e5ea] bg-white rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-[#0a2463]"
                        />
                      </div>
                    </div>
                  )}

                </div>

                {/* Confirm Button */}
                <button
                  type="submit"
                  disabled={topUpMutation.isPending}
                  className="w-full bg-[#0a2463] hover:bg-[#1a3a72] text-white py-4 rounded-xl font-bold text-sm transition shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {topUpMutation.isPending ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Bolt className="h-4 w-4 text-[#ea580c] fill-[#ea580c]" />
                  )}
                  Confirmer le rechargement
                </button>

              </form>
            </div>

            {/* History Section */}
            <div className="bg-white rounded-2xl border border-[#e2e5ea] shadow-card overflow-hidden">
              <div className="p-6 border-b border-[#e2e5ea] flex justify-between items-center">
                <h3 className="text-sm font-bold text-[#00103e]">Historique récent des rechargements</h3>
                <span className="text-xs text-[#8b919d]">Dernières opérations</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-[#3c3f4a]">
                  <thead className="bg-[#f5f7fa] font-bold text-[#5c6470] uppercase">
                    <tr>
                      <th className="px-6 py-3">Transaction</th>
                      <th className="px-6 py-3">Date</th>
                      <th className="px-6 py-3 text-right">Montant</th>
                      <th className="px-6 py-3">Statut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e2e5ea]">
                    <tr className="hover:bg-slate-50 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-orange-50 text-[#ea580c] flex items-center justify-center shrink-0">
                            <Smartphone className="h-4 w-4" />
                          </div>
                          <p className="font-semibold text-[#00103e]">Rechargement Mobile Money</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[#8b919d]">Hier, 14:20</td>
                      <td className="px-6 py-4 font-bold text-right text-emerald-700">+25 000 XAF</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-full border border-emerald-200">SUCCÈS</span>
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-50 text-[#0a2463] flex items-center justify-center shrink-0">
                            <Landmark className="h-4 w-4" />
                          </div>
                          <p className="font-semibold text-[#00103e]">Virement Bancaire BCC</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[#8b919d]">12 Nov, 09:15</td>
                      <td className="px-6 py-4 font-bold text-right text-emerald-700">+150 000 XAF</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-bold rounded-full border border-amber-200">EN COURS</span>
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                            <CreditCard className="h-4 w-4" />
                          </div>
                          <p className="font-semibold text-[#00103e]">Rechargement Carte Visa</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[#8b919d]">10 Nov, 18:45</td>
                      <td className="px-6 py-4 font-bold text-right text-emerald-700">+10 000 XAF</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-full border border-emerald-200">SUCCÈS</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Current Balance Card */}
            <div className="bg-gradient-to-br from-[#0a2463] to-[#1a3a72] text-white rounded-2xl p-6 shadow-lg relative overflow-hidden flex flex-col justify-between h-[150px]">
              <div className="absolute -top-6 -right-6 text-white/5 opacity-10">
                <Wallet className="h-28 w-28" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-semibold text-[#c8d3e8] uppercase tracking-wider block">Solde Principal (Live)</span>
                <h3 className="text-2xl font-black tracking-tight pt-2 tabular-nums">
                  {hideBalances ? '••••••' : formatXaf(stats?.metrics?.balance || 0)}
                </h3>
              </div>
              <div className="text-[10px] text-[#c8d3e8] font-medium flex items-center gap-1">
                <ShieldCheck className="h-4 w-4 text-emerald-400" /> Solde disponible pour retraits et virements
              </div>
            </div>

            {/* Support Card */}
            <div className="bg-white rounded-2xl border border-[#e2e5ea] p-6 shadow-card space-y-4">
              <h4 className="text-xs font-bold text-[#00103e]">Besoin d'aide ?</h4>
              <div className="space-y-3 text-xs text-[#3c3f4a]">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-[#f5f7fa] rounded-full flex items-center justify-center shrink-0 text-[#0a2463]">
                    <HelpCircle className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-bold text-[#00103e]">Centre d'aide</p>
                    <p className="text-[#5c6470] mt-0.5">Consultez nos guides et tutoriels de paiement.</p>
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="w-full border border-[#0a2463] text-[#0a2463] py-2 rounded-xl text-xs font-bold hover:bg-[#0a2463] hover:text-white transition duration-150"
              >
                Contacter le support
              </button>
            </div>

            {/* Security Badge */}
            <div className="bg-[#f5f7fa] border border-[#e2e5ea] rounded-2xl p-5 text-center flex flex-col items-center space-y-3">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-700 rounded-full flex items-center justify-center">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h4 className="text-xs font-bold text-[#00103e]">Sécurité de niveau bancaire</h4>
              <p className="text-[10px] text-[#5c6470] leading-relaxed">
                Toutes vos transactions sont sécurisées avec le protocole SSL 256 bits et surveillées par nos systèmes anti-fraude.
              </p>
            </div>

          </div>

        </div>

      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#e2e5ea] rounded-2xl w-full max-w-md p-8 shadow-modal text-center space-y-6 animate-scale-in">
            <div className="w-20 h-20 bg-emerald-50 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
              <Check className="h-10 w-10 text-emerald-600 stroke-[3px]" />
            </div>
            
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-[#00103e]">Rechargement réussi !</h3>
              <p className="text-xs text-[#5c6470]">Votre compte a été crédité avec succès. Votre nouveau solde est à jour.</p>
            </div>

            <div className="bg-[#f5f7fa] rounded-xl p-4 text-left text-xs text-[#3c3f4a] space-y-2.5">
              <div className="flex justify-between">
                <span className="text-[#5c6470]">Montant :</span>
                <span className="font-bold text-[#00103e]">{parseInt(amount).toLocaleString('fr-FR')} FCFA</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5c6470]">Référence :</span>
                <span className="font-bold text-[#00103e]">{receiptRef}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5c6470]">Date :</span>
                <span className="font-bold text-[#00103e]">Aujourd'hui, {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setShowSuccessModal(false)}
                className="w-full bg-[#f0f2f5] hover:bg-[#e4e7ea] text-[#00103e] font-bold py-3 rounded-xl text-xs transition"
              >
                Fermer
              </button>
              <button
                type="button"
                className="w-full bg-[#0a2463] hover:bg-[#1a3a72] text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 transition"
              >
                <Download className="h-4 w-4" /> Reçu
              </button>
            </div>
          </div>
        </div>
      )}

    </DashboardLayout>
  );
}
