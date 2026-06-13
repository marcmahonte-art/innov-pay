'use client';

import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Copy, Check, Save, Loader2, RefreshCw } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { apiClient } from '@/lib/api';

export default function WebhooksPage() {
  const [url, setUrl] = useState('');
  const [events, setEvents] = useState<string[]>(['payment.success', 'payment.failed']);
  const [copied, setCopied] = useState(false);
  const [urlError, setUrlError] = useState('');

  // Fetch Webhook Configuration
  const { data: config, isLoading: configLoading, refetch: refetchConfig } = useQuery({
    queryKey: ['webhookConfig'],
    queryFn: async () => {
      try {
        const res = await apiClient.get('/webhooks/config');
        setUrl(res.data.url);
        setEvents(res.data.events);
        return res.data;
      } catch (err: any) {
        // If not found, return null
        if (err.response?.status === 404) return null;
        throw err;
      }
    },
  });

  // Fetch Webhook Logs
  const { data: logsData, isLoading: logsLoading, refetch: refetchLogs } = useQuery({
    queryKey: ['webhookLogs'],
    queryFn: async () => {
      const res = await apiClient.get('/webhooks/logs');
      return res.data;
    },
  });

  // Save Config Mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      // Basic URL regex verification
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        setUrlError('L\'URL doit commencer par http:// ou https://');
        throw new Error('Invalid URL');
      }
      setUrlError('');
      const res = await apiClient.post('/webhooks/config', { url, events });
      return res.data;
    },
    onSuccess: () => {
      refetchConfig();
      refetchLogs();
    },
  });

  const handleCopySecret = () => {
    if (config?.secret) {
      navigator.clipboard.writeText(config.secret);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCheckboxChange = (event: string) => {
    if (events.includes(event)) {
      setEvents(events.filter((e) => e !== event));
    } else {
      setEvents([...events, event]);
    }
  };

  const isLoading = configLoading || logsLoading;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-[#00103e] tracking-tight">Webhooks</h1>
          <p className="text-[#5c6470] text-sm">Configurez des écouteurs HTTP pour recevoir des notifications en temps réel lors des événements de paiement.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Config form */}
          <div className="lg:col-span-1 bg-white border border-[#e2e5ea] rounded-2xl p-6 shadow-card flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-[#00103e]">Configuration</h3>
              
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#5c6470] uppercase tracking-wider">URL du Point de Terminaison (Endpoint)</label>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    setUrlError('');
                  }}
                  placeholder="https://votre-site.com/api/webhooks"
                  className="w-full bg-[#f5f7fa] border border-[#e2e5ea] text-[#0f1214] rounded-xl py-2 px-3 text-sm focus:outline-none focus:border-[#0a2463] transition"
                />
                {urlError && <p className="text-rose-600 text-xs mt-1">{urlError}</p>}
              </div>

              {/* Secret Key Display */}
              {config?.secret && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#5c6470] uppercase tracking-wider">Clé de Signature Webhook (Secret)</label>
                  <div className="flex bg-[#f5f7fa] rounded-xl border border-[#e2e5ea] p-3 items-center justify-between text-xs font-mono">
                    <span className="text-[#5c6470] truncate pr-4 font-semibold">{config.secret}</span>
                    <button 
                      onClick={handleCopySecret}
                      className="p-1.5 bg-white border border-[#e2e5ea] hover:border-[#8b919d] text-[#5c6470] hover:text-[#00103e] rounded-lg shrink-0 transition"
                    >
                      {copied ? <Check className="h-4.5 w-4.5 text-emerald-600" /> : <Copy className="h-4.5 w-4.5" />}
                    </button>
                  </div>
                </div>
              )}

              {/* Event checkboxes */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-[#5c6470] uppercase tracking-wider block">Événements à écouter</label>
                
                {['payment.success', 'payment.failed', 'payment.refunded'].map((event) => (
                  <label key={event} className="flex items-center space-x-3 text-sm text-[#3c3f4a] font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={events.includes(event)}
                      onChange={() => handleCheckboxChange(event)}
                      className="rounded border-[#e2e5ea] text-[#0a2463] focus:ring-[#0a2463]"
                    />
                    <span>{event}</span>
                  </label>
                ))}
              </div>
            </div>

            <button
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending}
              className="w-full flex justify-center items-center py-2.5 bg-[#0a2463] hover:bg-[#1a3a72] text-white font-semibold rounded-xl shadow-md transition duration-200 disabled:opacity-50"
            >
              {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              Enregistrer les Paramètres
            </button>
          </div>

          {/* Webhook log list */}
          <div className="lg:col-span-2 bg-white border border-[#e2e5ea] rounded-2xl p-6 shadow-card space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-[#00103e]">Historique de Livraison</h3>
                <p className="text-xs text-[#5c6470] mt-1">Logs de tentatives de transmission HTTP en arrière-plan.</p>
              </div>
              <button 
                onClick={() => refetchLogs()}
                className="p-2 border border-[#e2e5ea] rounded-xl hover:bg-[#f0f2f5] transition text-[#5c6470] hover:text-[#00103e]"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>

            {isLoading ? (
              <div className="space-y-4 animate-pulse">
                <div className="h-10 bg-[#f0f2f5] rounded-xl" />
                <div className="h-10 bg-[#f0f2f5] rounded-xl" />
              </div>
            ) : (
              <div className="overflow-y-auto max-h-[420px] space-y-3">
                {logsData?.data && logsData.data.length > 0 ? (
                  logsData.data.map((log: any) => (
                    <div 
                      key={log.id}
                      className="flex items-center justify-between p-4 bg-[#f5f7fa] border border-[#e2e5ea] rounded-xl text-[#3c3f4a]"
                    >
                      <div className="flex items-center space-x-3">
                        <span className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-bold font-mono ${
                          log.statusCode >= 200 && log.statusCode < 300 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {log.statusCode || 'FAIL'}
                        </span>
                        <div>
                          <p className="text-xs font-mono text-[#00103e] font-semibold">{log.event}</p>
                          <p className="text-[10px] text-[#8b919d] truncate max-w-[280px] sm:max-w-md">{log.url}</p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-xs font-semibold text-[#5c6470]">Essai #{log.attempt}</p>
                        <p className="text-[10px] text-[#8b919d]">
                          {new Date(log.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-12 text-center text-[#8b919d]">
                    Aucun log de transmission webhook enregistré.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
