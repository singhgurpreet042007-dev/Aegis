'use client';

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';

interface CTASectionProps {
  scrubProgress?: number; // 0.0 to 1.0, injected by FullPageController
}

const SCRUB_TEXT =
  'Aegis AI operates quietly in the background, continuously analyzing post-login behavioral dynamics — keystroke cadence, cursor trajectory, and micro-gesture timing — to safeguard your enterprise applications with zero user friction and absolute continuous zero-trust protection for every session.';

const TAGS = ['AGPL-3.0 LICENSED', 'SELF-HOSTED', 'TYPESCRIPT FIRST', 'ZERO VENDOR LOCK-IN'];

export function CTASection({ scrubProgress = 0 }: CTASectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const words = SCRUB_TEXT.split(' ');
  const totalWords = words.length;

  // Tags appear after 80% of text is revealed
  const tagsVisible = scrubProgress >= 0.8;

  return (
    <section
      ref={ref}
      className="relative min-h-[85vh] flex flex-col justify-center py-16 md:py-24 bg-white text-zinc-900 select-none"
    >
      <div className="w-full max-w-[900px] mx-auto px-6 md:px-12 text-center space-y-10">
        {/* Shield icon */}
        <motion.div
          className="w-9 h-9 rounded-xl bg-zinc-900 flex items-center justify-center mx-auto shadow-xs relative"
          initial={{ y: -40, opacity: 0, scale: 0.5 }}
          animate={isInView ? { y: 0, opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.34, 1.56, 0.64, 1] }}
        >
          <ShieldCheck className="w-4 h-4 text-white" />
          <motion.div
            className="absolute inset-[-6px] rounded-xl border border-zinc-200"
            animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0, 0.4] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>

        {/* Small Label */}
        <motion.div
          className="text-[10px] font-mono text-zinc-400 tracking-widest uppercase"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          SCROLL TO REVEAL · DEPLOYMENT & PHILOSOPHY
        </motion.div>

        {/* ══ WORD-BY-WORD BLUR-TO-SHARP TEXT SCRUB ══ */}
        <p className="text-[22px] sm:text-[28px] md:text-[34px] leading-[1.45] tracking-tight font-extralight inline-flex flex-wrap justify-center gap-x-[0.35em] gap-y-1" style={{ fontFamily: "'Inter', 'SF Pro Display', system-ui, sans-serif" }}>
          {words.map((word, idx) => {
            const wordProgress = idx / totalWords;
            const isRevealed = scrubProgress > wordProgress;
            const wordOpacity = isRevealed ? 1 : 0.35;
            const wordBlur = isRevealed ? 0 : 4;
            const wordColor = isRevealed ? '#52525b' : '#d4d4d8';

            return (
              <motion.span
                key={idx}
                animate={{
                  opacity: wordOpacity,
                  filter: `blur(${wordBlur}px)`,
                  color: wordColor,
                }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="inline-block will-change-[filter,opacity]"
              >
                {word}
              </motion.span>
            );
          })}
        </p>

        {/* Tags — fade in after 80% text scrub */}
        <motion.div
          className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-zinc-400 font-mono tracking-wider"
          animate={{
            opacity: tagsVisible ? 1 : 0,
            y: tagsVisible ? 0 : 12,
            filter: tagsVisible ? 'blur(0px)' : 'blur(4px)',
          }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          {TAGS.map((tag, i) => (
            <React.Fragment key={tag}>
              {i > 0 && <span className="text-zinc-300">·</span>}
              <span>{tag}</span>
            </React.Fragment>
          ))}
        </motion.div>
      </div>

      {/* Subtle bottom progress line */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-zinc-100">
        <motion.div
          className="h-full bg-zinc-300 origin-left"
          animate={{ scaleX: scrubProgress }}
          transition={{ duration: 0.15, ease: 'linear' }}
        />
      </div>
    </section>
  );
}
