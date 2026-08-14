import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, MousePointer, Video, AlertTriangle, Globe } from 'lucide-react';
import { SessionReplayFrame } from '@aegis/shared';
import { fetchApi } from '@/lib/api-client';
import { useConnectedWebsite } from '@/lib/aegis-website';
import { SessionMousePathCanvas } from './SessionMousePathCanvas';

interface SessionReplayViewProps {
  sessionId?: string;
}

export function SessionReplayView({ sessionId = 'sess_001' }: SessionReplayViewProps) {
  const { connectedSite, isConnected } = useConnectedWebsite();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [frames, setFrames] = useState<SessionReplayFrame[]>([]);
  const [rawMousePoints, setRawMousePoints] = useState<any[]>([]);

  useEffect(() => {
    const fetchReplay = async () => {
      try {
        const data = await fetchApi(`/biometrics/session/${sessionId}/mouse-path`);
        if (data && data.mousePoints && data.mousePoints.length > 0) {
          setRawMousePoints(data.mousePoints);
        }
      } catch {
        // Fallback below
      }

      const synthFrames: SessionReplayFrame[] = Array.from({ length: 40 }).map((_, i) => {
        const isAnomaly = i > 18;
        return {
          sequence: i,
          timestamp: i * 250,
          x: 120 + i * 22,
          y: 180 + (isAnomaly ? 0 : Math.sin(i * 0.5) * 35),
          type: i % 5 === 0 ? 'click' : 'move',
          velocity: isAnomaly ? 2400 : 820,
          dwellTime: isAnomaly ? 10 : 112,
          isAnomaly,
        };
      });
      setFrames(synthFrames);
    };

    fetchReplay();
  }, [sessionId]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && frames.length > 0) {
      timer = setInterval(() => {
        setCurrentIndex((prev) => {
          if (prev >= frames.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 200);
    }
    return () => clearInterval(timer);
  }, [isPlaying, frames.length]);

  if (!isConnected) {
    return (
      <div className="p-8 rounded-2xl border border-amber-200 bg-amber-50/80 text-center space-y-4 shadow-xs">
        <div className="w-12 h-12 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center mx-auto text-amber-700">
          <Globe className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-base font-bold text-amber-950">No Target Website Connected</h3>
          <p className="text-xs text-amber-800 mt-1 max-w-md mx-auto">
            Please connect your website URL in the <strong className="text-amber-950">"Connect Website"</strong> section to replay session trajectories for your target domain.
          </p>
        </div>
      </div>
    );
  }

  const currentFrame = frames[currentIndex] || frames[0] || { x: 100, y: 100, velocity: 800, dwellTime: 110, isAnomaly: false };

  return (
    <div className="space-y-6">
      <div className="border border-zinc-200/80 rounded-2xl p-6 bg-white shadow-xs flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-zinc-900 flex items-center justify-center text-white shrink-0 shadow-xs">
              <Video className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-base font-bold text-zinc-900 tracking-tight">Session Telemetry Replay & Path Visualization</h2>
          </div>
          <p className="text-xs text-zinc-500 font-light mt-1">
            Visual reconstruction of cursor trajectory & keystroke dynamics for session: <span className="font-mono text-zinc-800 font-semibold">{sessionId}</span>
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="px-3.5 py-1.5 bg-zinc-900 text-white hover:bg-zinc-800 rounded-xl text-xs font-mono font-semibold flex items-center space-x-2 transition-colors cursor-pointer shadow-xs"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isPlaying ? 'Pause' : 'Play Replay'}</span>
          </button>
          <button
            onClick={() => {
              setCurrentIndex(0);
              setIsPlaying(false);
            }}
            className="p-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl text-xs transition-colors cursor-pointer border border-zinc-200"
            title="Reset"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Side-by-side Mouse Path Canvas Component (Feature 5) */}
      <SessionMousePathCanvas
        humanPoints={rawMousePoints.length > 0 ? rawMousePoints : undefined}
      />

      {/* Screen Playback Canvas */}
      <div className="border border-zinc-200/80 rounded-2xl p-6 relative min-h-[360px] bg-white shadow-xs flex flex-col justify-between overflow-hidden">
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between border-b border-zinc-100 pb-3 text-xs text-zinc-400">
          <div className="flex items-center space-x-2">
            <div className="w-2.5 h-2.5 rounded-full bg-zinc-300" />
            <div className="w-2.5 h-2.5 rounded-full bg-zinc-300" />
            <div className="w-2.5 h-2.5 rounded-full bg-zinc-300" />
            <span className="font-mono text-[11px] text-zinc-500 ml-2">https://app.aegisai.io/dashboard</span>
          </div>
          <div className="font-mono text-[11px]">
            Frame: {currentIndex + 1} / {frames.length || 1}
          </div>
        </div>

        <div className="relative w-full h-[260px] mt-10">
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <path
              d={frames
                .slice(0, currentIndex + 1)
                .map((f, i) => `${i === 0 ? 'M' : 'L'} ${f.x} ${f.y}`)
                .join(' ')}
              fill="none"
              stroke={currentFrame.isAnomaly ? '#ef4444' : '#18181b'}
              strokeWidth="2"
              strokeDasharray={currentFrame.isAnomaly ? '4 4' : 'none'}
            />
          </svg>

          <div
            className="absolute transition-all duration-200 pointer-events-none -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${currentFrame.x}px`, top: `${currentFrame.y}px` }}
          >
            <div className="relative">
              <MousePointer
                className={`w-5 h-5 ${
                  currentFrame.isAnomaly ? 'text-rose-600 fill-rose-100' : 'text-zinc-900 fill-zinc-200'
                }`}
              />
              {currentFrame.isAnomaly && (
                <div className="absolute -top-6 left-6 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-mono text-[10px] font-bold flex items-center space-x-1 whitespace-nowrap">
                  <AlertTriangle className="w-3 h-3 text-rose-600" />
                  <span>Bot Linear Vector</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs border-t border-zinc-100 pt-4 font-mono">
          <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-200/80 text-left">
            <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">CURSOR VELOCITY</div>
            <div className="font-semibold text-zinc-900">{currentFrame.velocity || 800} px/s</div>
          </div>
          <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-200/80 text-left">
            <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">KEY DWELL TIME</div>
            <div className="font-semibold text-zinc-900">{currentFrame.dwellTime || 110} ms</div>
          </div>
          <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-200/80 text-left">
            <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">ANOMALY STATUS</div>
            <div className={`font-semibold ${currentFrame.isAnomaly ? 'text-rose-600' : 'text-emerald-700'}`}>
              {currentFrame.isAnomaly ? 'ANOMALOUS' : 'NORMAL'}
            </div>
          </div>
          <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-200/80 text-left">
            <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">REPLAY TIMELINE</div>
            <div className="font-semibold text-zinc-900">{(currentIndex * 0.25).toFixed(1)}s elapsed</div>
          </div>
        </div>
      </div>
    </div>
  );
}
