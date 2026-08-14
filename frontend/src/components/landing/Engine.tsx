'use client';

import { useRef, useState, useEffect, useMemo } from 'react';
import { motion, useInView, useSpring, useMotionValue } from 'framer-motion';
import { Cpu } from 'lucide-react';

// Deterministic pseudo-random for SSR safety
function pseudoRandom(seed: number) {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
}

/** Animated number with elastic overshoot using spring physics */
function AnimatedNumber({ value, delay = 0 }: { value: number; delay?: number }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  const motionVal = useMotionValue(0);
  const springVal = useSpring(motionVal, {
    stiffness: 60,
    damping: 15,
    mass: 1,
  });

  useEffect(() => {
    if (!isInView) return;
    const timer = setTimeout(() => {
      motionVal.set(value);
    }, delay * 1000);
    return () => clearTimeout(timer);
  }, [isInView, value, delay, motionVal]);

  useEffect(() => {
    const unsubscribe = springVal.on('change', (v) => {
      setDisplay(Math.floor(Math.max(0, v)));
    });
    return unsubscribe;
  }, [springVal]);

  return <span ref={ref}>{display.toLocaleString()}</span>;
}

/** Matrix-style code rain background */
function CodeRainBackground() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const columns = useMemo(() =>
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.round(pseudoRandom((i + 1) * 1.7) * 10000) / 100,
      duration: Math.round((3 + pseudoRandom((i + 1) * 2.9) * 6) * 100) / 100,
      delay: Math.round(pseudoRandom((i + 1) * 4.1) * 500) / 100,
      chars: Array.from({ length: 8 }, (_, j) =>
        String.fromCharCode(48 + Math.floor(pseudoRandom((i + 1) * (j + 1) * 3.3) * 74))
      ).join('\n'),
    })),
    []
  );

  if (!isMounted) return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden z-0 opacity-20">
      {columns.map((col) => (
        <motion.div
          key={col.id}
          className="absolute text-[10px] font-mono text-white/30 whitespace-pre leading-5"
          style={{ left: `${col.x}%` }}
          animate={{ y: ['-100%', '100vh'] }}
          transition={{
            duration: col.duration,
            delay: col.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          {col.chars}
        </motion.div>
      ))}
    </div>
  );
}

/** Floating orb particles for dark section */
function DarkParticles() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const particles = useMemo(() =>
    Array.from({ length: 16 }, (_, i) => ({
      id: i,
      x: Math.round(pseudoRandom((i + 1) * 7.3) * 10000) / 100,
      y: Math.round(pseudoRandom((i + 1) * 3.1) * 10000) / 100,
      size: Math.round((2 + pseudoRandom((i + 1) * 5.7) * 4) * 100) / 100,
      duration: Math.round((5 + pseudoRandom((i + 1) * 2.1) * 8) * 100) / 100,
      delay: Math.round(pseudoRandom((i + 1) * 6.3) * 300) / 100,
    })),
    []
  );

  if (!isMounted) return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: 'radial-gradient(circle, rgba(255,255,255,0.25), rgba(255,255,255,0.05))',
          }}
          animate={{
            y: [0, -30, -10, -40, 0],
            x: [0, 15, -10, 20, 0],
            opacity: [0.1, 0.5, 0.2, 0.4, 0.1],
            scale: [1, 1.3, 0.8, 1.2, 1],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

export function Engine() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const titleInView = useInView(sectionRef, { once: true, margin: '-100px' });

  const [waveData, setWaveData] = useState<number[]>(() =>
    Array.from({ length: 60 }, (_, i) => 30 + (Math.sin(i * 0.5) + 1) * 20)
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setWaveData((prev) => {
        const next = [...prev.slice(1), 30 + Math.random() * 40];
        return next;
      });
    }, 150);
    return () => clearInterval(interval);
  }, []);

  const wavePathD = `M ${waveData.map((val, i) => `${(i / (waveData.length - 1)) * 600},${180 - val * 1.8}`).join(' L ')}`;
  const waveAreaD = `M 0,180 L ${waveData.map((val, i) => `${(i / (waveData.length - 1)) * 600},${180 - val * 1.8}`).join(' L ')} L 600,180 Z`;

  return (
    <section
      id="engine"
      ref={sectionRef}
      className="relative min-h-[85vh] flex flex-col justify-center py-16 md:py-24 bg-zinc-950 text-zinc-100 overflow-hidden"
    >
      {/* Dark ambient background effects */}
      <div className="absolute inset-0 cyber-grid z-0" />
      <CodeRainBackground />
      <DarkParticles />

      {/* Neon scan line sweeping down */}
      <div className="neon-scan-line" />

      {/* Radial glow accent */}
      <motion.div
        className="pointer-events-none absolute z-0"
        style={{
          width: '600px',
          height: '600px',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 70%)',
        }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Dark scan overlay */}
      <div className="dark-scan-overlay" />

      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 md:px-12">
        {/* Header grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end mb-10">
          <motion.div
            className="lg:col-span-7"
            initial={{ opacity: 0, y: 40, filter: 'blur(8px)' }}
            animate={titleInView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.div
              className="text-[10px] font-normal text-zinc-500 tracking-widest uppercase mb-2 font-mono"
              initial={{ opacity: 0, x: -30 }}
              animate={titleInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              ML INFERENCE ENGINE
            </motion.div>
            <h2 className="text-2xl sm:text-[32px] font-light text-white tracking-tight leading-snug">
              <motion.span
                className="inline-block"
                initial={{ opacity: 0, x: -20 }}
                animate={titleInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.15 }}
              >
                Real-time anomaly{' '}
              </motion.span>
              <motion.span
                className="font-serif-italic italic text-zinc-400 font-light inline-block text-gradient-sweep-dark"
                initial={{ opacity: 0, scale: 0.85, rotateX: 25 }}
                animate={titleInView ? { opacity: 1, scale: 1, rotateX: 0 } : {}}
                transition={{ duration: 0.7, delay: 0.25, ease: [0.34, 1.56, 0.64, 1] }}
              >
                detection at scale
              </motion.span>
            </h2>
          </motion.div>

          {/* Cursive Editorial */}
          <motion.div
            className="lg:col-span-5"
            initial={{ opacity: 0, y: 40, filter: 'blur(8px)' }}
            animate={titleInView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
            transition={{ duration: 0.8, delay: 0.15 }}
          >
            <div className="flex items-center space-x-2 text-zinc-500 mb-1.5 font-mono text-[10px] font-normal uppercase tracking-wider">
              <motion.div
                animate={titleInView ? { rotate: [0, 360, 720] } : {}}
                transition={{ duration: 1.5, delay: 0.3, ease: 'easeOut' }}
              >
                <Cpu className="w-3.5 h-3.5" />
              </motion.div>
              <span>ISOLATIONFOREST ARCHITECTURE</span>
            </div>
            <p className="font-serif-italic italic text-zinc-400 text-[15px] sm:text-[16.5px] leading-relaxed font-light">
              &ldquo;Powered by scikit-learn IsolationForest with 100 estimators, our Python FastAPI microservice computes 23-dimensional vector anomalies at sub-200ms speeds without burdening user experience.&rdquo;
            </p>
          </motion.div>
        </div>

        {/* Engine visualization */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-4">
          {/* Waveform visualizer */}
          <motion.div
            className="lg:col-span-8 py-2 relative"
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={titleInView ? { opacity: 1, y: 0, scale: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {/* Neon border container */}
            <div className="relative rounded-xl border border-white/5 p-4" style={{ animation: 'neon-border-pulse 3s ease-in-out infinite' }}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-[10px] text-zinc-500 font-mono font-normal tracking-wider mb-0.5">
                    LIVE BEHAVIORAL STREAM
                  </div>
                  <div className="text-[15px] font-medium text-white">Session Telemetry Waveform</div>
                </div>
                <div className="flex items-center space-x-2">
                  <motion.div
                    className="w-2 h-2 rounded-full bg-emerald-400"
                    animate={{ scale: [1, 1.6, 1], opacity: [0.6, 1, 0.6], boxShadow: ['0 0 4px rgba(52,211,153,0.3)', '0 0 12px rgba(52,211,153,0.6)', '0 0 4px rgba(52,211,153,0.3)'] }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                  />
                  <span className="text-[10px] text-emerald-400/80 font-normal tracking-wider uppercase font-mono">STREAMING</span>
                </div>
              </div>

              {/* SVG Waveform */}
              <div className="h-[150px] w-full relative">
                <div className="dark-scan-overlay" />

                <svg viewBox="0 0 600 180" className="w-full h-full" preserveAspectRatio="none">
                  {[0, 45, 90, 135, 180].map((ly) => (
                    <line key={ly} x1="0" y1={ly} x2="600" y2={ly} stroke="rgba(255, 255, 255, 0.04)" strokeWidth="1" />
                  ))}

                  <motion.path
                    d={wavePathD}
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.6)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0 }}
                    animate={titleInView ? { pathLength: 1 } : {}}
                    transition={{ duration: 2, delay: 0.3, ease: 'easeOut' }}
                  />

                  <defs>
                    <linearGradient id="waveGradDark" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="rgba(255, 255, 255, 0.08)" />
                      <stop offset="100%" stopColor="rgba(255, 255, 255, 0)" />
                    </linearGradient>
                  </defs>
                  <motion.path
                    d={waveAreaD}
                    fill="url(#waveGradDark)"
                    initial={{ opacity: 0 }}
                    animate={titleInView ? { opacity: 1 } : {}}
                    transition={{ duration: 1, delay: 0.8 }}
                  />
                </svg>
              </div>

              {/* Bottom metrics */}
              <div className="grid grid-cols-4 gap-3 mt-4 pt-4 border-t border-white/5">
                {[
                  { label: 'Inference Latency', value: '147ms' },
                  { label: 'Estimators', value: '100' },
                  { label: 'Features/Tick', value: '23' },
                  { label: 'Contamination', value: '0.05' },
                ].map((m, i) => (
                  <motion.div
                    key={m.label}
                    initial={{ opacity: 0, y: 15 }}
                    animate={titleInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.4, delay: 0.5 + i * 0.1 }}
                  >
                    <div className="text-[9.5px] text-zinc-500 font-normal tracking-wider uppercase mb-0.5">{m.label}</div>
                    <div className="text-[14px] font-medium text-white font-mono tabular-nums">{m.value}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Stats stack */}
          <motion.div
            className="lg:col-span-4 grid grid-cols-2 lg:grid-cols-1 gap-4"
            initial={{ opacity: 0, x: 60 }}
            animate={titleInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            {[
              { label: 'Sessions Analyzed', value: 147293, suffix: '' },
              { label: 'Threats Blocked', value: 2841, suffix: '' },
              { label: 'Avg Trust Score', value: 97, suffix: '.4%' },
              { label: 'False Positive Rate', value: 0, suffix: '.02%' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                className="py-3 px-4 rounded-lg border border-white/5 relative overflow-hidden"
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={titleInView ? { opacity: 1, y: 0, scale: 1 } : {}}
                transition={{ duration: 0.5, delay: 0.35 + i * 0.1, ease: [0.34, 1.56, 0.64, 1] }}
                whileHover={{ borderColor: 'rgba(255,255,255,0.15)', transition: { duration: 0.2 } }}
              >
                {/* Subtle glow background on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/[0.02] to-transparent opacity-0 hover:opacity-100 transition-opacity" />
                <div className="text-[9.5px] font-normal text-zinc-500 uppercase tracking-wider mb-0.5 font-mono">{stat.label}</div>
                <div className="text-xl font-medium text-white tabular-nums relative">
                  <AnimatedNumber value={stat.value} delay={0.5 + i * 0.15} />
                  <span className="text-zinc-500 font-light">{stat.suffix}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
