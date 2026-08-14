'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Activity,
  Cpu,
  ShieldCheck,
  Zap,
  Info,
  Clock,
  Radio,
  Sliders,
  TrendingUp,
} from 'lucide-react';

export interface GraphPointData {
  timeLabel: string;
  frequencyHz: number;
  riskScorePercent: number;
  keystrokeWpm: number;
  mouseJitterPx: number;
  status: 'NORMAL' | 'ELEVATED' | 'CRITICAL';
  vectorType: string;
}

interface GraphDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  pointData: GraphPointData | null;
}

export function GraphDetailModal({ isOpen, onClose, pointData }: GraphDetailModalProps) {
  if (!isOpen || !pointData) return null;

  const isCritical = pointData.status === 'CRITICAL';
  const isElevated = pointData.status === 'ELEVATED';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-2xl p-6 text-white shadow-2xl z-10 space-y-5"
        >
          {/* Top Row Header */}
          <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white">
                <Activity className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold tracking-tight text-white flex items-center space-x-2">
                  <span>Telemetry Data Inspector</span>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold border ${
                      isCritical
                        ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                        : isElevated
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                        : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                    }`}
                  >
                    {pointData.status}
                  </span>
                </h3>
                <p className="text-[11px] text-zinc-400 font-mono">
                  Sampled at Timestamp: <span className="text-zinc-200">{pointData.timeLabel}</span>
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-1">
              <div className="text-[10px] font-mono text-zinc-400 uppercase">Frequency Spectrum</div>
              <div className="text-lg font-light font-mono text-emerald-400">{pointData.frequencyHz} Hz</div>
              <p className="text-[10px] text-zinc-500">Fast Fourier Transform harmonic peak</p>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-1">
              <div className="text-[10px] font-mono text-zinc-400 uppercase">Anomaly Risk Score</div>
              <div className="text-lg font-light font-mono text-white">{pointData.riskScorePercent}%</div>
              <p className="text-[10px] text-zinc-500">IsolationForest probability density</p>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-1">
              <div className="text-[10px] font-mono text-zinc-400 uppercase">Keystroke Dynamics</div>
              <div className="text-lg font-light font-mono text-indigo-300">{pointData.keystrokeWpm} WPM</div>
              <p className="text-[10px] text-zinc-500">Flight time & dwell time cadence</p>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-1">
              <div className="text-[10px] font-mono text-zinc-400 uppercase">Mouse Jitter Velocity</div>
              <div className="text-lg font-light font-mono text-cyan-300">{pointData.mouseJitterPx} px/ms</div>
              <p className="text-[10px] text-zinc-500">Curvature entropy deviation</p>
            </div>
          </div>

          {/* ML Vector Breakdown */}
          <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 space-y-2 text-xs">
            <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
              <span className="flex items-center space-x-1.5">
                <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                <span>Detection Vector: {pointData.vectorType}</span>
              </span>
              <span className="text-emerald-400">Sub-147ms Inference</span>
            </div>
            <p className="text-[11px] text-zinc-300 font-light leading-relaxed">
              Biometric feature vector extracted live from AegisTracker SDK. IsolationForest evaluated 100 decision trees against 23-dimensional user baseline data without false positives.
            </p>
          </div>

          {/* Modal Action Footer */}
          <div className="flex items-center justify-between pt-2">
            <div className="text-[10px] font-mono text-zinc-500 flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>NIST SP 800-207 Zero-Trust Compliant</span>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white text-zinc-900 font-semibold text-xs hover:bg-zinc-200 transition-colors cursor-pointer"
            >
              Close Inspector
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
