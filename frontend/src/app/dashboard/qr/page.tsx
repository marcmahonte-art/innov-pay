'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { QrCode, Download, Printer, Eye, TrendingUp, TrendingDown, RefreshCw, Upload, CheckCircle2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import DashboardLayout from '@/components/DashboardLayout';
import { apiClient } from '@/lib/api';

export default function InnovQrPage() {
  const [primaryColor, setPrimaryColor] = useState('#00103e');
  const [logoUrl, setLogoUrl] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Fetch QR settings
  const { data: qrConfig, isLoading: isQrLoading, refetch: refetchQr } = useQuery({
    queryKey: ['qrConfig'],
    queryFn: async () => {
      const res = await apiClient.get('/merchants/qr');
      return res.data;
    },
  });

  // Sync color & logo settings when fetched
  useEffect(() => {
    if (qrConfig) {
      if (qrConfig.primaryColor) setPrimaryColor(qrConfig.primaryColor);
      if (qrConfig.logoUrl) setLogoUrl(qrConfig.logoUrl);
    }
  }, [qrConfig]);

  // Fetch QR stats
  const { data: qrStats, isLoading: isStatsLoading } = useQuery({
    queryKey: ['qrStats'],
    queryFn: async () => {
      const res = await apiClient.get('/merchants/qr/stats');
      return res.data;
    },
  });

  // Save QR Mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      const res = await apiClient.post('/merchants/qr', {
        primaryColor,
        logoUrl: logoUrl || undefined,
      });
      return res.data;
    },
    onSuccess: () => {
      showToast('QR Code sauvegardé avec succès !');
      refetchQr();
    },
  });

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  const colors = ['#00103e', '#c94400', '#15803d', '#000000', '#1d4ed8'];

  // QR link points to the scan logging URL in the backend
  const merchantId = qrConfig?.merchantId || '0000-merchant-id';
  const qrValue = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/qr/scan/${merchantId}`;
  
  // Dynamic Google Chart / QR Server QR Code URL
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&color=${primaryColor.substring(1)}&data=${encodeURIComponent(qrValue)}`;

  return (
    <DashboardLayout>
      <div className="space-y-6 font-sans print:p-0">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-[#00103e] tracking-tight flex items-center">
              InnovQR <span className="bg-[#ea580c] text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-full ml-2 select-none">NEW</span>
            </h1>
            <p className="text-[#5c6470] text-sm">Générez et personnalisez votre point de paiement QR instantané pour vos encaissements physiques.</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handlePrint}
              className="flex items-center justify-center bg-white border border-[#e2e5ea] hover:bg-[#f0f2f5] text-[#00103e] font-semibold text-sm px-4 py-2.5 rounded-xl transition"
            >
              <Printer className="h-4 w-4 mr-2" />
              Imprimer A4
            </button>
            <button
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending}
              className="flex items-center justify-center bg-[#ea580c] hover:bg-[#c94400] text-white font-semibold text-sm px-4 py-2.5 rounded-xl shadow-md transition disabled:opacity-50"
            >
              {saveMutation.isPending ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <QrCode className="h-4 w-4 mr-2" />}
              Enregistrer
            </button>
          </div>
        </div>

        {/* Success Toast */}
        {toastMsg && (
          <div className="fixed bottom-8 right-8 bg-[#0a1628] border border-[#152e5e] text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-slide-in z-50">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            <div>
              <p className="text-xs font-bold">{toastMsg}</p>
            </div>
          </div>
        )}

        {/* Printable QR Code Flyer */}
        <div className="hidden print:flex flex-col items-center justify-center text-center p-12 space-y-8 min-h-screen">
          <div className="space-y-2">
            <h1 className="text-4xl font-extrabold text-[#00103e] tracking-tight">InnovPay</h1>
            <p className="text-sm text-[#5c6470] uppercase font-bold tracking-widest">Paiement sécurisé par QR Code</p>
          </div>
          
          <div className="p-8 border-4 border-[#0a2463] rounded-3xl bg-white shadow-2xl">
            <img src={qrCodeUrl} alt="Marchand QR Code" className="w-[300px] h-[300px]" />
          </div>

          <div className="space-y-3">
            <h2 className="text-2xl font-black text-[#00103e]">Scannez pour Payer</h2>
            <p className="text-sm text-[#5c6470] max-w-md mx-auto">
              Utilisez votre application mobile Airtel Money, Moov Money ou Konoom Money pour scanner ce code et confirmer votre paiement.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 print:hidden">
          
          {/* Left: Customization & Preview */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            
            {/* Bento QR Creator Card */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-2xl border border-[#e2e5ea] shadow-card">
              
              {/* Preview Area */}
              <div className="flex flex-col items-center justify-center p-6 bg-[#f5f7fa] rounded-2xl border-2 border-dashed border-[#e2e5ea] relative group">
                <div className="p-2 rounded-2xl bg-white shadow-lg mb-4" style={{ border: `3px solid ${primaryColor}` }}>
                  <div className="p-2 bg-white relative">
                    <img src={qrCodeUrl} alt="Merchant QR" className="w-[200px] h-[200px] object-contain" />
                    {logoUrl && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <img src={logoUrl} alt="Logo" className="w-10 h-10 bg-white border border-[#e2e5ea] rounded-full p-0.5 object-contain" />
                      </div>
                    )}
                  </div>
                </div>
                <h3 className="text-base font-bold text-[#00103e]">Prêt pour encaissement</h3>
                <p className="text-[10px] text-[#8b919d] uppercase tracking-widest font-bold">InnovQR Secure</p>
              </div>

              {/* Options Area */}
              <div className="flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#5c6470] uppercase tracking-wider mb-3">Couleur du QR</label>
                    <div className="flex gap-2">
                      {colors.map((c) => (
                        <button
                          key={c}
                          onClick={() => setPrimaryColor(c)}
                          className={`w-8 h-8 rounded-full border-2 transition ${
                            primaryColor === c ? 'border-[#ea580c] scale-110 shadow' : 'border-transparent hover:scale-105'
                          }`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#5c6470] uppercase tracking-wider mb-2">Logo Central (URL)</label>
                    <input
                      type="text"
                      value={logoUrl}
                      onChange={(e) => setLogoUrl(e.target.value)}
                      placeholder="https://votre-site.com/logo.png"
                      className="w-full bg-[#f5f7fa] border border-[#e2e5ea] rounded-xl py-2 px-3 text-[#0f1214] text-xs focus:outline-none focus:border-[#0a2463] transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#5c6470] uppercase tracking-wider mb-2">Instructions A4</label>
                    <p className="text-[10px] text-[#8b919d]">Générez une fiche A4 plastifiée prête à afficher dans votre boutique.</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-[#e2e5ea]">
                  <a
                    href={qrCodeUrl}
                    download="merchant-qr.png"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 border border-[#e2e5ea] py-2 px-4 rounded-lg text-xs font-bold text-[#00103e] hover:bg-[#f0f2f5] transition"
                  >
                    <Download className="h-4 w-4" />
                    Télécharger
                  </a>
                  <button
                    onClick={handlePrint}
                    className="flex items-center justify-center gap-2 bg-[#ea580c] hover:bg-[#c94400] text-white py-2 px-4 rounded-lg text-xs font-bold shadow transition"
                  >
                    <Printer className="h-4 w-4" />
                    Imprimer A4
                  </button>
                </div>
              </div>
            </div>

            {/* Scans Chart */}
            <div className="bg-white p-6 rounded-2xl border border-[#e2e5ea] shadow-card">
              <h3 className="font-bold text-[#00103e] mb-6">Activité des scans (30 derniers jours)</h3>
              <div className="h-[240px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={qrStats?.dailyScans || []}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 10 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 10 }} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Line type="monotone" dataKey="scans" stroke="#00103e" strokeWidth={3} dot={{ r: 3, fill: '#00103e', strokeWidth: 2, stroke: '#FFF' }} activeDot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Right: Quick Stats & Heatmap */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            
            {/* Quick Stats list */}
            <div className="space-y-4">
              <div className="bg-white p-5 rounded-2xl border border-[#e2e5ea] shadow-card flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 text-[#00103e] rounded-full flex items-center justify-center">
                  <QrCode className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-[10px] text-[#8b919d] uppercase font-bold tracking-wider">Total Scans</p>
                  <h4 className="text-xl font-black text-[#00103e]">{qrStats?.metrics?.totalScans || 0}</h4>
                  <p className="text-[10px] text-emerald-700 flex items-center gap-1 mt-0.5">
                    <TrendingUp className="h-3 w-3" /> +12% cette semaine
                  </p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#e2e5ea] shadow-card flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-700 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-[10px] text-[#8b919d] uppercase font-bold tracking-wider">Volume QR</p>
                  <h4 className="text-xl font-black text-[#00103e]">{qrStats?.metrics?.totalVolume?.toLocaleString('fr-FR') || 0} FCFA</h4>
                  <p className="text-[10px] text-emerald-700 flex items-center gap-1 mt-0.5">
                    <TrendingUp className="h-3 w-3" /> +8% cette semaine
                  </p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#e2e5ea] shadow-card flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-50 text-amber-700 rounded-full flex items-center justify-center">
                  <Eye className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-[10px] text-[#8b919d] uppercase font-bold tracking-wider">Taux de conversion</p>
                  <h4 className="text-xl font-black text-[#00103e]">{(qrStats?.metrics?.conversionRate || 0).toFixed(1)} %</h4>
                  <p className="text-[10px] text-rose-700 flex items-center gap-1 mt-0.5">
                    <TrendingDown className="h-3 w-3" /> -2% vs mois dernier
                  </p>
                </div>
              </div>
            </div>

            {/* Info Card */}
            <div className="bg-[#0a2463] text-white p-5 rounded-2xl space-y-3 shadow-card relative overflow-hidden">
              <span className="text-[9px] font-bold uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded-full select-none inline-block">Astuce InnovQR</span>
              <p className="text-xs font-bold leading-relaxed">
                Plastifiez votre QR Code et affichez-le sur votre comptoir. Nos encaissements QR prennent en charge Konoom, Airtel et Moov Mobile Money.
              </p>
              <div className="absolute -bottom-6 -right-6 text-white/5 opacity-10">
                <QrCode className="h-32 w-32" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
