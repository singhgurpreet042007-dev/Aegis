'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

interface SectionTransitionWrapperProps {
  children: React.ReactNode;
  className?: string;
  isFirstSection?: boolean;
}

export function SectionTransitionWrapper({
  children,
  className = '',
  isFirstSection = false,
}: SectionTransitionWrapperProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'start center', 'end center', 'end start'],
  });

  // Smooth physics spring for scroll progress
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 26,
    mass: 0.5,
    restDelta: 0.001,
  });

  /**
   * For the first section (Hero), entry starts cleanly at 0px so it never jumps on initial load.
   * For subsequent sections, entry comes from -75px (ABOVE) down to 0px.
   */
  const entryY = isFirstSection ? 0 : -75;
  const rawY = useTransform(smoothProgress, [0, 0.35, 0.65, 1], [entryY, 0, 0, 75]);

  const entryOpacity = isFirstSection ? 1 : 0.25;
  const rawOpacity = useTransform(smoothProgress, [0, 0.28, 0.72, 1], [entryOpacity, 1, 1, 0.25]);

  const entryBlur = isFirstSection ? 0 : 5;
  const rawBlur = useTransform(smoothProgress, [0, 0.28, 0.72, 1], [entryBlur, 0, 0, 5]);

  const filter = useTransform(rawBlur, (v) => `blur(${v.toFixed(1)}px)`);

  return (
    <motion.div
      ref={containerRef}
      style={{
        y: rawY,
        opacity: rawOpacity,
        filter,
      }}
      className={`transform-gpu will-change-[transform,opacity,filter] ${className}`}
    >
      {children}
    </motion.div>
  );
}
