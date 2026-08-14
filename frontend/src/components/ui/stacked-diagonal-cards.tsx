'use client';

import React from 'react';
import { Sparkles, ShieldAlert, Activity, Terminal, ArrowRight, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface StackedCardData {
  id: string;
  badge: string;
  badgeType: 'new' | 'popular' | 'trending';
  title: string;
  subtitle: string;
  metrics?: { label: string; value: string }[];
  statusText?: string;
  timeAgo?: string;
}

interface StackedDiagonalCardsProps {
  cards: StackedCardData[];
  onActionClick?: () => void;
  className?: string;
}

export function StackedDiagonalCards({
  cards,
  onActionClick,
  className,
}: StackedDiagonalCardsProps) {
  return (
    <div className={cn("relative w-full max-w-md h-[280px] flex items-center justify-center select-none", className)}>
      {cards.slice(0, 3).map((card, idx) => {
        // Stack index (0 = front, 1 = middle, 2 = back)
        const stackOffset = idx;

        return (
          <div
            key={card.id}
            style={{
              zIndex: 30 - stackOffset * 10,
              transform: `translate3d(${-stackOffset * 22}px, ${-stackOffset * 22}px, 0) scale(${1 - stackOffset * 0.05})`,
            }}
            className={cn(
              "absolute top-0 left-0 w-full rounded-2xl p-5 border transition-all duration-500 ease-out shadow-2xl backdrop-blur-xl group hover:-translate-y-2 cursor-pointer",
              stackOffset === 0
                ? "bg-zinc-950/95 border-zinc-700/80 text-white shadow-[0_20px_50px_rgba(0,0,0,0.8)] ring-1 ring-white/10"
                : stackOffset === 1
                  ? "bg-zinc-900/80 border-zinc-800/80 text-zinc-200 shadow-xl opacity-90"
                  : "bg-zinc-900/60 border-zinc-800/50 text-zinc-400 shadow-lg opacity-75"
            )}
          >
            {/* Top Badge & Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-full bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                </div>
                <span className="text-xs font-bold tracking-wide text-blue-400">
                  {card.badge}
                </span>
              </div>
              {card.timeAgo && (
                <span className="text-[10px] font-mono text-zinc-500">{card.timeAgo}</span>
              )}
            </div>

            {/* Title & Subtitle */}
            <h3 className="text-base font-extrabold text-white tracking-tight leading-snug">
              {card.title}
            </h3>
            <p className="text-xs text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
              {card.subtitle}
            </p>

            {/* Optional Metrics Grid */}
            {card.metrics && card.metrics.length > 0 && (
              <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-zinc-800/80">
                {card.metrics.map((m, mIdx) => (
                  <div key={mIdx} className="p-2 rounded-lg bg-zinc-900/90 border border-zinc-800">
                    <div className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">{m.label}</div>
                    <div className="text-xs font-extrabold text-white font-mono mt-0.5">{m.value}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Optional Status Alert Bar */}
            {card.statusText && (
              <div className="mt-3 p-2 rounded-lg bg-red-950/40 border border-red-800/50 flex items-center space-x-2 text-[11px] font-semibold text-red-300">
                <Lock className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                <span className="truncate">{card.statusText}</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default StackedDiagonalCards;
