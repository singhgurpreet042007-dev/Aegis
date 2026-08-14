'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Filter,
  RefreshCw,
  Zap,
  Globe,
  Clock,
  Smartphone,
  MapPin,
  AlertTriangle,
  FileText,
  Lock,
  ShieldCheck,
  ChevronRight,
  X,
  Mail,
  UserCheck,
  UserX,
} from 'lucide-react';
import { fetchApi } from '@/lib/api-client';
import { useConnectedWebsite } from '@/lib/aegis-website';
import { SecurityIncident, RiskLevel } from '@aegis/shared';

export function SecurityAlertsView() {
  const { connectedSite, isConnected } = useConnectedWebsite();
  const [filter, setFilter] = useState<string>('ALL');
  const [incidents, setIncidents] = useState<SecurityIncident[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedIncident, setSelectedIncident] = useState<SecurityIncident | null>(null);
  const [isProcessingAction, setIsProcessingAction] = useState<string | null>(null);

  const fetchIncidents = async () => {
    setIsLoading(true);
    try {
      if (isConnected && connectedSite) {
        const data = await fetchApi(`/sentinel/incidents?domain=${encodeURIComponent(connectedSite.domain)}`);
        if (Array.isArray(data)) {
          setIncidents(data);
          setIsLoading(false);
          return;
        }
      }
    } catch {
      // Ignored
    } finally {
      setIsLoading(false);
    }

    setIncidents([]);
  };

  useEffect(() => {
    fetchIncidents();
  }, [isConnected, connectedSite?.domain]);

  const handleVerifyAction = async (incidentId: string, action: 'VERIFIED' | 'COMPROMISED') => {
    setIsProcessingAction(incidentId);

    // Update local state immediately for snappy responsive UI
    setIncidents((prev) =>
      prev.map((inc) => {
        if (inc.id === incidentId) {
          const newState = action === 'VERIFIED' ? 'VERIFIED_BY_OWNER' : 'MARKED_COMPROMISED';
          const updatedInc = {
            ...inc,
            verificationState: newState as any,
            auditTrail: [
              ...inc.auditTrail,
              {
                timestamp: new Date().toISOString(),
                action: action === 'VERIFIED' ? 'VERIFIED_SAFE' : 'FLAGGED_COMPROMISED',
                actor: 'Security Officer (SecOps Console)',
                note:
                  action === 'VERIFIED'
                    ? 'Owner manually confirmed identity via Aegis SecOps Dashboard.'
                    : 'Owner flagged event as unauthorized. Automatic session token revocation executed.',
              },
            ],
          };
          if (selectedIncident?.id === incidentId) {
            setSelectedIncident(updatedInc);
          }
          return updatedInc;
        }
        return inc;
      })
    );

    try {
      await fetchApi(`/sentinel/incidents/${incidentId}/action`, {
        method: 'POST',
        body: JSON.stringify({ action }),
      });
    } catch (_) {
      // Local state is already updated
    } finally {
      setIsProcessingAction(null);
    }
  };

  const filteredIncidents = incidents.filter((inc) => {
    if (filter === 'ALL') return true;
    if (filter === 'PENDING') return inc.verificationState === 'PENDING';
    if (filter === 'VERIFIED') return inc.verificationState === 'VERIFIED_BY_OWNER';
    if (filter === 'COMPROMISED') return inc.verificationState === 'MARKED_COMPROMISED';
    return true;
  });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="space-y-6"
    >
      {/* Top Controls Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-zinc-200/80">
        <div>
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-zinc-900" />
            <h2 className="text-base font-bold text-zinc-900 tracking-tight">Security Incident & Alert Console</h2>
            <span className="text-xs text-zinc-500 font-mono">({filteredIncidents.length})</span>
          </div>
          <p className="text-xs text-zinc-500 font-light mt-0.5">
            Real-time security event detection, risk classification, and interactive owner verification audit trail for{' '}
            <span className="text-zinc-900 font-mono font-semibold">{connectedSite?.domain || 'demo-app.aegisai.io'}</span>
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchIncidents}
            className="p-2 rounded-xl bg-white border border-zinc-200 hover:bg-zinc-100 text-zinc-600 hover:text-zinc-900 transition-colors cursor-pointer shadow-xs"
            title="Refresh Security Events"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <div className="flex items-center space-x-2">
            <Filter className="w-3.5 h-3.5 text-zinc-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-white border border-zinc-200 text-xs text-zinc-700 rounded-xl px-3 py-1.5 focus:outline-none focus:border-zinc-900 font-mono shadow-xs"
            >
              <option value="ALL">All Events ({incidents.length})</option>
              <option value="PENDING">Pending Verification</option>
              <option value="VERIFIED">Verified Safe</option>
              <option value="COMPROMISED">Flagged Compromised</option>
            </select>
          </div>
        </div>
      </div>

      {/* Incident Cards List */}
      <div className="space-y-4">
        {filteredIncidents.length === 0 && !isLoading ? (
          <div className="p-12 text-center border border-zinc-200/80 rounded-2xl bg-white shadow-xs space-y-3">
            <ShieldCheck className="w-8 h-8 text-emerald-600 mx-auto" />
            <h3 className="text-sm font-bold text-zinc-900">No Security Data Available Yet</h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto leading-relaxed font-light">
              No security events or incident alerts recorded for <span className="text-zinc-800 font-medium">{connectedSite?.domain || 'demo-app.aegisai.io'}</span>.
              New security events will appear here automatically when detected.
            </p>
          </div>
        ) : (
          filteredIncidents.map((inc) => {
            const isCritical = inc.severity === 'CRITICAL' || inc.severity === 'HIGH';
            const isPending = inc.verificationState === 'PENDING';
            const isVerified = inc.verificationState === 'VERIFIED_BY_OWNER';
            const isCompromised = inc.verificationState === 'MARKED_COMPROMISED';

            return (
              <div
                key={inc.id}
                className={`border rounded-2xl p-5 transition-all space-y-4 bg-white shadow-xs ${
                  isCompromised || (isCritical && isPending)
                    ? 'border-rose-200 hover:border-rose-300'
                    : isVerified
                    ? 'border-emerald-200 hover:border-emerald-300'
                    : 'border-zinc-200/80 hover:border-zinc-300'
                }`}
              >
                {/* Card Top Row */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border uppercase tracking-wider ${
                        inc.severity === 'CRITICAL'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : inc.severity === 'HIGH'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : inc.severity === 'MEDIUM'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}
                    >
                      {inc.severity} RISK ({(inc.riskScore * 100).toFixed(0)}%)
                    </span>

                    <span className="px-2.5 py-1 rounded-full bg-zinc-100 text-zinc-700 text-[11px] font-mono font-bold uppercase tracking-wider border border-zinc-200">
                      {inc.eventType.replace(/_/g, ' ')}
                    </span>

                    {/* Verification Status Badge */}
                    <span
                      className={`text-[11px] font-mono font-bold px-2.5 py-1 rounded-full flex items-center space-x-1.5 border ${
                        isVerified
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : isCompromised
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse'
                      }`}
                    >
                      {isVerified ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>VERIFIED SAFE BY OWNER</span>
                        </>
                      ) : isCompromised ? (
                        <>
                          <XCircle className="w-3.5 h-3.5" />
                          <span>FLAGGED AS COMPROMISED</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-3.5 h-3.5" />
                          <span>PENDING OWNER VERIFICATION</span>
                        </>
                      )}
                    </span>
                  </div>

                  <div className="text-xs text-zinc-400 font-mono flex items-center space-x-2">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{new Date(inc.timestamp).toLocaleString()}</span>
                  </div>
                </div>

                {/* Card Description & Why Suspicious */}
                <div className="space-y-2">
                  <p className="text-xs text-zinc-800 font-medium leading-relaxed">
                    {inc.whySuspicious || `Security event detected on ${inc.domain} from IP ${inc.ipAddress}.`}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs font-mono text-zinc-500">
                    <div className="flex items-center space-x-1.5 bg-zinc-50 p-2.5 rounded-xl border border-zinc-200/80">
                      <Smartphone className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                      <span className="truncate">{inc.deviceInfo}</span>
                    </div>
                    <div className="flex items-center space-x-1.5 bg-zinc-50 p-2.5 rounded-xl border border-zinc-200/80">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate">{inc.ipAddress} ({inc.location})</span>
                    </div>
                    <div className="flex items-center space-x-1.5 bg-zinc-50 p-2.5 rounded-xl border border-zinc-200/80">
                      <Mail className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                      <span>{inc.notificationSent ? 'Interactive Email Sent' : 'Timeline Alert Only'}</span>
                    </div>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-zinc-100">
                  {/* Interactive Verification Buttons if PENDING */}
                  {isPending ? (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleVerifyAction(inc.id, 'VERIFIED')}
                        disabled={isProcessingAction === inc.id}
                        className="px-4 py-2 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center space-x-1.5 transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
                      >
                        <UserCheck className="w-4 h-4" />
                        <span>✓ YES, IT'S ME</span>
                      </button>
                      <button
                        onClick={() => handleVerifyAction(inc.id, 'COMPROMISED')}
                        disabled={isProcessingAction === inc.id}
                        className="px-4 py-2 text-xs bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold flex items-center space-x-1.5 transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
                      >
                        <UserX className="w-4 h-4" />
                        <span>🚨 NO, IT'S NOT ME</span>
                      </button>
                    </div>
                  ) : (
                    <div className="text-xs text-zinc-500 font-mono">
                      {isVerified && 'Device whitelisted for future sessions.'}
                      {isCompromised && 'Remediations executed & IP blacklisted.'}
                    </div>
                  )}

                  <button
                    onClick={() => setSelectedIncident(inc)}
                    className="px-3.5 py-2 text-xs bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-xl font-semibold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer border border-zinc-200"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>View Audit Trail</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ══ AUDIT TRAIL MODAL ══ */}
      {selectedIncident && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-zinc-200 rounded-2xl max-w-2xl w-full p-6 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
              <div>
                <div className="flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-zinc-900" />
                  <h3 className="text-base font-bold text-zinc-900">Security Incident Audit Trail</h3>
                </div>
                <p className="text-xs text-zinc-500 font-mono mt-0.5">ID: {selectedIncident.id}</p>
              </div>
              <button
                onClick={() => setSelectedIncident(null)}
                className="p-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-500 hover:text-zinc-900 transition-colors cursor-pointer border border-zinc-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Overview Metadata */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
              <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-200">
                <div className="text-[10px] text-zinc-400 font-bold uppercase">EVENT TYPE</div>
                <div className="font-bold text-zinc-900 mt-1 text-[11px] truncate">{selectedIncident.eventType}</div>
              </div>
              <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-200">
                <div className="text-[10px] text-zinc-400 font-bold uppercase">RISK SCORE</div>
                <div className="font-bold text-amber-700 mt-1">{(selectedIncident.riskScore * 100).toFixed(0)}% ({selectedIncident.severity})</div>
              </div>
              <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-200">
                <div className="text-[10px] text-zinc-400 font-bold uppercase">VERIFICATION</div>
                <div className="font-bold text-zinc-800 mt-1 truncate">{selectedIncident.verificationState}</div>
              </div>
              <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-200">
                <div className="text-[10px] text-zinc-400 font-bold uppercase">NOTIFIED</div>
                <div className="font-bold text-emerald-700 mt-1">{selectedIncident.notificationSent ? 'EMAIL SENT' : 'LOGGED'}</div>
              </div>
            </div>

            {/* Why Suspicious */}
            <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200 space-y-1">
              <h4 className="text-xs font-bold text-zinc-700 uppercase tracking-wider font-mono">Why Aegis AI Flagged Event</h4>
              <p className="text-xs text-zinc-600 leading-relaxed font-light">{selectedIncident.whySuspicious}</p>
            </div>

            {/* Step-by-Step Audit Timeline Log */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider font-mono">Complete Incident Audit Log</h4>

              <div className="space-y-3 relative border-l border-zinc-200 pl-4 ml-2">
                {selectedIncident.auditTrail.map((entry, idx) => (
                  <div key={idx} className="relative space-y-1">
                    <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-zinc-900 border border-white" />
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="font-bold text-zinc-900">{entry.action}</span>
                      <span className="text-[11px] text-zinc-400">{new Date(entry.timestamp).toLocaleString()}</span>
                    </div>
                    <div className="text-[11px] text-zinc-500 font-mono">Actor: <span className="text-zinc-800 font-medium">{entry.actor}</span></div>
                    <p className="text-xs text-zinc-600 leading-relaxed bg-zinc-50 p-3 rounded-xl border border-zinc-200 mt-1 font-sans">
                      {entry.note}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended Remediations */}
            {selectedIncident.remediationSteps && selectedIncident.remediationSteps.length > 0 && (
              <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200 space-y-2">
                <h4 className="text-xs font-bold text-amber-800 font-mono flex items-center space-x-1.5">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Executed Security Remediation Actions</span>
                </h4>
                <ul className="text-xs text-zinc-600 space-y-1 list-disc pl-4 font-mono">
                  {selectedIncident.remediationSteps.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Modal Actions */}
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedIncident(null)}
                className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer shadow-xs"
              >
                Close Audit Log
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
