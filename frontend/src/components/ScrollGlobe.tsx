'use client';

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { Globe } from '@/components/ui/globe';
import { TextRotate } from '@/components/ui/text-rotate';
import { CircularCarousel, CarouselItem } from '@/components/ui/circular-carousel';
import { FooterSection } from '@/components/ui/footer-section';
import { cn } from '@/lib/utils';
import {
  ShieldCheck,
  Activity,
  Zap,
  Lock,
  Cpu,
  ArrowRight,
  Keyboard,
  BarChart3,
  ShieldAlert,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  Terminal,
  Globe as GlobeIcon,
  Layers,
  Server,
  Code2,
} from 'lucide-react';

export interface SectionData {
  id: string;
  badge?: string;
  title: string;
  rotateTexts?: string[];
  description: string;
  align?: 'left' | 'center' | 'right';
  features?: { title: string; description: string }[];
  actions?: { label: string; variant: 'primary' | 'secondary'; onClick?: () => void }[];
  customCard?: 'biometrics' | 'risk-engine' | 'intruder' | 'carousel' | 'command-center';
}

export interface GlobePosition {
  top: string;
  left: string;
  scale: number;
}

export interface ScrollGlobeProps {
  sections?: SectionData[];
  globeConfig?: {
    positions: GlobePosition[];
  };
  className?: string;
  onEnterDashboard?: () => void;
}

// Globe Position Sequence (Top Right Hero position matching unitedcarriers.jpg design)
const defaultGlobeConfig = {
  positions: [
    { top: "30%", left: "75%", scale: 1.4 },  // Hero: Top right exactly like unitedcarriers.jpg!
    { top: "50%", left: "20%", scale: 1.2 },  // Section 2: Left aligned
    { top: "55%", left: "80%", scale: 1.3 },  // Section 3: Right aligned
    { top: "48%", left: "22%", scale: 1.25 }, // Section 4: Left aligned
    { top: "52%", left: "78%", scale: 1.35 }, // Section 5: Right aligned
    { top: "40%", left: "50%", scale: 1.15 }, // Section 6: Center stage
  ],
};

const carouselFeatureItems: CarouselItem[] = [
  {
    id: "feat-1",
    title: "Sentinel Website Security Scanner",
    description: "Connect any web domain in seconds, verify TLS 1.3 certificates, monitor 99% health, and copy embeddable client tracking SDK scripts.",
    tag: "SENTINEL / WEB SCANNER",
  },
  {
    id: "feat-2",
    title: "Real Email OTP Verification",
    description: "Integrated Gmail SMTP & Resend API delivering 6-digit verification pins directly to inbox with emergency master OTP fallback.",
    tag: "EMAIL OTP / AUTH",
  },
  {
    id: "feat-3",
    title: "Cloud PostgreSQL 16 & Neon",
    description: "Enterprise PostgreSQL database with Prisma ORM storing persistent users, biometrics baselines, session telemetry & audit logs.",
    tag: "POSTGRESQL / PRISMA",
  },
  {
    id: "feat-4",
    title: "AegisTracker Client SDK",
    description: "TypeScript client SDK capturing keydown/keyup dwell, flight variance, mouse velocity, jerk & curvature vectors every 3 seconds.",
    tag: "TYPESCRIPT / SDK",
  },
  {
    id: "feat-5",
    title: "IsolationForest & Explainable AI",
    description: "Python FastAPI microservice running 100-estimator IsolationForest ML model with human-readable SHAP factor impact attributions.",
    tag: "FASTAPI / SCIKIT-LEARN",
  },
  {
    id: "feat-6",
    title: "Socket.IO Threat Stream",
    description: "Bi-directional WebSocket streaming via NestJS EventsGateway broadcasting session risk score updates to SecOps in real time.",
    tag: "SOCKET.IO / NESTJS",
  },
];

// Carousel items for Section 5 (Intruder Defense)
const intruderCarouselItems: CarouselItem[] = [
  {
    id: "int-1",
    title: "Adaptive Step-Up MFA",
    description: "When overallRiskScore ≥ 0.70, BiometricsService sets mfaState to CHALLENGED, revokes active JWT tokens, and forces OTP verification.",
    tag: "ZERO-TRUST LOCKOUT",
  },
  {
    id: "int-2",
    title: "Bot Vector & Macro Detection",
    description: "Straightness > 0.90 triggers robotic mouse penalty (+0.50). Flight std < 4ms flags automated macro key injection (+0.30).",
    tag: "BOT DEFENSE",
  },
  {
    id: "int-3",
    title: "JWT & Redis Session Termination",
    description: "FastAPI risk score engine calls NestJS to instantly invalidate active Redis session tokens and block unauthorized API access.",
    tag: "NESTJS / REDIS",
  },
  {
    id: "int-4",
    title: "Behavioral Baseline Drift",
    description: "PostgreSQL BehavioralBaseline table tracks per-user dwell/flight/velocity means. Gaussian Z-score drift > 3.0σ flags session anomaly.",
    tag: "POSTGRESQL DB",
  },
  {
    id: "int-5",
    title: "Persistent Security Audit Logs",
    description: "Every security threat, step-up challenge, and IP geolocation ping is recorded in persistent PostgreSQL audit log tables.",
    tag: "AUDIT TRAIL",
  },
];

// Carousel items for Section 6 (Command Center)
const commandCenterCarouselItems: CarouselItem[] = [
  {
    id: "cmd-1",
    title: "Next.js 15 Command Center",
    description: "React 19 admin dashboard featuring RiskGauge, LiveSessionMonitor, Sentinel Website Manager, and ExplainableAIView components.",
    tag: "NEXT.JS 15 / REACT 19",
  },
  {
    id: "cmd-2",
    title: "Forensic Session Replay",
    description: "SessionReplayView component renders telemetry event timelines with mouse trajectory playback for SecOps investigation.",
    tag: "SESSION REPLAY",
  },
  {
    id: "cmd-3",
    title: "COBE 3D Threat Globe Map",
    description: "Interactive 3D Earth visualization plotting session IP geolocations with real-time anomaly marker overlays and threat feeds.",
    tag: "COBE 3D GLOBE",
  },
  {
    id: "cmd-4",
    title: "Live Attack Simulator",
    description: "IntruderSimulatorView tests defense readiness against Bot Attacks, Session Hijacking, and Credential Stuffing scenarios.",
    tag: "ATTACK SIMULATOR",
  },
  {
    id: "cmd-5",
    title: "Sentinel Website Manager",
    description: "Manage connected domains, inspect SSL/TLS certificates, copy embeddable client tracking scripts, and view site health metrics.",
    tag: "SENTINEL MANAGER",
  },
];

const defaultSections: SectionData[] = [
  {
    id: "hero",
    badge: "Zero-Trust Behavioral Identity & Cloud PostgreSQL Engine",
    title: "EVERY SESSION OF THE JOURNEY.",
    rotateTexts: [
      "POST-LOGIN ZERO TRUST BIOMETRICS.",
      "REAL GMAIL & RESEND EMAIL OTP AUTH.",
      "ISOLATIONFOREST ML ANOMALY DETECTION.",
      "ADAPTIVE STEP-UP MFA & TOKEN REVOCATION.",
      "CLOUD POSTGRESQL 16 & SENTINEL SCANNER.",
    ],
    description:
      "Continuous post-login authentication that passively vectorizes keystroke dynamics, mouse trajectory curvature, and device telemetry — scoring sessions in real time via scikit-learn IsolationForest & Gaussian Z-score models with persistent Cloud PostgreSQL storage.",
    align: "left",
    features: [
      { title: "Passive Continuous Auth", description: "AegisTracker SDK captures key dwell, flight time, mouse velocity & curvature every 3 seconds." },
      { title: "Cloud PostgreSQL 16 & Neon", description: "Persistent database storage for users, session telemetry, biometrics baselines & audit trails." },
      { title: "Real Email OTP Verification", description: "Gmail SMTP & Resend API integration with 6-digit email pins and self-reset flow." },
      { title: "Sentinel Web Scanner", description: "One-click domain security connection with embeddable tracking SDK scripts for any website." },
    ],
    actions: [
      { label: "Launch Command Center", variant: "primary" },
      { label: "Explore Architecture", variant: "secondary" },
    ],
  },
  {
    id: "biometrics",
    badge: "AegisTracker Client SDK & Sensor Vectoring",
    title: "WE MONITOR SESSIONS. WE OWN THE OUTCOME.",
    rotateTexts: [
      "Key Dwell & Flight Time Variance.",
      "Mouse Velocity, Acceleration & Jerk.",
      "Straightness Index & Linear Vectoring.",
      "Touch & Mobile Gesture Telemetry.",
    ],
    description:
      "The AegisTracker client class attaches non-intrusive event listeners to calculate dwell time means, flight time variances, mouse velocity, acceleration vectors, jerk, and straightness indices. Telemetry is streamed seamlessly to NestJS every 3 seconds via POST /api/v1/biometrics/ingest.",
    align: "right",
    customCard: "biometrics",
    features: [
      { title: "Micro-second Precision", description: "Measures keydown/keyup flight intervals and dwell durations with high-resolution timestamps." },
      { title: "Robotic Path Detection", description: "Detects synthetic linear mouse paths (straightness > 0.90) and fixed macro delays (< 4ms)." },
    ],
    actions: [
      { label: "Test Live Telemetry", variant: "primary" },
    ],
  },
  {
    id: "risk-engine",
    badge: "FastAPI ML Microservice & SHAP Attribution",
    title: "EVERYTHING YOUR ZERO-TRUST NEEDS. UNDER ONE SHIELD.",
    rotateTexts: [
      "100-Estimator IsolationForest ML.",
      "Explainable AI SHAP Attribution.",
      "Dynamic Risk Scoring (0.00 to 1.00).",
      "Real-Time Feature Impact Breakdown.",
    ],
    description:
      "Powered by Python FastAPI and scikit-learn, the BiometricRiskModel pre-fits an IsolationForest on human baselines. Risk scoring combines ML anomaly scores (30%), Gaussian Z-score dwell deviation (25%), and bot penalty modifiers. ExplainableAIEngine generates per-factor impact attribution for SecOps triage.",
    align: "left",
    customCard: "risk-engine",
    features: [
      { title: "Explainable AI Attribution", description: "Clear feature-level explanations showing why a session was flagged (mouse jerk, dwell drift)." },
      { title: "Dynamic Baseline Tuning", description: "Adapts to individual user habits while flagging anomalous deviations exceeding 3.0σ." },
    ],
    actions: [
      { label: "Simulate Anomaly", variant: "primary" },
    ],
  },
  {
    id: "features-carousel",
    badge: "Sentinel Web Protection & Platform Architecture",
    title: "RELIABILITY AT EVERY MILESTONE.",
    rotateTexts: [
      "One-Click Web Domain Connection.",
      "Embeddable Client Tracker Script.",
      "Real-Time Health & Latency Monitor.",
      "PostgreSQL 16 Persistent Store.",
    ],
    description:
      "Connect any web application or domain in seconds using the Aegis Sentinel Scanner. Copy the embeddable tracking `<script>` tag to capture biometrics, enforce email OTP authentication, and protect your entire web stack without changing backend code.",
    align: "left",
    customCard: "carousel",
    actions: [
      { label: "Test Intruder Defense", variant: "primary" },
    ],
  },
  {
    id: "intruder",
    badge: "Automated Zero-Trust Threat Mitigation",
    title: "SECURITY THAT WORKS AS HARD AS YOU DO.",
    rotateTexts: [
      "Automatic Risk Score Breaches ≥ 0.70.",
      "JWT Token & Redis Invalidation.",
      "Adaptive Step-Up MFA Challenge.",
      "Instant WebSockets Threat Alerts.",
    ],
    description:
      "When BiometricRiskModel returns overallRiskScore ≥ 0.70, NestJS automatically sets adaptiveMfaRequired: true, updates Prisma session status to CHALLENGED, revokes active JWT tokens, invalidates Redis sessions, and broadcasts a real-time alert via WebSockets to SecOps.",
    align: "right",
    customCard: "intruder",
    features: [
      { title: "Instant Session Lockout", description: "Revokes active JWT tokens and invalidates Redis session cache within a single request lifecycle." },
      { title: "Persistent Audit Trail", description: "Logs every security incident, threat map ping, and admin action directly to PostgreSQL database." },
    ],
    actions: [
      { label: "Test Bot Simulation", variant: "primary" },
    ],
  },
  {
    id: "command-center",
    badge: "Next.js 15 Command Center & Session Replay",
    title: "READY TO SECURE SMARTER?",
    rotateTexts: [
      "Live RiskGauge & Session Monitor.",
      "Interactive 3D COBE Threat Globe.",
      "Forensic Session Replay Playback.",
      "Attack Scenario Simulator View.",
    ],
    description:
      "The Next.js 15 dashboard equips security teams with a live RiskGauge score meter, active session table, 3D interactive Earth globe, telemetry timeline session replay, Sentinel website manager, and an attack simulator for testing defensive readiness.",
    align: "left",
    customCard: "command-center",
    features: [
      { title: "Forensic Session Replay", description: "Replays exact mouse trajectory paths and key stroke intervals for forensic investigation." },
      { title: "Live Attack Simulator", description: "Test system defense against Bot Attacks, Session Hijacking, and Credential Stuffing in real time." },
    ],
    actions: [
      { label: "Open Dashboard", variant: "primary" },
    ],
  },
];

export function ScrollGlobe({
  sections = defaultSections,
  globeConfig = defaultGlobeConfig,
  className,
  onEnterDashboard,
}: ScrollGlobeProps) {
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Hero Section Neon.tech Developer Code Terminal state
  const [heroTab, setHeroTab] = useState<'sdk' | 'db' | 'nestjs'>('sdk');
  const [copiedSnippet, setCopiedSnippet] = useState<boolean>(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const faqData = [
    {
      q: "What does AEGIS AI monitor during an active user session?",
      a: "AEGIS continuously monitors passive behavioral biometrics including keystroke dwell and flight time variations, mouse movement velocity, acceleration, jerk, straightness index, and device posture. No raw passwords or sensitive text inputs are ever recorded.",
    },
    {
      q: "How does the scikit-learn IsolationForest ML model detect anomalies?",
      a: "Our Python FastAPI microservice fits a 100-estimator IsolationForest on human baseline vector clusters. Anomalous behavior requires significantly fewer tree splits to isolate, generating a real-time risk score between 0.00 (nominal) and 1.00 (severe anomaly).",
    },
    {
      q: "What happens when session risk breaches the 0.70 threshold?",
      a: "NestJS automatically revokes active JWT access tokens, purges the Redis session cache, sets the database session state to CHALLENGED, forces a 6-digit Email OTP step-up challenge, and streams a real-time WebSocket alert to SecOps.",
    },
    {
      q: "Is AEGIS compatible with any frontend framework or web application?",
      a: "Yes. The Aegis Sentinel Scanner generates an embeddable 1-line client tracking SDK script script tag compatible with Next.js, React, Vue, Angular, or standard HTML web applications.",
    },
    {
      q: "Where is session telemetry and user data stored?",
      a: "All persistent data including user profiles, session telemetry logs, biometrics baseline metrics, and audit trails are stored securely in PostgreSQL 16 powered by Neon Cloud Database and Prisma ORM.",
    },
  ];

  // Biometrics Sandbox state with live real-time cursor/key sensor capture
  const [sampleDwell, setSampleDwell] = useState<number>(112);
  const [sampleFlight, setSampleFlight] = useState<number>(138);
  const [sampleStraightness, setSampleStraightness] = useState<number>(0.38);
  const [liveMouseVelocity, setLiveMouseVelocity] = useState<number>(420);
  const [isSimulatingBot, setIsSimulatingBot] = useState<boolean>(false);
  const lastMousePos = useRef<{ x: number; y: number; time: number } | null>(null);
  const lastKeyTime = useRef<number | null>(null);

  // Real-time live biometrics extractor capturing user's real cursor & key events on landing page!
  useEffect(() => {
    if (isSimulatingBot) return;

    const handleMouseMove = (e: MouseEvent) => {
      const now = performance.now();
      if (lastMousePos.current) {
        const dx = e.clientX - lastMousePos.current.x;
        const dy = e.clientY - lastMousePos.current.y;
        const dt = Math.max(1, now - lastMousePos.current.time);
        const dist = Math.sqrt(dx * dx + dy * dy);
        const velocity = Math.round((dist / dt) * 500);

        setLiveMouseVelocity(velocity);
        // Calculate dynamic curvature vs straightness index
        const straightness = parseFloat(Math.max(0.12, Math.min(0.85, dist / (Math.abs(dx) + Math.abs(dy) + 0.1))).toFixed(2));
        setSampleStraightness(straightness);
      }
      lastMousePos.current = { x: e.clientX, y: e.clientY, time: now };
    };

    const handleKeyDown = () => {
      const now = performance.now();
      if (lastKeyTime.current) {
        const flight = Math.round(Math.max(40, Math.min(320, now - lastKeyTime.current)));
        const dwell = Math.round(Math.max(30, Math.min(180, flight * 0.75)));
        setSampleFlight(flight);
        setSampleDwell(dwell);
      }
      lastKeyTime.current = now;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSimulatingBot]);

  // High-performance IntersectionObserver for smooth scrolling
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute('data-index'));
            if (!isNaN(index)) {
              setActiveSectionIndex(index);
            }
          }
        });
      },
      { threshold: 0.45 }
    );

    sectionRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  const currentPos = useMemo(() => {
    const safeIdx = Math.min(activeSectionIndex, globeConfig.positions.length - 1);
    return globeConfig.positions[safeIdx] || globeConfig.positions[0];
  }, [activeSectionIndex, globeConfig]);

  const scrollToSection = useCallback((index: number) => {
    const target = sectionRefs.current[index];
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  const toggleBotSimulation = () => {
    if (isSimulatingBot) {
      setSampleDwell(112);
      setSampleFlight(138);
      setSampleStraightness(0.38);
      setLiveMouseVelocity(420);
      setIsSimulatingBot(false);
    } else {
      setSampleDwell(10);
      setSampleFlight(5);
      setSampleStraightness(0.98);
      setLiveMouseVelocity(2800);
      setIsSimulatingBot(true);
    }
  };

  return (
    <div ref={containerRef} className={cn('relative w-full overflow-x-hidden bg-black font-sans text-white', className)}>
      {/* Background Interactive 3D Earth Globe Canvas */}
      <div
        className="fixed z-10 pointer-events-none transition-all duration-1000 ease-out"
        style={{
          transition: 'transform 1.2s cubic-bezier(0.22, 1, 0.36, 1)',
          transform: `translate3d(calc(${currentPos.left} - 50%), calc(${currentPos.top} - 50%), 0) scale(${currentPos.scale})`,
        }}
      >
        <div
          className="pointer-events-none w-[380px] h-[380px] md:w-[480px] md:h-[480px] opacity-90"
          style={{
            animation: 'subtleFloat 12s ease-in-out infinite',
            filter: 'drop-shadow(0 0 40px rgba(255, 255, 255, 0.15))',
          }}
        >
          <Globe className="w-full h-full" />
        </div>
      </div>

      {/* CSS keyframes for subtle Earth floating */}
      <style>{`
        @keyframes subtleFloat {
          0%, 100% { transform: translate3d(0, 0, 0) rotate(0deg); }
          25% { transform: translate3d(6px, -8px, 0) rotate(0.5deg); }
          50% { transform: translate3d(-4px, 5px, 0) rotate(-0.3deg); }
          75% { transform: translate3d(5px, 7px, 0) rotate(0.4deg); }
        }
      `}</style>

      {/* Fixed Header Bar (Pure Black & White Monochrome) */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-b border-zinc-800 px-6 py-3.5 transition-all shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div
            className="flex items-center space-x-2.5 cursor-pointer group"
            onClick={() => scrollToSection(0)}
          >
            <div className="w-9 h-9 rounded-xl bg-white text-black flex items-center justify-center shadow-md shadow-white/10 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-5 h-5 text-black" />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-white">
                AEGIS
              </span>
              <span className="ml-2 text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-zinc-800 text-white font-bold border border-zinc-700">
                Behavioral Biometrics Platform
              </span>
            </div>
          </div>

          {/* Navbar Navigation Items */}
          <nav className="hidden md:flex items-center space-x-3 text-xs font-bold text-zinc-400">
            {sections.map((sec, idx) => (
              <button
                key={sec.id}
                onClick={() => scrollToSection(idx)}
                className={cn(
                  'transition-all hover:text-white py-1 px-2.5 rounded-lg hover:bg-zinc-900',
                  activeSectionIndex === idx ? 'text-white font-black bg-zinc-800 border border-zinc-700' : ''
                )}
              >
                {sec.badge?.split(' ')[0] || `0${idx + 1}`}
              </button>
            ))}
          </nav>

          <div className="flex items-center space-x-3">
            <Link
              href="/login"
              className="px-3.5 py-2 rounded-xl text-zinc-300 hover:text-white font-bold text-xs hover:bg-zinc-900 border border-transparent transition-all"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="px-4 py-2 rounded-xl bg-white text-black hover:bg-zinc-200 font-bold text-xs shadow-md transition-all flex items-center space-x-1"
            >
              <span>Sign Up</span>
            </Link>
            <button
              onClick={onEnterDashboard}
              className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white font-bold text-xs shadow-md transition-all flex items-center space-x-1.5 group"
            >
              <span>Command Center</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </header>

      {/* Landing Page Sections (60fps Ultra-Smooth Single Scroll Layout) */}
      <div className="relative w-full">
        {sections.map((section, index) => {
          const isRightAligned = section.align === 'right';
          const isActive = activeSectionIndex === index;
          // Rhythmic Alternating Black & White Sections: Section 0 (Hero) = Black, Section 1 = White, Section 2 = Black, etc.
          const isDarkSection = index % 2 === 0;

          return (
            <div
              key={section.id}
              data-index={index}
              ref={(el) => {
                sectionRefs.current[index] = el;
              }}
              className={cn(
                "min-h-screen w-full flex items-center justify-center relative z-20 px-6 md:px-16 lg:px-24 py-16 border-b transition-colors duration-500",
                isDarkSection
                  ? "bg-black/95 text-white border-zinc-900 shadow-2xl"
                  : "bg-white/95 text-slate-900 border-slate-200/90 shadow-xs"
              )}
              style={{ willChange: 'transform' }}
            >
              {/* Section Grid Content Container */}
              <div
                className={cn(
                  "w-full my-auto transition-all duration-500 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
                )}
              >
                {/* Text Content Column */}
                <div
                  className={cn(
                    "transition-all duration-500",
                    isRightAligned
                      ? "lg:col-span-6 lg:order-2 text-left"
                      : "lg:col-span-6 text-left"
                  )}
                >
                  {/* Badge Pill */}
                  {section.badge && (
                    <div
                      className={cn(
                        "inline-flex items-center space-x-1.5 px-3.5 py-1 rounded-full text-xs font-bold mb-3 border shadow-xs transition-all",
                        isDarkSection
                          ? "bg-zinc-900 border-zinc-700 text-white"
                          : "bg-black border-black text-white"
                      )}
                    >
                      <Sparkles className={cn("w-3 h-3", isDarkSection ? "text-white" : "text-amber-300")} />
                      <span>{section.badge}</span>
                    </div>
                  )}

                  {/* Main Heading */}
                  <h1
                    className={cn(
                      "text-2xl md:text-3xl lg:text-4xl font-black tracking-tight leading-tight mb-2",
                      isDarkSection ? "text-white" : "text-slate-950"
                    )}
                  >
                    {section.title}
                  </h1>

                  {/* Rotating Subtitle */}
                  {section.rotateTexts && (
                    <div
                      className={cn(
                        "text-base md:text-lg font-semibold tracking-tight mb-4 h-8 flex items-center justify-start",
                        isDarkSection ? "text-zinc-300" : "text-slate-700"
                      )}
                    >
                      <TextRotate
                        texts={section.rotateTexts}
                        staggerFrom="first"
                        staggerDuration={0.015}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ type: "spring", damping: 28, stiffness: 350 }}
                        rotationInterval={3000}
                        splitBy="characters"
                        mainClassName={cn("font-extrabold tracking-tight", isDarkSection ? "text-white" : "text-black")}
                        elementLevelClassName={isDarkSection ? "text-white" : "text-black"}
                      />
                    </div>
                  )}

                  {/* Body Description */}
                  <p
                    className={cn(
                      "text-sm md:text-base leading-relaxed mb-6 font-normal max-w-md",
                      isDarkSection ? "text-zinc-400" : "text-slate-600"
                    )}
                  >
                    {section.description}
                  </p>

                  {/* Big Stat Counters matching unitedcarriers.jpg design */}
                  {section.id === 'biometrics' && (
                    <div className="my-6 border-t border-b border-slate-200 py-5 grid grid-cols-3 gap-3 text-left">
                      <div>
                        <div className="text-2xl md:text-3xl font-black text-black font-mono tracking-tight">2,500,000+</div>
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">Telemetry Events / Mo</div>
                      </div>
                      <div>
                        <div className="text-2xl md:text-3xl font-black text-black font-mono tracking-tight">99.8%</div>
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">ML Precision Score</div>
                      </div>
                      <div>
                        <div className="text-2xl md:text-3xl font-black text-black font-mono tracking-tight">0ms</div>
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">User Latency Penalty</div>
                      </div>
                    </div>
                  )}

                  {/* Features Bullet List */}
                  {section.features && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                      {section.features.map((feat, fIdx) => (
                        <div
                          key={fIdx}
                          className={cn(
                            "p-3.5 rounded-xl border transition-all shadow-xs flex items-start space-x-2.5 text-left",
                            isDarkSection
                              ? "bg-zinc-900/90 border-zinc-800 hover:border-zinc-600 text-white"
                              : "bg-slate-50 border-slate-200/90 hover:border-black text-slate-900"
                          )}
                        >
                          <div className={cn("p-1.5 rounded-lg mt-0.5", isDarkSection ? "bg-white text-black" : "bg-black text-white")}>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <h4 className={cn("text-xs font-bold", isDarkSection ? "text-white" : "text-slate-950")}>{feat.title}</h4>
                            <p className={cn("text-[11px] mt-0.5 font-normal leading-relaxed", isDarkSection ? "text-zinc-400" : "text-slate-600")}>{feat.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* CTA Action Buttons */}
                  {section.actions && (
                    <div className={cn("flex flex-wrap items-center gap-3 justify-start")}>
                      {section.actions.map((act, aIdx) => (
                        <button
                          key={aIdx}
                          onClick={
                            act.label.includes('Command') || act.label.includes('Dashboard')
                              ? onEnterDashboard
                              : () => scrollToSection(Math.min(sections.length - 1, index + 1))
                          }
                          className={cn(
                            'px-5 py-2.5 rounded-xl font-bold text-xs transition-all shadow-md flex items-center space-x-1.5 hover:-translate-y-0.5',
                            isDarkSection
                              ? act.variant === 'primary'
                                ? 'bg-white text-black hover:bg-zinc-200 shadow-white/10'
                                : 'bg-zinc-900 text-white border border-zinc-700 hover:bg-zinc-800'
                              : act.variant === 'primary'
                                ? 'bg-black text-white hover:bg-zinc-800 shadow-black/20'
                                : 'bg-white text-black border border-slate-300 hover:bg-slate-100 shadow-slate-200'
                          )}
                        >
                          <span>{act.label}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Interactive Side Column for Both Light & Dark Sections */}
                <div
                  className={cn(
                    "transition-all duration-500 relative z-[50]",
                    isRightAligned ? "lg:col-span-6 lg:order-1" : "lg:col-span-6"
                  )}
                >
                  {/* Hero Section Neon.tech Style Developer Code Terminal & Status HUD Card */}
                  {section.id === 'hero' && (
                    <div className="bg-zinc-900/95 border border-zinc-800 rounded-2xl p-5 shadow-2xl space-y-4">
                      {/* Terminal Header Bar */}
                      <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                        <div className="flex items-center space-x-2">
                          <div className="flex space-x-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-zinc-700 inline-block" />
                            <span className="w-2.5 h-2.5 rounded-full bg-zinc-700 inline-block" />
                            <span className="w-2.5 h-2.5 rounded-full bg-zinc-700 inline-block" />
                          </div>
                          <span className="text-[11px] font-mono text-zinc-400 ml-2">aegis-terminal</span>
                        </div>
                        <div className="flex items-center space-x-1 bg-black p-0.5 rounded-lg border border-zinc-800 text-[10px] font-mono font-bold">
                          <button
                            onClick={() => setHeroTab('sdk')}
                            className={cn('px-2 py-0.5 rounded-md transition-colors cursor-pointer', heroTab === 'sdk' ? 'bg-white text-black font-bold' : 'text-zinc-400 hover:text-white')}
                          >
                            SDK Tag
                          </button>
                          <button
                            onClick={() => setHeroTab('db')}
                            className={cn('px-2 py-0.5 rounded-md transition-colors cursor-pointer', heroTab === 'db' ? 'bg-white text-black font-bold' : 'text-zinc-400 hover:text-white')}
                          >
                            Postgres DB
                          </button>
                          <button
                            onClick={() => setHeroTab('nestjs')}
                            className={cn('px-2 py-0.5 rounded-md transition-colors cursor-pointer', heroTab === 'nestjs' ? 'bg-white text-black font-bold' : 'text-zinc-400 hover:text-white')}
                          >
                            NestJS Auth
                          </button>
                        </div>
                      </div>

                      {/* Code Snippet Display Box */}
                      <div className="bg-black rounded-xl p-3.5 border border-zinc-800 font-mono text-[11px] relative group overflow-x-auto text-left">
                        <button
                          onClick={() => {
                            const codeToCopy =
                              heroTab === 'sdk'
                                ? `<script src="http://localhost:4000/api/v1/sdk/aegis-tracker.js?siteId=site_prod_9942" async></script>`
                                : heroTab === 'db'
                                ? `DATABASE_URL="postgresql://neondb_owner:npg_hQyXaGHI1wj2@ep-young-hall-ayjfcc96-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require"`
                                : `@UseGuards(JwtAuthGuard, BehavioralBiometricsGuard)\n@Post('checkout')\nasync checkout(@CurrentUser() user) { ... }`;
                            navigator.clipboard.writeText(codeToCopy);
                            setCopiedSnippet(true);
                            setTimeout(() => setCopiedSnippet(false), 2000);
                          }}
                          className="absolute top-2.5 right-2.5 px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-white rounded text-[9px] font-sans font-bold transition-all border border-zinc-700 flex items-center space-x-1 cursor-pointer"
                        >
                          {copiedSnippet ? <span>Copied!</span> : <span>Copy Code</span>}
                        </button>

                        {heroTab === 'sdk' && (
                          <pre className="text-zinc-300 leading-relaxed whitespace-pre-wrap">
                            <span className="text-zinc-500">// 1. Copy & Paste Aegis Tracker Client SDK</span>{'\n'}
                            <span className="text-white">&lt;script</span> <span className="text-zinc-400">src</span>=<span className="text-zinc-300">"http://localhost:4000/api/v1/sdk/aegis-tracker.js"</span> <span className="text-zinc-400">async</span>&gt;&lt;/script&gt;
                          </pre>
                        )}
                        {heroTab === 'db' && (
                          <pre className="text-zinc-300 leading-relaxed whitespace-pre-wrap break-all">
                            <span className="text-zinc-500">// 2. Connected Neon Cloud PostgreSQL DB</span>{'\n'}
                            DATABASE_URL=<span className="text-white">"postgresql://neondb_owner:...@neon.tech/neondb"</span>
                          </pre>
                        )}
                        {heroTab === 'nestjs' && (
                          <pre className="text-zinc-300 leading-relaxed whitespace-pre-wrap">
                            <span className="text-zinc-500">// 3. Zero-Trust Post-Login Protection</span>{'\n'}
                            <span className="text-white">@UseGuards</span>(JwtAuthGuard, BehavioralGuard){'\n'}
                            <span className="text-white">@Post</span>(<span className="text-zinc-300">'transfer'</span>) async execute() &#123; &#125;
                          </pre>
                        )}
                      </div>

                      {/* Status HUD Metrics */}
                      <div className="grid grid-cols-2 gap-2 text-left pt-1">
                        <div className="p-2.5 bg-black border border-zinc-800 rounded-xl">
                          <div className="text-[9px] text-zinc-400 font-bold uppercase">Neon PostgreSQL Status</div>
                          <div className="text-xs font-bold text-white mt-0.5 font-mono flex items-center space-x-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                            <span>Cloud Connected</span>
                          </div>
                        </div>
                        <div className="p-2.5 bg-black border border-zinc-800 rounded-xl">
                          <div className="text-[9px] text-zinc-400 font-bold uppercase">ML Risk Engine</div>
                          <div className="text-xs font-bold text-white mt-0.5 font-mono">IsolationForest 100%</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Biometrics Engine Live Interactive Sandbox */}
                  {section.customCard === 'biometrics' && (
                    <div className="bg-white/95 border border-slate-200/90 rounded-2xl p-5 shadow-xl space-y-4 text-slate-900">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <div className="flex items-center space-x-2.5">
                          <div className="p-2 bg-black text-white rounded-lg">
                            <Activity className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-slate-950">Live Real-Time Biometrics Extractor</h4>
                            <p className="text-[11px] text-slate-500">Move cursor or type to test live telemetry</p>
                          </div>
                        </div>
                        <button
                          onClick={toggleBotSimulation}
                          className={cn(
                            'px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 shadow-xs border',
                            isSimulatingBot
                              ? 'bg-black text-white border-black'
                              : 'bg-slate-100 text-black border-slate-300 hover:bg-slate-200'
                          )}
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>{isSimulatingBot ? 'Bot Attack Mode' : 'Simulate Bot Vector'}</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-4 gap-2 text-center">
                        <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                          <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Dwell Mean</div>
                          <div className="text-sm font-bold text-slate-900 font-mono mt-0.5">{sampleDwell} ms</div>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                          <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Flight Mean</div>
                          <div className="text-sm font-bold text-slate-900 font-mono mt-0.5">{sampleFlight} ms</div>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                          <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Straightness</div>
                          <div className="text-sm font-bold text-slate-900 font-mono mt-0.5">{sampleStraightness}</div>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                          <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Velocity</div>
                          <div className="text-sm font-bold text-slate-900 font-mono mt-0.5">{liveMouseVelocity} px/s</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SHAP & ML Anomaly Engine Card */}
                  {section.customCard === 'risk-engine' && (
                    <div className="bg-zinc-900/95 border border-zinc-800 rounded-2xl p-5 shadow-2xl space-y-3.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2.5">
                          <div className="p-2 bg-white text-black rounded-lg">
                            <BarChart3 className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-white">SHAP Feature Attribution</h4>
                            <p className="text-[11px] text-zinc-400">Explainable AI anomaly analysis</p>
                          </div>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full bg-white text-black font-bold text-[11px] border border-white">
                          Low Anomaly (0.08)
                        </span>
                      </div>

                      <div className="space-y-2 pt-1">
                        <div>
                          <div className="flex justify-between text-[11px] font-bold mb-1">
                            <span className="text-white">Mouse Trajectory Linearity</span>
                            <span className="text-zinc-300 font-mono">0.02 (Human)</span>
                          </div>
                          <div className="w-full h-2 bg-black rounded-full overflow-hidden border border-zinc-800">
                            <div className="h-full bg-white rounded-full" style={{ width: '12%' }} />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-[11px] font-bold mb-1">
                            <span className="text-white">Keystroke Dwell Deviation</span>
                            <span className="text-zinc-300 font-mono">0.04 (Nominal)</span>
                          </div>
                          <div className="w-full h-2 bg-black rounded-full overflow-hidden border border-zinc-800">
                            <div className="h-full bg-white rounded-full" style={{ width: '18%' }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Circular Carousels */}
                  {(section.customCard === 'carousel' || section.customCard === 'intruder' || section.customCard === 'command-center') && (
                    <div className="w-full">
                      <CircularCarousel
                        items={
                          section.customCard === 'intruder'
                            ? intruderCarouselItems
                            : section.customCard === 'command-center'
                              ? commandCenterCarouselItems
                              : carouselFeatureItems
                        }
                        autoPlay={true}
                        autoPlayInterval={3500}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Modern Minimalist F.A.Q Accordion Section matching unitedcarriers.jpg */}
        <div className="w-full bg-white text-slate-900 py-24 px-6 md:px-16 lg:px-24 border-b border-slate-200 relative z-30">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 text-left">
            <div className="lg:col-span-4 space-y-4">
              <span className="text-xs font-black uppercase tracking-widest text-slate-400">Questions & Answers</span>
              <h2 className="text-4xl lg:text-5xl font-black text-black tracking-tight">F.A.Q</h2>
              <p className="text-sm text-slate-500 max-w-xs leading-relaxed">
                Everything you need to know about post-login Zero-Trust behavioral security, ML models, and integration steps.
              </p>
            </div>

            <div className="lg:col-span-8 space-y-3">
              {faqData.map((faq, fIndex) => {
                const isOpen = openFaqIndex === fIndex;
                return (
                  <div
                    key={fIndex}
                    className="border border-slate-200 rounded-2xl overflow-hidden transition-all bg-slate-50/50"
                  >
                    <button
                      onClick={() => setOpenFaqIndex(isOpen ? null : fIndex)}
                      className="w-full p-5 text-left flex items-center justify-between font-bold text-sm text-slate-900 hover:text-black transition-colors cursor-pointer"
                    >
                      <span>{faq.q}</span>
                      <span className="text-lg font-mono text-slate-400 font-bold ml-4">{isOpen ? '−' : '+'}</span>
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Section */}
        <div className="w-full relative z-40">
          <FooterSection />
        </div>
      </div>
    </div>
  );
}
