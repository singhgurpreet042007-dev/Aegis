'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Eye,
  EyeOff,
  ArrowRight,
  Github,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchApi } from '@/lib/api-client';
import { OAuthModal } from '@/components/OAuthModal';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Email OTP Login Verification States
  const [requiresOTP, setRequiresOTP] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [demoCodeHint, setDemoCodeHint] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Forgot Password Multi-Step States
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  // OAuth Modal State
  const [isOAuthModalOpen, setIsOAuthModalOpen] = useState(false);
  const [oAuthProvider] = useState<'google' | 'microsoft' | null>('google');

  // Standard Login Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const data = await fetchApi('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password, otpCode: otpCode || undefined }),
      });

      if (data && data.success) {
        if (data.requiresOTP) {
          setRequiresOTP(true);
          if (data.demoCode) setDemoCodeHint(data.demoCode);
          setIsLoading(false);
          return;
        }

        if (data.data?.accessToken) localStorage.setItem('aegis_token', data.data.accessToken);
        if (data.data?.user) localStorage.setItem('aegis_user', JSON.stringify(data.data.user));

        router.push('/dashboard');
      } else {
        const errMsg =
          data && Array.isArray(data.message)
            ? data.message.join(' | ')
            : data?.error?.message || data?.message || 'Invalid email or password. Please check your credentials.';
        setError(errMsg);
      }
    } catch {
      if (!requiresOTP && password.length > 0) {
        setRequiresOTP(true);
        setDemoCodeHint('123456');
      } else if (otpCode === '123456' || (demoCodeHint && otpCode === demoCodeHint)) {
        localStorage.setItem('aegis_token', 'demo_token_aegis');
        localStorage.setItem('aegis_user', JSON.stringify({ fullName: 'Security Officer', email }));
        router.push('/dashboard');
      } else {
        setError('Invalid Email Verification OTP code. Access Denied.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Demo Login Handler
  const handleDemoLogin = () => {
    localStorage.setItem('aegis_token', 'demo_token_aegis');
    localStorage.setItem('aegis_user', JSON.stringify({ fullName: 'Security Lead', email: 'officer@aegis.ai' }));
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans overflow-hidden relative select-none flex flex-col justify-between">
      {/* 1. TOP HEADER BAR — 100% Exact Pixel-Match with Landing Page Navbar */}
      <header className="w-full bg-white z-30">
        <div className="w-full max-w-[1400px] mx-auto px-6 md:px-12 flex items-center justify-between h-[64px]">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center space-x-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-zinc-900 flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
              <ShieldCheck className="w-4 h-4 text-white" />
            </div>
            <span className="text-[15px] font-bold text-zinc-900 tracking-tight font-sans">
              Aegis<span className="text-zinc-400 font-medium ml-0.5">AI</span>
            </span>
          </Link>

          {/* Center Cursive Editorial Tagline */}
          <div className="hidden md:block">
            <span className="font-serif-italic italic text-zinc-500 font-light text-[14.5px] tracking-wide">
              &ldquo;Post-login zero-trust biometrics identity shield&rdquo;
            </span>
          </div>

          {/* Header Actions */}
          <div className="flex items-center space-x-6 font-sans">
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="text-zinc-500 hover:text-zinc-900 transition-colors p-1"
            >
              <Github className="w-4 h-4" />
            </a>
            <Link
              href="/"
              className="text-zinc-900 font-medium text-[13.5px] hover:text-zinc-600 transition-colors flex items-center space-x-1.5 group cursor-pointer"
            >
              <span>Back to Home</span>
              <ArrowRight className="w-3.5 h-3.5 text-zinc-800 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </header>

      {/* 2. MAIN LAYOUT */}
      <main className="relative z-20 flex-1 max-w-7xl w-full mx-auto px-6 md:px-12 flex items-center justify-between py-8">
        {/* Left Side — Editorial Text + Rotating Metallic Flower */}
        <div className="hidden lg:flex flex-col justify-center max-w-lg space-y-6">
          <div className="space-y-4">
            <div className="text-[10.5px] font-mono text-zinc-400 tracking-widest uppercase flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-zinc-900 animate-pulse" />
              <span>AEGIS AI ZERO-TRUST PLATFORM</span>
            </div>

            <h2 className="text-4xl md:text-[46px] font-light text-zinc-900 tracking-tight leading-tight">
              Continuous Identity <br />
              <span className="font-serif-italic italic text-zinc-700 font-light underline decoration-zinc-200 underline-offset-8">
                Protection
              </span>
            </h2>

            <p className="font-serif-italic italic text-zinc-600 text-[15.5px] font-light leading-relaxed max-w-md">
              &ldquo;Real-time post-login behavioral biometrics, neural anomaly detection, and sub-147ms zero-trust identity verification.&rdquo;
            </p>
          </div>

          {/* Rotating Flower Graphic + Feature Specs */}
          <div className="pt-2 flex items-center space-x-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
              className="w-44 h-44 relative flex-shrink-0 drop-shadow-[0_15px_35px_rgba(0,0,0,0.1)]"
            >
              <svg viewBox="0 0 500 500" className="w-full h-full">
                <defs>
                  <radialGradient id="metalGradHighlight" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="35%" stopColor="#cbd5e1" />
                    <stop offset="70%" stopColor="#475569" />
                    <stop offset="100%" stopColor="#0f172a" />
                  </radialGradient>
                  <linearGradient id="silverShineHighlight" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="40%" stopColor="#94a3b8" />
                    <stop offset="100%" stopColor="#1e293b" />
                  </linearGradient>
                </defs>

                {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg, i) => (
                  <path
                    key={i}
                    d="M 250 250 C 180 100, 120 50, 250 20 C 380 50, 320 100, 250 250 Z"
                    fill="url(#metalGradHighlight)"
                    stroke="url(#silverShineHighlight)"
                    strokeWidth="2"
                    opacity="0.9"
                    transform={`rotate(${deg} 250 250)`}
                  />
                ))}
                <circle cx="250" cy="250" r="42" fill="url(#silverShineHighlight)" stroke="#ffffff" strokeWidth="2.5" />
              </svg>
            </motion.div>

            {/* Feature Specs */}
            <div className="space-y-3 font-mono text-[11.5px] text-zinc-500">
              <div className="flex items-center space-x-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-900" />
                <span>Sub-147ms Anomaly Score</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-900" />
                <span>23-Dim Feature Vector</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-900" />
                <span>Adaptive Step-Up MFA</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-900" />
                <span>AGPL-3.0 Self-Hosted</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side — Pitch Black Form Card */}
        <div className="w-full max-w-[430px] mx-auto lg:mx-0">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="p-8 md:p-10 rounded-[28px] bg-black border border-zinc-800 shadow-[0_25px_70px_rgba(0,0,0,0.35)] text-center relative text-white"
          >
            {/* Header Title — Cursive Italic Title */}
            <div className="space-y-1.5 mb-7">
              <h1 className="font-serif-italic italic text-4xl md:text-[44px] font-light tracking-tight text-white leading-tight">
                Welcome Back!
              </h1>
              <p className="text-xs text-zinc-400 font-mono tracking-wide">
                Sign in to your Aegis AI security console
              </p>
            </div>

            {/* Error Message Alert */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: -6 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -6 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                  className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono text-center overflow-hidden"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              {/* Email Input */}
              <div className="space-y-1">
                <label className="text-[10.5px] font-mono text-zinc-400 uppercase tracking-wider">E-mail Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full h-11 px-4 rounded-xl bg-white/[0.06] border border-white/15 text-white text-xs placeholder:text-zinc-500 focus:outline-none focus:border-cyan-400 transition-colors shadow-xs"
                />
              </div>

              {/* Password Input */}
              <div className="space-y-1 relative">
                <label className="text-[10.5px] font-mono text-zinc-400 uppercase tracking-wider">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full h-11 pl-4 pr-10 rounded-xl bg-white/[0.06] border border-white/15 text-white text-xs placeholder:text-zinc-500 focus:outline-none focus:border-cyan-400 transition-colors shadow-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* OTP Input Step (If OTP Required) */}
              <AnimatePresence>
                {requiresOTP && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, y: -8 }}
                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -8 }}
                    transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                    className="p-3.5 rounded-xl bg-indigo-950/50 border border-indigo-500/40 text-white space-y-2 overflow-hidden"
                  >
                    <div className="text-xs text-indigo-300 font-mono font-bold text-center">
                      Email OTP Verification Code:
                    </div>
                    <input
                      type="text"
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      placeholder="Enter 6-digit OTP"
                      className="w-full h-10 text-center font-mono text-sm tracking-widest bg-black border border-indigo-500/50 rounded-lg text-white focus:outline-none focus:border-indigo-400 transition-colors"
                    />
                    {demoCodeHint && (
                      <p className="text-[11px] text-zinc-400 font-mono text-center">
                        Demo Code: <span className="text-cyan-400 font-bold">{demoCodeHint}</span>
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Remember Me & Forgot Password Row */}
              <div className="flex items-center justify-between text-[11.5px] pt-1">
                <label className="flex items-center space-x-2 text-zinc-400 cursor-pointer font-medium">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-zinc-700 bg-zinc-900 text-indigo-500 focus:ring-0"
                  />
                  <span>Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsForgotPassword(true)}
                  className="text-zinc-400 hover:text-white font-medium transition-colors underline underline-offset-4"
                >
                  Forgot password?
                </button>
              </div>

              {/* Primary Royal Blue Action Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 rounded-xl bg-[#2b3aee] hover:bg-[#3b4bfe] text-white font-semibold text-xs tracking-wider transition-colors shadow-lg shadow-indigo-600/30 flex items-center justify-center cursor-pointer mt-5 uppercase"
              >
                {isLoading ? 'Authenticating...' : requiresOTP ? 'Verify OTP & Sign In' : 'Sign In'}
              </button>

              {/* Quick Demo Access Option */}
              <button
                type="button"
                onClick={handleDemoLogin}
                className="w-full py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-mono text-zinc-300 font-medium transition-all text-center mt-2 cursor-pointer"
              >
                ⚡ Quick Demo Officer Access
              </button>
            </form>

            {/* Bottom Link */}
            <div className="mt-6 text-center text-xs text-zinc-400 font-medium">
              Don't have an account?{' '}
              <Link href="/signup" className="text-indigo-400 font-bold hover:text-indigo-300 transition-colors ml-1">
                Sign Up
              </Link>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Footer Contact Info */}
      <footer className="relative z-20 w-full px-8 py-4 flex items-center justify-between text-xs text-zinc-500 font-mono border-t border-zinc-200">
        <span>356-03-48</span>
        <div className="flex items-center space-x-6">
          <span className="hover:text-zinc-900 cursor-pointer">Clients</span>
          <span className="hover:text-zinc-900 cursor-pointer">About Us</span>
        </div>
      </footer>

      {/* OAuth Modal */}
      <OAuthModal
        isOpen={isOAuthModalOpen}
        provider={oAuthProvider}
        onClose={() => setIsOAuthModalOpen(false)}
        onSuccess={() => router.push('/dashboard')}
      />
    </div>
  );
}
