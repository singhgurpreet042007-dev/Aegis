'use client';

import React, { useState } from 'react';
import { ShieldAlert, Lock, CheckCircle2, X, AlertTriangle } from 'lucide-react';

interface AdaptiveMfaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: () => void;
  riskScore: number;
}

export function AdaptiveMfaModal({ isOpen, onClose, onVerify, riskScore }: AdaptiveMfaModalProps) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [verified, setVerified] = useState(false);

  if (!isOpen) return null;

  // Retrieve user configured 2FA code from localStorage (default: 982401)
  const getExpectedCode = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('aegis_mfa_code') || '982401';
    }
    return '982401';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const targetCode = getExpectedCode();

    if (code.trim() !== targetCode) {
      setError('Incorrect 2FA Security Passcode. Access Denied.');
      return;
    }

    setVerified(true);
    setTimeout(() => {
      setVerified(false);
      setCode('');
      setError('');
      onVerify();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-md max-h-[90vh] overflow-y-auto p-6 rounded-3xl border border-amber-500/40 shadow-2xl shadow-amber-500/10 relative space-y-5">
        <button
          onClick={() => { setError(''); setCode(''); onClose(); }}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-200"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3">
          <div className="p-3 bg-amber-500/20 text-amber-400 border border-amber-500/40 rounded-2xl">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Adaptive Step-Up MFA Challenge</h3>
            <p className="text-xs text-amber-300">Continuous Identity Verification Triggered</p>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 text-xs text-amber-200 leading-relaxed">
          <strong>Security Anomaly Detected:</strong> Behavioral risk score reached ({(riskScore * 100).toFixed(0)}%). Continuous session access requires 2FA authentication.
        </div>

        {verified ? (
          <div className="py-6 text-center space-y-2 text-emerald-400">
            <CheckCircle2 className="w-12 h-12 mx-auto animate-bounce" />
            <div className="font-bold text-base">Identity Successfully Verified!</div>
            <p className="text-xs text-gray-400">Session risk restored to safe state. Access granted.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/40 text-red-400 text-xs font-medium text-center flex items-center justify-center space-x-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1.5 text-left">
              <label className="block text-xs font-semibold text-gray-300">
                Enter 6-Digit Authenticator Passcode:
              </label>
              <input
                type="password"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                placeholder="••••••"
                className="w-full text-center font-mono text-2xl tracking-[0.6em] py-3 bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
              <p className="text-[11px] text-gray-500 mt-1">
                Enter the 6-digit code configured in your Profile & Settings.
              </p>
            </div>

            <button
              type="submit"
              disabled={code.length !== 6}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 disabled:opacity-40 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/20 transition-all cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              <span>Verify & Continue Session</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
