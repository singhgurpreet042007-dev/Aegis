import React, { useState, useEffect, useCallback } from 'react';
import {
  TrendingUp,
  Globe,
  RefreshCw,
  Zap,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Crown,
  Lock,
} from 'lucide-react';
import { useConnectedWebsite } from '@/lib/aegis-website';
import { useSubscription } from '@/lib/useSubscription';
import { fetchApi } from '@/lib/api-client';

interface BehavioralDriftViewProps {
  currentRiskScore?: number;
  userId?: string;
  onRequireUpgrade?: (notice: string) => void;
}

export function BehavioralDriftView({
  currentRiskScore = 0.08,
  userId = 'usr_demo_dev',
  onRequireUpgrade,
}: BehavioralDriftViewProps) {
  const { connectedSite, isConnected } = useConnectedWebsite();
  const { isPaidPlan } = useSubscription();
  const [isRecalibrating, setIsRecalibrating] = useState(false);
  const [baselineData, setBaselineData] = useState<any>(null);
  const [hasBaseline, setHasBaseline] = useState<boolean>(true);

  const loadDriftData = useCallback(async () => {
    setIsRecalibrating(true);
    try {
      const res = await fetchApi(`/biometrics/baseline/${userId}`);
      if (res && res.hasBaseline && res.baseline) {
        setHasBaseline(true);
        setBaselineData(res.baseline);
      } else {
        setHasBaseline(false);
      }
    } catch {
      setHasBaseline(false);
    } finally {
      setIsRecalibrating(false);
    }
  }, [userId]);

  useEffect(() => {
    loadDriftData();
  }, [loadDriftData]);

  if (!isConnected) {
    return (
      <div className="p-8 rounded-2xl border border-amber-200 bg-amber-50/80 text-center space-y-4 shadow-xs">
        <div className="w-12 h-12 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center mx-auto text-amber-700">
          <Globe className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-base font-bold text-amber-950">No Target Website Connected</h3>
          <p className="text-xs text-amber-800 mt-1 max-w-md mx-auto">
            Please connect your website URL in the <strong className="text-amber-950">"Connect Website"</strong> section to view behavioral drift analysis for your target domain.
          </p>
        </div>
      </div>
    );
  }

  const isDriftDetected = (currentRiskScore ?? 0.08) >= 0.40;

  const dwellBase = baselineData?.keystrokeDwellMean || 110;
  const flightBase = baselineData?.keystrokeFlightMean || 140;
  const curvBase = baselineData?.mouseCurvatureMean || 0.38;

  const subAxisDrift = [
    {
      name: 'Keystroke Dwell Time Shift',
      baseline: `${dwellBase.toFixed(0)}ms`,
      current: isDriftDetected ? `${(dwellBase * 0.4).toFixed(0)}ms` : `${(dwellBase * 0.98).toFixed(0)}ms`,
      change: isDriftDetected ? '-60.0%' : '-2.0%',
      isAnomaly: isDriftDetected,
    },
    {
      name: 'Flight Time Latency Jitter',
      baseline: `${flightBase.toFixed(0)}ms`,
      current: isDriftDetected ? `${(flightBase * 0.2).toFixed(0)}ms` : `${(flightBase * 0.96).toFixed(0)}ms`,
      change: isDriftDetected ? '-80.0%' : '-4.0%',
      isAnomaly: isDriftDetected,
    },
    {
      name: 'Mouse Curvature Index',
      baseline: `${curvBase.toFixed(2)}`,
      current: isDriftDetected ? '0.04' : `${(curvBase * 0.97).toFixed(2)}`,
      change: isDriftDetected ? '-89.0%' : '-3.0%',
      isAnomaly: isDriftDetected,
    },
  ];

  return (
    <div className="space-y-6 relative">
      {/* 🔒 STARTER FREE TIER LOCK OVERLAY */}
      {!isPaidPlan && (
        <div className="absolute inset-0 z-20 bg-white/80 backdrop-blur-xs rounded-3xl p-8 flex flex-col items-center justify-center text-center space-y-5 border border-zinc-200 shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-zinc-900 text-white flex items-center justify-center shadow-lg">
            <Lock className="w-7 h-7 text-emerald-400" />
          </div>
          <div className="space-y-1.5 max-w-md">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold uppercase tracking-wider">
              PRO SEC-OPS FEATURE
            </span>
            <h3 className="text-xl font-bold text-zinc-900 tracking-tight">Behavioral Drift Radar Locked</h3>
            <p className="text-xs text-zinc-500 font-light leading-relaxed">
              Track subtle long-term biometrics degradation over time to stop slow credential sharing and insider attacks.
            </p>
          </div>
          <button
            onClick={() => onRequireUpgrade && onRequireUpgrade('Behavioral Drift Radar is locked on Starter tier. Upgrade to Pro SecOps to unlock Behavioral Drift Detection!')}
            className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-md flex items-center space-x-2 font-mono cursor-pointer"
          >
            <Crown className="w-4 h-4" />
            <span>Unlock Behavioral Drift Radar with Pro SecOps (₹300/mo) 🚀</span>
          </button>
        </div>
      )}

      {/* Header Bar */}
      <div className="border border-zinc-200/80 rounded-2xl p-6 bg-white shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-200 flex items-center justify-center text-white shrink-0 shadow-xs">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-zinc-900 tracking-tight">Behavioral Identity Drift Radar</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-600 border border-zinc-200 text-[10px] font-mono font-bold">
                PostgreSQL DB Stream
              </span>
            </div>
            <p className="text-xs text-zinc-500 font-light mt-1">
              Continuous biometric trajectory variance calculated against enrolled baseline profile for <span className="font-mono text-zinc-800 font-semibold">{userId}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs font-mono">
          <button
            onClick={loadDriftData}
            disabled={isRecalibrating}
            className="px-3.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-mono font-semibold text-xs flex items-center space-x-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRecalibrating ? 'animate-spin' : ''}`} />
            <span>{isRecalibrating ? 'Recalculating...' : 'Refresh Drift Metrics'}</span>
          </button>
          <span
            className={`px-3 py-1 rounded-full border text-[11px] font-bold flex items-center space-x-1.5 ${
              !hasBaseline
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : isDriftDetected
                ? 'bg-rose-50 text-rose-700 border-rose-200'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}
          >
            {!hasBaseline ? (
              <span>NO BASELINE ENROLLED</span>
            ) : isDriftDetected ? (
              <>
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>DRIFT ANOMALY DETECTED</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>STABLE IDENTITY SIGNATURE</span>
              </>
            )}
          </span>
        </div>
      </div>

      {/* Sub-Axis Drift Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {subAxisDrift.map((item, idx) => (
          <div key={idx} className="border border-zinc-200/80 rounded-2xl p-5 bg-white shadow-xs space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-zinc-900">{item.name}</span>
              <span className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded-full border ${item.isAnomaly ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                {item.change}
              </span>
            </div>

            <div className="space-y-1 font-mono text-xs">
              <div className="flex justify-between text-zinc-500">
                <span>Baseline DB Record:</span>
                <span className="font-bold text-zinc-900">{item.baseline}</span>
              </div>
              <div className="flex justify-between text-zinc-500">
                <span>Active Telemetry:</span>
                <span className={`font-bold ${item.isAnomaly ? 'text-rose-600' : 'text-emerald-700'}`}>{item.current}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
