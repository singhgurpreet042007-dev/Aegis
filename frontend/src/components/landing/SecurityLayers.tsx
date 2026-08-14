'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Lock, Eye, FileSearch, Globe, KeyRound, ServerCrash, ShieldCheck } from 'lucide-react';

const layers = [
  { icon: Eye, label: 'Behavioral Capture', detail: 'Keystroke · Mouse · Scroll · Touch' },
  { icon: FileSearch, label: 'Feature Extraction', detail: '23 biometric vectors per tick' },
  { icon: Lock, label: 'IsolationForest Analysis', detail: '100 estimators · 0.05 contamination' },
  { icon: Globe, label: 'Sentinel Scanner', detail: 'TLS · DNS · Headers · Cookies' },
  { icon: KeyRound, label: 'Step-Up MFA', detail: 'Email OTP via Nodemailer + Gmail' },
  { icon: ServerCrash, label: 'Threat Containment', detail: 'Session lock · Audit trail · Alert' },
];

function LayerRow({ layer, index, isParentInView }: { layer: typeof layers[0]; index: number; isParentInView: boolean }) {
  const cardRef = useRef<HTMLDivElement>(null);

  return (
    <div className="flex items-stretch group/row">
      {/* Connecting vertical line segment */}
      <div className="relative w-8 shrink-0 flex flex-col items-center">
        {/* Top connector line */}
        {index > 0 && (
          <motion.div
            className="w-px flex-1 bg-zinc-200 origin-top"
            initial={{ scaleY: 0 }}
            animate={isParentInView ? { scaleY: 1 } : {}}
            transition={{ duration: 0.4, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
          />
        )}
        {/* Node dot with glow pulse */}
        <motion.div
          className="relative w-2.5 h-2.5 rounded-full bg-zinc-800 shrink-0 my-1 shadow-xs"
          initial={{ scale: 0, opacity: 0 }}
          animate={isParentInView ? { scale: 1, opacity: 1 } : {}}
          transition={{
            duration: 0.4,
            delay: index * 0.12 + 0.1,
            ease: [0.34, 1.56, 0.64, 1],
          }}
        >
          {/* Pulse ring */}
          <motion.div
            className="absolute inset-[-4px] rounded-full border border-zinc-300"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={isParentInView ? { scale: [0.8, 1.6, 0.8], opacity: [0, 0.5, 0] } : {}}
            transition={{
              duration: 2,
              delay: index * 0.12 + 0.3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </motion.div>
        {/* Bottom connector line */}
        {index < layers.length - 1 && (
          <motion.div
            className="w-px flex-1 bg-zinc-200 origin-top"
            initial={{ scaleY: 0 }}
            animate={isParentInView ? { scaleY: 1 } : {}}
            transition={{ duration: 0.4, delay: index * 0.12 + 0.2, ease: [0.22, 1, 0.36, 1] }}
          />
        )}
      </div>

      {/* Layer content — slides from left with increasing stagger */}
      <motion.div
        ref={cardRef}
        initial={{ opacity: 0, x: -40, y: 8 }}
        animate={isParentInView ? { opacity: 1, x: 0, y: 0 } : {}}
        transition={{
          duration: 0.5,
          delay: index * 0.12 + 0.1,
          ease: [0.22, 1, 0.36, 1],
        }}
        whileHover={{ x: 6, transition: { duration: 0.2 } }}
        className="py-3 flex items-center space-x-4 flex-1 cursor-default group"
      >
        <div className="text-[11px] font-mono text-zinc-300 w-5 shrink-0 font-normal">
          {String(index + 1).padStart(2, '0')}
        </div>

        <motion.div
          initial={{ rotate: -90, opacity: 0 }}
          animate={isParentInView ? { rotate: 0, opacity: 1 } : {}}
          transition={{ duration: 0.4, delay: index * 0.12 + 0.2, ease: [0.34, 1.56, 0.64, 1] }}
        >
          <layer.icon className="w-3.5 h-3.5 text-zinc-600 shrink-0 group-hover:text-zinc-900 transition-colors" />
        </motion.div>

        <div className="min-w-0 flex-1">
          {/* Main Layer Name in Cursive Font */}
          <div className="font-serif-italic italic text-zinc-800 text-[17px] sm:text-[18px] font-normal leading-snug group-hover:text-zinc-900 transition-colors">
            {layer.label}
          </div>
          {/* Standard Sans Description below */}
          <div className="text-[12px] text-zinc-500 font-light truncate mt-0.5">
            {layer.detail}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export function SecurityLayers() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const titleInView = useInView(sectionRef, { once: true, margin: '-100px' });

  return (
    <section id="security" ref={sectionRef} className="relative min-h-[85vh] flex flex-col justify-center py-16 md:py-24 bg-white text-zinc-800">
      <div className="w-full max-w-[1400px] mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left: description & cursive paragraph */}
          <motion.div
            className="lg:col-span-5 lg:sticky lg:top-28"
            initial={{ opacity: 0, y: 25, filter: 'blur(3px)' }}
            animate={titleInView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.div
              className="text-[10px] font-normal text-zinc-400 tracking-widest uppercase mb-2 font-mono"
              initial={{ opacity: 0, x: -20 }}
              animate={titleInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              DEFENSE IN DEPTH
            </motion.div>
            <h2 className="text-2xl sm:text-[32px] font-light text-zinc-800 tracking-tight leading-snug mb-5">
              Six security layers{' '}
              <motion.span
                className="font-serif-italic italic text-zinc-600 font-light inline-block"
                initial={{ opacity: 0, rotateX: 20 }}
                animate={titleInView ? { opacity: 1, rotateX: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              >
                working in concert
              </motion.span>
            </h2>

            {/* Borderless Thinner Cursive Editorial Paragraph */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={titleInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="flex items-center space-x-2 text-zinc-400 mb-2 font-mono text-[10px] font-normal uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5 text-zinc-600" />
                <span>DEFENSE MATRIX</span>
              </div>
              <p className="font-serif-italic italic text-zinc-600 text-[15.5px] sm:text-[17px] leading-relaxed font-light">
                &ldquo;A multi-tiered defense matrix where telemetry ingestion, anomaly classification, and automated step-up OTP verification harmonize seamlessly to eliminate single points of security failure.&rdquo;
              </p>
            </motion.div>
          </motion.div>

          {/* Right: clean feature list rows with connecting line */}
          <div className="lg:col-span-7">
            {layers.map((layer, i) => (
              <LayerRow
                key={i}
                layer={layer}
                index={i}
                isParentInView={titleInView}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
