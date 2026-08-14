import React, { useState } from 'react';
import { Eye, Lock, Terminal, Shield, Globe, Sparkles, Crown } from 'lucide-react';
import { useConnectedWebsite } from '@/lib/aegis-website';
import { useSubscription } from '@/lib/useSubscription';

interface HoneypotSandboxViewProps {
  currentRiskScore?: number;
  onRequireUpgrade?: (notice: string) => void;
}

export function HoneypotSandboxView({ currentRiskScore = 0.08, onRequireUpgrade }: HoneypotSandboxViewProps) {
  const { connectedSite, isConnected } = useConnectedWebsite();
  const { isPaidPlan } = useSubscription();
  const [isSandboxActive, setIsSandboxActive] = useState(currentRiskScore >= 0.40);
  const [trappedEvents, setTrappedEvents] = useState<Array<{ time: string; type: string; detail: string; ip: string }>>([]);

  if (!isConnected) {
    return (
      <div className="p-8 rounded-2xl border border-amber-200 bg-amber-50/80 text-center space-y-4 shadow-xs">
        <div className="w-12 h-12 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center mx-auto text-amber-700">
          <Globe className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-base font-bold text-amber-950">No Target Website Connected</h3>
          <p className="text-xs text-amber-800 mt-1 max-w-md mx-auto">
            Please connect your website URL in the <strong className="text-amber-950">"Connect Website"</strong> section to deploy Digital Twin Honeypot Sandbox traps on your target domain.
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
            <h3 className="text-xl font-bold text-zinc-900 tracking-tight">Digital Twin Honeypot Sandbox Locked</h3>
            <p className="text-xs text-zinc-500 font-light leading-relaxed">
              Trap autonomous AI bots and malicious intruders in synthetic isolated memory environments before they touch real infrastructure.
            </p>
          </div>
          <button
            onClick={() => onRequireUpgrade && onRequireUpgrade('Digital Twin Honeypot Sandbox is locked on Starter tier. Upgrade to Pro SecOps for Unlimited Deception Traps!')}
            className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-md flex items-center space-x-2 font-mono cursor-pointer"
          >
            <Crown className="w-4 h-4" />
            <span>Unlock Sandbox with Pro SecOps (₹300/mo) 🚀</span>
          </button>
        </div>
      )}

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-zinc-200/80 gap-3">
        <div>
          <h2 className="text-base font-bold text-zinc-900 tracking-tight">Digital Twin Honeypot Sandbox</h2>
          <p className="text-xs text-zinc-500 font-light mt-0.5">
            Silently traps high-risk sessions & autonomous AI bots in a fake digital twin environment
          </p>
        </div>

        <button
          onClick={() => setIsSandboxActive(!isSandboxActive)}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-semibold flex items-center space-x-1.5 border transition-all cursor-pointer shadow-xs ${
            isSandboxActive
              ? 'bg-zinc-900 text-white border-zinc-900'
              : 'bg-zinc-100 text-zinc-600 border-zinc-200 hover:text-zinc-900'
          }`}
        >
          <Lock className="w-3.5 h-3.5" />
          <span>{isSandboxActive ? 'SANDBOX ACTIVE' : 'ACTIVATE SANDBOX'}</span>
        </button>
      </div>

      {/* Split Screen: Attacker's Fake View vs Admin Deception Control */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Side: What the Attacker / Bot Sees (Fake Digital Twin App) */}
        <div className="border border-zinc-200/80 rounded-2xl p-5 space-y-4 bg-white shadow-xs">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
            <div className="flex items-center space-x-2">
              <div className="w-2.5 h-2.5 rounded-full bg-zinc-300" />
              <div className="w-2.5 h-2.5 rounded-full bg-zinc-300" />
              <div className="w-2.5 h-2.5 rounded-full bg-zinc-300" />
              <span className="text-xs font-mono text-zinc-700 font-semibold ml-2">
                [DIGITAL TWIN] {connectedSite?.domain}/sandbox
              </span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-600 text-[10px] font-mono font-bold border border-zinc-200">
              ISOLATED
            </span>
          </div>

          <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/80 space-y-3 text-xs">
            <div className="font-semibold text-zinc-900 flex justify-between">
              <span>Synthetic Account Balance</span>
              <span className="text-emerald-700 font-mono font-bold">$1,450,000.00</span>
            </div>
            <div className="p-3 rounded-lg bg-white border border-zinc-200 text-[11px] text-zinc-500 space-y-1">
              <div>Recent Synthetic Transactions:</div>
              <div className="text-zinc-800 font-mono">• Wire Transfer #99182 - $50,000.00 (Approved)</div>
              <div className="text-zinc-800 font-mono">• API Export Customer DB - 10,000 records</div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-500 text-center font-mono">
            Attacker actions isolated in synthetic sandbox RAM memory.
          </div>
        </div>

        {/* Right Side: Admin Real-Time Deception Monitor */}
        <div className="border border-zinc-200/80 rounded-2xl p-5 space-y-4 bg-white shadow-xs">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
            <div className="flex items-center space-x-2 text-xs font-bold text-zinc-900">
              <Terminal className="w-4 h-4 text-zinc-400" />
              <span>Trapped Telemetry Log</span>
            </div>
            <span className="text-[11px] text-zinc-400 font-mono">Real-Time Deception Engine</span>
          </div>

          <div className="space-y-2.5 font-mono text-xs max-h-[280px] overflow-y-auto">
            {trappedEvents.map((e, i) => (
              <div key={i} className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/80 space-y-1">
                <div className="flex items-center justify-between text-zinc-900 font-semibold text-[11px]">
                  <span>[{e.time}] {e.type}</span>
                  <span className="text-zinc-400">IP: {e.ip}</span>
                </div>
                <div className="text-zinc-500 text-[11px] font-sans">{e.detail}</div>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 flex items-center justify-between text-xs font-mono">
            <span className="text-zinc-500">Sandbox Isolation Security:</span>
            <span className="text-emerald-700 font-bold">100% CONTAINED</span>
          </div>
        </div>
      </div>
    </div>
  );
}
