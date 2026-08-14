'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Eye, Zap, ShieldAlert } from 'lucide-react';
import { HoneypotSandboxView } from './HoneypotSandboxView';
import { IntruderSimulatorView } from './IntruderSimulatorView';

export function DeceptionSandboxView() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="space-y-6"
    >
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-200/80 pb-4 gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-zinc-900 flex items-center justify-center text-white shrink-0 shadow-xs">
              <Eye className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-lg font-bold text-zinc-900 tracking-tight">Deception Sandbox & Red Team Simulator</h2>
          </div>
          <p className="text-xs text-zinc-500 font-light mt-1">
            Isolated digital twin honeypots for decoy threat containment & interactive synthetic Red Team attack simulation.
          </p>
        </div>
      </div>

      {/* Honeypot Sandbox Section */}
      <div className="space-y-4">
        <HoneypotSandboxView />
      </div>

      <div className="laser-divider" />

      {/* Red Team Intruder Simulator Section */}
      <div className="space-y-4">
        <IntruderSimulatorView />
      </div>
    </motion.div>
  );
}

