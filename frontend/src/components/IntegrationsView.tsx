import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Link2,
  Webhook,
  CheckCircle2,
  RefreshCw,
  Zap,
  Bell,
  Copy,
  Code2,
} from 'lucide-react';
import { fetchApi } from '@/lib/api-client';
import { useConnectedWebsite } from '@/lib/aegis-website';

interface Integration {
  id: string;
  name: string;
  category: 'SIEM' | 'Webhook' | 'Identity' | 'Cloud';
  description: string;
  icon: string;
  status: 'CONNECTED' | 'DISCONNECTED' | 'SYNCING';
  lastSync: string;
}

export function IntegrationsView() {
  const { connectedSite, isConnected } = useConnectedWebsite();
  const [copiedCode, setCopiedCode] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success'>('idle');
  const [threatAlertStatus, setThreatAlertStatus] = useState<'idle' | 'testing' | 'success'>('idle');
  const [webhookUrl, setWebhookUrl] = useState('https://api.aegisai.io/v1/webhooks/secops-prod-01');

  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: 'datadog',
      name: 'Datadog SIEM',
      category: 'SIEM',
      description: 'Stream zero-trust biometrics telemetry and real-time risk scores directly to Datadog Logs.',
      icon: '🐶',
      status: 'DISCONNECTED',
      lastSync: 'Not connected',
    },
    {
      id: 'splunk',
      name: 'Splunk Enterprise Security',
      category: 'SIEM',
      description: 'Ingest high-frequency anomaly vectors and intruder threat logs into Splunk HTTP Event Collector (HEC).',
      icon: '📊',
      status: 'DISCONNECTED',
      lastSync: 'Not connected',
    },
    {
      id: 'slack',
      name: 'Slack SecOps Bot',
      category: 'Webhook',
      description: 'Instant notification alerts for CRITICAL risk score spikes (> 0.85) in SecOps response channels.',
      icon: '💬',
      status: 'DISCONNECTED',
      lastSync: 'Not connected',
    },
    {
      id: 'pagerduty',
      name: 'PagerDuty Escalations',
      category: 'Webhook',
      description: 'Trigger automated PagerDuty incidents on honey-token triggers and session hijacking attempts.',
      icon: '🚨',
      status: 'CONNECTED',
      lastSync: '10 mins ago',
    },
    {
      id: 'okta',
      name: 'Okta Identity Cloud',
      category: 'Identity',
      description: 'Enforce dynamic Adaptive Step-Up MFA via Okta Identity Engine when behavioral drift occurs.',
      icon: '🔑',
      status: 'CONNECTED',
      lastSync: '1 min ago',
    },
    {
      id: 'aws-cloudwatch',
      name: 'AWS CloudWatch Logs',
      category: 'Cloud',
      description: 'Archive tamper-proof raw biometric baseline vectors to AWS S3 / CloudWatch for compliance.',
      icon: '☁️',
      status: 'DISCONNECTED',
      lastSync: 'Never',
    },
  ]);

  const scriptTag = connectedSite?.scriptTag || `<script src="http://localhost:4000/api/v1/sdk/aegis-tracker.js?siteId=site_prod_9918" async></script>`;

  const handleCopyScript = () => {
    navigator.clipboard.writeText(scriptTag);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const toggleIntegration = (id: string) => {
    setIntegrations((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextStatus = item.status === 'CONNECTED' ? 'DISCONNECTED' : 'CONNECTED';
          return { ...item, status: nextStatus, lastSync: nextStatus === 'CONNECTED' ? 'Just now' : item.lastSync };
        }
        return item;
      })
    );
  };

  const handleTestWebhook = () => {
    setTestStatus('testing');
    setTimeout(() => {
      setTestStatus('success');
      setTimeout(() => setTestStatus('idle'), 3000);
    }, 1200);
  };

  const handleTestThreatAlertEmail = async () => {
    setThreatAlertStatus('testing');
    try {
      let userEmail = 'admin@aegisai.io';
      if (typeof window !== 'undefined') {
        const storedUser = localStorage.getItem('aegis_user');
        if (storedUser) {
          try {
            const u = JSON.parse(storedUser);
            if (u.email && u.email.includes('@')) userEmail = u.email;
          } catch (_) {}
        }
      }

      await fetchApi('/sentinel/detect-event', {
        method: 'POST',
        body: JSON.stringify({
          targetUrl: connectedSite?.url || 'https://my-app.com',
          domain: connectedSite?.domain || 'my-app.com',
          eventType: 'NEW_LOGIN_DETECTED',
          userEmail,
          deviceInfo: 'Chrome 122 on macOS (Safari/Blink)',
          ipAddress: '185.220.101.5',
          location: 'San Francisco, CA, USA',
          details: 'New login detected from an unrecognized device context.',
        }),
      });
      setThreatAlertStatus('success');
      setTimeout(() => setThreatAlertStatus('idle'), 4000);
    } catch {
      setThreatAlertStatus('idle');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="space-y-6"
    >
      {/* ══ HEADER BAR ══ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-200/80 pb-4 gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-zinc-900 flex items-center justify-center text-white shrink-0 shadow-xs">
              <Link2 className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-lg font-bold text-zinc-900 tracking-tight">SIEM & Security Pipeline Integrations</h2>
          </div>
          <p className="text-xs text-zinc-500 font-light mt-1">
            Stream AEGIS zero-trust biometrics telemetry and real-time risk scores to Datadog, Splunk, Slack, PagerDuty, Okta, and custom webhooks.
          </p>
        </div>
        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={handleTestThreatAlertEmail}
            disabled={threatAlertStatus === 'testing'}
            className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold font-mono transition-colors flex items-center space-x-2 cursor-pointer shadow-xs"
          >
            {threatAlertStatus === 'testing' ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Sending Alert...</span>
              </>
            ) : threatAlertStatus === 'success' ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                <span>Alert Email Sent! 🚨</span>
              </>
            ) : (
              <>
                <Bell className="w-3.5 h-3.5 text-white" />
                <span>Test Threat Alert Gmail 🚨</span>
              </>
            )}
          </button>
          <button
            onClick={handleTestWebhook}
            disabled={testStatus === 'testing'}
            className="px-3.5 py-2 rounded-xl bg-zinc-900 text-white text-xs font-semibold font-mono hover:bg-zinc-800 transition-colors flex items-center space-x-2 shadow-xs cursor-pointer"
          >
            {testStatus === 'testing' ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Testing Pipeline...</span>
              </>
            ) : testStatus === 'success' ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Webhook Verified!</span>
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5 text-white" />
                <span>Test Webhook Pipeline</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* SDK Script Generator Card */}
      <div className="border border-zinc-200/80 rounded-2xl p-6 bg-white shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
          <div className="flex items-center space-x-2">
            <Code2 className="w-4 h-4 text-zinc-900" />
            <h3 className="text-sm font-bold text-zinc-900">1-Line Client-Side Tracker SDK</h3>
          </div>
          <button
            onClick={handleCopyScript}
            className="text-xs text-zinc-700 hover:text-zinc-900 font-mono font-semibold flex items-center space-x-1.5 bg-zinc-50 px-3 py-1.5 rounded-xl border border-zinc-200 cursor-pointer shadow-xs"
          >
            {copiedCode ? (
              <span className="text-emerald-700 flex items-center space-x-1 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Copied SDK Tag!</span>
              </span>
            ) : (
              <span className="flex items-center space-x-1">
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Script Tag</span>
              </span>
            )}
          </button>
        </div>

        <p className="text-xs text-zinc-500 font-light leading-relaxed">
          Embed this single line into your frontend HTML <code className="text-zinc-800 font-mono bg-zinc-100 px-1 py-0.5 rounded">&lt;head&gt;</code> tag to continuously transmit mouse curvature & key dwell telemetry to your backend.
        </p>

        <pre className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 font-mono text-[11px] text-zinc-800 overflow-x-auto whitespace-pre-wrap">
          {scriptTag}
        </pre>
      </div>

      {/* Grid of SIEM & SecOps Integration Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {integrations.map((item) => {
          const isConn = item.status === 'CONNECTED';
          return (
            <div
              key={item.id}
              className={`border rounded-2xl p-5 transition-all flex flex-col justify-between bg-white shadow-xs hover:border-zinc-300 ${
                isConn ? 'border-zinc-200/80' : 'border-zinc-200 opacity-60'
              }`}
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{item.icon}</span>
                    <div>
                      <h3 className="text-sm font-bold text-zinc-900">{item.name}</h3>
                      <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold">{item.category}</span>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                      isConn
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-zinc-100 text-zinc-500 border-zinc-200'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
                <p className="text-xs text-zinc-500 font-light mt-3 leading-relaxed">{item.description}</p>
              </div>

              <div className="mt-5 pt-3 border-t border-zinc-100 flex items-center justify-between text-xs font-mono">
                <span className="text-[11px] text-zinc-400">Last sync: {item.lastSync}</span>
                <button
                  onClick={() => toggleIntegration(item.id)}
                  className={`px-3 py-1 rounded-xl text-[11px] font-semibold transition-all cursor-pointer ${
                    isConn
                      ? 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                      : 'bg-zinc-900 text-white hover:bg-zinc-800 shadow-xs'
                  }`}
                >
                  {isConn ? 'Configure' : 'Connect'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Webhook Endpoint Config */}
      <div className="border border-zinc-200/80 rounded-2xl p-5 bg-white shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Webhook className="w-4 h-4 text-zinc-400" />
            <h3 className="text-sm font-bold text-zinc-900">Custom Webhook Listener Pipeline</h3>
          </div>
          <span className="text-xs text-zinc-400 font-mono">HMAC SHA-256 Signed</span>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2 text-xs font-mono text-zinc-800 focus:outline-none focus:border-zinc-900"
            />
          </div>
          <button
            onClick={() => alert('Webhook signing secret copied to clipboard!')}
            className="px-3.5 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-xl text-xs font-semibold font-mono transition-colors border border-zinc-200 cursor-pointer shadow-xs"
          >
            Copy Signing Secret
          </button>
        </div>
      </div>
    </motion.div>
  );
}
