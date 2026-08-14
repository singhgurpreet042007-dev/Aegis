'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { ShieldCheck, Cpu, Zap, Activity, Lock, Layers, Sparkles } from 'lucide-react';

const capabilities = [
  {
    icon: Cpu,
    tag: 'AI THREAT DETECTION',
    title: 'IsolationForest Neural ML',
    desc: 'Scikit-learn IsolationForest algorithm evaluates 23-dimensional biometric feature vectors per tick to classify unauthorized session hijackers.',
  },
  {
    icon: Activity,
    tag: 'REAL-TIME TELEMETRY',
    title: 'Sub-147ms Stream Monitoring',
    desc: 'High-throughput stream processing captures keystroke cadence, cursor velocity, and micro-gestures continuously post-login.',
  },
  {
    icon: Zap,
    tag: 'INTELLIGENT DECISIONING',
    title: 'Dynamic Risk Decay Matrix',
    desc: 'Risk scores decay and adjust dynamically across user session timelines, eliminating static single-point authentication bottlenecks.',
  },
  {
    icon: Lock,
    tag: 'AUTOMATED RESPONSE',
    title: 'Adaptive Step-Up Verification',
    desc: 'Instant step-up OTP challenge dispatched via Nodemailer + Gmail when anomaly score crosses enterprise risk thresholds.',
  },
  {
    icon: ShieldCheck,
    tag: 'SECURITY INTELLIGENCE',
    title: 'Sentinel Web Scanner',
    desc: 'One-click automated security audits inspecting TLS certificates, DNS records, HTTP security headers, and cookie configurations.',
  },
  {
    icon: Layers,
    tag: 'MODERN ARCHITECTURE',
    title: 'Enterprise Zero-Trust Stack',
    desc: 'Engineered with Next.js 15 App Router, NestJS 10 modular guards, FastAPI microservices, and Neon PostgreSQL 16.',
  },
];

export function IntelligentSecurity() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const titleInView = useInView(sectionRef, { once: true, margin: '-100px' });

  return (
    <section id="intelligent-security" ref={sectionRef} className="relative min-h-[85vh] flex flex-col justify-center py-16 md:py-24 bg-white text-zinc-900 select-none">
      <div className="w-full max-w-[1400px] mx-auto px-6 md:px-12">
        {/* Header Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end mb-12">
          <motion.div
            className="lg:col-span-7"
            initial={{ opacity: 0, y: 15 }}
            animate={titleInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="text-[10px] font-mono text-zinc-400 tracking-widest uppercase mb-2">
              INTELLIGENT SECURITY CAPABILITIES
            </div>
            <h2 className="text-2xl sm:text-[34px] font-light text-zinc-900 tracking-tight leading-snug">
              Built for{' '}
              <span className="font-serif-italic italic text-zinc-700 font-light underline decoration-zinc-200 underline-offset-4">
                intelligent security
              </span>
            </h2>
          </motion.div>

          {/* Cursive Editorial Quote */}
          <motion.div
            className="lg:col-span-5"
            initial={{ opacity: 0, y: 15 }}
            animate={titleInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <div className="flex items-center space-x-2 text-zinc-400 mb-1.5 font-mono text-[10px] uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-zinc-500" />
              <span>SECURITY ARCHITECTURE</span>
            </div>
            <p className="font-serif-italic italic text-zinc-600 text-[15.5px] sm:text-[17px] leading-relaxed font-light">
              &ldquo;Aegis AI merges neural anomaly detection with continuous telemetry streaming, providing intelligent zero-trust protection with zero user friction.&rdquo;
            </p>
          </motion.div>
        </div>

        {/* 6 Capabilities Grid — Pure Floating Text & Icons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-8 pt-2">
          {capabilities.map((item, idx) => {
            const ColRef = () => {
              const itemRef = useRef<HTMLDivElement>(null);
              const itemInView = useInView(itemRef, { once: true, margin: '-60px' });

              return (
                <motion.div
                  ref={itemRef}
                  initial={{ opacity: 0, y: 15 }}
                  animate={itemInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: idx * 0.07, ease: [0.16, 1, 0.3, 1] }}
                  className="space-y-1.5"
                >
                  <div className="flex items-center space-x-2 text-[10px] font-mono text-zinc-400 tracking-wider uppercase">
                    <item.icon className="w-3.5 h-3.5 text-zinc-600" />
                    <span>{item.tag}</span>
                  </div>

                  <h3 className="font-serif-italic italic text-zinc-800 text-[18px] font-normal leading-snug">
                    {item.title}
                  </h3>

                  <p className="text-[12.5px] text-zinc-500 font-light leading-relaxed">
                    {item.desc}
                  </p>
                </motion.div>
              );
            };

            return <ColRef key={idx} />;
          })}
        </div>
      </div>
    </section>
  );
}
