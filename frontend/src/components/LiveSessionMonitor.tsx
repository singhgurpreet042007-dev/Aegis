import React, { useState, useEffect } from 'react';
import { Lock, Play, ShieldAlert, Monitor, CheckCircle2, Globe } from 'lucide-react';
import { fetchApi } from '@/lib/api-client';
import { useConnectedWebsite } from '@/lib/aegis-website';

interface SessionItem {
  id: string;
  user: { fullName: string; email: string };
  ipAddress: string;
  location: string;
  deviceFingerprint: string;
  currentRiskScore: number;
  riskLevel: string;
  mfaState: string;
  isSimulated?: boolean;
}

interface LiveSessionMonitorProps {
  sessions?: SessionItem[];
  onSelectReplay?: (sessionId: string) => void;
  onChallengeMfa?: (sessionId: string) => void;
}

export function LiveSessionMonitor({
  sessions,
  onSelectReplay,
  onChallengeMfa,
}: LiveSessionMonitorProps) {
  const { connectedSite, isConnected } = useConnectedWebsite();
  const [sessionList, setSessionList] = useState<SessionItem[]>(sessions || []);

  useEffect(() => {
    if (sessions && sessions.length > 0) {
      setSessionList(sessions);
      return;
    }

    const loadSessions = async () => {
      try {
        const data = await fetchApi('/risk/active-sessions');
        if (data && Array.isArray(data) && data.length > 0) {
          setSessionList(
            data.map((s: any) => ({
              id: s.id || s.sessionToken,
              user: {
                fullName: s.user?.fullName || 'Security Officer',
                email: s.user?.email || 'officer@aegisai.io',
              },
              ipAddress: s.ipAddress || '198.51.100.42',
              location: s.location || 'San Francisco, CA, USA',
              deviceFingerprint: s.deviceFingerprint || 'fp_macbook_m2_prod_991',
              currentRiskScore: s.currentRiskScore ?? 0.08,
              riskLevel: s.riskLevel || 'LOW',
              mfaState: s.mfaState || 'PASSED',
            })),
          );
          return;
        }
      } catch (_) {}

      setSessionList([]);
    };

    loadSessions();
  }, [sessions]);

  return (
    <div className="border border-zinc-200/80 rounded-2xl p-5 bg-white shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
        <div>
          <h3 className="text-sm font-bold text-zinc-900">Live Monitored Sessions</h3>
          <p className="text-xs text-zinc-500 font-light">Continuous zero-trust behavioral biometrics telemetry</p>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-full bg-zinc-100 text-zinc-600 border border-zinc-200 font-mono font-bold">
          {sessionList.length} Active Sessions
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-sans">
          <thead className="text-zinc-400 uppercase border-b border-zinc-200 font-mono tracking-wider text-[10px]">
            <tr>
              <th className="py-2.5 px-3">User</th>
              <th className="py-2.5 px-3">Device Fingerprint</th>
              <th className="py-2.5 px-3">IP & Location</th>
              <th className="py-2.5 px-3">Risk Score</th>
              <th className="py-2.5 px-3">Adaptive MFA</th>
              <th className="py-2.5 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 text-zinc-700">
            {sessionList.map((sess) => {
              const scorePct = Math.round(sess.currentRiskScore * 100);
              const isHigh = scorePct >= 75;
              const isMed = scorePct >= 40;

              return (
                <tr key={sess.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="py-3 px-3">
                    <div className="font-semibold text-zinc-900">{sess.user?.fullName || 'Security Officer'}</div>
                    <div className="text-[11px] text-zinc-400 font-mono">{sess.user?.email || 'user@aegisai.io'}</div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center space-x-1.5 font-mono text-[11px] text-zinc-500">
                      <Monitor className="w-3.5 h-3.5 text-zinc-400" />
                      <span>{(sess.deviceFingerprint || 'fp_aegis_98a7b6c5d4').slice(0, 16)}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="text-zinc-900 font-mono">{sess.ipAddress || '198.51.100.42'}</div>
                    <div className="text-[11px] text-zinc-400">{sess.location || 'San Francisco, US'}</div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-zinc-100 rounded-full h-1.5 overflow-hidden border border-zinc-200">
                        <div
                          className={`h-full transition-all duration-500 rounded-full ${
                            isHigh ? 'bg-rose-500' : isMed ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${scorePct}%` }}
                        />
                      </div>
                      <span className={`font-bold font-mono ${isHigh ? 'text-rose-600' : isMed ? 'text-amber-600' : 'text-emerald-600'}`}>
                        {scorePct}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                        sess.mfaState === 'CHALLENGED'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}
                    >
                      {sess.mfaState === 'CHALLENGED' ? (
                        <>
                          <ShieldAlert className="w-3 h-3" />
                          <span>CHALLENGED</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3 h-3" />
                          <span>PASSED</span>
                        </>
                      )}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => onSelectReplay && onSelectReplay(sess.id)}
                        className="px-2.5 py-1 text-[11px] bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-lg flex items-center space-x-1 transition-colors font-mono cursor-pointer"
                      >
                        <Play className="w-3 h-3" />
                        <span>Replay</span>
                      </button>
                      <button
                        onClick={() => onChallengeMfa && onChallengeMfa(sess.id)}
                        className="px-2.5 py-1 text-[11px] bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg flex items-center space-x-1 transition-colors font-mono cursor-pointer shadow-xs"
                      >
                        <Lock className="w-3 h-3" />
                        <span>MFA Step-Up</span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
