'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { CreditCard, ShieldCheck, CheckCircle2, AlertCircle, RefreshCw, Smartphone } from 'lucide-react';
import axios from 'axios';

// Public API client that doesn't need Bearer token
const publicApi = axios.create({
  baseURL: 'http://localhost:5000/api/v1', // Backend base URL
});

export default function PayLinkCheckoutPage() {
  const { slug } = useParams();
  const router = useRouter();
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [paymentInstructions, setPaymentInstructions] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch PayLink details
  const { data: payLink, isLoading, error } = useQuery({
    queryKey: ['payLinkCheckout', slug],
    queryFn: async () => {
      const res = await publicApi.get(`/pay/${slug}`);
      return res.data;
    },
    enabled: !!slug,
  });

  const payMutation = useMutation({
    mutationFn: async () => {
      setErrorMessage(null);
      const res = await publicApi.post(`/pay/${slug}`, {
        paymentMethod: selectedMethod,
        customerEmail: email,
        customerPhone: phone || undefined,
      });
      return res.data;
    },
    onSuccess: (data) => {
      if (data.status === 'SUCCESS') {
        setIsSuccess(true);
      } else if (data.instructions) {
        setPaymentInstructions(data.instructions);
      } else {
        // If pending/processing redirect url is supplied
        if (data.redirectUrl) {
          window.location.href = data.redirectUrl;
        } else {
          setIsSuccess(true);
        }
      }
    },
    onError: (err: any) => {
      setErrorMessage(err.response?.data?.message || err.message || 'Une erreur est survenue lors de la transaction.');
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 space-y-4">
        <RefreshCw className="h-8 w-8 animate-spin text-indigo-500" />
        <p className="text-sm font-semibold">Chargement de la page de paiement sécurisée...</p>
      </div>
    );
  }

  if (error || !payLink) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-6 text-center space-y-6">
        <div className="h-16 w-16 bg-rose-500/10 border border-rose-500/20 rounded-full flex items-center justify-center text-rose-500">
          <AlertCircle className="h-8 w-8" />
        </div>
        <div className="space-y-2 max-w-md">
          <h2 className="text-xl font-bold text-white">Lien de paiement invalide ou expiré</h2>
          <p className="text-sm text-slate-400">
            Ce lien de paiement n'existe pas ou a été désactivé par le marchand. Veuillez le contacter pour obtenir un lien valide.
          </p>
        </div>
        <button
          onClick={() => router.push('/')}
          className="py-3 px-6 bg-slate-900 border border-slate-800 hover:text-white rounded-xl text-slate-400 transition"
        >
          Retour à l'accueil
        </button>
      </div>
    );
  }

  const amountFormatted = parseFloat(payLink.amount).toLocaleString('fr-FR');

  const methods = [
    { id: 'KONOOM_MONEY', name: 'Konoom Mobile Money (Tchad)', icon: Smartphone, color: 'border-emerald-500/20 text-emerald-400 bg-emerald-500/5' },
    { id: 'AIRTEL_MONEY', name: 'Airtel Money', icon: Smartphone, color: 'border-red-500/20 text-red-400 bg-red-500/5' },
    { id: 'ORANGE_MONEY', name: 'Orange Money', icon: Smartphone, color: 'border-orange-500/20 text-orange-400 bg-orange-500/5' },
    { id: 'MOOV_MONEY', name: 'Moov Money', icon: Smartphone, color: 'border-blue-500/20 text-blue-400 bg-blue-500/5' },
    { id: 'VISA', name: 'Carte Visa', icon: CreditCard, color: 'border-indigo-500/20 text-indigo-400 bg-indigo-500/5' },
    { id: 'MASTERCARD', name: 'Carte Mastercard', icon: CreditCard, color: 'border-orange-400/20 text-orange-300 bg-orange-400/5' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 lg:p-10 font-sans selection:bg-indigo-600/30">
      <div className="absolute top-0 inset-x-0 h-80 bg-gradient-to-b from-indigo-500/5 via-transparent to-transparent pointer-events-none" />

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 bg-slate-900 border border-slate-850 rounded-[32px] overflow-hidden shadow-2xl relative z-10">
        
        {/* Left Side: Order Summary */}
        <div className="p-8 lg:p-12 bg-slate-950/40 border-r border-slate-850 flex flex-col justify-between space-y-8">
          <div className="space-y-6">
            <div>
              <span className="text-xs font-bold text-indigo-400 tracking-widest uppercase">Paiement Sécurisé via Innov Pay</span>
              <h1 className="text-xl font-black text-white mt-1">{payLink.merchant?.businessName || 'Merchant'}</h1>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-extrabold text-white leading-tight">{payLink.title}</h2>
              {payLink.description && <p className="text-slate-400 text-sm leading-relaxed">{payLink.description}</p>}
            </div>
          </div>

          <div className="space-y-6 pt-6 border-t border-slate-850">
            <div>
              <span className="text-xs text-slate-500">Montant total à payer</span>
              <h3 className="text-4xl font-black text-white mt-1">{amountFormatted} <span className="text-xl font-normal text-slate-400">{payLink.currency}</span></h3>
            </div>

            <div className="flex items-center space-x-2 text-slate-500 text-xs">
              <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>Données cryptées de bout en bout (SSL standard)</span>
            </div>
          </div>
        </div>

        {/* Right Side: Checkout Form */}
        <div className="p-8 lg:p-12 bg-slate-900 flex flex-col justify-center">
          {isSuccess ? (
            <div className="text-center space-y-6 py-8">
              <div className="h-16 w-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 mx-auto">
                <CheckCircle2 className="h-10 w-10 animate-bounce" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white">Paiement effectué !</h3>
                <p className="text-sm text-slate-400">
                  Votre paiement de {amountFormatted} {payLink.currency} a été traité avec succès.
                </p>
              </div>
            </div>
          ) : paymentInstructions ? (
            <div className="space-y-6">
              <div className="h-12 w-12 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center text-indigo-400">
                <Smartphone className="h-6 w-6" />
              </div>
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-white">Instructions de paiement</h3>
                <p className="text-sm text-slate-450 leading-relaxed bg-slate-950 p-4 border border-slate-850 rounded-2xl font-mono">
                  {paymentInstructions}
                </p>
              </div>
              <button
                onClick={() => {
                  setPaymentInstructions(null);
                  setIsSuccess(true);
                }}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-550 text-white font-bold rounded-2xl text-sm transition"
              >
                J'ai validé sur mon téléphone
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {errorMessage && (
                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-2xl text-xs flex items-start space-x-2">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">1. Choisir le moyen de paiement</h3>
                <div className="grid grid-cols-2 gap-3">
                  {methods.map((method) => {
                    const isSelected = selectedMethod === method.id;
                    return (
                      <button
                        key={method.id}
                        onClick={() => setSelectedMethod(method.id)}
                        className={`p-3 rounded-2xl border text-left flex flex-col justify-between h-20 transition ${
                          isSelected
                            ? 'bg-indigo-600/10 border-indigo-500'
                            : 'bg-slate-950 border-slate-850 hover:border-slate-800'
                        }`}
                      >
                        <method.icon className={`h-5 w-5 ${isSelected ? 'text-indigo-400' : 'text-slate-500'}`} />
                        <span className="text-[11px] font-bold text-white truncate w-full">{method.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {selectedMethod && (
                <div className="space-y-4 pt-2">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">2. Informations client</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Email</label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="exemple@mail.com"
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl py-3 px-4 text-white text-sm focus:border-indigo-500 focus:outline-none transition"
                      />
                    </div>

                    {selectedMethod.endsWith('_MONEY') && (
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Téléphone Mobile Money</label>
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+235 60 00 00 00"
                          className="w-full bg-slate-950 border border-slate-850 rounded-xl py-3 px-4 text-white text-sm focus:border-indigo-500 focus:outline-none transition font-mono"
                        />
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => payMutation.mutate()}
                    disabled={!email || (selectedMethod.endsWith('_MONEY') && !phone) || payMutation.isPending}
                    className="w-full mt-2 py-4 bg-indigo-600 hover:bg-indigo-550 disabled:bg-slate-800 text-white font-bold rounded-2xl text-sm transition shadow-lg shadow-indigo-600/10 flex items-center justify-center"
                  >
                    {payMutation.isPending ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                        Traitement sécurisé...
                      </>
                    ) : (
                      `Payer ${amountFormatted} ${payLink.currency}`
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
