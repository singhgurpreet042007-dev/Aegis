'use client';

import React from 'react';
import { ShieldCheck, Facebook, Instagram, Youtube, Linkedin } from 'lucide-react';

export function FooterSection() {
  return (
    <footer className="w-full bg-black text-white pt-16 pb-12 px-6 md:px-16 lg:px-24 border-t border-zinc-800 relative z-20">
      <div className="max-w-7xl mx-auto">
        {/* Top Brand Header */}
        <div className="mb-12">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-white text-black flex items-center justify-center font-black text-2xl shadow-lg">
              <ShieldCheck className="w-5 h-5 text-black" />
            </div>
            <span className="text-2xl font-black tracking-tight text-white">
              AEGIS
            </span>
          </div>
          <p className="text-xs text-zinc-400 font-mono">
            © 2026 AEGIS. Post-Login Behavioral Biometrics Identity Platform. AGPL-3.0 License.
          </p>
        </div>

        {/* 4 Column Footer Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pb-12 border-b border-zinc-800 text-left">
          {/* Column 1: Platform */}
          <div>
            <h4 className="text-sm font-extrabold text-white mb-4 tracking-wide">Platform</h4>
            <ul className="space-y-2.5 text-xs text-zinc-400">
              <li className="hover:text-white transition-colors cursor-pointer">AegisTracker SDK</li>
              <li className="hover:text-white transition-colors cursor-pointer">BiometricRiskModel API</li>
              <li className="hover:text-white transition-colors cursor-pointer">ExplainableAI Engine</li>
              <li className="hover:text-white transition-colors cursor-pointer">Adaptive Step-Up MFA</li>
              <li className="hover:text-white transition-colors cursor-pointer">SecOps Dashboard</li>
            </ul>
          </div>

          {/* Column 2: Tech Stack */}
          <div>
            <h4 className="text-sm font-extrabold text-white mb-4 tracking-wide">Tech Stack</h4>
            <ul className="space-y-2.5 text-xs text-zinc-400">
              <li className="hover:text-white transition-colors cursor-pointer">Next.js 15 / React 19</li>
              <li className="hover:text-white transition-colors cursor-pointer">NestJS 10 / Prisma 5</li>
              <li className="hover:text-white transition-colors cursor-pointer">FastAPI / scikit-learn</li>
              <li className="hover:text-white transition-colors cursor-pointer">PostgreSQL 16 / pgvector</li>
              <li className="hover:text-white transition-colors cursor-pointer">Socket.IO / Redis 7</li>
            </ul>
          </div>

          {/* Column 3: Resources */}
          <div>
            <h4 className="text-sm font-extrabold text-white mb-4 tracking-wide">Resources</h4>
            <ul className="space-y-2.5 text-xs text-zinc-400">
              <li className="hover:text-white transition-colors cursor-pointer">API Documentation</li>
              <li className="hover:text-white transition-colors cursor-pointer">Architecture Guide</li>
              <li className="hover:text-white transition-colors cursor-pointer">Prisma Schema Reference</li>
              <li className="hover:text-white transition-colors cursor-pointer">ML Model Documentation</li>
              <li className="hover:text-white transition-colors cursor-pointer">GitHub Repository</li>
            </ul>
          </div>

          {/* Column 4: Social Links */}
          <div>
            <h4 className="text-sm font-extrabold text-white mb-4 tracking-wide">Connect</h4>
            <ul className="space-y-2.5 text-xs text-zinc-400">
              <li className="flex items-center space-x-2 hover:text-white transition-colors cursor-pointer">
                <Facebook className="w-4 h-4 text-white" />
                <span>Facebook</span>
              </li>
              <li className="flex items-center space-x-2 hover:text-white transition-colors cursor-pointer">
                <Instagram className="w-4 h-4 text-white" />
                <span>Instagram</span>
              </li>
              <li className="flex items-center space-x-2 hover:text-white transition-colors cursor-pointer">
                <Youtube className="w-4 h-4 text-white" />
                <span>Youtube</span>
              </li>
              <li className="flex items-center space-x-2 hover:text-white transition-colors cursor-pointer">
                <Linkedin className="w-4 h-4 text-white" />
                <span>LinkedIn</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Tagline & Tech Stack Badges */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-zinc-400 gap-4">
          <div className="flex flex-wrap items-center space-x-2">
            <span className="font-bold text-zinc-300">Monorepo:</span>
            <span className="px-2 py-0.5 rounded-md bg-zinc-900 text-zinc-300 font-mono text-[10px] border border-zinc-800">Next.js 15</span>
            <span className="px-2 py-0.5 rounded-md bg-zinc-900 text-zinc-300 font-mono text-[10px] border border-zinc-800">NestJS 10</span>
            <span className="px-2 py-0.5 rounded-md bg-zinc-900 text-zinc-300 font-mono text-[10px] border border-zinc-800">FastAPI</span>
            <span className="px-2 py-0.5 rounded-md bg-zinc-900 text-zinc-300 font-mono text-[10px] border border-zinc-800">Prisma 5</span>
            <span className="px-2 py-0.5 rounded-md bg-zinc-900 text-zinc-300 font-mono text-[10px] border border-zinc-800">Socket.IO</span>
          </div>
          <div className="text-zinc-400 font-bold">
            Post-Login Behavioral Biometrics Identity Platform
          </div>
        </div>

        {/* Giant Edge-to-Edge Watermark Typography matching unitedcarriers.jpg */}
        <div className="mt-16 pt-8 border-t border-zinc-900/80 text-center overflow-hidden pointer-events-none select-none">
          <h1 className="text-[12vw] font-black leading-none tracking-tighter text-zinc-900/70 uppercase">
            AEGIS AI
          </h1>
        </div>
      </div>
    </footer>
  );
}
