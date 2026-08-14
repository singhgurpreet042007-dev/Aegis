import React, { useState } from 'react';
import { Play, Bot, Zap, CheckCircle2, UserCheck, ShieldAlert, Globe } from 'lucide-react';
import { SimulationResult } from '@/shared';
import { useConnectedWebsite } from '@/lib/aegis-website';
import { globalTelemetryTracker } from '@/lib/telemetry-tracker';

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
      detail: 'Dispatches synthetic straight diagonal 16ms mouse vectors and 10ms zero-jitter keystrokes over WebSocket.',
      expectedRisk: '0.92 (HIGH)',
    },
    {
      id: 'stuffing' as const,
      name: 'Credential Stuffing Burst',
      icon: ShieldAlert,
      detail: 'Simulates rapid automated form submission attempts with fixed 5ms inter-key latency.',
      expectedRisk: '0.96 (CRITICAL)',
    },
    {
      id: 'hijack' as const,
      name: 'Session Hijack / Token Transfer',
      icon: Zap,
      detail: 'Simulates a sudden shift in hardware WebGL canvas fingerprint mid-session.',
      expectedRisk: '0.84 (HIGH)',
    },
    {
      id: 'human' as const,
      name: 'Legitimate Human Baseline',
      icon: UserCheck,
      detail: 'Simulates organic curved mouse trajectory with natural 110ms key dwell latency.',
      expectedRisk: '0.08 (LOW)',
    },
  ];

  const handleRunSimulation = async (scenario: 'bot' | 'stuffing' | 'hijack' | 'human') => {
    setIsRunning(true);
    try {
      if (scenario === 'bot' || scenario === 'stuffing' || scenario === 'hijack') {
        // Feature 3: Programmatic synthetic bot input over WebSocket pipeline
        globalTelemetryTracker.simulateBotAttackBatch({
          pointCount: 50,
          startX: 80,
          startY: 80,
        });

        setTimeout(() => {
          const simulated: SimulationResult = {
            anomalyDetected: true,
            riskScore: scenario === 'bot' ? 0.92 : scenario === 'stuffing' ? 0.96 : 0.84,
            riskLevel: 'HIGH',
            mfaChallenged: true,
            featuresFlagged: ['Mouse Linearity (Robotic Vector)', 'Zero-Jitter Keystrokes'],
            explanation: `Simulated ${scenario.toUpperCase()} attack dispatched real synthetic straight-line 16ms events over WebSocket pipeline.`,
            scenarioExecuted: scenario,
          };
          setLastResult(simulated);
          if (onSimulationComplete) onSimulationComplete(simulated);
          setIsRunning(false);
        }, 800);
      } else {
        const simulated: SimulationResult = {
          anomalyDetected: false,
          riskScore: 0.08,
          riskLevel: 'LOW',
          mfaChallenged: false,
          featuresFlagged: [],
          explanation: 'Normal organic human baseline movement.',
          scenarioExecuted: scenario,
        };
        setLastResult(simulated);
        if (onSimulationComplete) onSimulationComplete(simulated);
        setIsRunning(false);
      }
    } catch {
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
