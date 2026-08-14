'use client';

import React, { useState } from 'react';
import {
  HelpCircle,
  Search,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Cpu,
  TrendingUp,
  FolderKanban,
  Bot,
  Eye,
  Dna,
  Zap,
  BrainCircuit,
  Sparkles,
  CheckCircle2,
  Terminal,
  FileCode2,
  Activity,
  Play,
} from 'lucide-react';

interface DocsCenterViewProps {
  onNavigateToTab?: (tab: string) => void;
}

export function DocsCenterView({ onNavigateToTab }: DocsCenterViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  const docModules = [
    {
      id: 'calibration',
      tabKey: 'dashboard',
      title: '60-Second Baseline Calibration Engine',
      category: 'Biometrics & AI Engine',
      icon: Dna,
      badge: 'Feature 1',
      summary: 'Captures natural mouse curvature, velocity, keystroke dwell times, and flight latency over a 60-second interactive enrolment mode.',
      howItWorks: 'Calculates mean and standard deviation for dwell time, flight time, velocity, and curvature. Stores a permanent BehavioralBaseline record in PostgreSQL database via Prisma.',
      howToOperate: '1. Click "Run 60s Calibration" in the header.\n2. Type the sample prompt naturally in the modal text area.\n3. Move mouse across the canvas target box for 60 seconds.',
      recommendedConfig: 'Enrolment duration: 60s, minimum sample count: 200 input events.',
    },
    {
      id: 'risk-engine',
      tabKey: 'dashboard',
      title: 'Real-Time Risk Score Engine & WebSockets',
      category: 'Biometrics & AI Engine',
      icon: Activity,
      badge: 'Feature 2',
      summary: 'Computes continuous mathematical Z-scores and IsolationForest anomaly scores on live telemetry streams over WebSockets.',
      howItWorks: 'Evaluates incoming telemetry against stored baseline: z = |cur - baseline_mean| / baseline_std. Combines Z-score with IsolationForest model output and broadcasts risk_score_update events.',
      howToOperate: '1. Observe the live Risk Gauge meter updating in real-time.\n2. Watch gauge color transition (Green <30%, Yellow 30-70%, Red >70%).\n3. View PostgreSQL RiskAssessment table logs.',
      recommendedConfig: 'Step-up MFA threshold: Risk Index ≥ 0.70.',
    },
    {
      id: 'simulator',
      tabKey: 'risk',
      title: 'Red Team Bot Attack Simulator',
      category: 'Security & Sandboxes',
      icon: Play,
      badge: 'Feature 3',
      summary: 'Programmatically dispatches synthetic straight-line 16ms mouse vectors and zero-jitter keypresses over the active WebSocket connection.',
      howItWorks: 'Dispatches synthetic telemetry through the exact same WebSocket pipeline as real users. Straight lines (curvature = 1.0) cause Z-score and IsolationForest anomaly scores to spike (>0.85).',
      howToOperate: '1. Navigate to the Red Team Intruder Simulator tab.\n2. Select "Automated Bot Attack" or "Credential Stuffing Burst".\n3. Click "Launch Simulation" and verify the Risk Gauge turns RED organically.',
      recommendedConfig: 'Synthetic bot step: 16ms intervals, fixed 10ms key dwell.',
    },
    {
      id: 'shap',
      tabKey: 'risk',
      title: 'SHAP Explainable AI (XAI) Attribution',
      category: 'Forensics & Audit',
      icon: BrainCircuit,
      badge: 'Feature 4',
      summary: 'Provides deep mathematical feature attribution breakdown explaining exact biometric anomalies down to millisecond precision.',
      howItWorks: 'Computes SHAP feature importance weights for robotic mouse straightness, dwell time shifts, and flight jitter. Saves factors in RiskAssessment.explainableFactors DB JSON.',
      howToOperate: '1. Open the Explainable AI & SHAP Risk Attribution panel.\n2. Review percentage attribution bars (e.g. Mouse Linearity: 45%).\n3. Read detailed threat impact descriptions.',
      recommendedConfig: 'SHAP calculation mode: TreeExplainer / Fast Kernel approximation.',
    },
    {
      id: 'path-canvas',
      tabKey: 'sessions',
      title: 'Session Mouse Path Canvas Visualization',
      category: 'Forensics & Audit',
      icon: Eye,
      badge: 'Feature 5',
      summary: 'Side-by-side HTML5 canvas replay rendering smooth organic human arcs vs rigid robotic bot lines.',
      howItWorks: 'Stores raw (x, y, t) coordinates in BehavioralSession.mousePoints in PostgreSQL. Renders green curved paths for human baseline vs red straight lines for bot attacks.',
      howToOperate: '1. Open the Session Replay & Mouse Path tab.\n2. View the side-by-side canvas trajectory panel.\n3. Compare smooth human curvature against rigid straight-line bot attack vectors.',
      recommendedConfig: 'Coordinate sampling: max 200 points per session window.',
    },
    {
      id: 'dashboard',
      tabKey: 'dashboard',
      title: 'Live Command Center',
      category: 'Overview',
      icon: ShieldCheck,
      badge: 'Core UI',
      summary: 'Central Zero-Trust command dashboard aggregating live risk spectrums, active session tables, and block rates.',
      howItWorks: 'Continuously streams WebSocket telemetry from active sessions. Calculates decaying risk scores using NIST SP 800-207 guidelines.',
      howToOperate: '1. Monitor floating metric callouts for active session volume and risk index.\n2. Observe the Live Risk Spectrum Wave.\n3. Inspect the Active Identity Matrix table.',
      recommendedConfig: 'Default risk threshold: 0.70 for Step-Up MFA challenge.',
    },
  ];

  const categories = ['ALL', 'Overview', 'Biometrics & AI Engine', 'Security & Sandboxes', 'Forensics & Audit'];

  const filteredModules = docModules.filter((doc) => {
    const matchesCategory = activeCategory === 'ALL' || doc.category === activeCategory;
    const matchesSearch =
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.howItWorks.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const copyScriptTag = () => {
    const code = `<script src="http://localhost:3001/aegis-tracker.js" data-site-id="aegis_site_prod_99182" async></script>`;
    navigator.clipboard.writeText(code);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="border border-zinc-200/80 rounded-2xl p-6 bg-white shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-200 flex items-center justify-center text-white shrink-0 shadow-xs">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-base font-bold text-zinc-900 tracking-tight">Developer Documentation & SDK Integration Center</h2>
            <p className="text-xs text-zinc-500 font-light mt-0.5">
              Comprehensive architectural guides, SDK installation snippets, and operational parameters for all 5 core biometric features.
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search docs, APIs, parameters..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-mono text-zinc-900 focus:outline-none focus:border-zinc-400 transition-all placeholder:text-zinc-400"
          />
        </div>
      </div>

      {/* ══ 1. QUICK-START ONBOARDING STEPS FOR NEW DEVELOPERS ══ */}
      <div className="p-6 rounded-2xl border border-zinc-200/80 bg-white shadow-xs space-y-4">
        <div className="flex items-center space-x-2 pb-3 border-b border-zinc-100">
          <Sparkles className="w-4 h-4 text-zinc-400" />
          <h3 className="text-xs font-bold text-zinc-900 tracking-tight">Getting Started: 5-Step Core Biometric Flow</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 font-mono text-xs">
          <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/80 space-y-1">
            <div className="text-[10px] text-zinc-400 uppercase font-bold">Step 01</div>
            <div className="text-xs font-bold text-zinc-900 font-sans">Baseline Calibration</div>
            <div className="text-[11px] text-zinc-500 font-light leading-relaxed font-sans pt-1">
              User runs 60s enrolment mode. AegisAI stores mouse velocity and keystroke dwell times in PostgreSQL.
            </div>
          </div>

          <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/80 space-y-1">
            <div className="text-[10px] text-zinc-400 uppercase font-bold">Step 02</div>
            <div className="text-xs font-bold text-zinc-900 font-sans">WebSocket Telemetry</div>
            <div className="text-[11px] text-zinc-500 font-light leading-relaxed font-sans pt-1">
              Client SDK buffers mouse movement vectors and key press dwell times and streams over WebSockets.
            </div>
          </div>

          <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/80 space-y-1">
            <div className="text-[10px] text-zinc-400 uppercase font-bold">Step 03</div>
            <div className="text-xs font-bold text-zinc-900 font-sans">Z-Score & IsolationForest</div>
            <div className="text-[11px] text-zinc-500 font-light leading-relaxed font-sans pt-1">
              Backend computes Z-score against stored baseline and IsolationForest anomaly score in real-time.
            </div>
          </div>

          <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/80 space-y-1">
            <div className="text-[10px] text-zinc-400 uppercase font-bold">Step 04</div>
            <div className="text-xs font-bold text-zinc-900 font-sans">Red Team Bot Simulator</div>
            <div className="text-[11px] text-zinc-500 font-light leading-relaxed font-sans pt-1">
              Dispatches synthetic 16ms straight-line bot vectors over WebSockets to turn Risk Gauge RED organically.
            </div>
          </div>

          <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/80 space-y-1">
            <div className="text-[10px] text-zinc-400 uppercase font-bold">Step 05</div>
            <div className="text-xs font-bold text-zinc-900 font-sans">SHAP XAI & Canvas Replay</div>
            <div className="text-[11px] text-zinc-500 font-light leading-relaxed font-sans pt-1">
              Inspect SHAP feature attributions and view side-by-side canvas path visualizer.
            </div>
          </div>
        </div>
      </div>

      {/* ══ 2. LIVE SDK SCRIPT SNIPPET GENERATOR ══ */}
      <div className="p-6 rounded-2xl border border-zinc-200/80 bg-white shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
          <div className="flex items-center space-x-2">
            <FileCode2 className="w-4 h-4 text-zinc-900" />
            <h3 className="text-xs font-bold text-zinc-900 tracking-tight">Client Integration Code Snippets</h3>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-mono font-bold border border-emerald-200">
            AegisTracker SDK v2.4
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* HTML Script Tag */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-zinc-900 font-mono">1. HTML Script Tag Integration</div>
            <div className="relative rounded-xl bg-zinc-900 text-zinc-100 p-4 font-mono text-xs overflow-x-auto border border-zinc-800">
              <pre className="text-[11px] leading-relaxed text-emerald-400">
                {`<script
  src="http://localhost:3001/aegis-tracker.js"
  data-site-id="aegis_site_prod_99182"
  async
></script>`}
              </pre>
              <button
                onClick={copyScriptTag}
                className="absolute right-3 top-3 px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-[10px] font-mono font-bold transition-colors cursor-pointer border border-zinc-700"
              >
                <span>{copiedSnippet ? 'Copied! 📋' : 'Copy HTML Tag 📋'}</span>
              </button>
            </div>
          </div>

          {/* React / TypeScript SDK Code */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-zinc-900 font-mono">2. React / TypeScript SDK Setup</div>
            <div className="relative rounded-xl bg-zinc-900 text-zinc-100 p-4 font-mono text-xs overflow-x-auto border border-zinc-800">
              <pre className="text-[11px] leading-relaxed text-blue-300">
                {`import { globalTelemetryTracker } from '@/lib/telemetry-tracker';

// Initialize tracking
globalTelemetryTracker.init({
  userId: 'user@domain.com',
  sessionId: 'sess_live_991',
});

// Programmatic Bot Simulator Trigger
globalTelemetryTracker.simulateBotAttackBatch({
  pointCount: 50,
});`}
              </pre>
            </div>
          </div>
        </div>
      </div>

      <div className="laser-divider" />

      {/* ══ 3. CATEGORY FILTERS ══ */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-semibold cursor-pointer transition-all whitespace-nowrap border ${
              activeCategory === cat
                ? 'bg-zinc-900 text-white border-zinc-900 shadow-xs'
                : 'bg-white text-zinc-600 hover:text-zinc-900 border-zinc-200 hover:bg-zinc-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* ══ 4. FEATURE DOCUMENTATION MODULES ══ */}
      <div className="space-y-6">
        {filteredModules.map((doc) => {
          const Icon = doc.icon;
          return (
            <div key={doc.id} className="p-6 rounded-2xl border border-zinc-200/80 bg-white shadow-xs space-y-4 hover:border-zinc-300 transition-all">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-zinc-900 flex items-center justify-center text-white shrink-0 shadow-xs">
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-sm font-bold text-zinc-900 tracking-tight">{doc.title}</h3>
                      <span className="px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-600 border border-zinc-200 text-[10px] font-mono font-bold">
                        {doc.badge}
                      </span>
                    </div>
                    <span className="text-[11px] text-zinc-400 font-mono">{doc.category}</span>
                  </div>
                </div>

                {onNavigateToTab && (
                  <button
                    onClick={() => onNavigateToTab(doc.tabKey)}
                    className="px-3.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-xs font-mono font-semibold text-white flex items-center space-x-1.5 transition-all cursor-pointer shadow-xs"
                  >
                    <span>Open Feature Live</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <p className="text-xs text-zinc-500 font-light leading-relaxed">{doc.summary}</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2 font-sans text-xs">
                {/* How it works */}
                <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/80 space-y-1">
                  <div className="text-[11px] font-mono font-bold text-zinc-900 flex items-center space-x-1">
                    <Terminal className="w-3.5 h-3.5 text-zinc-400" />
                    <span>How It Works</span>
                  </div>
                  <p className="text-[11px] text-zinc-500 font-light leading-relaxed">{doc.howItWorks}</p>
                </div>

                {/* How to operate */}
                <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/80 space-y-1">
                  <div className="text-[11px] font-mono font-bold text-zinc-900 flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-zinc-400" />
                    <span>How to Operate</span>
                  </div>
                  <div className="text-[11px] text-zinc-500 font-light leading-relaxed whitespace-pre-line">{doc.howToOperate}</div>
                </div>

                {/* Recommended config */}
                <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/80 space-y-1">
                  <div className="text-[11px] font-mono font-bold text-zinc-900 flex items-center space-x-1">
                    <FileCode2 className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Recommended Parameters</span>
                  </div>
                  <p className="text-[11px] text-zinc-500 font-mono leading-relaxed">{doc.recommendedConfig}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
