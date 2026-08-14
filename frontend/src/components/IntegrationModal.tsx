'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Link2,
  CheckCircle2,
  Zap,
  Globe,
  RefreshCw,
  AlertCircle,
  Copy,
  Check,
  Power,
  ShieldCheck,
  Lock,
} from 'lucide-react';
import {
  useConnectedWebsite,
  connectWebsite,
  disconnectWebsite,
  ConnectedWebsite,
} from '@/lib/aegis-website';

interface IntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function IntegrationModal({ isOpen, onClose }: IntegrationModalProps) {
  const { connectedSite, isConnected } = useConnectedWebsite();
  const [targetUrl, setTargetUrl] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [emailNotice, setEmailNotice] = useState<string | null>(null);

  useEffect(() => {
    if (connectedSite?.url) {
      setTargetUrl(connectedSite.url);
    } else {
      setTargetUrl('');
    }
  }, [connectedSite]);

  if (!isOpen) return null;

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUrl.trim()) {
      setErrorMsg('Please enter your website URL link.');
      return;
    }

    setIsConnecting(true);
    setErrorMsg('');
    setEmailNotice(null);

    let userEmail = 'admin@aegisai.io';
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('aegis_user');
      if (storedUser) {
        try {
          const u = JSON.parse(storedUser);
          if (u.email) userEmail = u.email;
        } catch (_) {}
      }
    }

    try {
      const result = await connectWebsite(targetUrl, userEmail);
      setEmailNotice(`✅ Aegis AI Sentinel Enabled! Activation email sent to ${userEmail}`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to connect website URL. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    disconnectWebsite();
    setTargetUrl('');
    setEmailNotice(null);
  };

  const handleCopyScript = () => {
    if (!connectedSite?.scriptTag) return;
    navigator.clipboard.writeText(connectedSite.scriptTag);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-xl bg-white border border-zinc-200 rounded-2xl shadow-2xl overflow-hidden text-zinc-900 font-sans max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-zinc-100 bg-zinc-50/50">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center text-white shadow-xs">
                <Link2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-base font-bold tracking-tight">Website Target Integration</h3>
                <p className="text-xs text-zinc-500 font-light">Connect any domain to enable AEGIS security monitoring</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors cursor-pointer border border-zinc-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-6 overflow-y-auto flex-1">
            {/* Status Banner */}
            <div className="p-4 rounded-2xl border border-zinc-200/80 bg-zinc-50 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div
                  className={`w-3 h-3 rounded-full ${
                    isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-400'
                  }`}
                />
                <div>
                  <div className="text-xs font-mono font-bold uppercase text-zinc-400">Connection Status</div>
                  <div className="text-sm font-bold text-zinc-900 flex items-center space-x-2">
                    <span>{isConnected ? 'Website Connected' : 'Website Disconnected'}</span>
                    {isConnected && connectedSite && (
                      <span className="text-xs font-mono text-zinc-600 font-normal">({connectedSite.domain})</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs font-mono uppercase text-zinc-400">AEGIS Monitoring</div>
                <div className="text-xs font-bold font-mono">
                  {isConnected ? (
                    <span className="text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      ACTIVE
                    </span>
                  ) : (
                    <span className="text-zinc-500 bg-zinc-100 px-2.5 py-0.5 rounded-full border border-zinc-200">
                      INACTIVE
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Email Notification Alert */}
            {emailNotice && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-mono flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{emailNotice}</span>
              </div>
            )}

            {/* Error Message */}
            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-mono flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* If Website Connected */}
            {isConnected && connectedSite ? (
              <div className="space-y-5">
                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-3">
                  <div className="flex items-center justify-between text-xs border-b border-zinc-200 pb-2">
                    <span className="text-zinc-500 font-medium">Active Monitored Domain:</span>
                    <span className="font-mono text-emerald-700 font-bold flex items-center space-x-1">
                      <Globe className="w-3.5 h-3.5" />
                      <span>{connectedSite.domain}</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <div className="bg-white p-2.5 rounded-xl border border-zinc-200">
                      <span className="text-zinc-400 block text-[10px] uppercase font-bold">SSL PROTOCOL</span>
                      <span className="text-zinc-800 font-semibold">{connectedSite.sslStatus}</span>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-zinc-200">
                      <span className="text-zinc-400 block text-[10px] uppercase font-bold">HEALTH & LATENCY</span>
                      <span className="text-emerald-700 font-semibold">99% ({connectedSite.latencyMs}ms)</span>
                    </div>
                  </div>

                  {/* 1-Line Protection Script */}
                  <div className="space-y-1.5 pt-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-700 font-medium">1-Line Script Protection Code:</span>
                      <button
                        onClick={handleCopyScript}
                        className="text-xs text-zinc-800 hover:text-zinc-900 font-mono font-semibold flex items-center space-x-1 cursor-pointer bg-white px-2.5 py-1 rounded-xl border border-zinc-200 shadow-xs"
                      >
                        {copiedScript ? (
                          <span className="text-emerald-700 flex items-center space-x-1 font-bold">
                            <Check className="w-3 h-3" />
                            <span>Copied!</span>
                          </span>
                        ) : (
                          <span className="flex items-center space-x-1">
                            <Copy className="w-3 h-3" />
                            <span>Copy Code</span>
                          </span>
                        )}
                      </button>
                    </div>
                    <pre className="p-3 rounded-xl bg-white border border-zinc-200 font-mono text-[11px] text-zinc-800 overflow-x-auto whitespace-pre-wrap">
                      {connectedSite.scriptTag}
                    </pre>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <p className="text-xs text-zinc-500 font-light max-w-xs">
                    Disconnecting stops AEGIS monitoring and resets the dashboard to initial state.
                  </p>
                  <button
                    onClick={handleDisconnect}
                    className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-mono font-semibold flex items-center space-x-2 transition-colors cursor-pointer"
                  >
                    <Power className="w-3.5 h-3.5" />
                    <span>Disconnect Website</span>
                  </button>
                </div>
              </div>
            ) : (
              /* If No Website Connected */
              <form onSubmit={handleConnect} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-700 block">
                    Enter Target Website URL (Vercel, Render, Railway, Custom Domain):
                  </label>
                  <div className="relative">
                    <Globe className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={targetUrl}
                      onChange={(e) => setTargetUrl(e.target.value)}
                      placeholder="https://mycompany.com or https://my-app.vercel.app"
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-900 font-mono"
                    />
                  </div>
                  <p className="text-[11px] text-zinc-500 font-light">
                    Supported: Vercel, Render, Railway, Netlify, custom domains, or any publicly accessible web link.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isConnecting}
                  className="w-full py-3 rounded-xl bg-zinc-900 text-white font-semibold text-xs hover:bg-zinc-800 transition-colors flex items-center justify-center space-x-2 cursor-pointer shadow-xs font-mono"
                >
                  {isConnecting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                      <span>Scanning & Connecting Target Website...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 text-white" />
                      <span>Connect Website & Start AEGIS Monitoring</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-zinc-100 bg-zinc-50/50 flex items-center justify-between text-xs text-zinc-500">
            <span className="flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-zinc-900" />
              <span>Continuous Zero-Trust Security Sentinel</span>
            </span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-xs transition-colors cursor-pointer shadow-xs font-mono"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
