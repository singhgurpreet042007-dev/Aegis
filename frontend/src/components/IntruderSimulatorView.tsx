import React, { useState } from 'react';
import { Play, Bot, Zap, CheckCircle2, UserCheck, ShieldAlert, Globe } from 'lucide-react';
import { SimulationResult, SimulatorScenario } from '@/shared';
import { useConnectedWebsite } from '@/lib/aegis-website';
import { globalTelemetryTracker, TelemetryTracker } from '@/lib/telemetry-tracker';
import { intruderApi } from '@/lib/api-client';

interface IntruderSimulatorViewProps {
  onSimulationComplete?: (result: SimulationResult) => void;
  sessionId?: string;
  userId?: string;
}

export function IntruderSimulatorView({ onSimulationComplete, sessionId, userId }: IntruderSimulatorViewProps) {
  const { connectedSite, isConnected } = useConnectedWebsite();
  const [activeTab, setActiveTab] = useState<'bot' | 'stuffing' | 'hijack' | 'human'>('bot');
  const [isRunning, setIsRunning] = useState(false);
  const [lastResult, setLastResult] = useState<SimulationResult | null>(null);

  if (!isConnected) {
    return (
      <div className="p-8 rounded-2xl border border-amber-200 bg-amber-50/80 text-center space-y-4 shadow-xs">
        <div className="w-12 h-12 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center mx-auto text-amber-700">
          <Globe className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-base font-bold text-amber-950">No Target Website Connected</h3>
          <p className="text-xs text-amber-800 mt-1 max-w-md mx-auto">
            Please connect your website URL in the <strong className="text-amber-950">"Connect Website"</strong> section to simulate attack vectors against your target domain.
          </p>
        </div>
      </div>
    );
  }

  const scenarios = [
    {
      id: 'bot' as const,
      name: 'Automated Bot Attack',
      icon: Bot,
      detail: 'Dispatches synthetic straight diagonal 16ms mouse vectors and 10ms zero-jitter keystrokes over WebSocket & HTTP.',
      expectedRisk: '0.85 - 0.95 (CRITICAL)',
    },
    {
      id: 'stuffing' as const,
      name: 'Credential Stuffing Burst',
      icon: ShieldAlert,
      detail: 'Simulates rapid automated form submission attempts with fixed 5ms inter-key latency and robotic straight movement.',
      expectedRisk: '0.88 - 0.98 (CRITICAL)',
    },
    {
      id: 'hijack' as const,
      name: 'Session Hijack / Account Takeover',
      icon: Zap,
      detail: 'Simulates a sudden shift in typing velocity and abnormal cadence mid-session from an untrusted device.',
      expectedRisk: '0.75 - 0.85 (HIGH)',
    },
    {
      id: 'human' as const,
      name: 'Legitimate Human Baseline',
      icon: UserCheck,
      detail: 'Simulates organic curved mouse trajectory with natural 110ms key dwell latency and standard variance.',
      expectedRisk: '0.04 - 0.12 (LOW)',
    },
  ];

  const handleRunSimulation = async (scenario: 'bot' | 'stuffing' | 'hijack' | 'human') => {
    setIsRunning(true);
    const targetSessionId = sessionId || 'sess_demo_default';
    const targetUserId = userId || 'usr_demo_default';

    const scenarioMap: Record<'bot' | 'stuffing' | 'hijack' | 'human', SimulatorScenario> = {
      bot: SimulatorScenario.BOT_ATTACK,
      stuffing: SimulatorScenario.CREDENTIAL_STUFFING,
      hijack: SimulatorScenario.SESSION_HIJACK,
      human: SimulatorScenario.NORMAL_USER,
    };

    const chosenScenario = scenarioMap[scenario];

    try {
      // 1. Dispatch authentic synthetic telemetry batch into telemetry tracker
      const generatedBatch = globalTelemetryTracker.simulateAttack(chosenScenario);
      const computedFeatures = TelemetryTracker.extractFeatures(
        generatedBatch.keystrokes,
        generatedBatch.mousePoints
      );

      // 2. Query NestJS Backend Intruder endpoint for real AI risk engine evaluation
      const backendRes: any = await intruderApi.simulate(targetSessionId, targetUserId, chosenScenario);

      let result: SimulationResult;

      if (backendRes && !backendRes.error && (backendRes.riskScore !== undefined || backendRes.overallRiskScore !== undefined)) {
        const score = backendRes.riskScore ?? backendRes.overallRiskScore;
        result = {
          anomalyDetected: backendRes.anomalyDetected ?? score >= 0.5,
          riskScore: score,
          riskLevel: backendRes.riskLevel || (score >= 0.85 ? 'CRITICAL' : score >= 0.6 ? 'HIGH' : 'LOW'),
          mfaChallenged: backendRes.mfaChallenged ?? backendRes.adaptiveMfaRequired ?? (score >= 0.6),
          featuresFlagged: backendRes.featuresFlagged || (backendRes.explainableFactors?.map((f: any) => f.feature || f.featureName) ?? []),
          explanation: backendRes.explanation || `Executed ${chosenScenario} simulation via backend IsolationForest + weighted rule engine.`,
          scenarioExecuted: scenario,
        };
      } else {
        // Fallback: Client-side local multi-factor evaluation using genuine extracted features
        const localEval = TelemetryTracker.evaluateLocalRisk(
          computedFeatures,
          undefined,
          scenario === 'human'
        );

        result = {
          anomalyDetected: localEval.riskLevel !== 'LOW',
          riskScore: localEval.overallRiskScore,
          riskLevel: localEval.riskLevel,
          mfaChallenged: localEval.adaptiveMfaRequired,
          featuresFlagged: localEval.explainableFactors.map((f: any) => f.feature),
          explanation: `Locally evaluated ${scenario} telemetry: Risk score ${localEval.overallRiskScore.toFixed(2)} (${localEval.riskLevel}).`,
          scenarioExecuted: scenario,
        };
      }

      setLastResult(result);
      if (onSimulationComplete) onSimulationComplete(result);
    } catch (err: any) {
      console.warn('[Simulation] Error executing simulation:', err);
      // Local fallback on error
      const generatedBatch = globalTelemetryTracker.simulateAttack(chosenScenario);
      const computedFeatures = TelemetryTracker.extractFeatures(
        generatedBatch.keystrokes,
        generatedBatch.mousePoints
      );
      const localEval = TelemetryTracker.evaluateLocalRisk(computedFeatures, undefined, scenario === 'human');
      const fallbackResult: SimulationResult = {
        anomalyDetected: localEval.riskLevel !== 'LOW',
        riskScore: localEval.overallRiskScore,
        riskLevel: localEval.riskLevel,
        mfaChallenged: localEval.adaptiveMfaRequired,
        featuresFlagged: localEval.explainableFactors.map((f: any) => f.feature),
        explanation: `Locally evaluated ${scenario} telemetry: Risk score ${localEval.overallRiskScore.toFixed(2)} (${localEval.riskLevel}).`,
        scenarioExecuted: scenario,
      };
      setLastResult(fallbackResult);
      if (onSimulationComplete) onSimulationComplete(fallbackResult);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-zinc-200/80 gap-3">
        <div>
          <h2 className="text-base font-bold text-zinc-900 tracking-tight">Intruder & Red Team Threat Simulator</h2>
          <p className="text-xs text-zinc-500 font-light mt-0.5">
            Programmatically dispatch synthetic bot vectors over WebSocket to test real Z-score & IsolationForest scoring
          </p>
        </div>

        {lastResult && (
          <div className="flex items-center space-x-2">
            <span
              className={`px-3 py-1 rounded-full border text-[11px] font-mono font-bold flex items-center space-x-1.5 ${
                lastResult.anomalyDetected
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>
                {(lastResult.scenarioExecuted || 'SIMULATION').toUpperCase()}: {((lastResult.riskScore || 0) * 100).toFixed(0)}% RISK
              </span>
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {scenarios.map((sc) => {
          const Icon = sc.icon;
          return (
            <div key={sc.id} className="p-5 rounded-2xl border border-zinc-200/80 bg-white shadow-xs space-y-3 hover:border-zinc-300 transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-zinc-900 flex items-center justify-center text-white shrink-0 shadow-xs">
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-zinc-900">{sc.name}</h3>
                    <span className="text-[11px] text-zinc-400 font-mono">Expected: {sc.expectedRisk}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setActiveTab(sc.id);
                    handleRunSimulation(sc.id);
                  }}
                  disabled={isRunning}
                  className="px-3.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-xs font-mono font-semibold text-white flex items-center space-x-1.5 transition-all cursor-pointer shadow-xs"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>{isRunning && activeTab === sc.id ? 'Simulating...' : 'Launch Simulation'}</span>
                </button>
              </div>

              <p className="text-xs text-zinc-500 font-light leading-relaxed">{sc.detail}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
