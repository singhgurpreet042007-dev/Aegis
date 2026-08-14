'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  Github,
  Terminal,
  ArrowRight,
  Code2,
  Sparkles,
  Layers,
  Activity,
  Cpu,
  Lock,
  Search,
  ExternalLink,
  Shield,
  Server,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { FooterSection } from '@/components/ui/footer-section';
import { TextScramble } from '@/components/ui/text-scramble';

interface ReactEmailLandingProps {
  onEnterDashboard?: () => void;
}

export function ReactEmailLanding({ onEnterDashboard }: ReactEmailLandingProps) {
  const router = routerNav();

  function routerNav() {
    try {
      return useRouter();
    } catch {
      return null;
    }
  }

  // Preloader state matching cosmos.mp4 video reference
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);

  // Preloader timer matching cosmos.mp4
  useEffect(() => {
    let current = 0;
    const timer = setInterval(() => {
      current += Math.floor(Math.random() * 10) + 5;
      if (current >= 100) {
        current = 100;
        setLoadingProgress(100);
        clearInterval(timer);
        setTimeout(() => {
          setIsLoading(false);
        }, 500);
      } else {
        setLoadingProgress(current);
      }
    }, 45);

    return () => clearInterval(timer);
  }, []);

  // Navigation & Tab States matching react-email.mp4
  const [activeNavTab, setActiveNavTab] = useState<'landing' | 'components' | 'templates'>('landing');
  const [activeCodeStack, setActiveCodeStack] = useState<'tailwind' | 'css' | 'typescript' | 'nestjs'>('tailwind');
  const [activeToolTab, setActiveToolTab] = useState<'linter' | 'compatibility' | 'spamScore'>('spamScore');
  const [copiedCli, setCopiedCli] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Selected Component detail view state
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Copy handler for CLI snippet
  const handleCopyCli = () => {
    navigator.clipboard.writeText('npx create-aegis-app@latest');
    setCopiedCli(true);
    setTimeout(() => setCopiedCli(false), 2000);
  };

  // Code snippet based on active stack
  const getCodeSnippet = () => {
    switch (activeCodeStack) {
      case 'tailwind':
        return `import { Body, Container, Head, Heading, Html, Img, Preview, Section, Text } from "@aegis/components";

interface AegisSecurityProps {
  user: string;
  trustScore: number;
}

export const SecurityEmail = ({ user = "Nicole", trustScore = 99.8 }: AegisSecurityProps) => (
  <Html>
    <Head />
    <Preview>AEGIS Zero Trust Session Alert</Preview>
    <Body className="bg-black my-auto mx-auto font-sans">
      <Container className="border border-zinc-800 rounded my-[40px] mx-auto p-[20px] max-w-[465px]">
        <Section className="mt-[32px]">
          <Img src="https://api.aegisai.io/logo.png" width="40" height="40" alt="AEGIS" className="my-0 mx-auto" />
        </Section>
        <Heading className="text-white text-[24px] font-bold text-center p-0 my-[30px] mx-0">
          Welcome to AEGIS, {user}!
        </Heading>
        <Text className="text-zinc-400 text-[14px] leading-[24px]">
          Your session trust score is <strong className="text-emerald-400">{trustScore}%</strong>. Continuous biometrics verification active.
        </Text>
      </Container>
    </Body>
  </Html>
);`;
      case 'css':
        return `/* Aegis Motion Typography CSS Stylesheet */
.aegis-security-card {
  background: #000000;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 32px;
  max-width: 480px;
  margin: 40px auto;
  font-family: var(--font-sans), system-ui;
}
.aegis-mono-badge {
  font-family: monospace;
  font-weight: 700;
  color: #10b981;
}`;
      case 'typescript':
        return `import { AegisTracker } from '@aegis/sdk';

// Initialize Client Biometrics Tracker
const tracker = new AegisTracker({
  siteId: 'site_prod_9942',
  endpoint: 'http://localhost:4000/api/v1/biometrics/ingest',
  flushIntervalMs: 3000,
});

tracker.onRiskUpdate((score) => {
  if (score >= 0.70) {
    console.warn('Threat detected! Triggering step-up MFA challenge.');
  }
});`;
      case 'nestjs':
        return `import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { BiometricsService } from './biometrics.service';

@Injectable()
export class BehavioralBiometricsGuard implements CanActivate {
  constructor(private biometricsService: BiometricsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const score = await this.biometricsService.evalSession(req.user.id);
    return score < 0.70;
  }
}`;
    }
  };

  // Component categories matching react-email.mp4 with Motion.mp4 font tags
  const componentCategories = [
    { name: 'Biometrics SDK', count: 3, id: 'biometrics', tag: '01 // SDK SENSORS' },
    { name: 'IsolationForest ML', count: 5, id: 'ml-engine', tag: '02 // FASTAPI ML' },
    { name: 'Sentinel Web Scanner', count: 6, id: 'sentinel', tag: '03 // WEB SCANNER' },
    { name: 'Step-Up Email OTP', count: 3, id: 'email-otp', tag: '04 // EMAIL AUTH' },
    { name: 'SecOps Command Center', count: 2, id: 'command-center', tag: '05 // NEXT.JS 15' },
    { name: 'Audit Log Trail', count: 2, id: 'audit', tag: '06 // POSTGRESQL' },
    { name: 'Code Block', count: 2, id: 'code-block', tag: '07 // PRIMITIVE' },
    { name: 'Container', count: 1, id: 'container', tag: '08 // LAYOUT' },
    { name: 'Divider', count: 2, id: 'divider', tag: '09 // LAYOUT' },
    { name: 'Features', count: 5, id: 'features', tag: '10 // UI BLOCK' },
    { name: 'Grid', count: 1, id: 'grid', tag: '11 // LAYOUT' },
    { name: 'Heading', count: 3, id: 'heading', tag: '12 // TYPOGRAPHY' },
    { name: 'Image', count: 3, id: 'image', tag: '13 // MEDIA' },
    { name: 'Link', count: 2, id: 'link', tag: '14 // NAVIGATION' },
    { name: 'Markdown', count: 3, id: 'markdown', tag: '15 // PARSER' },
    { name: 'Marketing', count: 1, id: 'marketing', tag: '16 // BLOCK' },
    { name: 'Pricing', count: 2, id: 'pricing', tag: '17 // BLOCK' },
    { name: 'Section', count: 2, id: 'section', tag: '18 // LAYOUT' },
  ];

  // Templates grid matching react-email.mp4 (01:00 - 01:09)
  const templateItems = [
    { title: 'AWS / Verify Email', author: 'resend', codeSnippet: '596853', description: 'Verification code email sent by Amazon Web Services for identity confirmation.' },
    { title: 'GitHub / Access Token', author: 'bruno4calabresa', codeSnippet: 'ghp_a81k9x...', description: 'A personal access token was created on your account for CLI access.' },
    { title: 'Apple / Receipt', author: 'theverge', codeSnippet: 'Order ID: W1182390', description: 'Save 5% on all your Apple purchases with Apple Card receipt layout.' },
    { title: 'Nike / Receipt', author: 'camdengallego', codeSnippet: 'Order #994812', description: 'Open-source Nike receipt template with itemized shipment tracking.' },
    { title: 'Slack / Confirm Email', author: 'zenonocha', codeSnippet: 'Confirm your email address', description: 'Your confirmation code is below - enter it in your Slack window.' },
    { title: 'Linear / Login Code', author: 'Rychillie', codeSnippet: '53224-5289a', description: 'Login code for Linear. This single-use code will expire in 5 minutes.' },
    { title: 'Google Play / Developer Update', author: 'zenonocha', codeSnippet: 'Policy Clarification', description: 'Official developer policy update notification template for Google Play store.' },
    { title: 'Stripe / Welcome', author: 'zenonocha', codeSnippet: 'Setup your Dashboard', description: 'Welcome email sent to new Stripe accounts upon business verification.' },
    { title: 'Postmark / Verify Code', author: 'ashishandanadea', codeSnippet: '144833', description: 'Enter the 6-digit verification code to finish registering your Postmark sender.' },
  ];

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-cyan-500/30 selection:text-cyan-200 overflow-x-hidden">
      {/* Dynamic 3D Cylinder Keyframes & Motion Typography Styling */}
      <style>{`
        @keyframes rotateCylinder {
          0% { transform: rotateY(0deg) rotateX(12deg); }
          100% { transform: rotateY(360deg) rotateX(12deg); }
        }
        .cylinder-ring {
          transform-style: preserve-3d;
          animation: rotateCylinder 24s linear infinite;
        }
        .cylinder-ring:hover {
          animation-play-state: paused;
        }
        .cylinder-card {
          backface-visibility: visible;
        }
      `}</style>

      {/* 1. PRELOADER SCREEN MATCHING cosmos.mp4 VIDEO REFERENCE */}
      {isLoading && (
        <div className="fixed inset-0 z-[100] bg-[#f4f4ef] text-slate-900 flex flex-col items-center justify-center transition-all duration-700 ease-out select-none">
          <div className="text-center space-y-4">
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-slate-900 font-sans uppercase">
              AEGIS<sup>©</sup>
            </h1>
            <p className="text-xs text-slate-500 font-mono tracking-widest uppercase font-bold">
              Zero Trust Behavioral Biometrics
            </p>
          </div>

          <div className="absolute bottom-12 text-xs font-mono text-slate-500 font-bold tracking-widest">
            {loadingProgress}%
          </div>
        </div>
      )}

      {/* 2. TOP HEADER BAR MATCHING react-email.mp4 + Motion.mp4 Font */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-b border-zinc-800/80 px-6 py-3.5 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Brand Logo */}
          <div
            onClick={() => setActiveNavTab('landing')}
            className="flex items-center space-x-2.5 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 p-0.5 shadow-md shadow-cyan-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-black rounded-[6px] flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
              </div>
            </div>
            <span className="text-base font-extrabold tracking-tight text-white flex items-center font-sans">
              react email <span className="ml-2 text-[10px] font-mono text-cyan-400 font-bold uppercase">/ aegis</span>
            </span>
          </div>

          {/* Navigation Links matching react-email.mp4 with Motion.mp4 font */}
          <nav className="hidden md:flex items-center space-x-1 text-xs font-mono font-bold text-zinc-400 bg-zinc-900/80 p-1 rounded-xl border border-zinc-800">
            <button
              onClick={() => setActiveNavTab('components')}
              className={cn(
                'px-3.5 py-1.5 rounded-lg transition-all cursor-pointer uppercase',
                activeNavTab === 'components' ? 'bg-zinc-800 text-white font-black shadow-xs' : 'hover:text-white'
              )}
            >
              Components
            </button>
            <button
              onClick={() => setActiveNavTab('templates')}
              className={cn(
                'px-3.5 py-1.5 rounded-lg transition-all cursor-pointer uppercase',
                activeNavTab === 'templates' ? 'bg-zinc-800 text-white font-black shadow-xs' : 'hover:text-white'
              )}
            >
              Templates
            </button>
            <button
              onClick={() => {
                if (onEnterDashboard) onEnterDashboard();
                else if (router) router.push('/login');
              }}
              className="px-3.5 py-1.5 rounded-lg hover:text-white transition-colors cursor-pointer uppercase"
            >
              Docs
            </button>
          </nav>

          {/* GitHub Star Pill & Action Button */}
          <div className="flex items-center space-x-3">
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-zinc-900/90 border border-zinc-800 text-xs text-zinc-300 hover:text-white hover:border-zinc-700 transition-all font-mono"
            >
              <Github className="w-3.5 h-3.5" />
              <span className="font-mono text-[11px] font-bold">16.9K</span>
            </a>

            <button
              onClick={() => {
                if (onEnterDashboard) onEnterDashboard();
                else if (router) router.push('/login');
              }}
              className="px-4 py-2 rounded-xl bg-white text-black hover:bg-zinc-200 font-extrabold text-xs font-mono tracking-wider shadow-md shadow-white/10 transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              <span>Command Center</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* 3. MAIN CONTENT AREA */}
      <main className="pt-24">
        {activeNavTab === 'landing' && (
          <>
            {/* HERO SECTION matching react-email.mp4 + Motion.mp4 Font */}
            <section className="relative min-h-[90vh] flex items-center justify-center px-6 md:px-16 max-w-7xl mx-auto overflow-hidden py-12">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center w-full relative z-20">
                {/* Hero Left Column */}
                <div className="lg:col-span-6 text-left space-y-6">
                  {/* Monospace Badge Tag matching Motion.mp4 with TextScramble font animation */}
                  <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs">
                    <TextScramble text="01 // POST-LOGIN BIOMETRICS" className="text-cyan-400 font-bold" />
                  </div>

                  {/* Glowing Logo Icon Card */}
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500/20 via-blue-500/10 to-transparent p-0.5 border border-cyan-500/30 shadow-xl shadow-cyan-500/10 flex items-center justify-center">
                    <div className="w-full h-full bg-zinc-950 rounded-[14px] flex items-center justify-center">
                      <ShieldCheck className="w-8 h-8 text-cyan-400" />
                    </div>
                  </div>

                  {/* Main Display Title with Motion.mp4 typography */}
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] text-white font-sans">
                    The next generation <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-cyan-400">
                      of writing emails & security
                    </span>
                  </h1>

                  {/* Body Paragraph */}
                  <p className="text-base text-zinc-400 leading-relaxed font-normal max-w-lg">
                    React Email & AEGIS AI is a next-generation collection of unstyled components for creating beautiful emails & continuous post-login biometrics using React, Tailwind, and TypeScript.
                  </p>

                  {/* CTA Action Buttons */}
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button
                      onClick={() => setActiveNavTab('components')}
                      className="px-5 py-3 rounded-xl bg-white text-black hover:bg-zinc-200 font-extrabold text-xs transition-all shadow-lg flex items-center space-x-2 cursor-pointer font-mono tracking-wide"
                    >
                      <span>Explore components</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    {/* Interactive CLI Copy Snippet */}
                    <div className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800 font-mono text-xs text-zinc-300">
                      <span className="text-zinc-500">npx create-aegis-app@latest</span>
                      <button
                        onClick={handleCopyCli}
                        className="p-1 hover:text-white transition-colors cursor-pointer ml-1"
                        title="Copy command"
                      >
                        {copiedCli ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Hero Right Column — 3D Rotating Cylinder Ring matching react-email.mp4 */}
                <div className="lg:col-span-6 relative h-[480px] flex items-center justify-center perspective-[1200px]">
                  <div className="relative w-full h-full flex items-center justify-center">
                    {/* 3D Curved Cylinder Ring */}
                    <div className="cylinder-ring relative w-[320px] h-[360px] flex items-center justify-center">
                      {[
                        {
                          title: 'Elegant Style',
                          sub: 'Customer Experience Research Team',
                          score: 'Satisfied 100%',
                          color: 'border-cyan-500/40 bg-cyan-950/40',
                          transform: 'rotateY(0deg) translateZ(260px)',
                        },
                        {
                          title: 'Steve Jobs',
                          sub: 'Co-Founder & CEO',
                          score: 'Satisfied 98%',
                          color: 'border-blue-500/40 bg-blue-950/40',
                          transform: 'rotateY(72deg) translateZ(260px)',
                        },
                        {
                          title: 'Behavioral Biometrics',
                          sub: 'IsolationForest 100 Estimators',
                          score: 'Anomaly Score 0.08',
                          color: 'border-emerald-500/40 bg-emerald-950/40',
                          transform: 'rotateY(144deg) translateZ(260px)',
                        },
                        {
                          title: 'Gmail & Resend OTP',
                          sub: '6-Digit Email Verification',
                          score: 'Instant Inbox Delivery',
                          color: 'border-purple-500/40 bg-purple-950/40',
                          transform: 'rotateY(216deg) translateZ(260px)',
                        },
                        {
                          title: 'Sentinel Web Scanner',
                          sub: 'One-Click Domain Connection',
                          score: 'TLS 1.3 Verified',
                          color: 'border-cyan-500/40 bg-cyan-950/40',
                          transform: 'rotateY(288deg) translateZ(260px)',
                        },
                      ].map((item, idx) => (
                        <div
                          key={idx}
                          className={cn(
                            'cylinder-card absolute w-[280px] p-5 rounded-2xl border backdrop-blur-md shadow-2xl transition-transform text-left',
                            item.color
                          )}
                          style={{ transform: item.transform }}
                        >
                          <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-3">
                            <span className="text-xs font-bold text-white font-sans">{item.title}</span>
                            <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
                              {item.score}
                            </span>
                          </div>
                          <p className="text-[11px] text-zinc-400 font-normal leading-relaxed">{item.sub}</p>
                          <div className="mt-3 pt-2 flex items-center justify-between text-[10px] font-mono text-zinc-500 font-bold">
                            <span>AEGIS / REACT-EMAIL</span>
                            <span>v0.1.0</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* SECTION 2: CODE EDITOR & LIVE PREVIEW SIDE-BY-SIDE matching react-email.mp4 (00:09 - 00:12) */}
            <section className="py-24 px-6 md:px-16 max-w-7xl mx-auto border-t border-zinc-800/80">
              <div className="text-center space-y-4 mb-12">
                <div className="inline-block px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 font-mono text-xs text-zinc-400 font-bold">
                  02 // CODE INTEGRATION
                </div>
                <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight font-sans">
                  Style with any tools
                </h2>
                <p className="text-sm text-zinc-400 max-w-md mx-auto">
                  Make your email security & biometrics components look beautiful with Tailwind or inline CSS.
                </p>

                {/* Stack Toggle Pills matching video */}
                <div className="inline-flex items-center space-x-1 p-1 bg-zinc-900 border border-zinc-800 rounded-xl text-xs font-mono font-bold mt-4">
                  {(['tailwind', 'css', 'typescript', 'nestjs'] as const).map((stack) => (
                    <button
                      key={stack}
                      onClick={() => setActiveCodeStack(stack)}
                      className={cn(
                        'px-4 py-1.5 rounded-lg capitalize transition-all cursor-pointer font-mono',
                        activeCodeStack === stack ? 'bg-zinc-800 text-white shadow-xs font-bold' : 'text-zinc-400 hover:text-white'
                      )}
                    >
                      {stack}
                    </button>
                  ))}
                </div>
              </div>

              {/* Side-by-Side Grid (Code Editor Left, Live Security Preview Right) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                {/* Dark VS Code Style Editor */}
                <div className="lg:col-span-7 bg-zinc-950 border border-zinc-800 rounded-2xl p-4 font-mono text-xs shadow-2xl text-left overflow-hidden flex flex-col">
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-800 text-zinc-500 text-[11px] mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block" />
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
                      <span className="ml-2 text-zinc-400 font-bold">email-template.tsx</span>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(getCodeSnippet());
                        setCopiedCode(true);
                        setTimeout(() => setCopiedCode(false), 2000);
                      }}
                      className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded text-[10px] font-mono transition-colors flex items-center space-x-1 border border-zinc-800 cursor-pointer"
                    >
                      {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>

                  <pre className="text-zinc-300 leading-relaxed overflow-x-auto p-2 flex-1 font-mono text-[11px]">
                    <code>{getCodeSnippet()}</code>
                  </pre>
                </div>

                {/* Live Card Preview Box matching react-email.mp4 (00:10) */}
                <div className="lg:col-span-5 bg-black border border-zinc-800 rounded-2xl p-8 shadow-2xl flex flex-col items-center justify-center text-center relative overflow-hidden">
                  <div className="w-12 h-12 rounded-xl bg-white text-black flex items-center justify-center mb-4 shadow-xl">
                    <ShieldCheck className="w-6 h-6 text-black" />
                  </div>
                  <h3 className="text-xl font-extrabold text-white mb-2 font-sans">Welcome to Helix, Nicole!</h3>
                  <p className="text-xs text-zinc-400 max-w-xs leading-relaxed mb-6">
                    We're excited to have you onboard at Helix. We hope you enjoy your journey with us. If you have any questions, feel free to reach out.
                  </p>
                  <button className="px-5 py-2.5 rounded-xl bg-white text-black font-extrabold text-xs shadow-lg hover:bg-zinc-200 transition-colors font-mono tracking-wide">
                    Get Started
                  </button>
                  <p className="text-[10px] text-zinc-600 mt-6 font-mono font-bold">Cheers, The Helix Team</p>
                </div>
              </div>
            </section>

            {/* SECTION 3: TESTIMONIAL QUOTE matching react-email.mp4 (00:13) */}
            <section className="py-20 px-6 max-w-3xl mx-auto text-center border-t border-zinc-800/80">
              <blockquote className="text-xl md:text-2xl font-bold text-white tracking-tight leading-relaxed mb-6 font-sans">
                "Building email UI is annoyingly difficult, especially trying to make things look correct in all clients. React Email makes this way easier."
              </blockquote>
              <div className="flex items-center justify-center space-x-3">
                <div className="w-9 h-9 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-xs text-white font-mono">
                  LR
                </div>
                <div className="text-left">
                  <div className="text-xs font-extrabold text-white font-sans">Lee Robinson</div>
                  <div className="text-[11px] text-zinc-500 font-mono">VP of DX, Cursor</div>
                </div>
              </div>
            </section>

            {/* SECTION 4: READY-TO-USE COMPONENTS BENTO GRID matching react-email.mp4 (00:14 - 00:17) */}
            <section className="py-24 px-6 md:px-16 max-w-7xl mx-auto border-t border-zinc-800/80">
              <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12 gap-4 text-left">
                <div>
                  <div className="inline-block px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 font-mono text-xs text-zinc-400 font-bold mb-2">
                    03 // READY-TO-USE COMPONENTS
                  </div>
                  <h2 className="text-3xl font-extrabold text-white tracking-tight mb-1 font-sans">Ready-to-use Components</h2>
                  <p className="text-xs text-zinc-400 font-mono">Copy and paste. Add your own data. Send.</p>
                </div>
                <button
                  onClick={() => setActiveNavTab('components')}
                  className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white font-bold text-xs shadow-md transition-all flex items-center space-x-1.5 cursor-pointer font-mono"
                >
                  <span>View all components</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 text-left">
                {componentCategories.slice(0, 6).map((cat) => (
                  <div
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      setActiveNavTab('components');
                    }}
                    className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800 hover:border-cyan-500/40 transition-all cursor-pointer group shadow-xl hover:-translate-y-1"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
                        {cat.tag}
                      </span>
                      <span className="text-xs text-zinc-500 font-mono">{cat.count} components</span>
                    </div>
                    <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors mb-2 font-sans">
                      {cat.name}
                    </h3>
                    <div className="w-full h-24 rounded-xl bg-zinc-900/60 border border-zinc-800/60 p-3 flex items-center justify-center group-hover:bg-zinc-900 transition-colors">
                      <div className="w-16 h-3 bg-zinc-800 rounded-full group-hover:bg-cyan-500/30 transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* SECTION 5: BATTLE-TESTED PRIMITIVES matching react-email.mp4 (00:18 - 00:19) */}
            <section className="py-24 px-6 md:px-16 max-w-7xl mx-auto border-t border-zinc-800/80 text-center">
              <h2 className="text-3xl font-extrabold text-white tracking-tight mb-2 font-sans">Battle-tested Primitives</h2>
              <p className="text-xs text-zinc-400 mb-12 font-mono">All components are tested on the most popular email clients and web runtimes.</p>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                {[
                  { name: 'Gmail', icon: 'M' },
                  { name: 'Apple Mail', icon: '✉️' },
                  { name: 'Outlook', icon: 'O' },
                  { name: 'Yahoo Mail', icon: 'y!' },
                  { name: 'HEY', icon: '👋' },
                  { name: 'Superhuman', icon: '⚡' },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 hover:border-zinc-700 transition-all flex flex-col items-center justify-center space-y-2 shadow-lg"
                  >
                    <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center font-bold text-base text-white">
                      {item.icon}
                    </div>
                    <span className="text-xs font-bold text-zinc-300 font-sans">{item.name}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* SECTION 6: BUILT-IN THREAT TOOLS matching react-email.mp4 (00:20 - 00:24) */}
            <section className="py-24 px-6 md:px-16 max-w-7xl mx-auto border-t border-zinc-800/80">
              <div className="text-center space-y-3 mb-16">
                <div className="inline-block px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 font-mono text-xs text-zinc-400 font-bold mb-2">
                  04 // THREAT INTELLIGENCE TOOLS
                </div>
                <h2 className="text-3xl font-extrabold text-white tracking-tight font-sans">Built-in deliverability & threat tools</h2>
                <p className="text-xs text-zinc-400 max-w-md mx-auto">
                  Before you hit "send", check how your email & session security is performing with a set of automated tools.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                {/* Left Tool Tabs matching video */}
                <div className="lg:col-span-5 space-y-4 text-left">
                  {[
                    {
                      id: 'linter',
                      title: 'Linter',
                      desc: 'Analyze every link in your email & session event to check that they are valid.',
                    },
                    {
                      id: 'compatibility',
                      title: 'Compatibility Checker',
                      desc: 'See how well your HTML/CSS & SDK is supported across popular mail clients & browsers.',
                    },
                    {
                      id: 'spamScore',
                      title: 'Spam Score / Anomaly Index',
                      desc: 'Analyze your email content using a robust scoring framework to determine if the email is likely to be marked as spam.',
                    },
                  ].map((tool) => (
                    <div
                      key={tool.id}
                      onClick={() => setActiveToolTab(tool.id as any)}
                      className={cn(
                        'p-5 rounded-2xl border transition-all cursor-pointer shadow-lg',
                        activeToolTab === tool.id
                          ? 'bg-zinc-900 border-zinc-700 text-white shadow-cyan-500/5'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
                      )}
                    >
                      <h4 className="text-sm font-bold mb-1 text-white font-sans">{tool.title}</h4>
                      <p className="text-xs leading-relaxed text-zinc-400 font-normal">{tool.desc}</p>
                    </div>
                  ))}
                </div>

                {/* Right Interactive Tool Window matching react-email.mp4 (00:23) */}
                <div className="lg:col-span-7 bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-2xl min-h-[320px] flex flex-col justify-center items-center text-center relative overflow-hidden">
                  {activeToolTab === 'spamScore' && (
                    <div className="space-y-4 animate-in fade-in duration-300">
                      <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-xl">
                        <CheckCircle2 className="w-8 h-8" />
                      </div>
                      <div className="text-3xl font-black font-mono text-white">10/10</div>
                      <p className="text-xs text-zinc-400 font-mono">Your email is clean of abuse indicators.</p>
                    </div>
                  )}

                  {activeToolTab === 'linter' && (
                    <div className="space-y-3 w-full max-w-sm text-left animate-in fade-in duration-300">
                      <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 text-xs font-mono flex items-center justify-between">
                        <span className="text-emerald-400">✓ FETCH ATTEMPT</span>
                        <span className="text-zinc-500">200 OK</span>
                      </div>
                      <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 text-xs font-mono flex items-center justify-between">
                        <span className="text-emerald-400">✓ TLS 1.3 VERIFIED</span>
                        <span className="text-zinc-500">Valid</span>
                      </div>
                    </div>
                  )}

                  {activeToolTab === 'compatibility' && (
                    <div className="space-y-2 w-full max-w-sm text-left text-xs font-mono animate-in fade-in duration-300">
                      <div className="flex justify-between p-2 border-b border-zinc-800 text-zinc-300">
                        <span>Gmail / Outlook</span>
                        <span className="text-emerald-400">100% Compatible</span>
                      </div>
                      <div className="flex justify-between p-2 border-b border-zinc-800 text-zinc-300">
                        <span>Apple Mail</span>
                        <span className="text-emerald-400">100% Compatible</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* SECTION 7: INTEGRATE WITH ANY SERVICE matching react-email.mp4 (00:25 - 00:27) */}
            <section className="py-24 px-6 md:px-16 max-w-7xl mx-auto border-t border-zinc-800/80 text-center">
              <h2 className="text-3xl font-extrabold text-white tracking-tight mb-2 font-sans">Integrate with any service</h2>
              <p className="text-xs text-zinc-400 mb-12 font-mono">Convert your React code into HTML or Plain Text and send it with any email service provider.</p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
                {[
                  { name: 'Resend', tag: 'Brought to you by Resend' },
                  { name: 'SendGrid', tag: 'Twilio SendGrid' },
                  { name: 'AWS', tag: 'Amazon Web Services' },
                  { name: 'Postmark', tag: 'ActiveCampaign' },
                ].map((serv, idx) => (
                  <div
                    key={idx}
                    className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800 hover:border-zinc-700 transition-all flex flex-col items-center justify-center space-y-2 shadow-xl"
                  >
                    <span className="text-base font-extrabold text-white font-sans">{serv.name}</span>
                    <span className="text-[10px] text-zinc-500 font-mono">{serv.tag}</span>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {/* COMPONENTS CATALOG PAGE VIEW matching react-email.mp4 (00:41 - 00:59) */}
        {activeNavTab === 'components' && (
          <div className="max-w-7xl mx-auto px-6 md:px-16 py-12 text-left">
            <div className="mb-10 space-y-2">
              <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight font-sans">Components</h1>
              <p className="text-xs text-zinc-400 font-mono">Build beautiful emails with pre-built components that you can copy-and-paste into your app.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {componentCategories.map((cat) => (
                <div
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={cn(
                    'p-5 rounded-2xl bg-zinc-950 border transition-all cursor-pointer shadow-xl hover:-translate-y-1',
                    selectedCategory === cat.id ? 'border-cyan-500 text-white bg-zinc-900' : 'border-zinc-800 text-zinc-300 hover:border-zinc-700'
                  )}
                >
                  <div className="flex items-center justify-between mb-3 font-mono">
                    <span className="text-[10px] font-mono text-zinc-500">{cat.count} components</span>
                  </div>
                  <h3 className="text-base font-bold mb-2 text-white font-sans">{cat.name}</h3>
                  <div className="w-full h-20 rounded-xl bg-zinc-900/60 border border-zinc-800/60 flex items-center justify-center">
                    <div className="w-12 h-2.5 bg-zinc-800 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TEMPLATES GALLERY PAGE VIEW matching react-email.mp4 (01:00 - 01:09) */}
        {activeNavTab === 'templates' && (
          <div className="max-w-7xl mx-auto px-6 md:px-16 py-12 text-left">
            <div className="mb-10 space-y-2">
              <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight font-sans">Templates</h1>
              <p className="text-xs text-zinc-400 font-mono">Open source templates built with React Email. Recreate any email or submit a pull request.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {templateItems.map((tpl, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800 hover:border-zinc-700 transition-all text-left shadow-xl space-y-4"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                    <div>
                      <h3 className="text-sm font-extrabold text-white font-sans">{tpl.title}</h3>
                      <p className="text-[10px] font-mono text-zinc-500">by @{tpl.author}</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-[11px] font-mono font-bold text-cyan-400">
                      {tpl.codeSnippet}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed font-normal">{tpl.description}</p>
                  <button className="w-full py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white font-extrabold text-xs transition-colors flex items-center justify-center space-x-1.5 cursor-pointer font-mono">
                    <span>View template</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer Section */}
      <FooterSection />
    </div>
  );
}
