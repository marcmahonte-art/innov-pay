'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { CreditCard, ShieldCheck, CheckCircle2, AlertCircle, RefreshCw, Smartphone } from 'lucide-react';
import axios from 'axios';

const publicApi = axios.create({
  baseURL: 'http://localhost:5000/api/v1',
});

export default function CheckoutSessionPage() {
  const { sessionId } = useParams();
  const router = useRouter();
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [paymentInstructions, setPaymentInstructions] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch Checkout Session details
  const { data: session, isLoading, error } = useQuery({
    queryKey: ['checkoutSession', sessionId],
    queryFn: async () => {
      const res = await publicApi.get(`/checkout/sessions/${sessionId}`);
      return res.data;
    },
    enabled: !!sessionId,
  });

  // Pre-fill email and phone from session if available
  useEffect(() => {
    if (session) {
      if (session.customerEmail) setEmail(session.customerEmail);
      if (session.customerPhone) setPhone(session.customerPhone);
    }
  }, [session]);

  const payMutation = useMutation({
    mutationFn: async () => {
      setErrorMessage(null);
      const res = await publicApi.post(`/checkout/sessions/${sessionId}/pay`, {
        paymentMethod: selectedMethod,
        customerPhone: phone || undefined,
      });
      return res.data;
    },
    onSuccess: (data) => {
      if (data.status === 'SUCCESS') {
        handlePaymentSuccess(data);
      } else if (data.instructions) {
        setPaymentInstructions(data.instructions);
      } else {
        if (data.redirectUrl) {
          window.location.href = data.redirectUrl;
        } else {
          handlePaymentSuccess(data);
        }
      }
    },
    onError: (err: any) => {
      setErrorMessage(err.response?.data?.message || err.message || 'Une erreur est survenue lors de la transaction.');
    },
  });

  const handlePaymentSuccess = (result: any) => {
    setIsSuccess(true);

    // Notify parent window (SDK) via postMessage
    if (typeof window !== 'undefined' && window.parent) {
      window.parent.postMessage({
        type: 'innovpay:success',
        payload: {
          paymentId: result.paymentId,
          merchantReference: result.merchantReference,
          status: result.status,
        }
      }, '*');
    }

    // Redirect to successUrl if provided
    if (result.successUrl) {
      setTimeout(() => {
        window.location.href = result.successUrl;
      }, 2000);
    }
  };

  const handleClose = () => {
    if (typeof window !== 'undefined' && window.parent) {
      window.parent.postMessage({ type: 'innovpay:close' }, '*');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 space-y-4">
        <RefreshCw className="h-8 w-8 animate-spin text-indigo-500" />
        <p className="text-sm font-semibold">Chargement de la session de paiement...</p>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-6 text-center space-y-6">
        <div className="h-16 w-16 bg-rose-500/10 border border-rose-500/20 rounded-full flex items-center justify-center text-rose-500">
          <AlertCircle className="h-8 w-8" />
        </div>
        <div className="space-y-2 max-w-md">
          <h2 className="text-xl font-bold text-white">Session expirée ou invalide</h2>
          <p className="text-sm text-slate-400">
            Cette session de paiement n'existe pas, a déjà été complétée ou a expiré. Veuillez relancer le paiement depuis votre application.
          </p>
        </div>
        <button
          onClick={handleClose}
          className="py-3 px-6 bg-slate-900 border border-slate-800 hover:text-white rounded-xl text-slate-400 transition"
        >
          Fermer la fenêtre
        </button>
      </div>
    );
  }

  const amountFormatted = parseFloat(session.amount).toLocaleString('fr-FR');

  const methods = [
    { id: 'KONOOM_MONEY', name: 'Konoom Mobile Money', icon: Smartphone },
    { id: 'AIRTEL_MONEY', name: 'Airtel Money', icon: Smartphone },
    { id: 'ORANGE_MONEY', name: 'Orange Money', icon: Smartphone },
    { id: 'MOOV_MONEY', name: 'Moov Money', icon: Smartphone },
    { id: 'VISA', name: 'Carte Visa', icon: CreditCard },
    { id: 'MASTERCARD', name: 'Carte Mastercard', icon: CreditCard },
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 selection:bg-indigo-600/30">
      <div className="w-full max-w-md bg-slate-900 border border-slate-850 rounded-[32px] overflow-hidden shadow-2xl relative">
        
        {/* Top summary section */}
        <div className="p-6 bg-slate-950/60 border-b border-slate-850 flex flex-col items-center text-center space-y-3">
          <div>
            <span className="text-[10px] font-bold text-indigo-400 tracking-widest uppercase">Innov Pay Secure Checkout</span>
            <h1 className="text-base font-extrabold text-white mt-0.5">{session.merchantName}</h1>
          </div>
          <div>
            <span className="text-xs text-slate-500">Total à payer</span>
            <h2 className="text-3xl font-black text-white mt-0.5">{amountFormatted} <span className="text-lg font-normal text-slate-450">{session.currency}</span></h2>
          </div>
        </div>

        {/* Form area */}
        <div className="p-6">
          {isSuccess ? (
            <div className="text-center space-y-5 py-6">
              <div className="h-14 w-14 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 mx-auto">
                <CheckCircle2 className="h-8 w-8 animate-bounce" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white font-sans">Paiement Réussi !</h3>
                <p className="text-xs text-slate-400">
                  Votre transaction de {amountFormatted} {session.currency} a été validée.
                </p>
              </div>
            </div>
          ) : paymentInstructions ? (
            <div className="space-y-5">
              <div className="h-12 w-12 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center text-indigo-400">
                <Smartphone className="h-6 w-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-white">Instructions de paiement</h3>
                <p className="text-xs text-slate-400 bg-slate-950 p-4 border border-slate-850 rounded-xl font-mono leading-relaxed">
                  {paymentInstructions}
                </p>
              </div>
              <button
                onClick={() => {
                  setPaymentInstructions(null);
                  handlePaymentSuccess({ status: 'SUCCESS' });
                }}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-550 text-white font-bold rounded-xl text-sm transition shadow-lg"
              >
                J'ai validé sur mon téléphone
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              {errorMessage && (
                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-450 p-3 rounded-xl text-[11px] flex items-start space-x-2">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="space-y-3">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Moyen de paiement</label>
                <div className="grid grid-cols-2 gap-2">
                  {methods.map((method) => {
                    const isSelected = selectedMethod === method.id;
                    return (
                      <button
                        key={method.id}
                        onClick={() => setSelectedMethod(method.id)}
                        className={`p-3.5 rounded-xl border text-left flex flex-col justify-between h-20 transition ${
                          isSelected
                            ? 'bg-indigo-600/10 border-indigo-500'
                            : 'bg-slate-950 border-slate-850 hover:border-slate-800'
                        }`}
                      >
                        <method.icon className={`h-4 w-4 ${isSelected ? 'text-indigo-400' : 'text-slate-550'}`} />
                        <span className="text-[10px] font-bold text-white truncate w-full">{method.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {selectedMethod && (
                <div className="space-y-4 pt-2">
                  {selectedMethod.endsWith('_MONEY') && (
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Numéro de téléphone</label>
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

                  <button
                    onClick={() => payMutation.mutate()}
                    disabled={(selectedMethod.endsWith('_MONEY') && !phone) || payMutation.isPending}
                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-550 disabled:bg-slate-800 text-white font-bold rounded-xl text-sm transition shadow-lg"
                  >
                    {payMutation.isPending ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                        Traitement sécurisé...
                      </>
                    ) : (
                      `Payer ${amountFormatted} ${session.currency}`
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer safety badge */}
        <div className="p-4 bg-slate-950/40 border-t border-slate-850 flex items-center justify-between text-[10px] text-slate-500">
          <div className="flex items-center space-x-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span>Sécurisé par Innov Pay</span>
          </div>
          <button onClick={handleClose} className="hover:text-white font-bold">Annuler</button>
        </div>
      </div>
    </div>
  );
}
