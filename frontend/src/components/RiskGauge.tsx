'use client';

import React from 'react';
import { AlertCircle, Activity } from 'lucide-react';

interface RiskGaugeProps {
  score?: number | null; // 0.0 to 1.0, or null if uncalibrated
  riskLevel?: string;
  hasBaseline?: boolean;
  onOpenCalibration?: () => void;
}

export function RiskGauge({
  score = 0.08,
  riskLevel = 'LOW',
  hasBaseline = true,
  onOpenCalibration,
}: RiskGaugeProps) {
  if (!hasBaseline || score === null) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center space-y-3 bg-amber-50/60 rounded-3xl border border-amber-200 shadow-xs">
        <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-200 text-amber-700 flex items-center justify-center">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-amber-950 font-mono">No Baseline Enrolled</h4>
          <p className="text-xs text-amber-800 font-light max-w-xs">
            Run a 60-second baseline calibration to enable real-time zero-trust scoring.
          </p>
        </div>
        {onOpenCalibration && (
          <button
            onClick={onOpenCalibration}
            className="px-4 py-2 rounded-xl bg-amber-900 hover:bg-amber-800 text-amber-100 font-mono font-bold text-xs flex items-center space-x-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Run Calibration Now</span>
          </button>
        )}
      </div>
    );
  }

  const percentage = Math.round(Math.min(100, Math.max(0, (score ?? 0.08) * 100)));
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const getColor = (pct: number) => {
    if (pct >= 70) return '#EF4444'; // Red (>0.70)
    if (pct >= 30) return '#F59E0B'; // Yellow (0.30 - 0.70)
    return '#10B981'; // Green (<0.30)
  };

  const currentColor = getColor(percentage);

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="relative w-44 h-44 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="88"
            cy="88"
            r={radius}
            stroke="currentColor"
            strokeWidth="12"
            className="text-zinc-200"
            fill="transparent"
          />
          <circle
            cx="88"
            cy="88"
            r={radius}
            stroke={currentColor}
            strokeWidth="12"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-700 ease-out"
          />
        </svg>

        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-extrabold text-zinc-900 tracking-tight font-mono">{percentage}%</span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mt-0.5 font-mono">
            Live Risk Score
          </span>
          <span
            className="text-xs font-bold px-2.5 py-0.5 mt-1 rounded-full border font-mono"
            style={{
              color: currentColor,
              borderColor: `${currentColor}40`,
              backgroundColor: `${currentColor}15`,
            }}
          >
            {riskLevel}
          </span>
        </div>
      </div>
    </div>
  );
}
