'use client';

import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Activity, Copy, Check, Save, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
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
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Webhooks</h1>
          <p className="text-slate-400 mt-1">Configurez des écouteurs HTTP pour recevoir des notifications en temps réel lors des événements de paiement.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Config form */}
          <div className="lg:col-span-1 bg-slate-900 border border-slate-800/80 rounded-3xl p-6 shadow-2xl flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white">Configuration</h3>
              
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400">URL du Point de Terminaison (Endpoint)</label>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    setUrlError('');
                  }}
                  placeholder="https://votre-site.com/api/webhooks"
                  className="w-full bg-slate-950/80 border-slate-800 text-white rounded-xl py-3 px-4 text-sm focus:ring-indigo-500"
                />
                {urlError && <p className="text-rose-400 text-xs mt-1">{urlError}</p>}
              </div>

              {/* Secret Key Display */}
              {config?.secret && (
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400">Clé de Signature Webhook (Secret)</label>
                  <div className="flex bg-slate-950/80 rounded-xl border border-slate-800 p-3 items-center justify-between text-xs font-mono">
                    <span className="text-slate-400 truncate pr-4">{config.secret}</span>
                    <button 
                      onClick={handleCopySecret}
                      className="p-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white rounded-lg shrink-0 transition"
                    >
                      {copied ? <Check className="h-4.5 w-4.5 text-emerald-400" /> : <Copy className="h-4.5 w-4.5" />}
                    </button>
                  </div>
                </div>
              )}

              {/* Event checkboxes */}
              <div className="space-y-3">
                <label className="text-xs font-semibold text-slate-400 block">Événements à écouter</label>
                
                {['payment.success', 'payment.failed', 'payment.refunded'].map((event) => (
                  <label key={event} className="flex items-center space-x-3 text-sm text-slate-300 font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={events.includes(event)}
                      onChange={() => handleCheckboxChange(event)}
                      className="rounded border-slate-800 bg-slate-950 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>{event}</span>
                  </label>
                ))}
              </div>
            </div>

            <button
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending}
              className="w-full flex justify-center items-center py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-lg transition duration-200 disabled:opacity-50"
            >
              {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              Enregistrer les Paramètres
            </button>
          </div>

          {/* Webhook log list */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800/80 rounded-3xl p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Historique de Livraison</h3>
                <p className="text-xs text-slate-400 mt-1">Logs de tentatives de transmission HTTP en arrière-plan.</p>
              </div>
              <button 
                onClick={() => refetchLogs()}
                className="p-2 border border-slate-800 rounded-xl hover:bg-slate-950 transition text-slate-400 hover:text-white"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>

            {isLoading ? (
              <div className="space-y-4">
                <div className="h-10 bg-slate-950/50 rounded-2xl animate-pulse" />
                <div className="h-10 bg-slate-950/50 rounded-2xl animate-pulse" />
              </div>
            ) : (
              <div className="overflow-y-auto max-h-[420px] space-y-3">
                {logsData?.data && logsData.data.length > 0 ? (
                  logsData.data.map((log: any) => (
                    <div 
                      key={log.id}
                      className="flex items-center justify-between p-4 bg-slate-950/80 border border-slate-850 rounded-2xl text-slate-300"
                    >
                      <div className="flex items-center space-x-3">
                        <span className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-bold font-mono ${
                          log.statusCode >= 200 && log.statusCode < 300 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}>
                          {log.statusCode || 'FAIL'}
                        </span>
                        <div>
                          <p className="text-xs font-mono text-white font-semibold">{log.event}</p>
                          <p className="text-[10px] text-slate-500 truncate max-w-[280px] sm:max-w-md">{log.url}</p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-xs font-semibold text-slate-400">Essai #{log.attempt}</p>
                        <p className="text-[10px] text-slate-600">
                          {new Date(log.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-12 text-center text-slate-500">
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
