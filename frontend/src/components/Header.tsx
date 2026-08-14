'use client';

import React from 'react';
import { ShieldCheck, Activity, AlertOctagon, ExternalLink, Crown, Sparkles, Gift } from 'lucide-react';
import { useConnectedWebsite } from '@/lib/aegis-website';

interface HeaderProps {
  currentRiskScore: number;
  isTracking: boolean;
  activeSessionId: string;
  onOpenProfile?: () => void;
  onOpenCheckout?: () => void;
  currentUser?: { fullName?: string; email?: string } | null;
  isDefconActive?: boolean;
  onToggleDefcon?: () => void;
  onViewLanding?: () => void;
  onOpenIntegrations?: () => void;
}

export function Header({
  currentRiskScore,
  isTracking,
  activeSessionId,
  onOpenProfile,
  onOpenCheckout,
  currentUser,
  isDefconActive,
  onToggleDefcon,
  onViewLanding,
  onOpenIntegrations,
}: HeaderProps) {
  const { connectedSite, isConnected } = useConnectedWebsite();

  const getRiskBadge = (score: number) => {
    if (isDefconActive) {
      return { label: 'DEFCON 1 LOCKDOWN', color: 'bg-red-600/30 text-red-400 border-red-500 animate-pulse font-black' };
    }
    if (!isConnected) {
      return { label: 'AWAITING TARGET WEBSITE', color: 'bg-neutral-800 text-neutral-400 border-neutral-700 font-mono' };
    }
    if (score >= 0.75) {
      return { label: 'CRITICAL RISK', color: 'bg-red-500/20 text-red-400 border-red-500/50' };
    }
    if (score >= 0.40) {
      return { label: 'ELEVATED RISK', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50' };
    }
    return { label: 'IDENTITY VERIFIED', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' };
  };

  const badge = getRiskBadge(currentRiskScore);

  const userName = currentUser?.fullName || 'Security Officer';
  const userInitials = userName
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'SO';

  return (
    <header className={`min-h-16 border-b px-3 sm:px-6 py-2 sm:py-0 flex flex-wrap sm:flex-nowrap items-center justify-between sticky top-0 z-40 transition-colors gap-2 ${
      isDefconActive ? 'bg-red-950/40 border-red-600/60 shadow-2xl shadow-red-900/30' : 'border-gray-800 glass-panel'
    }`}>
      {/* Brand Logo & Tagline */}
      <div className="flex items-center space-x-2 sm:space-x-4">
        <div className={`p-1.5 sm:p-2 rounded-xl text-sky-400 shadow-lg shrink-0 ${
          isDefconActive ? 'bg-red-600/20 border border-red-500 text-red-400 animate-pulse' : 'bg-sky-500/10 border border-sky-500/30 shadow-sky-500/5'
        }`}>
          <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
        <div>
          <div className="flex items-center space-x-1.5 sm:space-x-2">
            <span className="font-bold text-base sm:text-lg tracking-wider text-white">AEGIS</span>
            <span className="text-[10px] sm:text-xs px-1.5 py-0.5 rounded-md bg-sky-950 text-sky-300 border border-sky-800 font-mono">
              v1.0 Zero Trust
            </span>
          </div>
          <p className="hidden sm:block text-xs text-gray-400">Continuous Identity. Intelligent Protection.</p>
        </div>

        {/* Target Website Indicator */}
        <button
          onClick={onOpenIntegrations}
          className={`hidden lg:flex items-center space-x-2 px-3 py-1.5 rounded-xl border text-xs font-mono transition-all cursor-pointer ml-4 ${
            isConnected
              ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
              : 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400 animate-ping'}`} />
          <span>{isConnected ? `Target: ${connectedSite?.domain}` : 'Connect Target Website'}</span>
        </button>
      </div>

      {/* Real-time Tracking Status & DEFCON Toggle */}
      <div className="flex items-center space-x-2 sm:space-x-5 flex-wrap sm:flex-nowrap gap-y-2">
        {/* DEFCON 1 Emergency Button */}
        <button
          onClick={onToggleDefcon}
          className={`flex items-center space-x-1.5 sm:space-x-2 px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-full border text-[10px] sm:text-xs font-black transition-all cursor-pointer shadow-lg shrink-0 ${
            isDefconActive
              ? 'bg-red-600 hover:bg-red-500 text-white border-red-400 shadow-red-600/40 animate-pulse'
              : 'bg-red-950/40 hover:bg-red-900/60 text-red-400 border-red-500/40'
          }`}
        >
          <AlertOctagon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>{isDefconActive ? 'DEFCON 1 ACTIVE' : 'ENGAGE DEFCON 1'}</span>
        </button>

        <div className="hidden md:flex items-center space-x-2 text-xs text-gray-300 bg-gray-900/80 border border-gray-800 px-3 py-1.5 rounded-lg">
          <Activity className={`w-4 h-4 ${isTracking ? 'text-emerald-400 animate-pulse' : 'text-gray-500'}`} />
          <span>Biometric Tracker:</span>
          <span className={isTracking ? 'text-emerald-400 font-medium' : 'text-gray-400'}>
            {isTracking ? 'ACTIVE (Continuous Ingestion)' : 'PAUSED'}
          </span>
        </div>

        {/* Live Risk Badge */}
        <div className={`hidden sm:flex items-center space-x-2 border text-[10px] sm:text-xs font-semibold px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full shrink-0 ${badge.color}`}>
          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-current animate-ping" />
          <span>{badge.label} ({(currentRiskScore * 100).toFixed(0)}%)</span>
        </div>

        {/* Luxury Glowing Cyber-Emerald Upgrade & 7-Day Trial CTA */}
        {onOpenCheckout && (
          <button
            onClick={onOpenCheckout}
            className="hidden md:flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-white font-mono font-bold text-xs transition-all shadow-lg hover:shadow-emerald-500/30 cursor-pointer shrink-0 border border-emerald-400/50 hover:scale-105 active:scale-95 group relative overflow-hidden"
          >
            <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <Crown className="w-2.5 h-2.5 text-amber-300 group-hover:rotate-12 transition-transform" />
            </div>
            <span className="tracking-wide">7-DAY TRIAL / UPGRADE 👑</span>
            <span className="px-1.5 py-0.2 rounded-full bg-white text-emerald-950 text-[9px] font-black uppercase">
              FREE
            </span>
          </button>
        )}
        <button
          onClick={onOpenProfile}
          className="flex items-center space-x-2 sm:space-x-3 border-l border-gray-800 pl-3 sm:pl-6 cursor-pointer hover:opacity-80 transition-opacity shrink-0"
        >
          <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white font-extrabold text-[10px] sm:text-xs shadow-md">
            {userInitials}
          </div>
          <div className="hidden lg:block text-left">
            <div className="text-xs font-semibold text-gray-200 hover:text-sky-400 transition-colors">{userName}</div>
            <div className="text-[10px] text-gray-400 font-mono">
              {activeSessionId.startsWith('sess_') ? activeSessionId : `sess_${activeSessionId}`}
            </div>
          </div>
        </button>
      </div>
    </header>
  );
}
