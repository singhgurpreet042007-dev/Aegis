'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { ShieldCheck, Cpu, Zap, Activity, Lock, Layers, Sparkles, Github } from 'lucide-react';

const capabilities = [
  {
    icon: Cpu,
    tag: 'AI THREAT DETECTION',
    title: 'IsolationForest Neural ML',
    desc: 'Scikit-learn IsolationForest algorithm evaluates 23-dimensional biometric feature vectors per tick.',
  },
  {
    icon: Activity,
    tag: 'REAL-TIME TELEMETRY',
    title: 'Sub-147ms Stream Monitoring',
    desc: 'High-throughput stream processing captures keystroke cadence, cursor velocity, and micro-gestures.',
  },
  {
    icon: Zap,
    tag: 'INTELLIGENT DECISIONING',
    title: 'Dynamic Risk Decay Matrix',
    desc: 'Risk scores decay dynamically across user timelines, eliminating static authentication bottlenecks.',
  },
  {
    icon: Lock,
    tag: 'AUTOMATED RESPONSE',
    title: 'Adaptive Step-Up Verification',
    desc: 'Instant step-up OTP challenge dispatched via Nodemailer + Gmail when anomaly score crosses thresholds.',
  },
  {
    icon: ShieldCheck,
    tag: 'SECURITY INTELLIGENCE',
    title: 'Sentinel Web Scanner',
    desc: 'One-click automated security audits inspecting TLS certificates, DNS records, and security headers.',
  },
  {
    icon: Layers,
    tag: 'MODERN ARCHITECTURE',
    title: 'Enterprise Zero-Trust Stack',
    desc: 'Engineered with Next.js 15 App Router, NestJS 10 modular guards, FastAPI, and Neon PostgreSQL.',
  },
];

export function FinalSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const titleInView = useInView(sectionRef, { once: true, margin: '-80px' });

  return (
    <section id="final-section" ref={sectionRef} className="relative min-h-[85vh] flex flex-col justify-between py-8 md:py-12 bg-white text-zinc-900 select-none">
      {/* Top Part: Intelligent Security Content */}
      <div className="w-full max-w-[1400px] mx-auto px-6 md:px-12 my-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end mb-6">
          <motion.div
            className="lg:col-span-7"
            initial={{ opacity: 0, y: 25, filter: 'blur(4px)' }}
            animate={titleInView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="text-[10px] font-mono text-zinc-400 tracking-widest uppercase mb-1.5">
              INTELLIGENT SECURITY CAPABILITIES
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-light text-zinc-900 tracking-tight leading-snug">
              Built for{' '}
              <motion.span
                className="font-serif-italic italic text-zinc-700 font-light underline decoration-zinc-200 underline-offset-4 inline-block text-gradient-sweep"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={titleInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.6, delay: 0.15 }}
              >
                intelligent security
              </motion.span>
            </h2>
          </motion.div>

          <motion.div
            className="lg:col-span-5"
            initial={{ opacity: 0, y: 25, filter: 'blur(4px)' }}
            animate={titleInView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
            transition={{ duration: 0.7, delay: 0.15 }}
          >
            <div className="flex items-center space-x-2 text-zinc-400 mb-1 font-mono text-[10px] uppercase tracking-wider">
              <motion.div
                animate={titleInView ? { rotate: 360 } : {}}
                transition={{ duration: 1.5, delay: 0.3, ease: 'easeOut' }}
              >
                <Sparkles className="w-3.5 h-3.5 text-zinc-500" />
              </motion.div>
              <span>SECURITY ARCHITECTURE</span>
            </div>
            <p className="font-serif-italic italic text-zinc-600 text-[14.5px] sm:text-[15.5px] leading-relaxed font-light">
              &ldquo;Aegis AI merges neural anomaly detection with continuous telemetry streaming, providing intelligent zero-trust protection with zero user friction.&rdquo;
            </p>
          </motion.div>
        </div>

        {/* 6 Capabilities Grid — grid-wave pop-in pattern */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-10 gap-y-5 mb-6">
          {capabilities.map((item, idx) => {
            // Grid-wave: items pop in from center outward
            const row = Math.floor(idx / 3);
            const col = idx % 3;
            const waveDelay = 0.2 + (row * 0.12) + (Math.abs(col - 1) * 0.08);

            return (
              <motion.div
                key={idx}
                className="space-y-1 group cursor-default"
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={titleInView ? { opacity: 1, scale: 1, y: 0 } : {}}
                transition={{
                  duration: 0.5,
                  delay: waveDelay,
                  ease: [0.34, 1.56, 0.64, 1], // spring pop
                }}
                whileHover={{ y: -3, transition: { duration: 0.2 } }}
              >
                <div className="flex items-center space-x-1.5 text-[9.5px] font-mono text-zinc-400 tracking-wider uppercase">
                  <motion.div
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={titleInView ? { rotate: 0, opacity: 1 } : {}}
                    transition={{ duration: 0.4, delay: waveDelay + 0.1, ease: [0.34, 1.56, 0.64, 1] }}
                  >
                    <item.icon className="w-3 h-3 text-zinc-600 group-hover:text-zinc-900 transition-colors" />
                  </motion.div>
                  <span>{item.tag}</span>
                </div>
                <h3 className="font-serif-italic italic text-zinc-800 text-[16px] font-normal leading-snug group-hover:text-zinc-900 transition-colors">
                  {item.title}
                </h3>
                <p className="text-[12px] text-zinc-500 font-light leading-relaxed">
                  {item.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Bottom Part: Footer Content — slides up with parallax offset */}
      <motion.div
        className="w-full max-w-[1400px] mx-auto px-6 md:px-12 pt-4"
        initial={{ opacity: 0, y: 40 }}
        animate={titleInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-4">
          <motion.div
            className="md:col-span-4 space-y-2"
            initial={{ opacity: 0, x: -20 }}
            animate={titleInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.65 }}
          >
            <div className="flex items-center space-x-2.5">
              <div className="w-7 h-7 rounded-xl bg-zinc-900 flex items-center justify-center shadow-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-[15px] font-bold text-zinc-900 tracking-tight font-sans">
                Aegis<span className="text-zinc-400 font-medium ml-0.5">AI</span>
              </span>
            </div>
            <p className="font-serif-italic italic text-zinc-600 text-[13.5px] leading-relaxed font-light">
              &ldquo;Pioneering post-login behavioral biometrics and continuous zero-trust identity verification.&rdquo;
            </p>
          </motion.div>

          <motion.div
            className="md:col-span-2"
            initial={{ opacity: 0, y: 15 }}
            animate={titleInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <h4 className="font-serif-italic italic text-zinc-900 text-[15px] font-normal mb-1.5">Platform</h4>
            <ul className="space-y-1 text-[12px] text-zinc-600 font-light">
              <li>AegisTracker SDK</li>
              <li>IsolationForest ML</li>
              <li>Sentinel Scanner</li>
            </ul>
          </motion.div>

          <motion.div
            className="md:col-span-3"
            initial={{ opacity: 0, y: 15 }}
            animate={titleInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.75 }}
          >
            <h4 className="font-serif-italic italic text-zinc-900 text-[15px] font-normal mb-1.5">Architecture</h4>
            <ul className="space-y-1 text-[12px] text-zinc-600 font-light">
              <li>Next.js 15 App Router · React 19</li>
              <li>NestJS 10 Framework · Guards</li>
              <li>Python FastAPI · scikit-learn ML</li>
            </ul>
          </motion.div>

          <motion.div
            className="md:col-span-3"
            initial={{ opacity: 0, y: 15 }}
            animate={titleInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <h4 className="font-serif-italic italic text-zinc-900 text-[15px] font-normal mb-1.5">Resources</h4>
            <ul className="space-y-1 text-[12px] text-zinc-600 font-light">
              <li>Architecture Specification</li>
              <li>API Reference Documentation</li>
              <li className="flex items-center space-x-1">
                <Github className="w-3 h-3 text-zinc-500" />
                <span>GitHub Monorepo</span>
              </li>
            </ul>
          </motion.div>
        </div>

        <motion.div
          className="pt-2 flex flex-col md:flex-row items-center justify-between gap-2 text-[11px] text-zinc-400 font-mono"
          initial={{ opacity: 0 }}
          animate={titleInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.9 }}
        >
          <div>
            © 2026 Aegis AI. <span className="font-serif-italic italic text-zinc-800 font-normal">Continuous Zero-Trust Shield</span>. All rights reserved.
          </div>
          <div>AGPL-3.0 · SOC2 Ready · Sub-200ms ML</div>
        </motion.div>
      </motion.div>
    </section>
  );
}
