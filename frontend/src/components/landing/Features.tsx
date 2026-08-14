'use client';

import { useRef, useMemo, useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { Fingerprint, Activity, Cpu, Scan, ShieldAlert, Waves, BookOpen } from 'lucide-react';

// SSR-safe pseudo random helper
function pseudoRandom(seed: number) {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
}

const features = [
  {
    icon: Fingerprint,
    tag: '01',
    title: 'Behavioral Biometrics SDK',
    desc: 'Client-side AegisTracker captures keystroke dynamics, mouse trajectory, scroll velocity, and touch pressure — building a unique behavioral fingerprint per user session.',
  },
  {
    icon: Cpu,
    tag: '02',
    title: 'IsolationForest ML Engine',
    desc: 'FastAPI microservice runs scikit-learn IsolationForest with 100 estimators to detect behavioral anomalies in real-time with sub-200ms inference latency.',
  },
  {
    icon: Activity,
    tag: '03',
    title: 'Continuous Risk Scoring',
    desc: 'Every session is scored continuously — not once at login. Risk scores decay and update live, triggering adaptive step-up MFA when anomalies exceed thresholds.',
  },
  {
    icon: ShieldAlert,
    tag: '04',
    title: 'Adaptive Step-Up MFA',
    desc: 'When behavioral drift is detected, Aegis triggers email OTP verification via Nodemailer + Gmail. Legitimate users re-verify seamlessly. Attackers get blocked.',
  },
  {
    icon: Scan,
    tag: '05',
    title: 'Sentinel Web Scanner',
    desc: 'One-click domain security audit — TLS certificate inspection, DNS record analysis, security header checks, cookie audit, and attack surface mapping.',
  },
  {
    icon: Waves,
    tag: '06',
    title: 'SecOps Command Center',
    desc: 'Real-time dashboard with live session monitoring, threat map visualization, session replay, security alerts, policy rules engine, and executive reporting.',
  },
];

/** Floating glowing particles for dark Features section */
function FeatureParticles() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const particles = useMemo(() =>
    Array.from({ length: 16 }, (_, i) => ({
      id: i,
      x: Math.round(pseudoRandom((i + 1) * 2.3) * 10000) / 100,
      y: Math.round(pseudoRandom((i + 1) * 6.7) * 10000) / 100,
      size: Math.round((2 + pseudoRandom((i + 1) * 3.9) * 3) * 100) / 100,
      duration: Math.round((5 + pseudoRandom((i + 1) * 1.5) * 7) * 100) / 100,
      delay: Math.round(pseudoRandom((i + 1) * 4.3) * 400) / 100,
    })),
    []
  );

  if (!isMounted) return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-white/20"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            boxShadow: '0 0 8px rgba(255, 255, 255, 0.25)',
          }}
          animate={{
            y: [0, -30, 15, -25, 0],
            x: [0, 10, -12, 6, 0],
            opacity: [0.1, 0.5, 0.2, 0.4, 0.1],
            scale: [1, 1.3, 0.9, 1.2, 1],
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

function FeatureItem({ feature, index }: { feature: typeof features[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });

  // Alternate slide direction: even from left, odd from right
  const slideDirection = index % 2 === 0 ? -60 : 60;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: slideDirection, y: 20, filter: 'blur(4px)' }}
      animate={isInView ? { opacity: 1, x: 0, y: 0, filter: 'blur(0px)' } : {}}
      transition={{
        duration: 0.6,
        delay: index * 0.08,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{
        y: -4,
        scale: 1.01,
        transition: { duration: 0.2 },
      }}
      className="p-5 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.06] hover:border-white/20 transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.4)] hover:shadow-[0_0_25px_rgba(255,255,255,0.08)] group cursor-default relative overflow-hidden"
    >
      {/* Subtle scan sweep on card hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent -translate-x-full group-hover:animate-[scan-line_1.5s_ease-in-out_infinite] pointer-events-none" />

      <div className="flex items-center space-x-3 mb-2">
        <div className="text-[10px] font-medium text-zinc-500 font-mono tracking-wider">
          {feature.tag}
        </div>
        {/* Icon with spin entrance */}
        <motion.div
          initial={{ rotate: -180, scale: 0.5, opacity: 0 }}
          animate={isInView ? { rotate: 0, scale: 1, opacity: 1 } : {}}
          transition={{
            duration: 0.5,
            delay: index * 0.08 + 0.15,
            ease: [0.34, 1.56, 0.64, 1],
          }}
          className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-white/30 group-hover:bg-white/10 transition-all"
        >
          <feature.icon className="w-3.5 h-3.5 text-zinc-300 group-hover:text-white group-hover:scale-110 transition-all duration-300" />
        </motion.div>
        <h3 className="font-serif-italic italic text-white text-[17.5px] sm:text-[19px] font-normal leading-snug group-hover:text-white transition-colors">
          {feature.title}
        </h3>
      </div>

      <motion.p
        className="text-[13px] text-zinc-400 leading-relaxed font-light mt-1"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.4, delay: index * 0.08 + 0.25 }}
      >
        {feature.desc}
      </motion.p>
    </motion.div>
  );
}

export function Features() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const titleInView = useInView(sectionRef, { once: true, margin: '-100px' });

  return (
    <section
      id="features"
      ref={sectionRef}
      className="relative min-h-[85vh] flex flex-col justify-center py-16 md:py-24 bg-zinc-950 text-zinc-100 overflow-hidden"
    >
      {/* Dark ambient background effects */}
      <div className="absolute inset-0 cyber-grid z-0" />
      <FeatureParticles />

      {/* Neon scan line sweeping down */}
      <div className="neon-scan-line" />

      {/* Radial ambient glow */}
      <motion.div
        className="pointer-events-none absolute z-0"
        style={{
          width: '650px',
          height: '650px',
          left: '10%',
          top: '40%',
          transform: 'translate(0, -50%)',
          background: 'radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 70%)',
        }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.45, 0.2] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 md:px-12">
        {/* Section header grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end mb-10">
          <motion.div
            className="lg:col-span-7"
            initial={{ opacity: 0, x: -40, filter: 'blur(6px)' }}
            animate={titleInView ? { opacity: 1, x: 0, filter: 'blur(0px)' } : {}}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div
              className="text-[10px] font-normal text-zinc-500 tracking-widest uppercase mb-2 font-mono"
              initial={{ opacity: 0, y: 10 }}
              animate={titleInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              CORE CAPABILITIES
            </motion.div>
            <h2 className="text-2xl sm:text-[32px] font-light text-white tracking-tight leading-snug">
              Six layers of{' '}
              <motion.span
                className="font-serif-italic italic text-zinc-400 font-light inline-block text-gradient-sweep-dark"
                initial={{ opacity: 0, y: 12, rotateX: 20 }}
                animate={titleInView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              >
                intelligent protection
              </motion.span>
            </h2>
          </motion.div>

          {/* Borderless Thinner Cursive Editorial Paragraph */}
          <motion.div
            className="lg:col-span-5"
            initial={{ opacity: 0, x: 40, filter: 'blur(6px)' }}
            animate={titleInView ? { opacity: 1, x: 0, filter: 'blur(0px)' } : {}}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="p-4 rounded-xl border border-white/5 bg-white/[0.02] backdrop-blur-xs">
              <div className="flex items-center space-x-2 text-zinc-400 mb-1.5 font-mono text-[10px] font-normal uppercase tracking-wider">
                <BookOpen className="w-3.5 h-3.5 text-white" />
                <span>CAPABILITIES SUMMARY</span>
              </div>
              <p className="font-serif-italic italic text-zinc-400 text-[15px] sm:text-[16.5px] leading-relaxed font-light">
                &ldquo;Every user leaves an invisible behavioral footprint. Our six core architectural layers capture, vectorize, and evaluate these micro-patterns in real time — stopping account takeovers before damage occurs.&rdquo;
              </p>
            </div>
          </motion.div>
        </div>

        {/* Feature list grid — waterfall cascade with dark glass cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
          {features.map((feature, i) => (
            <FeatureItem key={feature.tag} feature={feature} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
