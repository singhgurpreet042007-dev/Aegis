'use client';

import React, { useState, useEffect } from 'react';
import { Activity, Clock, ShieldCheck } from 'lucide-react';
import { fetchApi } from '@/lib/api-client';

interface TimelineEvent {
  id: string;
  timestamp: string;
  type: 'TELEMETRY' | 'RISK_CHANGE' | 'ALERT' | 'VERIFICATION' | 'DECAY';
  title: string;
  description: string;
  riskScore?: number;
  badgeColor: string;
}

export function SessionTimeline({ sessionId = 'sess_live' }: { sessionId?: string }) {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTimelineFromDb = async () => {
      setLoading(true);
      try {
        const session = await fetchApi(`/biometrics/session/${sessionId}`);
        if (session && session.riskAssessments && session.riskAssessments.length > 0) {
          const mapped: TimelineEvent[] = session.riskAssessments.map((a: any, i: number) => {
            const isHigh = a.overallRiskScore >= 0.7;
            const isMed = a.overallRiskScore >= 0.4;
            return {
              id: a.id || `evt_${i}`,
              timestamp: a.timestamp ? new Date(a.timestamp).toLocaleTimeString() : `${i + 1}m ago`,
              type: isHigh ? 'ALERT' : isMed ? 'RISK_CHANGE' : 'TELEMETRY',
              title: `Risk Assessment Score: ${Math.round(a.overallRiskScore * 100)}%`,
              description: `Risk Level: ${a.riskLevel || 'LOW'}. Anomaly Score: ${(a.anomalyScore || 0).toFixed(2)}. factors: ${a.explainableFactors || 'Telemetry stream evaluated'}`,
              riskScore: a.overallRiskScore,
              badgeColor: isHigh
                ? 'bg-rose-50 text-rose-700 border-rose-200'
                : isMed
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200',
            };
          });
          setEvents(mapped);
          return;
        }
      } catch {
        // Ignored
      } finally {
        setLoading(false);
      }

      setEvents([]);
    };

    fetchTimelineFromDb();
  }, [sessionId]);

  return (
    <div className="p-6 rounded-2xl bg-white border border-zinc-200/80 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b border-zinc-100">
        <div>
          <h3 className="text-base font-bold text-zinc-900 flex items-center space-x-2">
            <Activity className="w-4.5 h-4.5 text-zinc-400" />
            <span>Session Risk Timeline & Chain of Evidence</span>
          </h3>
          <p className="text-xs text-zinc-500 font-light mt-0.5">
            Chronological PostgreSQL DB audit log tracking telemetry ingestion, risk score changes, and security alerts.
          </p>
        </div>
        <span className="px-3 py-1 rounded-full bg-zinc-100 border border-zinc-200 text-[11px] font-mono font-bold text-zinc-600">
          Trace ID: {sessionId}
        </span>
      </div>

      {loading ? (
        <div className="py-8 text-center text-xs font-mono text-zinc-400">
          Loading PostgreSQL session timeline events...
        </div>
      ) : events.length === 0 ? (
        <div className="py-8 text-center space-y-2 bg-zinc-50 border border-zinc-200 rounded-xl">
          <ShieldCheck className="w-8 h-8 text-zinc-400 mx-auto" />
          <h4 className="text-xs font-bold text-zinc-900 font-mono">No Timeline Events in Database</h4>
          <p className="text-xs text-zinc-500 font-light max-w-sm mx-auto">
            Interact with the page or trigger calibration to log live telemetry audit events into PostgreSQL database.
          </p>
        </div>
      ) : (
        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-zinc-200">
          {events.map((evt) => (
            <div key={evt.id} className="relative flex items-start space-x-4 group">
              <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-white border-2 border-zinc-900 flex items-center justify-center text-xs shadow-xs">
                <div className="w-1.5 h-1.5 rounded-full bg-zinc-900" />
              </div>

              <div className="flex-1 p-4 rounded-xl bg-zinc-50 border border-zinc-200/80 hover:border-zinc-300 transition-all space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono border font-bold uppercase ${evt.badgeColor}`}>
                      {evt.type}
                    </span>
                    <span className="text-xs font-bold text-zinc-900">{evt.title}</span>
                  </div>
                  <span className="text-[11px] font-mono text-zinc-400 flex items-center space-x-1">
                    <Clock className="w-3 h-3 text-zinc-400" />
                    <span>{evt.timestamp}</span>
                  </span>
                </div>

                <p className="text-xs text-zinc-500 font-light leading-relaxed">{evt.description}</p>

                {evt.riskScore !== undefined && (
                  <div className="pt-2 flex items-center space-x-2 text-[11px] font-mono border-t border-zinc-200/60">
                    <span className="text-zinc-400">Risk Score Impact:</span>
                    <span
                      className={`font-bold ${
                        evt.riskScore >= 0.75 ? 'text-rose-600' : evt.riskScore >= 0.40 ? 'text-amber-600' : 'text-emerald-600'
                      }`}
                    >
                      {(evt.riskScore * 100).toFixed(0)}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
