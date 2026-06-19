'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { CreditCard, ShieldCheck, CheckCircle2, AlertCircle, RefreshCw, Smartphone, ChevronRight } from 'lucide-react';
import axios from 'axios';

const publicApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1',
});

export default function CheckoutSessionPage() {
  const { sessionId } = useParams();
  const router = useRouter();
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [phone, setPhone] = useState('');
  const [paymentInstructions, setPaymentInstructions] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [otpRequired, setOtpRequired] = useState(false);
  const [otp, setOtp] = useState('');

  const verifyOtpMutation = useMutation({
    mutationFn: async () => {
      setErrorMessage(null);
      const res = await publicApi.post(`/checkout/sessions/${sessionId}/verify-otp`, {
        otp,
      });
      return res.data;
    },
    onSuccess: (data) => {
      handlePaymentSuccess(data);
    },
    onError: (err: any) => {
      setErrorMessage(err.response?.data?.message || err.message || 'Le code OTP saisi est incorrect.');
    },
  });

  // Fetch Checkout Session details
  const { data: session, isLoading, error } = useQuery({
    queryKey: ['checkoutSession', sessionId],
    queryFn: async () => {
      const res = await publicApi.get(`/checkout/sessions/${sessionId}`);
      return res.data;
    },
    enabled: !!sessionId,
  });

  // Pre-fill phone from session if available
  useEffect(() => {
    if (session) {
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
      } else if (data.otpRequired) {
        setOtpRequired(true);
        setPaymentInstructions(data.instructions || null);
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
      <div className="min-h-screen bg-[#f5f7fa] flex flex-col items-center justify-center text-[#5c6470] space-y-4 font-webpay">
        <RefreshCw className="h-8 w-8 animate-spin text-[#0a2463]" />
        <p className="text-sm font-semibold">Chargement de la session de paiement...</p>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="min-h-screen bg-[#f5f7fa] flex flex-col items-center justify-center px-6 text-center space-y-6 font-webpay">
        <div className="h-16 w-16 bg-[#ffdad6] rounded-full flex items-center justify-center text-[#B91C1C]">
          <AlertCircle className="h-8 w-8" />
        </div>
        <div className="space-y-2 max-w-md">
          <h2 className="text-xl font-bold text-[#00103e]">Session expirée ou invalide</h2>
          <p className="text-sm text-[#5c6470]">
            Cette session de paiement n'existe pas, a déjà été complétée ou a expiré. Veuillez relancer le paiement depuis votre application.
          </p>
        </div>
        <button
          onClick={handleClose}
          className="py-3 px-6 bg-white border border-[#e2e5ea] hover:bg-[#f0f2f5] rounded-xl text-[#0a2463] font-bold transition"
        >
          Fermer la fenêtre
        </button>
      </div>
    );
  }

  const amountFormatted = parseFloat(session.amount).toLocaleString('fr-FR');

  const methods = [
    { id: 'KONOOM_MONEY', name: 'Konoom Money', operator: 'KONOOM', logo: '/operators/konoom.png', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { id: 'AIRTEL_MONEY', name: 'Airtel Money', operator: 'AIRTEL', logo: '/operators/airtel.png', color: 'bg-red-50 text-red-600 border-red-200' },
    { id: 'MOOV_MONEY', name: 'Moov Money', operator: 'MOOV', logo: '/operators/moov.png', color: 'bg-blue-50 text-blue-600 border-blue-200' },
    { id: 'VISA', name: 'Carte Visa', operator: 'VISA/GIMAC', logo: '/operators/visa.svg', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    { id: 'MASTERCARD', name: 'Carte Mastercard', operator: 'MASTERCARD', logo: '/operators/mastercard.svg', color: 'bg-orange-50 text-orange-700 border-orange-200' },
  ];

  return (
    <div className="min-h-screen bg-[#f5f7fa] flex flex-col items-center justify-center p-4 font-webpay">
      <div className="w-full max-w-md bg-white border border-[#e2e5ea] rounded-[24px] overflow-hidden shadow-modal relative">
        
        {/* Top summary section */}
        <div className="p-6 bg-[#f5f7fa] border-b border-[#e2e5ea] flex flex-col items-center text-center space-y-3">
          <div>
            <span className="text-[10px] font-bold text-[#ea580c] tracking-widest uppercase">Innov Pay Secure Checkout</span>
            <h1 className="text-base font-extrabold text-[#00103e] mt-1">{session.merchantName}</h1>
          </div>
          <div>
            <span className="text-xs text-[#5c6470]">Total à payer</span>
            <h2 className="text-3xl font-black text-[#00103e] mt-0.5 tabular-nums">
              {amountFormatted} <span className="text-lg font-normal text-[#5c6470]">{session.currency}</span>
            </h2>
          </div>
        </div>

        {/* Form area */}
        <div className="p-6">
          {isSuccess ? (
            <div className="text-center space-y-5 py-6">
              <div className="h-14 w-14 bg-[#dcfce7] border border-emerald-200 rounded-full flex items-center justify-center text-[#15803D] mx-auto">
                <CheckCircle2 className="h-8 w-8 animate-bounce" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-[#00103e]">Paiement Réussi !</h3>
                <p className="text-xs text-[#5c6470]">
                  Votre transaction de {amountFormatted} {session.currency} a été validée.
                </p>
              </div>
            </div>
          ) : otpRequired ? (
            <div className="space-y-5">
              <div className="h-12 w-12 bg-[#0a2463]/10 border border-[#0a2463]/20 rounded-2xl flex items-center justify-center text-[#0a2463]">
                <Smartphone className="h-6 w-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-[#00103e]">Validation OTP Requise</h3>
                <p className="text-xs text-[#5c6470]">
                  {paymentInstructions || "Veuillez saisir le code OTP envoyé par SMS pour finaliser le paiement."}
                </p>
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Saisir l'OTP (ex: 123456)"
                  className="w-full bg-[#f5f7fa] border border-[#e2e5ea] rounded-xl py-3 px-4 text-[#0f1214] text-center text-lg tracking-widest focus:border-[#0a2463] focus:outline-none transition font-mono mt-2"
                />
              </div>
              
              {errorMessage && (
                <div className="bg-rose-50 border border-rose-200 text-[#B91C1C] p-3 rounded-xl text-[11px] flex items-start space-x-2">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <button
                onClick={() => verifyOtpMutation.mutate()}
                disabled={otp.length < 6 || verifyOtpMutation.isPending}
                className="w-full py-3.5 bg-[#ea580c] hover:bg-[#c94400] disabled:bg-[#b8bcc5] text-white font-bold rounded-xl text-sm transition shadow-md flex items-center justify-center"
              >
                {verifyOtpMutation.isPending ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    Validation en cours...
                  </>
                ) : (
                  "Confirmer le paiement"
                )}
              </button>
            </div>
          ) : paymentInstructions ? (
            <div className="space-y-5">
              <div className="h-12 w-12 bg-[#0a2463]/10 border border-[#0a2463]/20 rounded-2xl flex items-center justify-center text-[#0a2463]">
                <Smartphone className="h-6 w-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-[#00103e]">Instructions de paiement</h3>
                <p className="text-xs text-[#5c6470] bg-[#f5f7fa] p-4 border border-[#e2e5ea] rounded-xl font-mono leading-relaxed">
                  {paymentInstructions}
                </p>
              </div>
              <button
                onClick={() => {
                  setPaymentInstructions(null);
                  handlePaymentSuccess({ status: 'SUCCESS' });
                }}
                className="w-full py-3.5 bg-[#ea580c] hover:bg-[#c94400] text-white font-bold rounded-xl text-sm transition shadow-md"
              >
                J'ai validé sur mon téléphone
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              {errorMessage && (
                <div className="bg-rose-50 border border-rose-200 text-[#B91C1C] p-3 rounded-xl text-[11px] flex items-start space-x-2">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="space-y-3">
                <label className="block text-[10px] font-bold text-[#5c6470] uppercase tracking-wider">Moyen de paiement</label>
                <div className="space-y-2">
                  {methods.map((method) => {
                    const isSelected = selectedMethod === method.id;
                    return (
                      <button
                        key={method.id}
                        onClick={() => setSelectedMethod(method.id)}
                        className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition ${
                          isSelected
                            ? 'bg-[#0a2463]/5 border-[#0a2463]'
                            : 'bg-white border-[#e2e5ea] hover:border-[#8b919d]'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          {method.logo ? (
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center border border-[#e2e5ea] bg-white overflow-hidden p-1">
                              <img src={method.logo} alt={method.name} className="max-w-full max-h-full object-contain" />
                            </div>
                          ) : (
                            <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-[10px] uppercase border ${method.color}`}>
                              {method.operator.substring(0, 4)}
                            </span>
                          )}
                          <div>
                            <span className="text-xs font-bold text-[#00103e] block">{method.name}</span>
                            <span className="text-[10px] text-[#8b919d]">Opérateur CEMAC</span>
                          </div>
                        </div>
                        <ChevronRight className={`h-4 w-4 ${isSelected ? 'text-[#0a2463]' : 'text-[#8b919d]'}`} />
                      </button>
                    );
                  })}
                </div>
              </div>

              {selectedMethod && (
                <div className="space-y-4 pt-2 border-t border-[#e2e5ea]">
                  {selectedMethod.endsWith('_MONEY') && (
                    <div>
                      <label className="block text-[10px] font-bold text-[#5c6470] uppercase tracking-wider mb-1.5">Numéro de téléphone</label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+235 60 00 00 00"
                        className="w-full bg-[#f5f7fa] border border-[#e2e5ea] rounded-xl py-3 px-4 text-[#0f1214] text-sm focus:border-[#0a2463] focus:outline-none transition font-mono"
                      />
                    </div>
                  )}

                  <button
                    onClick={() => payMutation.mutate()}
                    disabled={(selectedMethod.endsWith('_MONEY') && !phone) || payMutation.isPending}
                    className="w-full py-3.5 bg-[#ea580c] hover:bg-[#c94400] disabled:bg-[#b8bcc5] text-white font-bold rounded-xl text-sm transition shadow-md flex items-center justify-center"
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
        <div className="p-4 bg-[#f5f7fa] border-t border-[#e2e5ea] flex items-center justify-between text-[10px] text-[#5c6470]">
          <div className="flex items-center space-x-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>Sécurisé par Innov Pay</span>
          </div>
          <button onClick={handleClose} className="hover:text-[#00103e] font-bold">Annuler</button>
        </div>
      </div>
    </div>
  );
}
