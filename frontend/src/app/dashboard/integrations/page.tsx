'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Code2, Download, ExternalLink, Cpu, LayoutGrid, CheckCircle2, ShoppingCart, HelpCircle } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { apiClient } from '@/lib/api';

export default function IntegrationsPage() {
  
  // Fetch API Keys to show on this page for developer comfort
  const { data: apiKeys } = useQuery({
    queryKey: ['integrationsApiKeys'],
    queryFn: async () => {
      const res = await apiClient.get('/merchants/api-keys');
      return res.data;
    },
  });

  const activeTestKey = apiKeys?.find((k: any) => !k.isLive)?.publicKey || 'pk_test_...';
  const activeLiveKey = apiKeys?.find((k: any) => k.isLive)?.publicKey || 'pk_live_...';

  const plugins = [
    {
      name: 'WooCommerce',
      description: 'Acceptez Airtel, Moov, Konoom et les cartes bancaires sur votre site WordPress.',
      version: 'v2.0.0',
      logo: 'https://cdn-icons-png.flaticon.com/512/5968/5968397.png',
      downloadUrl: '#',
      installed: false,
    },
    {
      name: 'PrestaShop',
      description: 'Module de paiement Innov Pay officiel pour toutes les versions de PrestaShop v1.7+.',
      version: 'v1.8.2',
      logo: 'https://cdn-icons-png.flaticon.com/512/825/825482.png',
      downloadUrl: '#',
      installed: false,
    },
    {
      name: 'SDK PHP / Node.js',
      description: 'Intégrez la passerelle directement dans vos applications custom.',
      version: 'v1.0.4',
      logo: 'https://cdn-icons-png.flaticon.com/512/919/919830.png',
      downloadUrl: '#',
      installed: true,
    }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 font-sans">
        
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-[#00103e] tracking-tight">Plugins & Modules d'Intégration</h1>
          <p className="text-[#5c6470] text-sm">Installez nos extensions prêtes à l'emploi ou développez votre propre intégration avec nos clés API.</p>
        </div>

        {/* API Keys quick reference */}
        <div className="bg-white border border-[#e2e5ea] rounded-2xl p-6 shadow-card space-y-4">
          <div className="flex items-center space-x-2 text-[#00103e]">
            <Cpu className="h-5 w-5 text-[#ea580c]" />
            <h3 className="text-base font-bold">Identifiants d'Intégration Rapide</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-4 bg-[#f5f7fa] border border-[#e2e5ea] rounded-xl space-y-1 relative">
              <span className="text-[10px] font-bold text-[#8b919d] block">Clé Publique Sandbox (Test)</span>
              <span className="text-[#00103e] break-all block font-semibold">{activeTestKey}</span>
            </div>
            
            <div className="p-4 bg-[#f5f7fa] border border-[#e2e5ea] rounded-xl space-y-1 relative">
              <span className="text-[10px] font-bold text-[#8b919d] block">Clé Publique Live (Production)</span>
              <span className="text-[#00103e] break-all block font-semibold">{activeLiveKey}</span>
            </div>
          </div>
        </div>

        {/* Plugins Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plugins.map((plugin) => (
            <div key={plugin.name} className="bg-white border border-[#e2e5ea] rounded-2xl p-6 shadow-card flex flex-col justify-between space-y-6 hover:shadow-card-hover transition">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="w-12 h-12 bg-[#f5f7fa] rounded-xl flex items-center justify-center p-2 border border-[#e2e5ea]">
                    <img src={plugin.logo} alt={plugin.name} className="max-w-full max-h-full object-contain" />
                  </div>
                  <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold">{plugin.version}</span>
                </div>
                
                <div className="space-y-1.5">
                  <h4 className="text-sm font-extrabold text-[#00103e]">{plugin.name}</h4>
                  <p className="text-xs text-[#5c6470] leading-relaxed">{plugin.description}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-[#e2e5ea] flex items-center justify-between">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                  {plugin.installed ? 'Configuré' : 'Prêt à installer'}
                </span>
                <button
                  onClick={() => alert(`Téléchargement de l'archive ${plugin.name} en cours...`)}
                  className="flex items-center text-xs font-bold text-[#0a2463] hover:text-[#ea580c] transition"
                >
                  <Download className="h-4 w-4 mr-1.5" />
                  Télécharger .zip
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* API documentation block */}
        <div className="bg-[#f5f7fa] border border-[#e2e5ea] rounded-2xl p-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="md:col-span-2 space-y-2">
            <h4 className="text-sm font-extrabold text-[#00103e] flex items-center">
              <Code2 className="h-4.5 w-4.5 text-[#ea580c] mr-2" />
              Intégration API personnalisée & Webhooks
            </h4>
            <p className="text-xs text-[#5c6470] leading-relaxed">
              Consultez notre documentation complète pour intégrer notre widget WebPay, notre checkout USSD natif, ou paramétrer des webhooks sécurisés avec signature HMAC SHA-256.
            </p>
          </div>
          <div className="flex justify-start md:justify-end">
            <a
              href="https://docs.innovpay.td"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-[#0a2463] hover:bg-[#1a3a72] text-white font-bold text-xs px-5 py-3 rounded-xl shadow-md transition"
            >
              <span>Accéder à la Doc API</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
