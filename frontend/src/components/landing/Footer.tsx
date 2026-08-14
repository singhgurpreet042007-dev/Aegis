'use client';

import { ShieldCheck, Github, Lock, Cpu, Activity, Globe, ShieldAlert } from 'lucide-react';

export function Footer() {
  return (
    <footer className="relative min-h-[85vh] flex flex-col justify-center py-16 md:py-24 bg-white text-zinc-900 select-none">
      <div className="w-full max-w-[1400px] mx-auto px-6 md:px-12">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-14 mb-16">
          {/* Brand & Overview Column (4 cols) */}
          <div className="md:col-span-4 space-y-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-zinc-900 flex items-center justify-center shadow-xs">
                <ShieldCheck className="w-4 h-4 text-white" />
              </div>
              <span className="text-[17px] font-bold text-zinc-900 tracking-tight font-sans">
                Aegis<span className="text-zinc-400 font-medium ml-0.5">AI</span>
              </span>
            </div>

            {/* Cursive Brand Statement */}
            <p className="font-serif-italic italic text-zinc-600 text-[15.5px] leading-relaxed font-light">
              &ldquo;Pioneering post-login behavioral biometrics and continuous zero-trust identity verification for modern enterprise systems.&rdquo;
            </p>

            {/* Pure Floating System Status Text */}
            <div className="pt-2 flex items-center space-x-3 text-[11px] font-mono">
              <span className="flex items-center space-x-1.5 text-zinc-600 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>ALL SYSTEMS OPERATIONAL</span>
              </span>
              <span className="text-zinc-300">·</span>
              <span className="text-zinc-400 font-normal">LATENCY &lt; 147ms</span>
            </div>
          </div>

          {/* Platform Column (2 cols) */}
          <div className="md:col-span-2">
            <h4 className="font-serif-italic italic text-zinc-900 text-[18px] font-normal mb-4">Platform</h4>
            <ul className="space-y-3 text-[13px] text-zinc-600 font-light">
              <li className="hover:text-zinc-900 transition-colors cursor-pointer flex items-center space-x-1.5">
                <Activity className="w-3.5 h-3.5 text-zinc-400" />
                <span>AegisTracker SDK</span>
              </li>
              <li className="hover:text-zinc-900 transition-colors cursor-pointer flex items-center space-x-1.5">
                <Cpu className="w-3.5 h-3.5 text-zinc-400" />
                <span>IsolationForest ML</span>
              </li>
              <li className="hover:text-zinc-900 transition-colors cursor-pointer flex items-center space-x-1.5">
                <Globe className="w-3.5 h-3.5 text-zinc-400" />
                <span>Sentinel Scanner</span>
              </li>
              <li className="hover:text-zinc-900 transition-colors cursor-pointer flex items-center space-x-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-zinc-400" />
                <span>Adaptive Step-Up MFA</span>
              </li>
              <li className="hover:text-zinc-900 transition-colors cursor-pointer flex items-center space-x-1.5">
                <Lock className="w-3.5 h-3.5 text-zinc-400" />
                <span>SecOps Command</span>
              </li>
            </ul>
          </div>

          {/* Architecture Stack Column (3 cols) */}
          <div className="md:col-span-3">
            <h4 className="font-serif-italic italic text-zinc-900 text-[18px] font-normal mb-4">Architecture</h4>
            <ul className="space-y-3 text-[13px] text-zinc-600 font-light">
              <li className="hover:text-zinc-900 transition-colors cursor-pointer">Next.js 15 App Router · React 19</li>
              <li className="hover:text-zinc-900 transition-colors cursor-pointer">NestJS 10 Framework · Guards</li>
              <li className="hover:text-zinc-900 transition-colors cursor-pointer">Python FastAPI · scikit-learn ML</li>
              <li className="hover:text-zinc-900 transition-colors cursor-pointer">Neon PostgreSQL 16 · Prisma ORM</li>
              <li className="hover:text-zinc-900 transition-colors cursor-pointer">Redis 7 Pub/Sub Session Cache</li>
            </ul>
          </div>

          {/* Resources & Legal Column (3 cols) */}
          <div className="md:col-span-3">
            <h4 className="font-serif-italic italic text-zinc-900 text-[18px] font-normal mb-4">Resources & Legal</h4>
            <ul className="space-y-3 text-[13px] text-zinc-600 font-light">
              <li className="hover:text-zinc-900 transition-colors cursor-pointer">Architecture Specification</li>
              <li className="hover:text-zinc-900 transition-colors cursor-pointer">API Reference Documentation</li>
              <li className="hover:text-zinc-900 transition-colors cursor-pointer">AGPL-3.0 Open Source License</li>
              <li className="hover:text-zinc-900 transition-colors cursor-pointer">Privacy Policy & Security Matrix</li>
              <li className="hover:text-zinc-900 transition-colors cursor-pointer flex items-center space-x-1">
                <Github className="w-3.5 h-3.5 text-zinc-500" />
                <span>GitHub Monorepo</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-zinc-100 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-[12.5px] text-zinc-500 font-light">
            © 2026 Aegis AI. <span className="font-serif-italic italic text-zinc-800 font-normal">Continuous Zero-Trust Biometrics Shield</span>. All rights reserved.
          </div>

          {/* Pure Floating Text Badges */}
          <div className="text-[11px] text-zinc-400 font-mono tracking-wider">
            AGPL-3.0 · SOC2 Ready · Sub-200ms ML
          </div>
        </div>
      </div>
    </footer>
  );
}
