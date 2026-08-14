'use client';

import { useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useInView } from 'framer-motion';
import { ShieldCheck, ArrowRight, Activity, Cpu, Lock, Globe, ShieldAlert, Github } from 'lucide-react';

interface DashboardSectionProps {
  onNavigate?: (path: string) => void;
}

export function DashboardSection({ onNavigate }: DashboardSectionProps) {
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  const handleCTA = () => {
    if (onNavigate) onNavigate('/dashboard');
    else router.push('/dashboard');
  };

  return (
    <section ref={ref} className="relative min-h-[85vh] flex flex-col justify-between py-10 md:py-14 bg-white text-zinc-900 select-none">
      {/* Top Half: Dashboard Command Center Preview */}
      <div className="w-full max-w-[1400px] mx-auto px-6 md:px-12 my-auto">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6">
            <div>
              <div className="text-[10px] font-mono text-zinc-400 tracking-widest uppercase mb-1.5">
                SECOPS COMMAND CENTER
              </div>
              <h2 className="text-2xl sm:text-3xl font-light text-zinc-900 tracking-tight">
                Live Enterprise{' '}
                <span className="font-serif-italic italic text-zinc-700 font-light">
                  Dashboard
                </span>
              </h2>
            </div>

            <button
              onClick={handleCTA}
              className="group text-zinc-900 font-semibold text-[14px] hover:text-zinc-600 transition-colors flex items-center space-x-2 cursor-pointer self-start md:self-auto"
            >
              <span>Explore Live Dashboard</span>
              <ArrowRight className="w-4 h-4 text-zinc-900 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Quick Dashboard Stat Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-4">
            <div>
              <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider mb-1">Active Sessions</div>
              <div className="text-xl font-medium text-zinc-900 font-mono">1,482 <span className="text-[11px] text-emerald-500 font-normal">LIVE</span></div>
            </div>
            <div>
              <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider mb-1">Average Trust Score</div>
              <div className="text-xl font-medium text-zinc-900 font-mono">98.2% <span className="text-[11px] text-zinc-400 font-normal">STABLE</span></div>
            </div>
            <div>
              <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider mb-1">Inference Speed</div>
              <div className="text-xl font-medium text-zinc-900 font-mono">147ms <span className="text-[11px] text-zinc-400 font-normal">AVG</span></div>
            </div>
            <div>
              <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider mb-1">Threat Status</div>
              <div className="text-xl font-medium text-emerald-600 font-mono">NORMAL <span className="text-[11px] text-emerald-500 font-normal">0 CRITICAL</span></div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom Half: Naturally Integrated Footer */}
      <div className="w-full max-w-[1400px] mx-auto px-6 md:px-12 pt-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-8">
          {/* Brand & Statement */}
          <div className="md:col-span-4 space-y-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-7.5 h-7.5 rounded-xl bg-zinc-900 flex items-center justify-center shadow-xs">
                <ShieldCheck className="w-4 h-4 text-white" />
              </div>
              <span className="text-[15px] font-bold text-zinc-900 tracking-tight font-sans">
                Aegis<span className="text-zinc-400 font-medium ml-0.5">AI</span>
              </span>
            </div>
            <p className="font-serif-italic italic text-zinc-600 text-[14px] leading-relaxed font-light">
              &ldquo;Pioneering post-login behavioral biometrics and continuous zero-trust identity verification for modern enterprise systems.&rdquo;
            </p>
          </div>

          {/* Platform Column */}
          <div className="md:col-span-2">
            <h4 className="font-serif-italic italic text-zinc-900 text-[16px] font-normal mb-2.5">Platform</h4>
            <ul className="space-y-2 text-[12.5px] text-zinc-600 font-light">
              <li className="hover:text-zinc-900 transition-colors cursor-pointer flex items-center space-x-1.5">
                <Activity className="w-3 h-3 text-zinc-400" />
                <span>AegisTracker SDK</span>
              </li>
              <li className="hover:text-zinc-900 transition-colors cursor-pointer flex items-center space-x-1.5">
                <Cpu className="w-3 h-3 text-zinc-400" />
                <span>IsolationForest ML</span>
              </li>
              <li className="hover:text-zinc-900 transition-colors cursor-pointer flex items-center space-x-1.5">
                <Globe className="w-3 h-3 text-zinc-400" />
                <span>Sentinel Scanner</span>
              </li>
            </ul>
          </div>

          {/* Architecture Column */}
          <div className="md:col-span-3">
            <h4 className="font-serif-italic italic text-zinc-900 text-[16px] font-normal mb-2.5">Architecture</h4>
            <ul className="space-y-2 text-[12.5px] text-zinc-600 font-light">
              <li className="hover:text-zinc-900 transition-colors cursor-pointer">Next.js 15 App Router · React 19</li>
              <li className="hover:text-zinc-900 transition-colors cursor-pointer">NestJS 10 Framework · Guards</li>
              <li className="hover:text-zinc-900 transition-colors cursor-pointer">Python FastAPI · scikit-learn ML</li>
            </ul>
          </div>

          {/* Resources Column */}
          <div className="md:col-span-3">
            <h4 className="font-serif-italic italic text-zinc-900 text-[16px] font-normal mb-2.5">Resources</h4>
            <ul className="space-y-2 text-[12.5px] text-zinc-600 font-light">
              <li className="hover:text-zinc-900 transition-colors cursor-pointer">Architecture Specification</li>
              <li className="hover:text-zinc-900 transition-colors cursor-pointer">API Reference Documentation</li>
              <li className="hover:text-zinc-900 transition-colors cursor-pointer flex items-center space-x-1">
                <Github className="w-3 h-3 text-zinc-500" />
                <span>GitHub Monorepo</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Integrated Bottom Bar */}
        <div className="pt-4 flex flex-col md:flex-row items-center justify-between gap-3 text-[11px]">
          <div className="text-zinc-500 font-light">
            © 2026 Aegis AI. <span className="font-serif-italic italic text-zinc-800 font-normal">Continuous Zero-Trust Biometrics Shield</span>. All rights reserved.
          </div>
          <div className="text-zinc-400 font-mono tracking-wider">
            AGPL-3.0 · SOC2 Ready · Sub-200ms ML
          </div>
        </div>
      </div>
    </section>
  );
}
