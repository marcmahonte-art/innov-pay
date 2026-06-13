'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { CreditCard, ShieldCheck, CheckCircle2, AlertCircle, RefreshCw, Smartphone, ChevronRight } from 'lucide-react';
import axios from 'axios';

const publicApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1',
});

export default function MerchantQrPaymentPage() {
  const { merchantId } = useParams();
  const router = useRouter();
  const [amount, setAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [paymentInstructions, setPaymentInstructions] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [otpRequired, setOtpRequired] = useState(false);
  const [otp, setOtp] = useState('');
  const [paymentId, setPaymentId] = useState<string | null>(null);

  // Fetch Merchant profile
  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['merchantQrProfile', merchantId],
    queryFn: async () => {
      const res = await publicApi.get(`/checkout/merchant/${merchantId}`);
      return res.data;
    },
    enabled: !!merchantId,
  });

  // Log scan event once loaded
  useEffect(() => {
    if (merchantId) {
      publicApi.get(`/qr/scan/${merchantId}`).catch((err) => {
        console.error('Failed to log scan:', err);
      });
    }
  }, [merchantId]);

  const payMutation = useMutation({
    mutationFn: async () => {
      setErrorMessage(null);
      
      // First create a dynamic payment session
      const sessionRes = await publicApi.post('/checkout/sessions', {
        merchantId,
        amount: parseFloat(amount),
        currency: 'XAF',
        customerEmail: email,
        customerPhone: phone || undefined,
        merchantReference: `qr_${Date.now().toString().substring(6)}`,
        metadata: { isQrScan: true },
      });

      const { id: sessionId } = sessionRes.data;

      // Submit payment for this session
      const res = await publicApi.post(`/checkout/sessions/${sessionId}/pay`, {
        paymentMethod: selectedMethod,
        customerPhone: phone || undefined,
      });

      return { sessionId, data: res.data };
    },
    onSuccess: ({ sessionId, data }) => {
      if (data.status === 'SUCCESS') {
        setIsSuccess(true);
      } else if (data.otpRequired) {
        setPaymentId(sessionId);
        setOtpRequired(true);
        setPaymentInstructions(data.instructions || null);
      } else if (data.instructions) {
        setPaymentInstructions(data.instructions);
      } else {
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

  const verifyOtpMutation = useMutation({
    mutationFn: async () => {
      setErrorMessage(null);
      const res = await publicApi.post(`/checkout/sessions/${paymentId}/verify-otp`, {
        otp,
      });
      return res.data;
    },
    onSuccess: () => {
      setIsSuccess(true);
    },
    onError: (err: any) => {
      setErrorMessage(err.response?.data?.message || err.message || 'Le code OTP saisi est incorrect.');
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f5f7fa] flex flex-col items-center justify-center text-[#5c6470] space-y-4 font-webpay">
        <RefreshCw className="h-8 w-8 animate-spin text-[#0a2463]" />
        <p className="text-sm font-semibold">Chargement du portail de paiement QR...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-[#f5f7fa] flex flex-col items-center justify-center px-6 text-center space-y-6 font-webpay">
        <div className="h-16 w-16 bg-[#ffdad6] rounded-full flex items-center justify-center text-[#B91C1C]">
          <AlertCircle className="h-8 w-8" />
        </div>
        <div className="space-y-2 max-w-md">
          <h2 className="text-xl font-bold text-[#00103e]">Marchand introuvable</h2>
          <p className="text-sm text-[#5c6470]">
            Ce QR Code correspond à un marchand qui n'existe pas ou dont le compte a été désactivé.
          </p>
        </div>
        <button
          onClick={() => router.push('/')}
          className="py-3 px-6 bg-white border border-[#e2e5ea] hover:bg-[#f0f2f5] rounded-xl text-[#0a2463] font-bold transition"
        >
          Fermer la fenêtre
        </button>
      </div>
    );
  }

  const methods = [
    { id: 'KONOOM_MONEY', name: 'Konoom Mobile Money (Tchad)', operator: 'KONOOM', logo: '/operators/konoom.png', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { id: 'AIRTEL_MONEY', name: 'Airtel Money', operator: 'AIRTEL', logo: '/operators/airtel.png', color: 'bg-red-50 text-red-600 border-red-200' },
    { id: 'MOOV_MONEY', name: 'Moov Money', operator: 'MOOV', logo: '/operators/moov.png', color: 'bg-blue-50 text-blue-600 border-blue-200' },
    { id: 'VISA', name: 'Carte Visa', operator: 'VISA/GIMAC', logo: '/operators/visa.png', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    { id: 'MASTERCARD', name: 'Carte Mastercard', operator: 'MASTERCARD', logo: '/operators/mastercard.svg', color: 'bg-orange-50 text-orange-700 border-orange-200' },
  ];

  return (
    <div className="min-h-screen bg-[#f5f7fa] flex items-center justify-center p-4 lg:p-10 font-webpay">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 bg-white border border-[#e2e5ea] rounded-[24px] overflow-hidden shadow-modal relative">
        
        {/* Left Side: Order Summary */}
        <div className="p-8 lg:p-12 bg-[#f5f7fa] border-r border-[#e2e5ea] flex flex-col justify-between space-y-8">
          <div className="space-y-6">
            <div>
              <span className="text-xs font-bold text-[#ea580c] tracking-widest uppercase">InnovQR Secure Payment</span>
              <h1 className="text-2xl font-black text-[#00103e] mt-1">{profile.businessName || 'Marchand Innov Pay'}</h1>
            </div>

            <div className="space-y-2">
              <h2 className="text-lg font-extrabold text-[#00103e] leading-tight">Règlement instantané par scan QR</h2>
              <p className="text-[#5c6470] text-sm leading-relaxed">
                Réglez vos achats en toute sécurité. Saisissez le montant indiqué par le caissier et choisissez votre moyen de paiement mobile ou carte.
              </p>
            </div>
          </div>

          <div className="space-y-6 pt-6 border-t border-[#e2e5ea]">
            <div className="flex items-center space-x-2 text-[#5c6470] text-xs">
              <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Cryptage SSL standard & transaction sécurisée</span>
            </div>
          </div>
        </div>

        {/* Right Side: Checkout Form */}
        <div className="p-8 lg:p-12 bg-white flex flex-col justify-center">
          {isSuccess ? (
            <div className="text-center space-y-6 py-8">
              <div className="h-16 w-16 bg-[#dcfce7] border border-emerald-250 rounded-full flex items-center justify-center text-[#15803D] mx-auto">
                <CheckCircle2 className="h-10 w-10 animate-bounce" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-[#00103e]">Paiement effectué !</h3>
                <p className="text-sm text-[#5c6470]">
                  Votre règlement de {parseFloat(amount).toLocaleString('fr-FR')} XAF a été traité avec succès.
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
            <div className="space-y-6">
              <div className="h-12 w-12 bg-[#0a2463]/10 border border-[#0a2463]/20 rounded-2xl flex items-center justify-center text-[#0a2463]">
                <Smartphone className="h-6 w-6" />
              </div>
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-[#00103e]">Instructions de paiement</h3>
                <p className="text-sm text-[#5c6470] leading-relaxed bg-[#f5f7fa] p-4 border border-[#e2e5ea] rounded-xl font-mono">
                  {paymentInstructions}
                </p>
              </div>
              <button
                onClick={() => {
                  setPaymentInstructions(null);
                  setIsSuccess(true);
                }}
                className="w-full py-4 bg-[#ea580c] hover:bg-[#c94400] text-white font-bold rounded-xl text-sm transition shadow-md"
              >
                J'ai validé sur mon téléphone
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {errorMessage && (
                <div className="bg-rose-50 border border-rose-200 text-[#B91C1C] p-4 rounded-xl text-xs flex items-start space-x-2">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#5c6470] uppercase tracking-wider mb-2">Montant du règlement (FCFA)</label>
                  <input
                    type="number"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Saisir le montant en FCFA"
                    className="w-full bg-[#f5f7fa] border border-[#e2e5ea] rounded-xl py-3 px-4 text-[#0f1214] text-lg font-bold focus:border-[#0a2463] focus:outline-none transition"
                  />
                </div>

                <h3 className="text-xs font-bold text-[#5c6470] uppercase tracking-wider">1. Choisir le moyen de paiement</h3>
                <div className="grid grid-cols-1 gap-2 max-h-[180px] overflow-y-auto pr-1">
                  {methods.map((method) => {
                    const isSelected = selectedMethod === method.id;
                    return (
                      <button
                        key={method.id}
                        onClick={() => setSelectedMethod(method.id)}
                        className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition ${
                          isSelected
                            ? 'bg-[#0a2463]/5 border-[#0a2463]'
                            : 'bg-white border-[#e2e5ea] hover:border-[#8b919d]'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          {method.logo ? (
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center border border-[#e2e5ea] bg-white overflow-hidden p-1">
                              <img src={method.logo} alt={method.name} className="max-w-full max-h-full object-contain" />
                            </div>
                          ) : (
                            <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-[10px] uppercase border ${method.color}`}>
                              {method.operator.substring(0, 4)}
                            </span>
                          )}
                          <span className="text-xs font-bold text-[#00103e]">{method.name}</span>
                        </div>
                        <ChevronRight className={`h-4 w-4 ${isSelected ? 'text-[#0a2463]' : 'text-[#8b919d]'}`} />
                      </button>
                    );
                  })}
                </div>
              </div>

              {selectedMethod && (
                <div className="space-y-4 pt-4 border-t border-[#e2e5ea]">
                  <h3 className="text-xs font-bold text-[#5c6470] uppercase tracking-wider">2. Informations client</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-bold text-[#5c6470] uppercase tracking-wider mb-1">Email</label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="exemple@mail.com"
                        className="w-full bg-[#f5f7fa] border border-[#e2e5ea] rounded-xl py-2 px-3 text-[#0f1214] text-sm focus:border-[#0a2463] focus:outline-none transition"
                      />
                    </div>

                    {selectedMethod.endsWith('_MONEY') && (
                      <div>
                        <label className="block text-[10px] font-bold text-[#5c6470] uppercase tracking-wider mb-1">Téléphone Mobile Money</label>
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+235 60 00 00 00"
                          className="w-full bg-[#f5f7fa] border border-[#e2e5ea] rounded-xl py-2 px-3 text-[#0f1214] text-sm focus:border-[#0a2463] focus:outline-none transition font-mono"
                        />
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => payMutation.mutate()}
                    disabled={!amount || !email || (selectedMethod.endsWith('_MONEY') && !phone) || payMutation.isPending}
                    className="w-full mt-2 py-3.5 bg-[#ea580c] hover:bg-[#c94400] disabled:bg-[#b8bcc5] text-white font-bold rounded-xl text-sm transition shadow-md flex items-center justify-center"
                  >
                    {payMutation.isPending ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                        Traitement sécurisé...
                      </>
                    ) : (
                      `Payer ${parseFloat(amount).toLocaleString('fr-FR')} FCFA`
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
