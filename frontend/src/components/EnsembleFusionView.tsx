import React from 'react';
import { Cpu, MousePointer, Keyboard, Monitor, Scroll, Layers, Globe } from 'lucide-react';
import { useConnectedWebsite } from '@/lib/aegis-website';

interface EnsembleFusionViewProps {
  currentRiskScore?: number;
}

export function EnsembleFusionView({ currentRiskScore = 0.08 }: EnsembleFusionViewProps) {
  const { connectedSite, isConnected } = useConnectedWebsite();
  const isHighRisk = currentRiskScore >= 0.40;

  if (!isConnected) {
    return (
      <div className="p-8 rounded-2xl border border-amber-200 bg-amber-50/80 text-center space-y-4 shadow-xs">
        <div className="w-12 h-12 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center mx-auto text-amber-700">
          <Globe className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-base font-bold text-amber-950">No Target Website Connected</h3>
          <p className="text-xs text-amber-800 mt-1 max-w-md mx-auto">
            Please connect your website URL in the <strong className="text-amber-950">"Connect Website"</strong> section to enable multi-modal ensemble risk model fusion.
          </p>
        </div>
      </div>
    );
  }

  const models = [
    {
      name: 'Mouse Trajectory Vector Model',
      icon: MousePointer,
      weight: '35%',
      score: isHighRisk ? 0.92 : 0.08,
      status: isHighRisk ? 'CRITICAL_ANOMALY' : 'NOMINAL',
      detail: 'IsolationForest on cursor acceleration, curvature angle & jerk vectors.',
    },
    {
      name: 'Keystroke Cadence Model',
      icon: Keyboard,
      weight: '25%',
      score: isHighRisk ? 0.88 : 0.06,
      status: isHighRisk ? 'HIGH_ANOMALY' : 'NOMINAL',
      detail: 'Gaussian Mixture Model on key dwell times & flight latency jitter.',
    },
    {
      name: 'Canvas Hardware Fingerprint Model',
      icon: Monitor,
      weight: '20%',
      score: 0.02,
      status: 'NOMINAL',
      detail: 'WebGL / Canvas 2D render hash consistency check.',
    },
    {
      name: 'Scroll Dynamic Model',
      icon: Scroll,
      weight: '20%',
      score: isHighRisk ? 0.74 : 0.05,
      status: isHighRisk ? 'ELEVATED_ANOMALY' : 'NOMINAL',
      detail: 'Scroll acceleration entropy & wheel event delta sampling.',
    },
  ];

  const trustScore = Math.max(0, Math.round(100 - currentRiskScore * 100));
  const getNistState = (score: number) => {
    if (score >= 80) return { name: 'TRUSTED', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    if (score >= 60) return { name: 'WATCH', color: 'bg-zinc-100 text-zinc-700 border-zinc-200' };
    if (score >= 35) return { name: 'ELEVATED', color: 'bg-amber-50 text-amber-700 border-amber-200' };
    return { name: 'CRITICAL', color: 'bg-rose-50 text-rose-700 border-rose-200' };
  };

  const nist = getNistState(trustScore);

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-zinc-200/80 gap-3">
        <div>
          <h2 className="text-base font-bold text-zinc-900 tracking-tight">Multi-Modal Ensemble Fusion Engine</h2>
          <p className="text-xs text-zinc-500 font-light mt-0.5">
            Aggregates 4 independent biometrics micro-models into a unified Meta-Learner output
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-right font-mono">
            <div className="text-[10px] text-zinc-400 font-bold tracking-wider uppercase">TRUST SCORE</div>
            <div className="text-sm font-bold text-zinc-900">{trustScore} / 100</div>
          </div>
          <span className={`text-xs font-mono font-bold px-3 py-1 rounded-full border ${nist.color}`}>
            ● {nist.name}
          </span>
        </div>
      </div>

      {/* Grid of 4 Micro-Models */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {models.map((m, i) => {
          const Icon = m.icon;
          const isBad = m.score >= 0.40;
          return (
            <div key={i} className="p-5 rounded-2xl border border-zinc-200/80 bg-white shadow-xs space-y-3 hover:border-zinc-300 transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-zinc-900 flex items-center justify-center text-white shrink-0 shadow-xs">
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-zinc-900">{m.name}</h3>
                    <span className="text-[11px] text-zinc-400 font-mono">Weight: {m.weight}</span>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                    isBad ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}
                >
                  ● {m.status}
                </span>
              </div>

              <p className="text-xs text-zinc-500 font-light leading-relaxed">{m.detail}</p>

              <div className="space-y-1.5 font-mono text-xs pt-1">
                <div className="flex justify-between text-zinc-500">
                  <span>Micro-Model Anomaly Score:</span>
                  <span className={`font-bold ${isBad ? 'text-rose-600' : 'text-emerald-700'}`}>
                    {(m.score * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="w-full bg-zinc-100 rounded-full h-1.5 overflow-hidden border border-zinc-200">
                  <div
                    className={`h-full transition-all duration-500 rounded-full ${isBad ? 'bg-rose-500' : 'bg-zinc-900'}`}
                    style={{ width: `${m.score * 100}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Meta Learner Aggregator Banner */}
      <div className="p-5 rounded-2xl border border-zinc-200/80 bg-white shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-mono text-xs">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-zinc-900 flex items-center justify-center text-white shrink-0 shadow-xs">
            <Layers className="w-4.5 h-4.5 text-white" />
          </div>
          <div>
            <div className="font-bold text-zinc-900 text-sm font-sans">Meta-Learner Decision Matrix</div>
            <div className="text-zinc-500 text-[11px] mt-0.5">Weighted: (0.35 × Mouse) + (0.25 × Key) + (0.20 × Canvas) + (0.20 × Scroll)</div>
          </div>
        </div>

        <div className="sm:text-right">
          <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">AGGREGATED SCORE</div>
          <div className={`text-sm font-bold ${isHighRisk ? 'text-rose-600' : 'text-emerald-700'}`}>
            {(currentRiskScore * 100).toFixed(0)}% ANOMALY RISK
          </div>
        </div>
      </div>
    </div>
  );
}
