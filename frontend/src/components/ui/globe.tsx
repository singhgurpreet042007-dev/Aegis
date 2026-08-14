'use client';

import React, { useEffect, useRef, useState } from 'react';
import createGlobe, { COBEOptions } from 'cobe';
import { cn } from '@/lib/utils';

interface GlobeProps {
  className?: string;
  dark?: number;
  baseColor?: [number, number, number];
  markerColor?: [number, number, number];
  glowColor?: [number, number, number];
  mapBrightness?: number;
  markers?: { location: [number, number]; size: number }[];
}

export function Globe({
  className,
  dark = 1,
  // Pure Monochrome High-Contrast Earth: Obsidian black space, pure white dots, crisp silver halo
  baseColor = [0.03, 0.03, 0.03],
  markerColor = [1.0, 1.0, 1.0],
  glowColor = [0.2, 0.2, 0.2],
  mapBrightness = 14,
  markers = [
    { location: [37.7749, -122.4194], size: 0.08 }, // San Francisco
    { location: [50.1109, 8.6821], size: 0.09 },    // Frankfurt
    { location: [35.6762, 139.6503], size: 0.07 },   // Tokyo
    { location: [51.5074, -0.1278], size: 0.08 },    // London
    { location: [-33.8688, 151.2093], size: 0.06 },  // Sydney
    { location: [40.7128, -74.006], size: 0.08 },    // New York
    { location: [1.3521, 103.8198], size: 0.07 },    // Singapore
  ],
}: GlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pointerInteracting = useRef<number | null>(null);
  const pointerInteractionMovement = useRef(0);
  const [r, setR] = useState(0);

  useEffect(() => {
    let phi = 0;
    let width = 0;
    let animFrameId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onResize = () => {
      if (canvas) {
        width = canvas.offsetWidth;
      }
    };
    window.addEventListener('resize', onResize);
    onResize();

    const options: COBEOptions = {
      devicePixelRatio: Math.min(2, window.devicePixelRatio || 1),
      width: width * 2 || 1000,
      height: width * 2 || 1000,
      phi: 0,
      theta: 0.2,
      dark,
      diffuse: 2.4,
      mapSamples: 24000,
      mapBrightness,
      baseColor,
      markerColor,
      glowColor,
      opacity: 0.95,
      markers,
    };

    const globe = createGlobe(canvas, options);

    const animate = () => {
      if (!pointerInteracting.current) {
        phi += 0.005; // Smooth continuous 60fps Earth rotation
      }
      globe.update({
        phi: phi + r,
        width: width * 2 || 1000,
        height: width * 2 || 1000,
      });
      animFrameId = requestAnimationFrame(animate);
    };

    animFrameId = requestAnimationFrame(animate);

    setTimeout(() => {
      if (canvas) canvas.style.opacity = '1';
    }, 100);

    return () => {
      cancelAnimationFrame(animFrameId);
      globe.destroy();
      window.removeEventListener('resize', onResize);
    };
  }, [dark, r, baseColor, markerColor, glowColor, mapBrightness, markers]);

  return (
    <div
      className={cn(
        'relative mx-auto aspect-square w-full max-w-[650px] transition-all duration-700 ease-out drop-shadow-2xl',
        className
      )}
    >
      <canvas
        ref={canvasRef}
        onPointerDown={(e) => {
          pointerInteracting.current = e.clientX - pointerInteractionMovement.current;
          if (canvasRef.current) canvasRef.current.style.cursor = 'grabbing';
        }}
        onPointerUp={() => {
          pointerInteracting.current = null;
          if (canvasRef.current) canvasRef.current.style.cursor = 'grab';
        }}
        onPointerOut={() => {
          pointerInteracting.current = null;
          if (canvasRef.current) canvasRef.current.style.cursor = 'grab';
        }}
        onMouseMove={(e) => {
          if (pointerInteracting.current !== null) {
            const delta = e.clientX - pointerInteracting.current;
            pointerInteractionMovement.current = delta;
            setR(delta / 150);
          }
        }}
        onTouchMove={(e) => {
          if (pointerInteracting.current !== null && e.touches[0]) {
            const delta = e.touches[0].clientX - pointerInteracting.current;
            pointerInteractionMovement.current = delta;
            setR(delta / 150);
          }
        }}
        className="h-full w-full opacity-0 transition-opacity duration-1000 ease-in cursor-grab touch-none"
      />
    </div>
  );
}
