import React, { useState } from 'react';
import {
  Sliders,
  Bot,
  Zap,
  Globe,
  Bell,
  CheckCircle2,
  Lock,
  Sparkles,
  Save,
  Plus,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { useConnectedWebsite } from '@/lib/aegis-website';

export function PolicyRulesView() {
  const { connectedSite, isConnected } = useConnectedWebsite();
  const [mfaThreshold, setMfaThreshold] = useState<number>(70);
  const [lockoutThreshold, setLockoutThreshold] = useState<number>(90);
  const [botStrictness, setBotStrictness] = useState<'low' | 'balanced' | 'strict'>('balanced');
  const [dwellTolerance, setDwellTolerance] = useState<number>(3.0);

  const [blacklistedIps, setBlacklistedIps] = useState<Array<{ id: string; ip: string; reason: string; addedAt: string }>>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('aegis_blacklisted_ips');
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (_) {}
      }
    }
    return [];
  });
  const [newIp, setNewIp] = useState('');
  const [newReason, setNewReason] = useState('');

  const [webhookUrl, setWebhookUrl] = useState('https://hooks.slack.com/services/T00/B00/XXXX');
  const [slackAlertsEnabled, setSlackAlertsEnabled] = useState(true);

  const [savedSuccess, setSavedSuccess] = useState(false);



  const handleAddIp = () => {
    if (!newIp) return;
    setBlacklistedIps([
      ...blacklistedIps,
      {
        id: `ip_${Date.now()}`,
        ip: newIp,
        reason: newReason || 'Manual SecOps Blacklist',
        addedAt: new Date().toISOString().split('T')[0],
      },
    ]);
    setNewIp('');
    setNewReason('');
  };

  const handleRemoveIp = (id: string) => {
    setBlacklistedIps(blacklistedIps.filter((i) => i.id !== id));
  };

  const handleSavePolicies = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Title Banner */}
      <div className="border border-zinc-200/80 rounded-2xl p-6 bg-white shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-zinc-900 flex items-center justify-center text-white shrink-0 shadow-xs">
              <Sliders className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-base font-bold text-zinc-900 tracking-tight">Threat Mitigation & Security Policy Rules</h2>
          </div>
          <p className="text-xs text-zinc-500 font-light mt-1 max-w-xl">
            Configure automated ML anomaly sensitivity thresholds, adaptive MFA trigger rules, and IP blacklists.
          </p>
        </div>

        {savedSuccess && (
          <div className="px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center space-x-1.5 font-mono">
            <CheckCircle2 className="w-4 h-4" />
            <span>Policies Deployed!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSavePolicies} className="space-y-6">
        {/* CARD 1: Threshold Sliders */}
        <div className="border border-zinc-200/80 rounded-2xl p-6 bg-white shadow-xs space-y-6">
          <div className="border-b border-zinc-100 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-zinc-900">Risk Score Trigger Thresholds</h3>
              <p className="text-xs text-zinc-500 font-light">Control when adaptive authentication and session locks trigger automatically</p>
            </div>
            <Sparkles className="w-4 h-4 text-zinc-400" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* MFA Threshold Slider */}
            <div className="space-y-3 p-4 bg-zinc-50 rounded-xl border border-zinc-200/80 text-left">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-amber-600" />
                  <span className="text-xs font-semibold text-zinc-900">Adaptive Step-Up MFA Trigger</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 font-mono font-bold text-xs border border-amber-200">
                  {mfaThreshold}% Score
                </span>
              </div>
              <input
                type="range"
                min="40"
                max="85"
                value={mfaThreshold}
                onChange={(e) => setMfaThreshold(parseInt(e.target.value, 10))}
                className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-zinc-900"
              />
              <p className="text-[11px] text-zinc-500 font-light">
                When biometrics risk score reaches <strong className="text-zinc-900">{mfaThreshold}%</strong>, user session state changes to CHALLENGED and TOTP popup opens.
              </p>
            </div>

            {/* Lockout Threshold Slider */}
            <div className="space-y-3 p-4 bg-zinc-50 rounded-xl border border-zinc-200/80 text-left">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Lock className="w-4 h-4 text-rose-600" />
                  <span className="text-xs font-semibold text-zinc-900">Autonomous Session Lockdown</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 font-mono font-bold text-xs border border-rose-200">
                  {lockoutThreshold}% Score
                </span>
              </div>
              <input
                type="range"
                min="75"
                max="98"
                value={lockoutThreshold}
                onChange={(e) => setLockoutThreshold(parseInt(e.target.value, 10))}
                className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-rose-600"
              />
              <p className="text-[11px] text-zinc-500 font-light">
                When biometrics risk score reaches <strong className="text-rose-600">{lockoutThreshold}%</strong>, JWT & Redis session tokens are instantly invalidated.
              </p>
            </div>
          </div>
        </div>

        {/* CARD 2: Biometric Model Tuning */}
        <div className="border border-zinc-200/80 rounded-2xl p-6 bg-white shadow-xs space-y-6">
          <div className="border-b border-zinc-100 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-zinc-900">Biometric ML Sensitivity Tuning</h3>
              <p className="text-xs text-zinc-500 font-light">Tune IsolationForest contamination and Gaussian Z-score strictness</p>
            </div>
            <Bot className="w-4 h-4 text-zinc-400" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Bot Vector Strictness Selection */}
            <div className="space-y-2 text-left">
              <label className="text-xs font-semibold text-zinc-700">Robotic Linearity Vector Penalty</label>
              <div className="grid grid-cols-3 gap-2">
                {(['low', 'balanced', 'strict'] as const).map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setBotStrictness(level)}
                    className={`py-2 rounded-xl text-xs font-semibold capitalize transition-all border cursor-pointer ${
                      botStrictness === level
                        ? 'bg-zinc-900 text-white border-zinc-900 shadow-xs'
                        : 'bg-zinc-50 text-zinc-600 border-zinc-200 hover:bg-zinc-100'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-zinc-500 font-light mt-1">
                {botStrictness === 'strict'
                  ? 'Strict: Linear cursor movement straightness > 0.85 immediately incurs +0.60 bot penalty.'
                  : botStrictness === 'balanced'
                  ? 'Balanced: Linear cursor straightness > 0.90 incurs +0.50 bot penalty (Recommended).'
                  : 'Low: Linear cursor straightness > 0.95 incurs +0.35 bot penalty.'}
              </p>
            </div>

            {/* Dwell Time Tolerance */}
            <div className="space-y-2 text-left">
              <label className="text-xs font-semibold text-zinc-700">Keystroke Dwell Deviation Tolerance (Z-Score σ)</label>
              <div className="flex items-center space-x-3">
                <input
                  type="number"
                  step="0.1"
                  min="1.5"
                  max="5.0"
                  value={dwellTolerance}
                  onChange={(e) => setDwellTolerance(parseFloat(e.target.value) || 3.0)}
                  className="w-28 px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 font-mono focus:outline-none focus:border-zinc-900"
                />
                <span className="text-xs text-zinc-500 font-mono">Standard Deviations (σ)</span>
              </div>
              <p className="text-[11px] text-zinc-500 font-light">
                Key holding duration exceeding {dwellTolerance}σ from baseline triggers anomaly alert.
              </p>
            </div>
          </div>
        </div>

        {/* CARD 3: IP Blacklist Manager */}
        <div className="border border-zinc-200/80 rounded-2xl p-6 bg-white shadow-xs space-y-4">
          <div className="border-b border-zinc-100 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-zinc-900">IP Subnet & Geofencing Blacklist</h3>
              <p className="text-xs text-zinc-500 font-light">Blocked IP addresses automatically receive 99% risk score penalties</p>
            </div>
            <Globe className="w-4 h-4 text-zinc-400" />
          </div>

          <div className="flex items-center space-x-3 max-w-xl">
            <input
              type="text"
              value={newIp}
              onChange={(e) => setNewIp(e.target.value)}
              placeholder="IP Address (e.g. 198.51.100.99)"
              className="w-48 px-3.5 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-none focus:border-zinc-900 font-mono"
            />
            <input
              type="text"
              value={newReason}
              onChange={(e) => setNewReason(e.target.value)}
              placeholder="Threat Reason (e.g. Malicious Subnet)"
              className="flex-1 px-3.5 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-none focus:border-zinc-900 font-sans"
            />
            <button
              type="button"
              onClick={handleAddIp}
              className="px-4 py-2 rounded-xl bg-zinc-900 text-white hover:bg-zinc-800 font-semibold text-xs transition-colors flex items-center space-x-1 shrink-0 cursor-pointer shadow-xs font-mono"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add IP</span>
            </button>
          </div>

          <div className="border border-zinc-200/80 rounded-xl overflow-hidden mt-3 bg-white">
            <table className="w-full text-left text-xs text-zinc-700">
              <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-400 uppercase font-mono text-[10px]">
                <tr>
                  <th className="px-5 py-2.5 font-semibold">Blacklisted IP</th>
                  <th className="px-5 py-2.5 font-semibold">Threat Reason</th>
                  <th className="px-5 py-2.5 font-semibold">Date Added</th>
                  <th className="px-5 py-2.5 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 font-mono">
                {blacklistedIps.map((ip) => (
                  <tr key={ip.id} className="hover:bg-zinc-50 transition-colors">
                    <td className="px-5 py-3 font-semibold text-rose-600 flex items-center space-x-2">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>{ip.ip}</span>
                    </td>
                    <td className="px-5 py-3 text-zinc-600 font-sans">{ip.reason}</td>
                    <td className="px-5 py-3 text-zinc-400">{ip.addedAt}</td>
                    <td className="px-5 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleRemoveIp(ip.id)}
                        className="p-1 rounded text-zinc-400 hover:text-rose-600 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* CARD 4: Slack & Webhook Notifications */}
        <div className="border border-zinc-200/80 rounded-2xl p-6 bg-white shadow-xs space-y-4">
          <div className="border-b border-zinc-100 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-zinc-900">SecOps Threat Alert Webhooks</h3>
              <p className="text-xs text-zinc-500 font-light">Instantly dispatch threat attribution alerts to your SOC channels</p>
            </div>
            <Bell className="w-4 h-4 text-zinc-400" />
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-left">
              <input
                type="checkbox"
                id="slackAlerts"
                checked={slackAlertsEnabled}
                onChange={(e) => setSlackAlertsEnabled(e.target.checked)}
                className="rounded bg-zinc-100 border-zinc-300 text-zinc-900 focus:ring-0"
              />
              <label htmlFor="slackAlerts" className="text-xs text-zinc-700 font-medium cursor-pointer">
                Enable Instant Slack / PagerDuty Dispatch for Critical Anomalies (Score ≥ 75%)
              </label>
            </div>

            <div className="space-y-1.5 text-left max-w-xl">
              <label className="text-xs font-semibold text-zinc-700">Webhook Endpoint URL</label>
              <input
                type="url"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                className="w-full px-3.5 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 font-mono focus:outline-none focus:border-zinc-900"
              />
            </div>
          </div>
        </div>

        {/* Save Button Footer */}
        <div className="flex items-center justify-end pt-2">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-zinc-900 text-white font-semibold text-xs hover:bg-zinc-800 transition-colors flex items-center space-x-2 cursor-pointer shadow-xs"
          >
            <Save className="w-4 h-4" />
            <span>Deploy Rule Changes</span>
          </button>
        </div>
      </form>
    </div>
  );
}
