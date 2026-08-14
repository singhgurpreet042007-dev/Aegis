'use client';

import React from 'react';
import { ShieldAlert, HelpCircle, X, CheckCircle2, ArrowRight, BrainCircuit } from 'lucide-react';

interface WhyBlockedModalProps {
  isOpen: boolean;
  onClose: () => void;
  riskScore: number;
  factors?: Array<{ feature: string; impact: string; score: number; description: string }>;
}

export function WhyBlockedModal({ isOpen, onClose, riskScore, factors }: WhyBlockedModalProps) {
  if (!isOpen) return null;

  const defaultFactors = factors && factors.length > 0 ? factors : [
    {
      feature: 'Cursor Trajectory Curve Angle',
      impact: 'CRITICAL',
      score: 0.45,
      description: 'Your mouse moved in perfectly straight 180° geometric lines, which matches automated bot scripts rather than natural human arm curvature.',
    },
    {
      feature: 'Keystroke Flight Latency',
      impact: 'HIGH',
      score: 0.32,
      description: 'The time gap between your key presses was less than 5 milliseconds with zero human variance, indicating automated form fill software.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200 font-sans">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 rounded-3xl border border-zinc-200 shadow-2xl relative space-y-5 bg-white text-zinc-900">
        <button onClick={onClose} className="absolute top-4 right-4 p-1.5 text-zinc-400 hover:text-zinc-900 rounded-xl hover:bg-zinc-100 transition-colors">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-zinc-900">Why Was My Session Challenged?</h3>
            <p className="text-xs text-zinc-500 font-light">Self-Serve Explainable Security Insights (SHAP Engine)</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80 text-xs text-zinc-700 space-y-2">
          <div className="font-bold text-zinc-900 flex items-center justify-between">
            <span>Security Assessment Overview</span>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 font-mono font-bold border border-amber-200 text-[10px]">
              Risk Level: {(riskScore * 100).toFixed(0)}%
            </span>
          </div>
          <p className="text-zinc-500 font-light leading-relaxed">
            AEGIS detected behavioral patterns that deviate from your normal human identity profile. To ensure your account isn't compromised by a bot or session hijack, here is a transparent breakdown of what triggered the challenge:
          </p>
        </div>

        {/* Feature Attributions in Plain Human Language */}
        <div className="space-y-3">
          <div className="text-xs font-bold text-zinc-900 flex items-center space-x-2">
            <BrainCircuit className="w-4 h-4 text-zinc-500" />
            <span>Plain-Language Behavioral Findings</span>
          </div>

          {defaultFactors.map((f, i) => (
            <div key={i} className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/80 space-y-1 text-xs">
              <div className="flex items-center justify-between font-mono">
                <span className="font-bold text-zinc-900 font-sans">{f.feature}</span>
                <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                  {f.impact} ANOMALY
                </span>
              </div>
              <p className="text-zinc-500 font-light text-[11px] leading-relaxed pt-1">
                {f.description}
              </p>
            </div>
          ))}
        </div>

        <div className="pt-3 border-t border-zinc-100 flex items-center justify-between text-xs">
          <span className="text-zinc-400 font-light">Need help? Contact Aegis Security Ops</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-xs rounded-xl flex items-center space-x-1.5 transition-all cursor-pointer shadow-xs font-mono"
          >
            <span>I Understand</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
