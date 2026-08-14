import React, { useRef, useEffect } from 'react';
import { MousePointer, Bot, UserCheck } from 'lucide-react';

export interface PathPoint {
  x: number;
  y: number;
  t: number;
  speed?: number;
}

interface SessionMousePathCanvasProps {
  humanPoints?: PathPoint[];
  botPoints?: PathPoint[];
  title?: string;
  subtitle?: string;
}

export function SessionMousePathCanvas({
  humanPoints,
  botPoints,
}: SessionMousePathCanvasProps) {
  const humanCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const botCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Generate sample human curved path if none passed
  const defaultHumanPoints: PathPoint[] = Array.from({ length: 45 }).map((_, i) => {
    const angle = (i / 45) * Math.PI * 1.5;
    const radius = 60 + Math.sin(i * 0.3) * 20;
    return {
      x: 120 + Math.cos(angle) * radius + Math.sin(i * 0.8) * 15,
      y: 90 + Math.sin(angle) * radius * 0.8,
      t: i * 80,
      speed: 400 + Math.abs(Math.sin(i * 0.4)) * 600,
    };
  });

  // Generate sample bot straight robotic path if none passed
  const defaultBotPoints: PathPoint[] = Array.from({ length: 45 }).map((_, i) => {
    return {
      x: 40 + i * 8, // perfect straight slope
      y: 30 + i * 3.5, // perfect straight slope
      t: i * 16.0, // fixed exact 16ms interval
      speed: 1320, // fixed exact speed
    };
  });

  const activeHuman = humanPoints && humanPoints.length > 0 ? humanPoints : defaultHumanPoints;
  const activeBot = botPoints && botPoints.length > 0 ? botPoints : defaultBotPoints;

  const drawPath = (
    canvas: HTMLCanvasElement | null,
    points: PathPoint[],
    isBot: boolean
  ) => {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background grid lines
    ctx.strokeStyle = '#f4f4f5';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(0, canvas.width);
      ctx.stroke();
    }

    if (points.length < 2) return;

    // Draw path line
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    for (let i = 1; i < points.length; i++) {
      const p1 = points[i - 1];
      const p2 = points[i];

      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);

      if (isBot) {
        ctx.strokeStyle = '#ef4444'; // Red linear bot line
      } else {
        ctx.strokeStyle = '#10b981'; // Green human curve line
      }
      ctx.stroke();

      // Draw point dot
      ctx.fillStyle = isBot ? '#f87171' : '#34d399';
      ctx.beginPath();
      ctx.arc(p2.x, p2.y, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw cursor icon at last point
    const lastP = points[points.length - 1];
    ctx.fillStyle = isBot ? '#dc2626' : '#059669';
    ctx.beginPath();
    ctx.arc(lastP.x, lastP.y, 5, 0, Math.PI * 2);
    ctx.fill();
  };

  useEffect(() => {
    drawPath(humanCanvasRef.current, activeHuman, false);
    drawPath(botCanvasRef.current, activeBot, true);
  }, [activeHuman, activeBot]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
        <div>
          <h3 className="text-sm font-bold text-zinc-900 tracking-tight">Session Mouse Path Trajectory Canvas</h3>
          <p className="text-xs text-zinc-500 font-light">
            Side-by-side visual proof of organic human curvature vs robotic linear bot vectors
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Human Canvas */}
        <div className="p-4 rounded-2xl border border-zinc-200 bg-white shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center">
                <UserCheck className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-zinc-900 font-mono">1. Human Baseline Session</span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-mono font-bold">
              Smooth Curve
            </span>
          </div>

          <div className="relative rounded-xl overflow-hidden border border-zinc-200 bg-zinc-50">
            <canvas ref={humanCanvasRef} width={420} height={160} className="w-full h-[160px]" />
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 pt-1">
            <span>Trajectory: Organic Curved Arc</span>
            <span>Velocity Var: High</span>
          </div>
        </div>

        {/* Bot Canvas */}
        <div className="p-4 rounded-2xl border border-zinc-200 bg-white shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-zinc-900 font-mono">2. Simulated Bot Attack Session</span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-mono font-bold">
              Robotic Straight Line
            </span>
          </div>

          <div className="relative rounded-xl overflow-hidden border border-zinc-200 bg-zinc-50">
            <canvas ref={botCanvasRef} width={420} height={160} className="w-full h-[160px]" />
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 pt-1">
            <span>Trajectory: Straight Line (1.0)</span>
            <span>Delta t: Fixed 16.0ms</span>
          </div>
        </div>
      </div>
    </div>
  );
}
