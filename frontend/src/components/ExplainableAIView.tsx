import React, { useState, useEffect } from 'react';
import { BrainCircuit, AlertTriangle, CheckCircle2, Globe, Lock, Crown, Activity } from 'lucide-react';
import { ExplainableFactor } from '@/shared';
import { useConnectedWebsite } from '@/lib/aegis-website';
import { useSubscription } from '@/lib/useSubscription';
import { fetchApi } from '@/lib/api-client';

interface ExplainableAIViewProps {
  factors?: ExplainableFactor[];
  overallRiskScore?: number;
  riskLevel?: string;
  sessionId?: string;
  onRequireUpgrade?: (notice: string) => void;
}

export function ExplainableAIView({
  factors,
  overallRiskScore = 0.08,
  riskLevel = 'LOW',
  sessionId = 'sess_live_active',
  onRequireUpgrade,
}: ExplainableAIViewProps) {
  const { connectedSite, isConnected } = useConnectedWebsite();
  const { isPaidPlan } = useSubscription();
  const [userName, setUserName] = useState('Security Officer');
  const [dbFactors, setDbFactors] = useState<ExplainableFactor[]>(factors || []);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('aegis_user');
      if (stored) {
        try {
          const u = JSON.parse(stored);
          if (u.fullName) setUserName(u.fullName);
        } catch (_) {}
      }
    }
  }, []);

  useEffect(() => {
    if (factors && factors.length > 0) {
      setDbFactors(factors);
      return;
    }

    const fetchFactorsFromDb = async () => {
      setLoading(true);
      try {
        const data = await fetchApi(`/biometrics/session/${sessionId}`);
        if (data && data.riskAssessments && data.riskAssessments.length > 0) {
          const latest = data.riskAssessments[0];
          if (latest.explainableFactors) {
            try {
              const parsed = JSON.parse(latest.explainableFactors);
              if (Array.isArray(parsed)) {
                setDbFactors(parsed);
              }
            } catch (_) {}
          }
        }
      } catch {
        // Ignored
      } finally {
        setLoading(false);
      }
    };

    fetchFactorsFromDb();
  }, [factors, sessionId]);

  if (!isConnected) {
    return (
      <div className="p-8 rounded-2xl border border-amber-200 bg-amber-50/80 text-center space-y-4 shadow-xs">
        <div className="w-12 h-12 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center mx-auto text-amber-700">
          <Globe className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-base font-bold text-amber-950">No Target Website Connected</h3>
          <p className="text-xs text-amber-800 mt-1 max-w-md mx-auto">
            Please connect your website URL in the <strong className="text-amber-950">"Connect Website"</strong> section to generate explainable AI threat attributions for your target domain.
          </p>
        </div>
      </div>
    );
  }

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
            <h3 className="text-xl font-bold text-zinc-900 tracking-tight">SHAP Explainable AI Audit Locked</h3>
            <p className="text-xs text-zinc-500 font-light leading-relaxed">
              Unlock deep mathematical SHAP feature attribution reports explaining exact biometrics anomalies down to millisecond precision.
            </p>
          </div>
          <button
            onClick={() => onRequireUpgrade && onRequireUpgrade('SHAP Explainable AI is locked on Starter tier. Upgrade to Pro SecOps to unlock Explainable AI Risk Attribution Reports!')}
            className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-md flex items-center space-x-2 font-mono cursor-pointer"
          >
            <Crown className="w-4 h-4" />
            <span>Unlock Explainable AI with Pro SecOps (₹300/mo) 🚀</span>
          </button>
        </div>
      )}

      <div className="border border-zinc-200/80 rounded-2xl p-6 bg-white shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-200 flex items-center justify-center text-white shrink-0 shadow-xs">
            <BrainCircuit className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-zinc-900 tracking-tight">Explainable AI & SHAP Risk Attribution</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-600 border border-zinc-200 text-[10px] font-mono font-bold">
                SHAP Feature Attribution
              </span>
            </div>
            <p className="text-xs text-zinc-500 font-light mt-1">
              Real-time ML feature importance analysis for user: <span className="font-mono text-zinc-800 font-semibold">{userName}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs font-mono">
          <span
            className={`px-3 py-1 rounded-full border text-[11px] font-bold flex items-center space-x-1.5 ${
              overallRiskScore > 0.7
                ? 'bg-rose-50 text-rose-700 border-rose-200'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}
          >
            {overallRiskScore > 0.7 ? <AlertTriangle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
            <span>RISK STATE: {riskLevel} ({(overallRiskScore * 100).toFixed(0)}%)</span>
          </span>
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs font-mono text-zinc-500 bg-white border border-zinc-200 rounded-2xl">
          Fetching SHAP feature attribution from PostgreSQL database...
        </div>
      ) : dbFactors.length === 0 ? (
        <div className="p-8 text-center space-y-2 bg-zinc-50 border border-zinc-200 rounded-2xl">
          <Activity className="w-8 h-8 text-zinc-400 mx-auto" />
          <h4 className="text-xs font-bold text-zinc-900 font-mono">No Active Risk Assessment Factors</h4>
          <p className="text-xs text-zinc-500 font-light max-w-sm mx-auto">
            Interact with the page or launch a simulation to generate live SHAP explainability factors.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {dbFactors.map((f, i) => (
            <div key={i} className="border border-zinc-200/80 rounded-2xl p-5 bg-white shadow-xs space-y-3 hover:border-zinc-300 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-900">{f.feature}</span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                    f.impact.includes('ANOMALY') || f.impact === 'UNRECOGNIZED'
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}
                >
                  {f.impact}
                </span>
              </div>
              <p className="text-xs text-zinc-500 font-light leading-relaxed">{f.description}</p>
              <div className="space-y-1.5 font-mono text-xs pt-1">
                <div className="flex justify-between text-zinc-500">
                  <span>SHAP Feature Weight:</span>
                  <span className="font-bold text-zinc-900">{(f.score * 100).toFixed(0)}%</span>
                </div>
                <div className="w-full bg-zinc-100 rounded-full h-1.5 overflow-hidden border border-zinc-200">
                  <div
                    className="bg-zinc-900 h-full transition-all duration-500 rounded-full"
                    style={{ width: `${Math.min(100, f.score * 200)}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
