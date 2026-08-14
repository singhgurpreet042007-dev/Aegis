'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';

interface FullPageControllerProps {
  sections: React.ReactNode[];
}

const SECTION_ANIMATIONS = [
  // 0 — Hero
  {
    enter: { opacity: 1, scale: 1, filter: 'blur(0px)', y: 0, x: 0, rotateX: 0, rotateY: 0, clipPath: 'inset(0% 0% 0% 0%)' },
    exitUp: { opacity: 0, scale: 0.92, filter: 'blur(4px)', y: 60, x: 0, rotateX: 0, rotateY: 0, clipPath: 'inset(0% 0% 0% 0%)' },
    exitDown: { opacity: 0, scale: 1.05, filter: 'blur(3px)', y: -80, x: 0, rotateX: 0, rotateY: 0, clipPath: 'inset(0% 0% 0% 0%)' },
    transition: { duration: 0.75, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  },
  // 1 — Features
  {
    enter: { opacity: 1, scale: 1, filter: 'blur(0px)', y: 0, x: 0, rotateX: 0, rotateY: 0, clipPath: 'inset(0% 0% 0% 0%)' },
    exitUp: { opacity: 0, scale: 1, filter: 'blur(0px)', y: 80, x: -100, rotateX: 0, rotateY: 0, clipPath: 'inset(0% 0% 0% 0%)' },
    exitDown: { opacity: 0, scale: 1, filter: 'blur(0px)', y: 0, x: 120, rotateX: 0, rotateY: 6, clipPath: 'inset(0% 0% 0% 0%)' },
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
  // 2 — Engine
  {
    enter: { opacity: 1, scale: 1, filter: 'blur(0px)', y: 0, x: 0, rotateX: 0, rotateY: 0, clipPath: 'inset(0% 0% 0% 0%)' },
    exitUp: { opacity: 0, scale: 1, filter: 'blur(0px)', y: 40, x: 0, rotateX: 0, rotateY: 0, clipPath: 'inset(0% 0% 0% 0%)' },
    exitDown: { opacity: 1, scale: 1, filter: 'blur(0px)', y: 0, x: 0, rotateX: 0, rotateY: 0, clipPath: 'inset(50% 0% 50% 0%)' },
    transition: { duration: 0.78, ease: [0.65, 0, 0.35, 1] as [number, number, number, number] },
  },
  // 3 — SecurityLayers
  {
    enter: { opacity: 1, scale: 1, filter: 'blur(0px)', y: 0, x: 0, rotateX: 0, rotateY: 0, clipPath: 'inset(0% 0% 0% 0%)' },
    exitUp: { opacity: 0, scale: 0.98, filter: 'blur(2px)', y: 50, x: 0, rotateX: 0, rotateY: 0, clipPath: 'inset(0% 0% 0% 0%)' },
    exitDown: { opacity: 1, scale: 1, filter: 'blur(0px)', y: 0, x: 0, rotateX: 0, rotateY: 0, clipPath: 'inset(0% 100% 100% 0%)' },
    transition: { duration: 0.75, ease: [0.77, 0, 0.175, 1] as [number, number, number, number] },
  },
  // 4 — TechStack
  {
    enter: { opacity: 1, scale: 1, filter: 'blur(0px)', y: 0, x: 0, rotateX: 0, rotateY: 0, clipPath: 'inset(0% 0% 0% 0%)' },
    exitUp: { opacity: 0, scale: 1, filter: 'blur(0px)', y: 60, x: 0, rotateX: -12, rotateY: 0, clipPath: 'inset(0% 0% 0% 0%)' },
    exitDown: { opacity: 0, scale: 0.96, filter: 'blur(2px)', y: -30, x: 0, rotateX: 15, rotateY: 0, clipPath: 'inset(0% 0% 0% 0%)' },
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
  // 5 — CTASection (TEXT SCRUB PAGE)
  {
    enter: { opacity: 1, scale: 1, filter: 'blur(0px)', y: 0, x: 0, rotateX: 0, rotateY: 0, clipPath: 'inset(0% 0% 0% 0%)' },
    exitUp: { opacity: 0, scale: 1.08, filter: 'blur(4px)', y: 40, x: 0, rotateX: 0, rotateY: 0, clipPath: 'inset(0% 0% 0% 0%)' },
    exitDown: { opacity: 0, scale: 0.85, filter: 'blur(5px)', y: 0, x: 0, rotateX: 0, rotateY: 0, clipPath: 'inset(0% 0% 0% 0%)' },
    transition: { duration: 0.68, ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number] },
  },
  // 6 — FinalSection
  {
    enter: { opacity: 1, scale: 1, filter: 'blur(0px)', y: 0, x: 0, rotateX: 0, rotateY: 0, clipPath: 'inset(0% 0% 0% 0%)' },
    exitUp: { opacity: 0, scale: 1, filter: 'blur(0px)', y: 50, x: 0, rotateX: 0, rotateY: 0, clipPath: 'inset(0% 0% 0% 0%)' },
    exitDown: { opacity: 1, scale: 1, filter: 'blur(0px)', y: 0, x: 0, rotateX: 0, rotateY: 0, clipPath: 'inset(50% 0% 50% 0%)' },
    transition: { duration: 0.75, ease: [0.65, 0, 0.35, 1] as [number, number, number, number] },
  },
];

/** Section index 5 (CTASection) is the text-scrub pinned page */
const TEXT_SCRUB_SECTION = 5;

export function FullPageController({ sections }: FullPageControllerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<'down' | 'up'>('down');
  const isAnimatingRef = useRef(false);
  const touchStartYRef = useRef(0);

  // Smooth accumulated scroll progress for the text-scrub section (0.0 → 1.0)
  const [scrubProgress, setScrubProgress] = useState(0);

  const totalSections = sections.length;

  const goToSection = useCallback(
    (targetIndex: number, dir: 'down' | 'up') => {
      const clampedIndex = Math.max(0, Math.min(totalSections - 1, targetIndex));
      if (clampedIndex === currentIndex || isAnimatingRef.current) return;

      isAnimatingRef.current = true;
      setDirection(dir);
      setCurrentIndex(clampedIndex);

      // Reset scrub when entering or leaving the text-scrub section
      if (clampedIndex === TEXT_SCRUB_SECTION) {
        setScrubProgress(dir === 'down' ? 0 : 1);
      }

      setTimeout(() => {
        isAnimatingRef.current = false;
      }, 750);
    },
    [currentIndex, totalSections]
  );

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (isAnimatingRef.current) return;

      const threshold = 15;

      // ── TEXT SCRUB INTERCEPT for section 5 ──
      if (currentIndex === TEXT_SCRUB_SECTION) {
        if (e.deltaY > threshold) {
          // Scrolling DOWN → increase progress
          const newProgress = Math.min(1, scrubProgress + 0.06);
          if (newProgress >= 1) {
            setScrubProgress(1);
            // Small delay so user sees 100% before page flips
            setTimeout(() => goToSection(TEXT_SCRUB_SECTION + 1, 'down'), 200);
          } else {
            setScrubProgress(newProgress);
          }
          return;
        } else if (e.deltaY < -threshold) {
          // Scrolling UP → decrease progress
          const newProgress = Math.max(0, scrubProgress - 0.06);
          if (newProgress <= 0) {
            setScrubProgress(0);
            setTimeout(() => goToSection(TEXT_SCRUB_SECTION - 1, 'up'), 200);
          } else {
            setScrubProgress(newProgress);
          }
          return;
        }
      }

      // Standard section switching for all other pages
      if (e.deltaY > threshold) {
        goToSection(currentIndex + 1, 'down');
      } else if (e.deltaY < -threshold) {
        goToSection(currentIndex - 1, 'up');
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowDown', 'PageDown', ' '].includes(e.key)) {
        e.preventDefault();
        if (currentIndex === TEXT_SCRUB_SECTION && scrubProgress < 1) {
          setScrubProgress((p) => Math.min(1, p + 0.12));
          return;
        }
        goToSection(currentIndex + 1, 'down');
      } else if (['ArrowUp', 'PageUp'].includes(e.key)) {
        e.preventDefault();
        if (currentIndex === TEXT_SCRUB_SECTION && scrubProgress > 0) {
          setScrubProgress((p) => Math.max(0, p - 0.12));
          return;
        }
        goToSection(currentIndex - 1, 'up');
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      touchStartYRef.current = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (isAnimatingRef.current) return;
      const touchEndY = e.changedTouches[0].clientY;
      const diff = touchStartYRef.current - touchEndY;

      if (currentIndex === TEXT_SCRUB_SECTION) {
        if (diff > 40) {
          const newP = Math.min(1, scrubProgress + 0.15);
          if (newP >= 1) {
            setScrubProgress(1);
            setTimeout(() => goToSection(TEXT_SCRUB_SECTION + 1, 'down'), 200);
          } else {
            setScrubProgress(newP);
          }
          return;
        } else if (diff < -40) {
          const newP = Math.max(0, scrubProgress - 0.15);
          if (newP <= 0) {
            setScrubProgress(0);
            setTimeout(() => goToSection(TEXT_SCRUB_SECTION - 1, 'up'), 200);
          } else {
            setScrubProgress(newP);
          }
          return;
        }
      }

      if (diff > 40) {
        goToSection(currentIndex + 1, 'down');
      } else if (diff < -40) {
        goToSection(currentIndex - 1, 'up');
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [currentIndex, scrubProgress, goToSection]);

  return (
    <div
      className="relative w-full h-[calc(100vh-64px)] overflow-hidden bg-white"
      style={{ perspective: '1200px' }}
    >
      {sections.map((sectionNode, idx) => {
        const isCurrent = idx === currentIndex;
        const isPast = idx < currentIndex;

        const config = SECTION_ANIMATIONS[idx] || SECTION_ANIMATIONS[0];

        let targetVariant = 'enter';
        if (!isCurrent) {
          targetVariant = isPast ? 'exitUp' : 'exitDown';
        }

        // Inject scrubProgress into CTASection (index 5)
        const sectionProps = idx === TEXT_SCRUB_SECTION ? { scrubProgress } : {};
        const elementToRender = React.isValidElement(sectionNode)
          ? React.cloneElement(sectionNode as React.ReactElement<any>, sectionProps)
          : sectionNode;

        return (
          <motion.div
            key={idx}
            className="absolute inset-0 w-full h-full transform-gpu"
            initial={false}
            animate={targetVariant}
            variants={{
              enter: config.enter,
              exitUp: config.exitUp,
              exitDown: config.exitDown,
            }}
            transition={config.transition}
            style={{
              pointerEvents: isCurrent ? 'auto' : 'none',
              zIndex: isCurrent ? 20 : 10 - Math.abs(idx - currentIndex),
            }}
          >
            {elementToRender}
          </motion.div>
        );
      })}

      {/* Floating Section Navigation Dots */}
      <div className="fixed right-6 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center space-y-3">
        {sections.map((_, idx) => (
          <button
            key={idx}
            onClick={() => goToSection(idx, idx > currentIndex ? 'down' : 'up')}
            className="group relative p-1 focus:outline-none cursor-pointer"
            aria-label={`Go to section ${idx + 1}`}
          >
            <span
              className={`block rounded-full transition-all duration-500 ${
                idx === currentIndex
                  ? 'w-2.5 h-6 bg-zinc-900 shadow-md'
                  : 'w-2 h-2 bg-zinc-300 hover:bg-zinc-500'
              }`}
            />
            <span className="absolute right-7 top-1/2 -translate-y-1/2 px-2 py-0.5 rounded bg-zinc-900 text-white text-[10px] font-mono opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-sm">
              Section 0{idx + 1}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
