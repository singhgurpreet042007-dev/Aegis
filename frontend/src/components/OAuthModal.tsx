'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, User, Plus, ArrowRight, X } from 'lucide-react';
import { fetchApi } from '@/lib/api-client';

interface OAuthModalProps {
  isOpen: boolean;
  provider: 'google' | 'microsoft' | null;
  mode?: 'login' | 'signup';
  onClose: () => void;
  onSuccess: (data: any) => void;
  onError?: (msg: string) => void;
}

export function OAuthModal({ isOpen, provider, mode = 'login', onClose, onSuccess, onError }: OAuthModalProps) {
  const [step, setStep] = useState<'choose' | 'custom'>('choose');
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const accountsList = [
    { name: 'Gurpreet Singh', email: 'singh.gurpreet042007@gmail.com', avatar: 'GS' },
    { name: 'Gurpreet Singh', email: 'varundhawanp2@gmail.com', avatar: 'GS' },
    { name: 'Balvir Singh', email: 'balvirsingh14527@gmail.com', avatar: 'BS' },
  ];

  useEffect(() => {
    if (isOpen) {
      setStep('choose');
      setErrorMsg('');
      setIsLoading(false);
    }
  }, [isOpen]);

  if (!isOpen || !provider) return null;

  const isGoogle = provider === 'google';
  const providerName = isGoogle ? 'Google' : 'Microsoft';

  const handleOpenGoogleSystemWindow = () => {
    // Open Chrome's Account Chooser page
    window.open('https://accounts.google.com/AccountChooser', '_blank', 'width=520,height=630');
  };

  const handleSelectAccount = async (email: string, fullName: string) => {
    setIsLoading(true);
    setErrorMsg('');

    try {
      const data = await fetchApi('/auth/oauth', {
        method: 'POST',
        body: JSON.stringify({
          email,
          fullName,
          provider,
          mode,
        }),
      });

      if (data && data.success) {
        onSuccess(data.data);
      } else {
        const msg = data?.error?.message || data?.message || `No AegisAI account found for ${email}. Please Sign Up first!`;
        setErrorMsg(msg);
        if (onError) onError(msg);
      }
    } catch {
      if (mode === 'login') {
        const msg = `No AegisAI account found for ${email}. Please Sign Up first!`;
        setErrorMsg(msg);
        if (onError) onError(msg);
      } else {
        onSuccess({
          accessToken: `oauth_token_${Date.now()}`,
          user: { fullName, email, provider },
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail) return;
    const name = customName.trim() || customEmail.split('@')[0];
    handleSelectAccount(customEmail, name);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 10 }}
          transition={{ duration: 0.2 }}
          className="bg-[#121318] text-white rounded-3xl w-full max-w-[420px] max-h-[90vh] overflow-y-auto shadow-2xl border border-zinc-800 font-sans"
        >
          {/* Top Bar Header */}
          <div className="px-6 pt-5 pb-3 flex items-center justify-between border-b border-zinc-800/80">
            <div className="flex items-center space-x-2.5">
              <GoogleIcon className="w-5 h-5" />
              <span className="text-xs font-mono text-zinc-400 font-bold">accounts.google.com</span>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center font-bold text-xs cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-6 space-y-5">
            {/* Header Google Logo & Title */}
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto mb-2 shadow-xs">
                <GoogleIcon className="w-7 h-7" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-white">Choose an account</h2>
              <p className="text-xs text-zinc-400 font-medium">
                to continue to <span className="font-bold text-white">AEGIS</span>
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-950/80 border border-red-800 text-red-300 text-xs font-semibold text-center">
                {errorMsg}
              </div>
            )}

            {step === 'choose' ? (
              /* Google Account Selector List */
              <div className="space-y-2 pt-1">
                {accountsList.map((acc, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectAccount(acc.email, acc.name)}
                    disabled={isLoading}
                    className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800/90 hover:border-zinc-600 transition-all cursor-pointer text-left group"
                  >
                    <div className="flex items-center space-x-3.5">
                      <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-extrabold text-sm flex items-center justify-center shadow-xs">
                        {acc.avatar}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">
                          {acc.name}
                        </div>
                        <div className="text-[11px] text-zinc-400 font-mono">{acc.email}</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-emerald-400 transition-transform group-hover:translate-x-0.5" />
                  </button>
                ))}

                {/* Use Another Account Option */}
                <button
                  type="button"
                  onClick={() => setStep('custom')}
                  className="w-full flex items-center space-x-3.5 p-3.5 rounded-2xl border border-dashed border-zinc-700 bg-zinc-900/40 hover:bg-zinc-800 hover:border-zinc-500 transition-all cursor-pointer text-left group"
                >
                  <div className="w-10 h-10 rounded-full bg-zinc-800 text-zinc-400 flex items-center justify-center">
                    <User className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-bold text-white">Use another account</div>
                    <div className="text-[10px] text-zinc-400">Sign in with a different Google account</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-500" />
                </button>
              </div>
            ) : (
              /* Custom Google Email Entry */
              <form onSubmit={handleCustomSubmit} className="space-y-3 pt-1">
                <div className="space-y-1 text-left">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                    Google Email
                  </label>
                  <input
                    type="email"
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    placeholder="e.g. yourname@gmail.com"
                    required
                    className="w-full h-10 px-3 rounded-xl border border-zinc-700 bg-zinc-900 text-white focus:border-emerald-500 text-xs font-medium outline-none"
                  />
                </div>

                <div className="space-y-1 text-left">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="Enter your name"
                    required
                    className="w-full h-10 px-3 rounded-xl border border-zinc-700 bg-zinc-900 text-white focus:border-emerald-500 text-xs font-medium outline-none"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setStep('choose')}
                    className="text-xs font-bold text-zinc-400 hover:text-white"
                  >
                    ← Back to Accounts
                  </button>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer disabled:opacity-50 flex items-center space-x-1.5"
                  >
                    <span>{isLoading ? 'Authenticating...' : 'Sign In'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            )}

            {/* Bottom System Button */}
            <div className="pt-2 border-t border-zinc-800 text-center">
              <button
                type="button"
                onClick={handleOpenGoogleSystemWindow}
                className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 hover:underline"
              >
                Open Google Account Settings in Chrome
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

function GoogleIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09Z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23Z" fill="#34A853" />
      <path d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84Z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z" fill="#EB4335" />
    </svg>
  );
}
