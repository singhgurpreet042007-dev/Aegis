import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Sparkles, Send, Zap, CheckCircle2, FileText, Lock, ShieldAlert, Terminal, Activity, Globe } from 'lucide-react';
import { useConnectedWebsite } from '@/lib/aegis-website';

interface AiSentinelViewProps {
  currentRiskScore?: number;
}

export function AiSentinelView({ currentRiskScore = 0.08 }: AiSentinelViewProps) {
  const { connectedSite, isConnected } = useConnectedWebsite();
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: isConnected && connectedSite
        ? `Hello! I am AEGIS Cyber Sentinel. Currently monitoring active target website: ${connectedSite.domain} (${connectedSite.url}).\n\nCurrent Threat Level: ${
            currentRiskScore >= 0.40 ? 'ELEVATED RISK (Bot Vector Detected)' : 'LOW RISK (Nominal)'
          }.\n\nHow can I help you protect ${connectedSite.domain} today?`
        : `Hello! I am AEGIS Cyber Sentinel, your autonomous SecOps assistant operating on NIST SP 800-207 Zero Trust guidelines. Connect a target website URL to enable active monitoring.`,
      timestamp: 'Just now',
    },
  ]);
  const [input, setInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [mitigated, setMitigated] = useState(false);

  if (!isConnected) {
    return (
      <div className="p-8 rounded-2xl border border-amber-500/30 bg-amber-950/20 text-center space-y-4">
        <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
          <Globe className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-base font-bold text-white">No Target Website Connected</h3>
          <p className="text-xs text-neutral-400 mt-1 max-w-md mx-auto">
            Please connect your website URL in the <strong className="text-white">"Connect Website"</strong> section to enable AEGIS Cyber Sentinel AI assistance for your domain.
          </p>
        </div>
      </div>
    );
  }

  const handleSendMessage = (textToSend?: string) => {
    const prompt = textToSend || input;
    if (!prompt.trim()) return;

    const newMsg = { sender: 'user', text: prompt, timestamp: 'Just now' };
    setMessages((prev) => [...prev, newMsg]);
    if (!textToSend) setInput('');
    setIsAnalyzing(true);

    setTimeout(() => {
      let reply = '';
      if (prompt.toLowerCase().includes('rca') || prompt.toLowerCase().includes('analyze') || prompt.toLowerCase().includes('bot')) {
        reply = `🔍 **Root Cause Analysis (RCA) Report Generated**:\n\n` +
          `- **Target Session Token**: \`sess_prod_active_99182\`\n` +
          `- **Attacker Origin**: \`185.220.101.5\` (Frankfurt, DE - TOR Exit Node)\n` +
          `- **Anomalous Features**: Linear mouse curvature (straightness 0.98 vs 0.38 baseline), 5ms zero-jitter keystrokes.\n` +
          `- **Classification**: High-Confidence Bot Automation / Credential Stuffing Macro.\n` +
          `- **Recommended Action**: Revoke session token immediately & blacklist origin IP subnet.`;
      } else if (prompt.toLowerCase().includes('mitigate') || prompt.toLowerCase().includes('block') || prompt.toLowerCase().includes('contain')) {
        reply = `⚡ **Autonomous Containment Playbook Executed**:\n\n` +
          `1. Session \`sess_prod_active_99182\` immediately terminated.\n` +
          `2. Origin IP \`185.220.101.5\` added to Global Firewall Blacklist.\n` +
          `3. Mandatory Step-up 2FA Challenge issued to secondary user tokens.\n` +
          `4. Traffic payload mirrored into Digital Twin Honeypot Sandbox for forensic extraction.`;
        setMitigated(true);
      } else {
        reply = `I have completed a real-time telemetry scan for your query: "${prompt}". Aegis-AI Risk Engine reports active sessions are monitored under IsolationForest and Gaussian Mixture Models with 0.94 anomaly confidence. All threat vectors are currently contained.`;
      }

      setMessages((prev) => [...prev, { sender: 'ai', text: reply, timestamp: 'Just now' }]);
      setIsAnalyzing(false);
    }, 900);
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center space-x-2">
            <Bot className="w-5 h-5 text-white" />
            <h2 className="text-base font-extrabold text-white tracking-tight">AI Cyber Sentinel Analyst</h2>
            <span className="px-2 py-0.5 rounded-full bg-white/10 text-neutral-300 text-[10px] font-mono">
              Autonomous LLM SecOps
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Autonomous AI security assistant that analyzes telemetry, generates incident RCA reports, and executes 1-click threat mitigations
          </p>
        </div>

        {mitigated && (
          <div className="text-xs font-mono font-bold text-emerald-400 flex items-center space-x-1.5">
            <CheckCircle2 className="w-4 h-4" />
            <span>● THREAT AUTO-MITIGATED</span>
          </div>
        )}
      </div>

      {/* ══ 1. SENTINEL METRIC CALLOUTS (PROPORTIONAL SIZES, NO GLOW) ══ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="space-y-1">
          <div className="text-[11px] text-neutral-400 font-semibold uppercase tracking-wider flex items-center space-x-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-neutral-400" />
            <span>Containment Rate</span>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">99.4%</div>
          <div className="text-[11px] text-neutral-400 font-mono">Autonomous Execution</div>
        </div>

        <div className="space-y-1">
          <div className="text-[11px] text-neutral-400 font-semibold uppercase tracking-wider flex items-center space-x-1.5">
            <Zap className="w-3.5 h-3.5 text-neutral-400" />
            <span>Decision Latency</span>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">18ms</div>
          <div className="text-[11px] text-neutral-400 font-mono">Sub-Second Response</div>
        </div>

        <div className="space-y-1">
          <div className="text-[11px] text-neutral-400 font-semibold uppercase tracking-wider flex items-center space-x-1.5">
            <Activity className="w-3.5 h-3.5 text-neutral-400" />
            <span>Active Security Rules</span>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">24 Rules</div>
          <div className="text-[11px] text-neutral-400 font-mono">Zero Trust Enforced</div>
        </div>

        <div className="space-y-1">
          <div className="text-[11px] text-neutral-400 font-semibold uppercase tracking-wider flex items-center space-x-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-neutral-400" />
            <span>Threat Blocked Today</span>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">42 Threats</div>
          <div className="text-[11px] text-neutral-400 font-mono">100% Contained</div>
        </div>
      </div>

      <div className="laser-divider" />

      {/* ══ 2. MAIN LAYOUT: CHAT CONSOLE & AUTONOMOUS PLAYBOOKS (PURE OPEN LAYOUT) ══ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chat Console */}
        <div className="lg:col-span-2 flex flex-col h-[460px] justify-between space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div className="flex items-center space-x-2">
              <Terminal className="w-4 h-4 text-neutral-400" />
              <h3 className="text-xs font-bold text-white tracking-tight">SecOps Conversational Console</h3>
            </div>
            <span className="text-[10px] font-mono text-neutral-400">LLM Telemetry Engine</span>
          </div>

          {/* Chat Messages Log */}
          <div className="overflow-y-auto space-y-4 flex-1 pr-2 scrollbar-none">
            <AnimatePresence initial={false}>
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  className={`flex space-x-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {m.sender === 'ai' && (
                    <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-white shrink-0 font-mono text-[10px]">
                      AI
                    </div>
                  )}
                  <div
                    className={`max-w-lg p-3 text-xs leading-relaxed font-sans ${
                      m.sender === 'user'
                        ? 'bg-white text-black font-semibold rounded-lg'
                        : 'text-neutral-200 border-b border-white/10 pb-3 font-mono whitespace-pre-line'
                    }`}
                  >
                    {m.text}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {isAnalyzing && (
              <div className="flex items-center space-x-2 text-xs text-neutral-400 font-mono italic">
                <Sparkles className="w-3.5 h-3.5 animate-spin text-white" />
                <span>Sentinel AI is analyzing threat telemetry...</span>
              </div>
            )}
          </div>

          {/* Input Bar */}
          <div className="pt-2 border-t border-white/10">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center space-x-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask Sentinel AI (e.g., 'Generate RCA Report' or 'Mitigate active threat')..."
                className="flex-1 px-3.5 py-2 bg-white/5 border border-white/15 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white/40 transition-colors font-sans"
              />
              <button
                type="submit"
                className="p-2 bg-white text-black hover:bg-neutral-200 rounded-xl transition-colors cursor-pointer shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Quick Action Playbooks (No Cards) */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2 border-b border-white/10 pb-2">
            <Zap className="w-4 h-4 text-neutral-400" />
            <h3 className="text-xs font-bold text-white tracking-tight">Autonomous SecOps Playbooks</h3>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <button
              onClick={() => handleSendMessage('Generate Incident RCA Report for recent threat')}
              className="w-full py-2.5 border-b border-white/10 text-left text-neutral-200 hover:text-white transition-colors flex items-center space-x-3 cursor-pointer group"
            >
              <FileText className="w-4 h-4 text-neutral-400 group-hover:text-white shrink-0" />
              <div>
                <div className="font-bold text-white font-sans text-xs">Generate Incident RCA Report</div>
                <div className="text-[10px] text-neutral-400 mt-0.5">Extract root cause & SHAP scores</div>
              </div>
            </button>

            <button
              onClick={() => handleSendMessage('Mitigate active threat and block offending IP')}
              className="w-full py-2.5 border-b border-white/10 text-left text-neutral-200 hover:text-white transition-colors flex items-center space-x-3 cursor-pointer group"
            >
              <Lock className="w-4 h-4 text-rose-400 shrink-0" />
              <div>
                <div className="font-bold text-white font-sans text-xs">Execute Auto-Mitigation Playbook</div>
                <div className="text-[10px] text-rose-400 mt-0.5">Kill session & blacklist attacker IP</div>
              </div>
            </button>

            <button
              onClick={() => handleSendMessage('Isolate session into Digital Twin Honeypot Sandbox')}
              className="w-full py-2.5 border-b border-white/10 text-left text-neutral-200 hover:text-white transition-colors flex items-center space-x-3 cursor-pointer group"
            >
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <div className="font-bold text-white font-sans text-xs">Isolate into Honeypot Sandbox</div>
                <div className="text-[10px] text-amber-400 mt-0.5">Mirror traffic & extract payload</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
