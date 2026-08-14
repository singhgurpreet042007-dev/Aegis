'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LoadingScreenProps {
  onComplete: () => void;
  onExitStart?: () => void;
}

const TECH_STACK = [
  'PYTHON',
  'NEXT.JS',
  'RUST',
  'NEURAL MESH',
  'ZERO TRUST',
  'BIOMETRICS',
];

export function LoadingScreen({ onComplete, onExitStart }: LoadingScreenProps) {
  const [phase, setPhase] = useState<'enter' | 'assembled' | 'exit'>('enter');
  const onCompleteRef = useRef(onComplete);
  const onExitStartRef = useRef(onExitStart);

  useEffect(() => {
    onCompleteRef.current = onComplete;
    onExitStartRef.current = onExitStart;
  }, [onComplete, onExitStart]);

  useEffect(() => {
    const assembleTimer = setTimeout(() => {
      setPhase('assembled');
    }, 500);

    const exitTimer = setTimeout(() => {
      setPhase('exit');
      if (onExitStartRef.current) {
        onExitStartRef.current();
      }
    }, 1800);

    const completeTimer = setTimeout(() => {
      if (onCompleteRef.current) {
        onCompleteRef.current();
      }
    }, 2400);

    return () => {
      clearTimeout(assembleTimer);
      clearTimeout(exitTimer);
      clearTimeout(completeTimer);
    };
  }, []);

  const cornerSpring = {
    type: 'spring' as const,
    stiffness: 180,
    damping: 24,
    mass: 0.8,
  };

  return (
    <motion.div
      className="fixed inset-0 z-[200] flex items-center justify-center overflow-hidden bg-white text-zinc-900 select-none pointer-events-auto"
      initial={{ opacity: 1 }}
      animate={phase === 'exit' ? { opacity: 0 } : { opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* 4 CORNER TARGET BRACKETS */}
      <motion.div
        className="absolute top-6 left-6 text-[10px] font-mono text-zinc-400 tracking-widest pointer-events-none flex items-center space-x-1.5 z-10"
        animate={{ opacity: phase === 'exit' ? 0 : [0.4, 0.8, 0.6] }}
        transition={{ duration: 1.5 }}
      >
        <span className="text-zinc-600 font-bold">+</span>
        <span>SYS//01</span>
      </motion.div>
      <motion.div
        className="absolute top-6 right-6 text-[10px] font-mono text-zinc-400 tracking-widest pointer-events-none flex items-center space-x-1.5 z-10"
        animate={{ opacity: phase === 'exit' ? 0 : [0.4, 0.8, 0.6] }}
        transition={{ duration: 1.5 }}
      >
        <span>SYS//02</span>
        <span className="text-zinc-600 font-bold">+</span>
      </motion.div>
      <motion.div
        className="absolute bottom-6 left-6 text-[10px] font-mono text-zinc-400 tracking-widest pointer-events-none flex items-center space-x-1.5 z-10"
        animate={{ opacity: phase === 'exit' ? 0 : [0.4, 0.8, 0.6] }}
        transition={{ duration: 1.5 }}
      >
        <span className="text-zinc-600 font-bold">+</span>
        <span>ZERO_TRUST</span>
      </motion.div>
      <motion.div
        className="absolute bottom-6 right-6 text-[10px] font-mono text-zinc-400 tracking-widest pointer-events-none flex items-center space-x-1.5 z-10"
        animate={{ opacity: phase === 'exit' ? 0 : [0.4, 0.8, 0.6] }}
        transition={{ duration: 1.5 }}
      >
        <span>SECURE_MESH</span>
        <span className="text-zinc-600 font-bold">+</span>
      </motion.div>

      {/* SHOCKWAVE BURST WHEN 4 CORNERS SNAP INTO CENTER */}
      {phase === 'assembled' && (
        <motion.div
          className="absolute rounded-full border border-zinc-300 shadow-[0_0_40px_rgba(0,0,0,0.06)] pointer-events-none z-0"
          initial={{ width: 40, height: 40, opacity: 1, scale: 0.1 }}
          animate={{ width: 850, height: 850, opacity: 0, scale: 1.2 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        />
      )}

      {/* MAIN STAGE (4-CORNER CONVERGENCE + ORBITING TECH RING + WARP ZOOM EXIT) */}
      <motion.div
        className="relative flex items-center justify-center z-10 transform-gpu will-change-transform"
        animate={
          phase === 'exit'
            ? { scale: [1, 1.45, 2.6], opacity: [1, 0.9, 0] }
            : { scale: 1, opacity: 1 }
        }
        transition={{ duration: 0.52, ease: [0.76, 0, 0.24, 1] }}
      >
        {/* 3D ORBITING TECH STACK RING */}
        <AnimatePresence>
          {(phase === 'assembled' || phase === 'exit') && (
            <motion.div
              className="absolute w-[360px] h-[360px] md:w-[460px] md:h-[460px] pointer-events-none z-0 flex items-center justify-center transform-gpu"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1, rotate: 360 }}
              exit={{ opacity: 0, scale: 1.3 }}
              transition={{
                rotate: { duration: 10, repeat: Infinity, ease: 'linear' },
                opacity: { duration: 0.3 },
                scale: { duration: 0.3 },
              }}
            >
              {/* Outer Dashed Orbit Line */}
              <div className="absolute inset-0 rounded-full border border-dashed border-zinc-200" />

              {/* Orbiting Badges */}
              {TECH_STACK.map((tech, i) => {
                const angle = (i * 360) / TECH_STACK.length;
                const radius = 210;
                const x = radius * Math.cos((angle * Math.PI) / 180);
                const y = radius * Math.sin((angle * Math.PI) / 180);

                return (
                  <div
                    key={tech}
                    className="absolute"
                    style={{
                      transform: `translate3d(${x}px, ${y}px, 0)`,
                    }}
                  >
                    <motion.div
                      className="px-3 py-1 rounded-full bg-white border border-zinc-200 text-zinc-700 font-mono text-[10px] tracking-widest uppercase shadow-xs whitespace-nowrap transform-gpu"
                      animate={{ rotate: -360 }}
                      transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                    >
                      {tech}
                    </motion.div>
                  </div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* 4-CORNER CONVERGENCE AEGIS LOGO (FLIES IN FROM 4 CORNERS) */}
        <div
          className="relative flex items-baseline justify-center z-10 font-light uppercase tracking-[0.06em]"
          style={{
            fontSize: 'clamp(3.5rem, 11vw, 8rem)',
            fontFamily: "'Space Grotesk', 'Montserrat', 'Inter', sans-serif",
            fontWeight: 300,
          }}
        >
          {/* Letter 1: 'A' (Flies in from TOP-LEFT) */}
          <motion.span
            className="inline-block text-zinc-900 transform-gpu"
            initial={{ x: '-45vw', y: '-45vh', opacity: 0, rotate: -30 }}
            animate={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
            transition={cornerSpring}
          >
            A
          </motion.span>

          {/* Letter 2: 'E' (Flies in from TOP-RIGHT) */}
          <motion.span
            className="inline-block text-zinc-900 transform-gpu"
            initial={{ x: '45vw', y: '-45vh', opacity: 0, rotate: 30 }}
            animate={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
            transition={{ ...cornerSpring, delay: 0.04 }}
          >
            E
          </motion.span>

          {/* Letter 3: 'G' (CENTER ANCHOR) */}
          <motion.span
            className="inline-block text-zinc-900 font-normal transform-gpu"
            initial={{ scale: 1.5, opacity: 0 }}
            animate={{ scale: [1.5, 0.9, 1], opacity: 1 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            G
          </motion.span>

          {/* Letter 4: 'I' (Flies in from BOTTOM-LEFT) */}
          <motion.span
            className="inline-block text-zinc-900 transform-gpu"
            initial={{ x: '-45vw', y: '45vh', opacity: 0, rotate: -30 }}
            animate={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
            transition={{ ...cornerSpring, delay: 0.08 }}
          >
            I
          </motion.span>

          {/* Letter 5: 'S' (Flies in from BOTTOM-RIGHT) */}
          <motion.span
            className="inline-block text-zinc-900 transform-gpu"
            initial={{ x: '45vw', y: '45vh', opacity: 0, rotate: 30 }}
            animate={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
            transition={{ ...cornerSpring, delay: 0.12 }}
          >
            S
          </motion.span>

          <sup className="text-zinc-400 font-mono text-2xl tracking-normal font-bold ml-1.5 align-top inline-block">
            ©
          </sup>
        </div>
      </motion.div>
    </motion.div>
  );
}
