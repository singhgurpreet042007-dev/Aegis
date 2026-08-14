'use client';

import React, { useEffect, useRef } from 'react';

const techBadges = [
  'Zero Trust v1.0',
  'Biometrics AI Engine',
  'NIST SP 800-207',
  'Keystroke Dynamics',
  'Mouse Vector Analysis',
  'Adaptive Step-Up MFA',
  'DEFCON 1 Lockdown',
  'Neural Behavioral Drift',
  'Real-Time WebSocket',
  'PyTorch Risk Classifier',
  'FastAPI Risk Model',
  'PostgreSQL Audit Trail',
  'Explainable AI SHAP',
  'Isolation Forest ML',
  'JWT Session Tracker',
  'Biometric DNA Radar',
];

export function BiometricMeshBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let animationFrameId: number;

    const setupCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5); // Cap DPR at 1.5 for ultra smooth 60fps
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.scale(dpr, dpr);
      return { w, h };
    };

    let { w: width, h: height } = setupCanvas();

    const handleResize = () => {
      const dims = setupCanvas();
      width = dims.w;
      height = dims.h;
    };

    window.addEventListener('resize', handleResize);

    // Optimized grid size for locked 60 FPS
    const cols = 32;
    const rows = 20;
    let step = 0;

    // Cache pre-measured text widths for zero frame-overhead
    ctx.font = '600 11px system-ui, -apple-system, sans-serif';
    const textWidthCache = techBadges.map((text) => ctx.measureText(text).width);

    const render = () => {
      // Solid fast clear
      ctx.fillStyle = '#040406';
      ctx.fillRect(0, 0, width, height);

      step += 0.012;

      const cellW = width / cols;
      const cellH = height / rows;

      ctx.lineWidth = 0.5;

      // 1. Optimized Fast 3D Mesh Grid
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const distFromCenter = (c - cols / 2) * (c - cols / 2) + (r - rows / 2) * (r - rows / 2);
          const z =
            Math.sin(c * 0.18 + step) * 10 +
            Math.cos(r * 0.18 + step) * 10;

          const x = c * cellW + Math.cos(step + r) * 2;
          const y = r * cellH + z;

          const alpha = Math.max(0.08, Math.min(0.45, (z + 18) / 36));

          // Draw point
          ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
          ctx.fillRect(x - 0.8, y - 0.8, 1.6, 1.6);

          // Fast horizontal line
          if (c < cols - 1 && (r % 2 === 0 || c % 2 === 0)) {
            const nextX = (c + 1) * cellW + Math.cos(step + r) * 2;
            const nextZ = Math.sin((c + 1) * 0.18 + step) * 10 + Math.cos(r * 0.18 + step) * 10;
            const nextY = r * cellH + nextZ;

            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(nextX, nextY);
            ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.12})`;
            ctx.stroke();
          }
        }
      }

      // 2. High-Performance 60FPS Orbiting Diamond Badges
      const cx = width * 0.5;
      const cy = height * 0.5;
      const rx = Math.min(width * 0.45, 620);
      const ry = Math.min(height * 0.42, 380);

      techBadges.forEach((text, i) => {
        const angle = (i / techBadges.length) * Math.PI * 2 + step * 0.35;
        const bx = cx + Math.cos(angle) * rx;
        const by = cy + Math.sin(angle) * ry;

        const scale = 0.85 + (Math.sin(angle) + 1) * 0.15;
        const opacity = 0.8 + (Math.sin(angle) + 1) * 0.2;

        ctx.save();
        ctx.translate(bx, by);

        const textWidth = textWidthCache[i];
        const padX = 14 * scale;
        const rectW = textWidth + padX * 2 + 10;
        const rectH = 24 * scale;

        // Diamond Rhombus Accent (Monochrome)
        ctx.save();
        ctx.rotate(Math.PI / 4);
        const dSize = rectH * 0.75;
        ctx.fillStyle = `rgba(0, 0, 0, ${opacity})`;
        ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.8})`;
        ctx.lineWidth = 1.2;
        ctx.fillRect(-dSize / 2, -dSize / 2, dSize, dSize);
        ctx.strokeRect(-dSize / 2, -dSize / 2, dSize, dSize);
        ctx.restore();

        // Capsule Badge Box (Monochrome)
        ctx.fillStyle = `rgba(0, 0, 0, ${opacity * 0.95})`;
        ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.7})`;
        ctx.lineWidth = 1.2;

        ctx.beginPath();
        ctx.roundRect(-rectW / 2, -rectH / 2, rectW, rectH, 6);
        ctx.fill();
        ctx.stroke();

        // Status LED Dot (Pure White/Gray Glow)
        ctx.beginPath();
        ctx.arc(-rectW / 2 + 9 * scale, 0, 2.8 * scale, 0, Math.PI * 2);
        ctx.fillStyle = opacity > 0.9 ? '#ffffff' : '#a1a1aa';
        ctx.fill();

        // Sharp Pure White Text
        ctx.font = `600 ${Math.round(10.5 * scale)}px system-ui, -apple-system, sans-serif`;
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, 4 * scale, 0);

        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0 transform-gpu will-change-transform"
    />
  );
}
