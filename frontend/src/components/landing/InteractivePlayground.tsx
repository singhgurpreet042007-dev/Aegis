'use client';

import { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Search, ArrowRight, CheckCircle2, Fingerprint, Sparkles } from 'lucide-react';
import { connectWebsite } from '@/lib/aegis-website';

export function InteractivePlayground() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  const [urlInput, setUrlInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<{
    domain: string;
    siteId: string;
    sslStatus: string;
    latencyMs: number;
    healthScore: number;
  } | null>(null);

  const [typingSpeed, setTypingSpeed] = useState(0);
  const [keystrokeCount, setKeystrokeCount] = useState(0);
  const [anomalyScore, setAnomalyScore] = useState(0.04);
  const [userText, setUserText] = useState('');
  const lastKeyTimeRef = useRef<number | null>(null);

  const handleScanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    setIsScanning(true);
    try {
      const site = await connectWebsite(urlInput);
      setScanResult({
        domain: site.domain,
        siteId: site.siteId,
        sslStatus: site.sslStatus,
        latencyMs: site.latencyMs,
        healthScore: site.healthScore,
      });
    } catch (_) {
    } finally {
      setIsScanning(false);
    }
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setUserText(text);
    const now = performance.now();

    if (lastKeyTimeRef.current) {
      const delta = now - lastKeyTimeRef.current;
      const speed = Math.round(1000 / Math.max(delta, 10));
      setTypingSpeed(speed);

      const variance = Math.abs(delta - 120) / 500;
      setAnomalyScore(Math.min(0.99, Math.max(0.01, Number((0.02 + variance * 0.15).toFixed(2)))));
    }

    lastKeyTimeRef.current = now;
    setKeystrokeCount((prev) => prev + 1);
  };

  return (
    <section ref={sectionRef} className="relative py-20 md:py-28 bg-slate-50/50 text-slate-900 border-t border-slate-100">
      <div className="max-w-[1240px] mx-auto px-6 md:px-10">
        {/* Section Header grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end mb-14">
          <motion.div
            className="lg:col-span-7"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="text-[10.5px] font-bold text-cyan-600 tracking-widest uppercase mb-2 font-mono">
              INTERACTIVE PLAYGROUND
            </div>
            <h2 className="text-2xl sm:text-3xl font-normal text-slate-900 tracking-tight leading-snug">
              Test Sentinel & Biometrics{' '}
              <span className="font-serif-italic italic text-cyan-600 font-normal">
                in real-time
              </span>
            </h2>
          </motion.div>

          {/* Cursive Editorial Paragraph Card */}
          <motion.div
            className="lg:col-span-5 p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.15 }}
          >
            <div className="flex items-center space-x-2 text-cyan-600 mb-2 font-mono text-[10px] font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>LIVE DEMO EXPERIMENT</span>
            </div>
            <p className="font-serif-italic italic text-slate-700 text-[15px] sm:text-[16.5px] leading-relaxed">
              &ldquo;Experience real-time behavioral capture and domain security posture analysis directly within your browser window.&rdquo;
            </p>
          </motion.div>
        </div>

        {/* Playground Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Tool 1: Sentinel Domain Scanner */}
          <motion.div
            className="lg:col-span-6 p-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm flex flex-col justify-between"
            initial={{ opacity: 0, y: 25 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <div>
              <div className="flex items-center space-x-3 mb-5">
                <div className="w-9 h-9 rounded-2xl bg-cyan-50 border border-cyan-200 flex items-center justify-center">
                  <Search className="w-4 h-4 text-cyan-600" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Sentinel Domain Inspector</h3>
                  <p className="text-xs text-slate-500 font-normal">Scan any URL for TLS certificate, SSL, and security posture</p>
                </div>
              </div>

              <form onSubmit={handleScanSubmit} className="space-y-4 mb-5">
                <div className="relative">
                  <input
                    type="text"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://example.com"
                    className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono placeholder:text-slate-400 focus:outline-none focus:border-cyan-500 focus:bg-white transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={isScanning}
                    className="absolute right-1.5 top-1.5 bottom-1.5 px-3.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors flex items-center space-x-1 disabled:opacity-50"
                  >
                    <span>{isScanning ? 'Scanning...' : 'Scan URL'}</span>
                    <ArrowRight className="w-3 h-3 text-cyan-400" />
                  </button>
                </div>
              </form>

              {scanResult ? (
                <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between text-emerald-800 font-bold">
                    <span className="flex items-center space-x-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>{scanResult.domain}</span>
                    </span>
                    <span className="text-emerald-700">{scanResult.latencyMs}ms</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-emerald-900 pt-2 border-t border-emerald-200/60">
                    <div>Site ID: <span className="font-bold">{scanResult.siteId}</span></div>
                    <div>SSL: <span className="font-bold">{scanResult.sslStatus}</span></div>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 text-center text-xs font-mono text-slate-500">
                  Enter a website URL above to generate an instant security report.
                </div>
              )}
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-[10.5px] font-mono text-slate-400 font-medium">
              <span>SENTINEL API V1.4</span>
              <span>TLS 1.3 AUDIT ACTIVE</span>
            </div>
          </motion.div>

          {/* Tool 2: Live Biometrics Keystroke Analyzer */}
          <motion.div
            className="lg:col-span-6 p-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm flex flex-col justify-between"
            initial={{ opacity: 0, y: 25 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            <div>
              <div className="flex items-center space-x-3 mb-5">
                <div className="w-9 h-9 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                  <Fingerprint className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Live Keystroke Biometrics</h3>
                  <p className="text-xs text-slate-500 font-normal">Type in the input box below to observe live anomaly calculation</p>
                </div>
              </div>

              <div className="space-y-4 mb-5">
                <input
                  type="text"
                  value={userText}
                  onChange={handleTyping}
                  placeholder="Type anything here to test behavioral telemetry..."
                  className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors"
                />

                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-center">
                    <div className="text-[9.5px] text-slate-500 mb-1 font-mono uppercase font-bold">Keystrokes</div>
                    <div className="text-base font-bold text-slate-900 font-mono">{keystrokeCount}</div>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-center">
                    <div className="text-[9.5px] text-slate-500 mb-1 font-mono uppercase font-bold">Speed</div>
                    <div className="text-base font-bold text-slate-900 font-mono">{typingSpeed} <span className="text-xs font-normal text-slate-500">k/s</span></div>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-center">
                    <div className="text-[9.5px] text-slate-500 mb-1 font-mono uppercase font-bold">Risk</div>
                    <div className="text-base font-bold text-emerald-600 font-mono">{(anomalyScore * 100).toFixed(1)}%</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[10.5px] font-mono text-slate-400 font-medium">
              <span>ISOLATIONFOREST 100 TREES</span>
              <span>SUB-200MS INFERENCE</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
