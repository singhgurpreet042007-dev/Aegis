'use client';

import { useRef, useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useMotionValue, AnimatePresence } from 'framer-motion';
import { ArrowRight, Activity, Cpu, Lock, Sparkles } from 'lucide-react';

interface HeroProps {
  onNavigate?: (path: string) => void;
}

const DYNAMIC_TAGLINES = [
  { icon: Activity, text: 'KEYSTROKE & MOUSE DYNAMICS' },
  { icon: Cpu, text: 'NEURAL ISOLATIONFOREST ENGINE' },
  { icon: Lock, text: 'POST-LOGIN ZERO TRUST BIOMETRICS' },
];

// Deterministic pseudo-random helper (rounded to 2 decimal places to prevent float serialization SSR mismatch)
function pseudoRandom(seed: number) {
  const x = Math.sin(seed * 9999) * 10000;
  const raw = x - Math.floor(x);
  return Math.round(raw * 100) / 100;
}

/** Floating particle background — generates deterministic dot positions to prevent SSR mismatch */
function FloatingParticles() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const particles = useMemo(
    () =>
      Array.from({ length: 24 }, (_, i) => ({
        id: i,
        x: Math.round(pseudoRandom((i + 1) * 1.1) * 10000) / 100,
        y: Math.round(pseudoRandom((i + 1) * 2.3) * 10000) / 100,
        size: Math.round((1.5 + pseudoRandom((i + 1) * 3.7) * 2) * 100) / 100,
        delay: Math.round(pseudoRandom((i + 1) * 4.9) * 500) / 100,
        duration: Math.round((4 + pseudoRandom((i + 1) * 5.3) * 4) * 100) / 100,
      })),
    []
  );

  if (!isMounted) return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-zinc-300"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
          }}
          animate={{
            y: [0, -20, -40, -20, 0],
            x: [0, 8, -5, 10, 0],
            opacity: [0.15, 0.4, 0.25, 0.35, 0.15],
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

/** Staggered word reveal — splits text into words and animates each */
function StaggeredText({
  children,
  className,
  delay = 0,
}: {
  children: string;
  className?: string;
  delay?: number;
}) {
  const words = children.split(' ');
  return (
    <span className={className}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          className="inline-block mr-[0.3em]"
          initial={{ opacity: 0, y: 18, filter: 'blur(4px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{
            duration: 0.5,
            delay: delay + i * 0.06,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
}

export function Hero({ onNavigate }: HeroProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [taglineIndex, setTaglineIndex] = useState(0);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const [spotlightPos, setSpotlightPos] = useState({ x: 500, y: 300 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left - rect.width / 2);
    mouseY.set(e.clientY - rect.top - rect.height / 2);
    setSpotlightPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setTaglineIndex((prev) => (prev + 1) % DYNAMIC_TAGLINES.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  const handleCTA = () => {
    if (onNavigate) onNavigate('/login');
    else router.push('/login');
  };

  const CurrentIcon = DYNAMIC_TAGLINES[taglineIndex].icon;

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative min-h-[85vh] flex flex-col justify-center py-12 md:py-20 bg-white text-zinc-800 select-none"
    >
      {/* Floating Particle Background */}
      <FloatingParticles />

      {/* Particle Grid Pattern */}
      <div className="pointer-events-none absolute inset-0 particle-grid opacity-50 z-0" />

      {/* Dynamic Spotlight Beam */}
      <motion.div
        className="pointer-events-none absolute inset-0 z-0"
        animate={{ opacity: 0.35 }}
        transition={{ duration: 1.5 }}
        style={{
          background: `radial-gradient(700px circle at ${spotlightPos.x}px ${spotlightPos.y}px, rgba(0, 0, 0, 0.03), transparent 80%)`,
        }}
      />

      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column — Full-Screen Hero Layout */}
          <div className="lg:col-span-7">
            {/* Tagline Eyebrow with AnimatePresence */}
            <div className="h-6 mb-5 overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={taglineIndex}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="inline-flex items-center space-x-2 text-zinc-400 font-mono text-[10.5px] font-normal tracking-wider uppercase"
                >
                  <motion.div
                    className="w-1.5 h-1.5 rounded-full bg-zinc-400"
                    animate={{ scale: [1, 1.4, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                  <CurrentIcon className="w-3.5 h-3.5 text-zinc-400" />
                  <span>{DYNAMIC_TAGLINES[taglineIndex].text}</span>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Main Headline — Staggered Word Reveal */}
            <h1 className="text-3xl sm:text-4xl md:text-[42px] font-light leading-[1.24] tracking-tight text-zinc-900 mb-6">
              <StaggeredText delay={0.2}>
                Continuous behavioral identity verification for
              </StaggeredText>{' '}
              <motion.span
                className="font-serif-italic italic text-zinc-700 font-light underline decoration-zinc-200 underline-offset-4 inline-block"
                initial={{ opacity: 0, y: 20, rotateX: 20 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ duration: 0.7, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
              >
                the modern enterprise
              </motion.span>
            </h1>

            {/* Description with smooth entrance */}
            <motion.p
              className="text-base sm:text-[17px] text-zinc-500 font-light leading-relaxed max-w-xl mb-9"
              initial={{ opacity: 0, y: 14, filter: 'blur(3px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              Aegis AI monitors keystroke dynamics, mouse acceleration, and session telemetry
              in real-time — providing post-login zero-trust protection with zero user friction.
            </motion.p>

            {/* CTAs with glow ring + arrow animation */}
            <motion.div
              className="flex items-center space-x-8"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.65 }}
            >
              <button
                onClick={handleCTA}
                className="group relative text-zinc-900 font-semibold text-[14.5px] hover:text-zinc-600 transition-colors flex items-center space-x-2 cursor-pointer"
              >
                {/* Subtle glow behind CTA */}
                <div className="absolute -inset-3 rounded-xl bg-zinc-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative">Launch Dashboard</span>
                <motion.div
                  className="relative"
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <ArrowRight className="w-4 h-4 text-zinc-900 group-hover:text-zinc-600 transition-colors" />
                </motion.div>
              </button>

              <a
                href="#features"
                className="text-zinc-600 font-medium text-[14.5px] hover:text-zinc-900 transition-colors"
              >
                Explore Features
              </a>
            </motion.div>
          </div>

          {/* Right Column — Floating Cursive Editorial */}
          <div className="lg:col-span-5">
            <motion.div
              initial={{ opacity: 0, y: 25, rotateY: -8 }}
              animate={{ opacity: 1, y: 0, rotateY: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="py-4"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div className="flex items-center space-x-2 text-zinc-400 mb-3 font-mono text-[10.5px] font-normal uppercase tracking-wider">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                </motion.div>
                <span>OVERVIEW & PHILOSOPHY</span>
              </div>

              {/* Thinner Soft Cursive Editorial Paragraph */}
              <p className="font-serif-italic italic text-zinc-700 text-[18px] sm:text-[20px] leading-[1.65] mb-7 font-light">
                &ldquo;Aegis AI transforms post-login identity security by turning raw human interaction dynamics — keystroke cadence, cursor velocity, and micro-gestures — into a continuous, unhackable zero-trust behavioral shield.&rdquo;
              </p>

              <motion.div
                className="pt-4 flex items-center justify-between text-[11.5px] text-zinc-400 font-mono font-normal"
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ duration: 0.8, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
                style={{ transformOrigin: 'left' }}
              >
                <span>Real-Time Ingestion</span>
                <motion.span
                  className="text-zinc-700 font-medium"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  Sub-200ms Latency
                </motion.span>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
