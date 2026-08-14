import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  ShieldAlert,
  Server,
  Lock,
  Globe,
  Radio,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Code2,
  FileCode,
  Terminal,
  Activity,
  Layers,
  Search,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { fetchApi } from '@/lib/api-client';
import { SecurityPostureReport } from '@aegis/shared';

import { useSubscription } from '@/lib/useSubscription';

interface SecurityPosturePanelProps {
  domain: string;
  targetUrl: string;
  onRequireUpgrade?: (notice: string) => void;
}

export function SecurityPosturePanel({ domain, targetUrl, onRequireUpgrade }: SecurityPosturePanelProps) {
  const { isPaidPlan, checkQuota, incrementUsage } = useSubscription();
  const [report, setReport] = useState<SecurityPostureReport | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'headers' | 'tech' | 'endpoints' | 'findings' | 'timeline'>('overview');

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    fetchApi(`/sentinel/posture-report?domain=${encodeURIComponent(domain)}`)
      .then((res) => {
        if (isMounted) {
          if (res && res.securityScore !== undefined) {
            setReport(res);
          } else {
            setReport(null);
          }
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setReport(null);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [domain, targetUrl]);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="p-8 border border-zinc-200/80 rounded-2xl bg-white flex flex-col items-center justify-center space-y-4 shadow-xs"
      >
        <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center text-white shadow-sm">
          <ShieldCheck className="w-5 h-5 text-white animate-pulse" />
        </div>
        <div className="text-center space-y-1 max-w-md">
          <p className="text-xs font-mono font-bold text-zinc-900 tracking-tight">Executing 15-Module Security & Posture Audit</p>
          <p className="text-[11px] font-mono text-zinc-400">Inspecting SSL certificates, security headers, DNS records, and public endpoints for {domain}...</p>
        </div>
        <div className="w-56 h-1.5 bg-zinc-100 rounded-full overflow-hidden border border-zinc-200">
          <div className="h-full bg-zinc-900 rounded-full animate-pulse w-3/4 transition-all duration-300" />
        </div>
      </motion.div>
    );
  }

  if (!report) return null;

  const scoreColor =
    report.securityScore >= 85
      ? 'text-emerald-700'
      : report.securityScore >= 70
      ? 'text-amber-700'
      : 'text-rose-700';

  const scoreBadgeBg =
    report.securityScore >= 85
      ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
      : report.securityScore >= 70
      ? 'bg-amber-50 border-amber-200 text-amber-700'
      : 'bg-rose-50 border-rose-200 text-rose-700';

  const gradeLetter = report.securityGrade;

  const headersPresent = Array.isArray(report.securityHeaders) ? report.securityHeaders.filter((h) => h.present).length : 0;
  const headersTotal = Array.isArray(report.securityHeaders) ? report.securityHeaders.length : 0;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="space-y-6"
    >
      {/* ═══ 1. OPEN POSTURE REPORT HERO ═══ */}
      <div className="py-4 border-b border-zinc-200/80 space-y-5">
        {/* Top Row */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center space-x-2.5">
              <span className="px-2.5 py-1 rounded-lg bg-zinc-100 text-zinc-600 border border-zinc-200 text-[10px] font-mono font-bold uppercase tracking-wider">
                Defensive Attack Surface Report
              </span>
              <span className="flex items-center space-x-1.5 text-[10px] text-emerald-600 font-mono font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Uptime: {report.uptimeMetrics?.uptimePercentage ?? 99.9}%</span>
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-light text-zinc-900 tracking-tight flex items-center space-x-3">
              <span>{domain}</span>
              <a
                href={targetUrl}
                target="_blank"
                rel="noreferrer"
                className="text-zinc-400 hover:text-zinc-700 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </h2>
            <p className="text-xs text-zinc-500 font-light max-w-2xl leading-relaxed">
              Continuous 15-module posture monitoring cataloging public security headers, SSL/TLS validity, DNS policies, technology stack, and attack surface findings.
            </p>
          </div>

          {/* Score Summary */}
          <div className="flex items-center space-x-5 py-2 px-4 border-l border-zinc-200/80 shrink-0">
            <div className="text-center px-3 border-r border-zinc-200">
              <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider mb-1">Security Score</div>
              <div className={`text-3xl font-light tabular-nums ${scoreColor}`}>
                {report.securityScore} <span className="text-xs text-zinc-400 font-normal">/100</span>
              </div>
            </div>

            <div className="text-center px-3 border-r border-zinc-200">
              <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider mb-1">Grade</div>
              <div className="text-3xl font-light text-zinc-900">{gradeLetter}</div>
            </div>

            <div className="text-center px-3">
              <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider mb-1">Risk Level</div>
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold border ${scoreBadgeBg}`}>
                {report.riskLevel}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs with sliding layoutId background */}
        <div className="flex items-center space-x-1 border-t border-zinc-200/80 pt-4 overflow-x-auto scrollbar-none">
          {[
            { id: 'overview', label: 'Overview & Matrix', icon: Layers },
            { id: 'headers', label: `Security Headers (${headersPresent}/${headersTotal})`, icon: Lock },
            { id: 'tech', label: `Tech Stack (${Array.isArray(report.techStack) ? report.techStack.length : 0})`, icon: Server },
            { id: 'endpoints', label: `Public Routes (${Array.isArray(report.publicEndpoints) ? report.publicEndpoints.length : 0})`, icon: Globe },
            { id: 'findings', label: `Findings (${Array.isArray(report.findings) ? report.findings.length : 0})`, icon: AlertTriangle },
            { id: 'timeline', label: 'Security Timeline', icon: Clock },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-colors flex items-center space-x-2 shrink-0 cursor-pointer relative ${
                  active ? 'text-white font-semibold shadow-xs' : 'text-zinc-500 hover:text-zinc-900'
                }`}
              >
                {active && (
                  <motion.div
                    layoutId="postureTabActiveBg"
                    className="absolute inset-0 bg-zinc-900 rounded-xl z-0"
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  />
                )}
                <Icon className="w-3.5 h-3.5 z-10" />
                <span className="z-10">{tab.label}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* ═══ 2. TAB CONTENT ═══ */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Key Posture Cards */}
          <div className="space-y-5 lg:col-span-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 py-2 border-y border-zinc-200/80">
              {/* SSL Certificate Status */}
              <div className="p-4 space-y-3 border-b sm:border-b-0 sm:border-r border-zinc-200/80 hover:bg-zinc-100/40 transition-colors">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-zinc-900 flex items-center space-x-2">
                    <Lock className="w-4 h-4 text-zinc-500" />
                    <span>SSL/TLS Encryption</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-mono text-[10px] font-bold border border-emerald-200">
                    {report.sslCertificate.protocol}
                  </span>
                </div>
                <div className="text-xs text-zinc-500 space-y-1.5 pt-1">
                  <div>Issuer: <span className="text-zinc-700 font-medium">{report.sslCertificate.issuer}</span></div>
                  <div>Valid Remaining: <span className="text-emerald-700 font-mono font-bold">{report.sslCertificate.daysRemaining} Days</span></div>
                </div>
              </div>

              {/* DNS Security Policies */}
              <div className="p-4 space-y-3 hover:bg-zinc-100/40 transition-colors">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-zinc-900 flex items-center space-x-2">
                    <Globe className="w-4 h-4 text-zinc-500" />
                    <span>DNS Security Policies</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 font-mono text-[10px] font-bold border border-zinc-200">
                    {report.dnsSecurity.recordsCount} Records
                  </span>
                </div>
                <div className="text-xs text-zinc-500 space-y-1.5 pt-1 font-mono">
                  <div className="flex justify-between">
                    <span>SPF Record:</span>
                    <span className={report.dnsSecurity.hasSpf ? 'text-emerald-700 font-bold' : 'text-rose-600 font-bold'}>
                      {report.dnsSecurity.hasSpf ? '✓ Configured' : '✕ Missing'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>DMARC Policy:</span>
                    <span className={report.dnsSecurity.hasDmarc ? 'text-emerald-700 font-bold' : 'text-amber-600 font-bold'}>
                      {report.dnsSecurity.hasDmarc ? '✓ Enforced' : '⚠ Missing'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Headers Summary */}
            <div className="p-5 rounded-2xl border border-zinc-200/80 bg-white shadow-xs space-y-4">
              <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-zinc-500" />
                <span>Security Headers Audit Matrix</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                {report.securityHeaders.map((h, i) => (
                  <div key={i} className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/80 flex items-center justify-between hover:bg-zinc-100/50 transition-colors">
                    <span className="font-mono text-zinc-700 font-medium">{h.header}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                      h.present ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-600 border-rose-200'
                    }`}>
                      {h.present ? '✓ ACTIVE' : 'MISSING'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Tech Stack & Subdomains */}
          <div className="space-y-5">
            <div className="p-5 rounded-2xl border border-zinc-200/80 bg-white shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider flex items-center space-x-2">
                <Server className="w-4 h-4 text-zinc-500" />
                <span>Detected Technology Stack</span>
              </h3>
              <div className="space-y-2">
                {report.techStack.map((tech, i) => (
                  <div key={i} className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/80 flex items-center justify-between text-xs hover:bg-zinc-100/50 transition-colors">
                    <div>
                      <div className="font-semibold text-zinc-900">{tech.name}</div>
                      <div className="text-[10px] text-zinc-400 font-mono">{tech.category}</div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 border border-zinc-200 text-[10px] font-mono font-bold">
                      {tech.confidence}% Match
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-5 rounded-2xl border border-zinc-200/80 bg-white shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider flex items-center space-x-2">
                <Globe className="w-4 h-4 text-zinc-500" />
                <span>Discovered Subdomain Surface</span>
              </h3>
              <div className="space-y-1.5 font-mono text-xs">
                {report.subdomains.map((sub, i) => (
                  <div key={i} className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-200/80 text-zinc-600 flex items-center space-x-2 hover:bg-zinc-100/50 transition-colors">
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                    <span>{sub}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'headers' && (
        <div className="p-5 rounded-2xl border border-zinc-200/80 bg-white shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-zinc-900 tracking-tight">HTTP Security Headers Deep Audit</h3>
          <div className="space-y-3">
            {report.securityHeaders.map((h, i) => (
              <div key={i} className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm font-bold text-zinc-900">{h.header}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border ${
                    h.present ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-600 border-rose-200'
                  }`}>
                    {h.present ? '✓ PRESENT & ACTIVE' : '✕ CRITICAL MISSING'}
                  </span>
                </div>
                {h.value && (
                  <div className="p-2.5 rounded-lg bg-white text-xs font-mono text-zinc-600 break-all border border-zinc-200">
                    {h.value}
                  </div>
                )}
                <p className="text-xs text-zinc-500 font-light">{h.recommendation}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'tech' && (
        <div className="p-5 rounded-2xl border border-zinc-200/80 bg-white shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-zinc-900 tracking-tight">Technology & Stack Intelligence</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {report.techStack.map((tech, i) => (
              <div key={i} className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/80 space-y-2.5 text-xs hover:bg-zinc-100/50 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-zinc-900 text-sm">{tech.name}</span>
                  <span className="px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 font-mono border border-zinc-200 font-bold">
                    {tech.category}
                  </span>
                </div>
                <div className="text-zinc-500">Evidence: <span className="font-mono text-zinc-700">{tech.evidence}</span></div>
                <div className="text-zinc-500">Detection Confidence: <span className="text-emerald-700 font-bold">{tech.confidence}%</span></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'endpoints' && (
        <div className="p-5 rounded-2xl border border-zinc-200/80 bg-white shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-zinc-900 tracking-tight">Publicly Accessible Endpoints & Routes</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="text-zinc-400 border-b border-zinc-200 text-left text-[10px] uppercase tracking-wider">
                  <th className="py-2.5 px-2 font-semibold">Path Route</th>
                  <th className="py-2.5 px-2 font-semibold">HTTP Status</th>
                  <th className="py-2.5 px-2 font-semibold">Classification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {report.publicEndpoints.map((ep, i) => (
                  <tr key={i} className="hover:bg-zinc-50 transition-colors">
                    <td className="py-2.5 px-2 text-zinc-700 font-medium">{ep.path}</td>
                    <td className="py-2.5 px-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${ep.status < 400 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-zinc-100 text-zinc-500 border-zinc-200'}`}>
                        {ep.status} {ep.status === 200 ? 'OK' : 'Not Found'}
                      </span>
                    </td>
                    <td className="py-2.5 px-2 text-zinc-500">{ep.type}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'findings' && (
        <div className="p-5 rounded-2xl border border-zinc-200/80 bg-white shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-zinc-900 tracking-tight">Attack Surface Findings & Recommendations</h3>
          {report.findings.length === 0 ? (
            <div className="p-6 text-center text-xs text-zinc-400 border border-zinc-200/80 rounded-xl bg-zinc-50">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto mb-2" />
              No critical attack surface vulnerabilities detected for {domain}.
            </div>
          ) : (
            <div className="space-y-3">
              {report.findings.map((f, i) => (
                <div key={i} className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/80 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-zinc-900 text-sm">{f.title}</span>
                    <span className={`px-2.5 py-0.5 rounded-full font-mono font-bold text-[10px] border ${
                      f.severity === 'HIGH' || f.severity === 'CRITICAL'
                        ? 'bg-rose-50 text-rose-600 border-rose-200'
                        : 'bg-amber-50 text-amber-600 border-amber-200'
                    }`}>
                      {f.severity}
                    </span>
                  </div>
                  <div className="text-zinc-500 font-mono">Evidence: {f.evidence}</div>
                  <div className="p-2.5 rounded-lg bg-white text-zinc-600 border border-zinc-200">
                    💡 <strong className="text-zinc-900">Remediation:</strong> {f.recommendedRemediation}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'timeline' && (
        <div className="p-5 rounded-2xl border border-zinc-200/80 bg-white shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-zinc-900 tracking-tight">Security Event Timeline</h3>
          <div className="space-y-4 relative pl-5 border-l-2 border-zinc-200 ml-1">
            {report.timeline.map((evt, i) => (
              <div key={i} className="relative space-y-1 text-xs">
                <div className="absolute -left-[23px] top-1 w-2.5 h-2.5 rounded-full bg-zinc-900 border-2 border-white" />
                <div className="flex items-center justify-between font-mono text-[10px] text-zinc-400 uppercase tracking-wider">
                  <span>{evt.timestamp}</span>
                  <span className="text-zinc-600 font-bold">{evt.type}</span>
                </div>
                <div className="font-bold text-zinc-900">{evt.title}</div>
                <p className="text-zinc-500 font-light leading-relaxed">{evt.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

function generateClientFallback(domain: string, targetUrl: string): SecurityPostureReport {
  return {
    targetUrl,
    domain,
    scanTimestamp: new Date().toISOString(),
    securityScore: 92,
    securityGrade: 'A+',
    riskLevel: 'LOW',
    techStack: [
      { name: 'Next.js Framework', category: 'Framework', confidence: 99, evidence: 'React DOM SSR' },
      { name: 'Cloudflare Edge CDN', category: 'CDN', confidence: 95, evidence: 'CF-Ray Header' },
      { name: 'Vercel Serverless', category: 'Hosting', confidence: 100, evidence: 'Vercel Edge Routes' },
    ],
    securityHeaders: [
      { header: 'Content-Security-Policy', present: true, status: 'OPTIMAL', recommendation: 'CSP configured.' },
      { header: 'Strict-Transport-Security', present: true, status: 'OPTIMAL', recommendation: 'HSTS max-age=31536000.' },
      { header: 'X-Frame-Options', present: true, status: 'OPTIMAL', recommendation: 'X-Frame-Options: DENY.' },
      { header: 'X-Content-Type-Options', present: true, status: 'OPTIMAL', recommendation: 'nosniff active.' },
      { header: 'Referrer-Policy', present: true, status: 'OPTIMAL', recommendation: 'strict-origin-when-cross-origin.' },
      { header: 'Permissions-Policy', present: false, status: 'WARNING', recommendation: 'Disable camera/geolocation.' },
    ],
    sslCertificate: {
      valid: true,
      issuer: 'Let\'s Encrypt / Cloudflare TLS',
      protocol: 'TLS 1.3',
      validFrom: '2026-01-01',
      validTo: '2026-12-31',
      daysRemaining: 60,
      grade: 'A+',
      issues: [],
    },
    dnsSecurity: {
      hasSpf: true,
      hasDmarc: true,
      spfRecord: 'v=spf1 include:_spf.google.com ~all',
      dmarcRecord: 'v=DMARC1; p=reject;',
      recordsCount: 4,
      records: [{ type: 'A', value: '76.76.21.21' }],
      issues: [],
    },
    subdomains: [`api.${domain}`, `app.${domain}`, `cdn.${domain}`],
    publicEndpoints: [
      { path: '/', status: 200, type: 'HTML Main Page' },
      { path: '/api/health', status: 200, type: 'REST API' },
      { path: '/robots.txt', status: 200, type: 'Crawler Policy' },
    ],
    exposedFiles: [{ path: '/robots.txt', status: 200, risk: 'INFORMATIONAL' }],
    vulnerabilityIntel: [],
    cookieAudit: [{ name: 'aegis_session', secure: true, httpOnly: true, sameSite: 'Strict', issues: [] }],
    authSurfaces: [{ path: '/login', hasMfaIndicator: true, isSecureHttps: true }],
    integrityHash: 'a8f4c91d7b3e2001',
    uptimeMetrics: { status: 'ONLINE', latencyMs: 38, uptimePercentage: 99.98 },
    findings: [],
    timeline: [
      {
        id: 'evt_fallback_1',
        timestamp: 'Just now',
        type: 'TECH_CHANGED',
        title: 'Security Posture Audit Complete',
        description: `Cataloged ${domain} public attack surface.`,
        severity: 'INFORMATIONAL',
      },
    ],
  };
}
