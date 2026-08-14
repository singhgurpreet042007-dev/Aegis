'use client';

import { useState, useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { LoadingScreen } from './LoadingScreen';
import { Navbar } from './Navbar';
import { Hero } from './Hero';
import { Features } from './Features';
import { Engine } from './Engine';
import { SecurityLayers } from './SecurityLayers';
import { TechStack } from './TechStack';
import { CTASection } from './CTASection';
import { FinalSection } from './FinalSection';
import { FullPageController } from './FullPageController';

interface LandingPageProps {
  onNavigate?: (path: string) => void;
}

export function LandingPage({ onNavigate }: LandingPageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isExitStarted, setIsExitStarted] = useState(false);

  // Force scroll position to top (0,0) on initial mount & disable browser scroll restoration
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.history.scrollRestoration = 'manual';
      window.scrollTo(0, 0);
    }
  }, []);

  const handleExitStart = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
    }
    setIsExitStarted(true);
  }, []);

  const handleLoadingComplete = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
    }
    setIsLoading(false);
  }, []);

  return (
    <div className="h-screen w-screen bg-white text-zinc-900 antialiased selection:bg-zinc-900 selection:text-white overflow-hidden relative">
      {/* Cinematic Loading Screen */}
      <AnimatePresence>
        {isLoading && (
          <LoadingScreen
            onExitStart={handleExitStart}
            onComplete={handleLoadingComplete}
          />
        )}
      </AnimatePresence>

      {/* Main Site (Rendered underneath, smoothly revealed as loading screen exits) */}
      <motion.div
        className="transform-gpu h-full w-full bg-white"
        initial={{ opacity: 0, scale: 1.03 }}
        animate={
          isExitStarted
            ? { opacity: 1, scale: 1 }
            : { opacity: 0, scale: 1.03 }
        }
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Fixed Navbar pinned to screen top */}
        <Navbar onNavigate={onNavigate} />

        {/* 100% Full-Width Edge-to-Edge Container — 7-Section Sequential Stack */}
        <div className="w-full pt-[64px] h-full bg-white">
          <FullPageController
            sections={[
              <Hero key="hero" onNavigate={onNavigate} />,
              <Features key="features" />,
              <Engine key="engine" />,
              <SecurityLayers key="security" />,
              <TechStack key="stack" />,
              <CTASection key="launch" />,
              <FinalSection key="final" />,
            ]}
          />
        </div>
      </motion.div>
    </div>
  );
}
