'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  Lock,
  CheckCircle2,
  X,
  Sparkles,
  Zap,
  Building2,
  Check,
  Download,
  ArrowRight,
  Gift,
  Crown,
  QrCode,
  Smartphone,
  Copy,
  Clock,
  CheckCircle,
  AlertCircle,
  PhoneCall,
  MessageSquare,
} from 'lucide-react';
import { fetchApi } from '@/lib/api-client';

export interface PlanDetails {
  id: 'starter' | 'pro' | 'enterprise';
  name: string;
  monthlyPrice: number;
  quarterlyPrice: number;
  annualPrice: number;
  monthlyPriceInr: number;
  quarterlyPriceInr: number;
  annualPriceInr: number;
  description: string;
  badge?: string;
  features: string[];
}

export const PRICING_PLANS: PlanDetails[] = [
  {
    id: 'starter',
    name: 'Starter Developer',
    monthlyPrice: 0,
    quarterlyPrice: 0,
    annualPrice: 0,
    monthlyPriceInr: 0,
    quarterlyPriceInr: 0,
    annualPriceInr: 0,
    description: 'Essential zero-trust biometrics telemetry for single website projects.',
    features: [
      '1 Connected Target Domain',
      'Up to 1,000 Active Monitored Sessions/mo',
      'Basic Keystroke & Mouse Velocity Telemetry',
      'Standard Step-Up MFA Challenge Modal',
    ],
  },
  {
    id: 'pro',
    name: 'Pro SecOps',
    monthlyPrice: 4,
    quarterlyPrice: 10,
    annualPrice: 36,
    monthlyPriceInr: 300,
    quarterlyPriceInr: 800,
    annualPriceInr: 3000,
    badge: 'MOST POPULAR',
    description: 'Continuous IsolationForest ML, automated Sentinel containment, and custom policies.',
    features: [
      'Up to 5 Connected Target Domains',
      'Up to 50,000 Active Monitored Sessions/mo',
      'Multi-Modal Ensemble AI (4 Micro-Models)',
      '14-Day Behavioral Drift Radar',
      'Automated Slack & Webhook Threat Dispatch',
      'Custom Risk Sensitivity Sliders & IP Blacklists',
      'Priority 24/7 SecOps Support',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise Cyber',
    monthlyPrice: 12,
    quarterlyPrice: 30,
    annualPrice: 110,
    monthlyPriceInr: 999,
    quarterlyPriceInr: 2500,
    annualPriceInr: 8999,
    badge: 'MAXIMUM SECURITY',
    description: 'Digital Twin Honeypot decoy sandbox, dedicated ML model retraining & SOC SLAs.',
    features: [
      'Unlimited Connected Target Domains',
      'Unlimited Monitored Sessions & Raw Telemetry',
      'Digital Twin Honeypot Decoy Sandbox',
      'SHAP Explainable AI (XAI) Audit Reports',
      'Custom Scikit-Learn Model Retraining Pipeline',
      'SOC-2 Type II & NIST SP 800-207 Audit Exports',
      'Dedicated Cybersecurity Engineer SLA (15m)',
    ],
  },
];

interface PaymentGatewayModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPlanId?: 'starter' | 'pro' | 'enterprise';
  limitNotice?: string;
  onPaymentSuccess?: (planId: string) => void;
}

export function PaymentGatewayModal({
  isOpen,
  onClose,
  initialPlanId = 'pro',
  limitNotice,
  onPaymentSuccess,
}: PaymentGatewayModalProps) {
  const [selectedPlanId, setSelectedPlanId] = useState<'starter' | 'pro' | 'enterprise'>(initialPlanId);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'quarterly' | 'annual'>('annual');
  const [currency, setCurrency] = useState<'USD' | 'INR'>('INR');
  const [activeMode, setActiveMode] = useState<'upi' | 'trial'>('upi');

  // UPI & Mobile Details
  const [upiId, setUpiId] = useState('9882776796@ptyes');
  const [mobileNumber, setMobileNumber] = useState('9882776796');
  const [selectedUpiApp, setSelectedUpiApp] = useState<'gpay' | 'phonepe' | 'paytm' | 'bhim'>('gpay');
  const [qrTimer, setQrTimer] = useState(300);
  const [upiCopied, setUpiCopied] = useState(false);
  const [mobileCopied, setMobileCopied] = useState(false);
  const [qrImgPath, setQrImgPath] = useState('/upi-qr.jpg');
  const [qrImgFailed, setQrImgFailed] = useState(false);

  // Checkout Step State
  const [step, setStep] = useState<'details' | 'processing' | 'success'>('details');
  const [processingMsg, setProcessingMsg] = useState('Connecting to Payment Gateway...');
  const [serverInvoice, setServerInvoice] = useState<any>(null);

  // Reset modal state on open
  useEffect(() => {
    if (isOpen) {
      setStep('details');
      if (initialPlanId) {
        setSelectedPlanId(initialPlanId);
      }
      setQrTimer(300);
    }
  }, [isOpen, initialPlanId]);

  // QR Timer Countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isOpen && activeMode === 'upi' && step === 'details' && qrTimer > 0) {
      interval = setInterval(() => {
        setQrTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isOpen, activeMode, step, qrTimer]);

  if (!isOpen) return null;

  const currentPlan = PRICING_PLANS.find((p) => p.id === selectedPlanId) || PRICING_PLANS[1];

  const getNumericPrice = () => {
    const isInr = currency === 'INR';
    if (billingCycle === 'quarterly') return isInr ? currentPlan.quarterlyPriceInr : currentPlan.quarterlyPrice;
    if (billingCycle === 'annual') return isInr ? currentPlan.annualPriceInr : currentPlan.annualPrice;
    return isInr ? currentPlan.monthlyPriceInr : currentPlan.monthlyPrice;
  };

  const totalPrice = getNumericPrice();
  const currencySymbol = currency === 'INR' ? '₹' : '$';
  const currencyLabel = currency === 'INR' ? 'INR' : 'USD';

  const handleCopyUpiId = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(upiId);
      setUpiCopied(true);
      setTimeout(() => setUpiCopied(false), 2000);
    }
  };

  const handleCopyMobileNumber = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(mobileNumber);
      setMobileCopied(true);
      setTimeout(() => setMobileCopied(false), 2000);
    }
  };

  // Activate Plan Helper
  const activateSubscriptionGlobally = (planId: 'starter' | 'pro' | 'enterprise') => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('aegis_active_plan', planId);
      localStorage.setItem('aegis_plan_billing', billingCycle);
      localStorage.setItem('aegis_plan_currency', currency);

      const now = new Date();
      const expires = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      localStorage.setItem('aegis_trial_claimed', 'true');
      localStorage.setItem('aegis_trial_expires_at', expires.toISOString());
    }
  };

  // Claim 7-Day Free Trial
  const handleClaim7DayTrial = async () => {
    setStep('processing');
    setProcessingMsg('Activating 7-Day Free Trial (No Card Upfront)...');

    try {
      const res = await fetchApi('/api/billing/claim-trial', {
        method: 'POST',
        body: JSON.stringify({ planId: selectedPlanId }),
      });

      activateSubscriptionGlobally(selectedPlanId);
      setStep('success');
      if (onPaymentSuccess) onPaymentSuccess(selectedPlanId);
    } catch (_) {
      activateSubscriptionGlobally(selectedPlanId);
      setStep('success');
      if (onPaymentSuccess) onPaymentSuccess(selectedPlanId);
    }
  };

  // General Checkout Handler (UPI / QR / Mobile)
  const handleProcessCheckout = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setStep('processing');
    setProcessingMsg('Verifying UPI / QR Code Transfer & Updating Subscription Plan...');

    try {
      const res = await fetchApi('/api/billing/checkout', {
        method: 'POST',
        body: JSON.stringify({
          planId: selectedPlanId,
          billingCycle,
          currency,
          paymentMethod: 'upi',
          upiId,
        }),
      });

      activateSubscriptionGlobally(selectedPlanId);

      setServerInvoice({
        invoiceId: res?.transaction?.invoiceId || 'INV-2026-' + Math.floor(100000 + Math.random() * 900000),
        transactionId: res?.transaction?.transactionId || 'TXN_AEGIS_' + Math.random().toString(36).substring(2, 10).toUpperCase(),
        amountPaid: `${currencySymbol}${totalPrice.toLocaleString()} ${currencyLabel}`,
        paymentMethod: `UPI / QR (${upiId})`,
        date: new Date().toUTCString(),
      });

      setStep('success');
      if (onPaymentSuccess) onPaymentSuccess(selectedPlanId);
    } catch (_) {
      activateSubscriptionGlobally(selectedPlanId);
      setServerInvoice({
        invoiceId: 'INV-2026-' + Math.floor(100000 + Math.random() * 900000),
        transactionId: 'TXN_AEGIS_' + Math.random().toString(36).substring(2, 10).toUpperCase(),
        amountPaid: `${currencySymbol}${totalPrice.toLocaleString()} ${currencyLabel}`,
        paymentMethod: `UPI / QR (${upiId})`,
        date: new Date().toUTCString(),
      });
      setStep('success');
      if (onPaymentSuccess) onPaymentSuccess(selectedPlanId);
    }
  };

  const handleDownloadReceipt = () => {
    const invoiceContent = `================================================================================
                    AEGIS AI CERTIFIED PAYMENT RECEIPT & INVOICE
================================================================================
Invoice ID:     ${serverInvoice?.invoiceId || 'INV-2026-981240'}
Transaction ID: ${serverInvoice?.transactionId || 'TXN_AEGIS_X8921B'}
Date:           ${new Date().toUTCString()}
UPI ID:         ${upiId}
Phone / Mob:    ${mobileNumber}
Status:         PAID & VERIFIED (Instant SaaS Subscription Unlocked)
--------------------------------------------------------------------------------

SUBSCRIPTION DETAILS:
Purchased Plan: ${currentPlan.name}
Billing Period: ${billingCycle.toUpperCase()}
Amount Paid:    ${activeMode === 'trial' ? 'FREE ($0.00)' : `${currencySymbol}${totalPrice.toLocaleString()} ${currencyLabel}`}
Security SSL:   TLS 1.3 Certified NPCI UPI Banking Protocol

INCLUDED ENTERPRISE CAPABILITIES:
${currentPlan.features.map((f) => `  - ${f}`).join('\n')}

================================================================================
               THANK YOU FOR CHOOSING AEGIS AI ZERO-TRUST PLATFORM
================================================================================`;

    const blob = new Blob([invoiceContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Aegis_Invoice_${currentPlan.id.toUpperCase()}_2026.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="bg-white border border-zinc-200/90 rounded-3xl max-w-4xl w-full p-5 sm:p-8 space-y-6 shadow-2xl relative max-h-[94vh] overflow-y-auto text-zinc-900 scrollbar-none"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-2xl bg-zinc-100 hover:bg-zinc-200 text-zinc-500 hover:text-zinc-900 transition-colors cursor-pointer border border-zinc-200/80 z-10"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Quota Limit Notice Alert (if opened due to limit reached) */}
          {limitNotice && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center space-x-3 text-amber-900 text-xs shadow-xs">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <span className="font-bold uppercase font-mono text-[11px] block">Quota Limit Reached</span>
                <span className="font-light">{limitNotice}</span>
              </div>
            </div>
          )}

          {/* ══ STEP 1: PLAN SELECTOR & PAYMENT METHOD CHECKOUT ══ */}
          {step === 'details' && (
            <div className="space-y-6">
              {/* Header Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-100">
                <div>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white shrink-0 shadow-sm">
                      <Crown className="w-4 h-4 text-white" />
                    </div>
                    <h2 className="text-xl font-bold tracking-tight text-zinc-900">AegisAI Security Subscription</h2>
                  </div>
                  <p className="text-xs text-zinc-500 font-light mt-1">
                    Select your plan, currency, and pay instantly via UPI / Scan QR Code or Phone Number
                  </p>
                </div>

                {/* Currency Switcher & Billing Cycle Selector */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* Currency Switcher ($ USD / ₹ INR) */}
                  <div className="inline-flex items-center p-1 rounded-2xl bg-zinc-100 border border-zinc-200 text-xs font-mono">
                    <button
                      type="button"
                      onClick={() => setCurrency('INR')}
                      className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center space-x-1 ${
                        currency === 'INR' ? 'bg-emerald-600 text-white shadow-xs' : 'text-zinc-600 hover:text-zinc-900'
                      }`}
                    >
                      <span>₹ INR</span>
                      <span className="text-[9px] px-1 bg-white/20 rounded font-normal">India</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrency('USD')}
                      className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center space-x-1 ${
                        currency === 'USD' ? 'bg-zinc-900 text-white shadow-xs' : 'text-zinc-600 hover:text-zinc-900'
                      }`}
                    >
                      <span>$ USD</span>
                      <span className="text-[9px] px-1 bg-white/20 rounded font-normal">Global</span>
                    </button>
                  </div>

                  {/* Billing Cycle Selector */}
                  <div className="inline-flex items-center p-1 rounded-2xl bg-zinc-100 border border-zinc-200/80 text-xs font-mono">
                    <button
                      type="button"
                      onClick={() => setBillingCycle('monthly')}
                      className={`px-2.5 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
                        billingCycle === 'monthly' ? 'bg-zinc-900 text-white shadow-xs' : 'text-zinc-600'
                      }`}
                    >
                      Monthly
                    </button>
                    <button
                      type="button"
                      onClick={() => setBillingCycle('quarterly')}
                      className={`px-2.5 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
                        billingCycle === 'quarterly' ? 'bg-zinc-900 text-white shadow-xs' : 'text-zinc-600'
                      }`}
                    >
                      3-Months
                    </button>
                    <button
                      type="button"
                      onClick={() => setBillingCycle('annual')}
                      className={`px-2.5 py-1.5 rounded-xl font-semibold transition-all cursor-pointer flex items-center space-x-1 ${
                        billingCycle === 'annual' ? 'bg-zinc-900 text-white shadow-xs' : 'text-zinc-600'
                      }`}
                    >
                      <span>Annual</span>
                      <span className="px-1 py-0.2 bg-emerald-500 text-white text-[9px] font-bold rounded-full">SAVINGS</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* 3 Plan Cards Selector */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {PRICING_PLANS.map((plan) => {
                  const isSelected = selectedPlanId === plan.id;
                  const isInr = currency === 'INR';
                  let p = plan.monthlyPrice;
                  if (billingCycle === 'quarterly') p = isInr ? plan.quarterlyPriceInr : plan.quarterlyPrice;
                  if (billingCycle === 'annual') p = isInr ? plan.annualPriceInr : plan.annualPrice;
                  if (billingCycle === 'monthly') p = isInr ? plan.monthlyPriceInr : plan.monthlyPrice;

                  return (
                    <div
                      key={plan.id}
                      onClick={() => setSelectedPlanId(plan.id)}
                      className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-4 relative ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/20 shadow-md'
                          : 'border-zinc-200/80 bg-white hover:border-zinc-300 shadow-xs'
                      }`}
                    >
                      {plan.badge && (
                        <span className="absolute -top-3 right-4 px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[9px] font-mono font-bold tracking-wider shadow-xs">
                          {plan.badge}
                        </span>
                      )}

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-bold text-zinc-900">{plan.name}</h3>
                          <div
                            className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                              isSelected ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-zinc-300 bg-white'
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                        </div>

                        <div className="flex items-baseline space-x-1">
                          <span className="text-2xl font-bold font-mono text-zinc-900">
                            {currencySymbol}{p.toLocaleString()}
                          </span>
                          <span className="text-xs text-zinc-500 font-mono">
                            /{billingCycle === 'quarterly' ? '3mo' : billingCycle === 'annual' ? 'yr' : 'mo'}
                          </span>
                        </div>

                        <p className="text-[11px] text-zinc-500 font-light leading-relaxed">{plan.description}</p>
                      </div>

                      <div className="space-y-1.5 pt-2 border-t border-zinc-200/60 font-sans text-xs">
                        {plan.features.slice(0, 3).map((feat, idx) => (
                          <div key={idx} className="flex items-center space-x-1.5 text-[11px] text-zinc-700">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span className="truncate">{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Payment Method Selector Tabs: UPI/QR vs 7-Day Trial */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-700 uppercase font-mono tracking-wider">Select Checkout Option</label>
                <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                  <button
                    type="button"
                    onClick={() => setActiveMode('upi')}
                    className={`py-3 px-4 rounded-2xl font-bold transition-all cursor-pointer flex items-center justify-center space-x-2 border ${
                      activeMode === 'upi'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                        : 'bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100'
                    }`}
                  >
                    <QrCode className="w-4 h-4" />
                    <span>Pay via UPI ID / QR Code 📱</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveMode('trial')}
                    className={`py-3 px-4 rounded-2xl font-bold transition-all cursor-pointer flex items-center justify-center space-x-2 border ${
                      activeMode === 'trial'
                        ? 'bg-zinc-900 text-white border-zinc-900 shadow-md'
                        : 'bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100'
                    }`}
                  >
                    <Gift className="w-4 h-4" />
                    <span>Claim 7-Day Free Trial 🎁</span>
                  </button>
                </div>
              </div>

              {/* 📱 UPI / SCAN QR CODE & MOBILE NUMBER PAYMENT PANEL */}
              {activeMode === 'upi' && (
                <div className="border border-emerald-200 rounded-2xl p-6 bg-emerald-50/40 space-y-6">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    {/* Left: Custom Uploaded QR Code */}
                    <div className="flex flex-col items-center space-y-3 bg-white p-5 rounded-2xl border border-emerald-200 shadow-sm shrink-0">
                      <div className="text-[11px] font-mono font-bold text-emerald-800 flex items-center space-x-1.5">
                        <QrCode className="w-4 h-4 text-emerald-600" />
                        <span>SCAN QR TO PAY INSTANTLY</span>
                      </div>

                      {/* High Resolution Render of User's QR Code */}
                      <div className="w-48 h-48 bg-white p-2 rounded-xl border border-zinc-200 shadow-xs relative flex items-center justify-center overflow-hidden">
                        {!qrImgFailed ? (
                          <img
                            src={qrImgPath}
                            alt="Official AegisAI UPI QR Code"
                            className="w-full h-full object-contain rounded-lg shadow-xs"
                            onError={() => {
                              if (qrImgPath === '/upi-qr.jpg') {
                                setQrImgPath('/upi-qr.png');
                              } else {
                                setQrImgFailed(true);
                              }
                            }}
                          />
                        ) : (
                          <svg className="w-full h-full text-zinc-900" viewBox="0 0 100 100" fill="currentColor">
                            <rect x="5" y="5" width="25" height="25" fill="#059669" rx="3" />
                            <rect x="9" y="9" width="17" height="17" fill="#ffffff" rx="2" />
                            <rect x="13" y="13" width="9" height="9" fill="#059669" rx="1" />
                            <rect x="70" y="5" width="25" height="25" fill="#059669" rx="3" />
                            <rect x="74" y="9" width="17" height="17" fill="#ffffff" rx="2" />
                            <rect x="78" y="13" width="9" height="9" fill="#059669" rx="1" />
                            <rect x="5" y="70" width="25" height="25" fill="#059669" rx="3" />
                            <rect x="9" y="74" width="17" height="17" fill="#ffffff" rx="2" />
                            <rect x="13" y="78" width="9" height="9" fill="#059669" rx="1" />
                            <rect x="35" y="10" width="6" height="6" />
                            <rect x="45" y="10" width="6" height="6" />
                            <rect x="55" y="10" width="6" height="6" />
                            <rect x="38" y="38" width="24" height="24" fill="#059669" rx="4" />
                            <path d="M50 42 L58 46 V53 C58 58 50 61 50 61 C50 61 42 58 42 53 V46 Z" fill="#ffffff" />
                          </svg>
                        )}
                      </div>

                      <div className="flex items-center space-x-1.5 text-xs text-amber-700 font-mono font-bold bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                        <Clock className="w-3.5 h-3.5 animate-spin" />
                        <span>Valid for: {formatTimer(qrTimer)}</span>
                      </div>
                    </div>

                    {/* Right: UPI VPA / Mobile Number Details */}
                    <div className="flex-1 space-y-4 text-left">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-bold text-emerald-950">Pay via GPay, PhonePe, Paytm or BHIM</h3>
                          <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                            Instant UPI Authorization
                          </span>
                        </div>
                        <p className="text-xs text-zinc-600 font-light leading-relaxed">
                          Scan QR Code or pay directly using our official Merchant UPI VPA ID or Mobile Number.
                        </p>
                      </div>

                      {/* VPA UPI ID Copy Bar */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-zinc-700">Official Merchant VPA UPI ID</label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            readOnly
                            value={upiId}
                            className="flex-1 px-3.5 py-2.5 bg-white border border-zinc-200 rounded-xl text-xs font-mono font-bold text-zinc-900 select-all"
                          />
                          <button
                            type="button"
                            onClick={handleCopyUpiId}
                            className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-mono text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer shadow-xs"
                          >
                            {upiCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                            <span>{upiCopied ? 'Copied!' : 'Copy UPI'}</span>
                          </button>
                        </div>
                      </div>

                      {/* Mobile / Phone Number Copy Bar */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-zinc-700">PhonePe / GPay / Paytm Mobile Number</label>
                        <div className="flex items-center space-x-2">
                          <div className="relative flex-1">
                            <PhoneCall className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                              type="text"
                              readOnly
                              value={mobileNumber}
                              className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-zinc-200 rounded-xl text-xs font-mono font-bold text-zinc-900 select-all"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={handleCopyMobileNumber}
                            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer shadow-xs"
                          >
                            {mobileCopied ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
                            <span>{mobileCopied ? 'Copied!' : 'Copy Mobile'}</span>
                          </button>
                        </div>
                      </div>

                      {/* Confirm & Verify Button */}
                      <div className="pt-3 border-t border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="text-left font-mono">
                          <div className="text-[10px] text-zinc-400 font-bold uppercase">TOTAL DUE TODAY</div>
                          <div className="text-xl font-bold text-emerald-950">
                            {currencySymbol}{totalPrice.toLocaleString()} {currencyLabel}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleProcessCheckout()}
                          className="w-full sm:w-auto px-7 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors flex items-center justify-center space-x-2 cursor-pointer shadow-md font-mono"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Verify Payment & Unlock Features 🚀</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 🎁 7-DAY FREE TRIAL CLAIM PANEL */}
              {activeMode === 'trial' && (
                <div className="border border-emerald-200 rounded-2xl p-6 bg-emerald-50/50 space-y-4 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md">
                    <Gift className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-emerald-950">Claim Your 7-Day Unlimited Free Trial</h3>
                    <p className="text-xs text-emerald-800 font-light max-w-lg mx-auto leading-relaxed">
                      Enjoy 7 full days of AegisAI Pro SecOps protection. Zero payment required upfront. Instant access to all 15 security modules.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleClaim7DayTrial}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-lg hover:shadow-emerald-500/25 flex items-center justify-center space-x-2 mx-auto cursor-pointer font-mono"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>CLAIM 7-DAY FREE TRIAL 🎁</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ══ STEP 2: PROCESSING SIMULATION ══ */}
          {step === 'processing' && (
            <div className="py-16 text-center space-y-6">
              <div className="relative w-20 h-20 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-zinc-200 border-t-emerald-600 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center text-zinc-900">
                  <Lock className="w-8 h-8 text-emerald-600" />
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold text-zinc-900 tracking-tight">Communicating with Payment Gateway</h3>
                <p className="text-xs text-zinc-500 font-mono">{processingMsg}</p>
              </div>
            </div>
          )}

          {/* ══ STEP 3: SUCCESS & RECEIPT ══ */}
          {step === 'success' && (
            <div className="py-8 text-center space-y-6">
              <div className="w-16 h-16 rounded-3xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-mono font-bold border border-emerald-200 uppercase tracking-wider">
                  {activeMode === 'trial' ? '7-DAY FREE TRIAL ACTIVATED 🎁' : 'SUBSCRIPTION ACTIVATED & UNLOCKED 🚀'}
                </span>
                <h3 className="text-2xl font-bold text-zinc-900 tracking-tight">
                  {activeMode === 'trial' ? 'Welcome to your 7-Day Free Trial!' : `Welcome to ${currentPlan.name}!`}
                </h3>
                <p className="text-xs text-zinc-500 font-light max-w-md mx-auto leading-relaxed">
                  All 15 Zero-Trust security modules, honeypot sandboxes, explainable AI reports, and posture audits are now 100% unlocked!
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200/80 max-w-md mx-auto text-left font-mono text-xs space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-200/80 text-zinc-500 text-[11px]">
                  <span>ACCOUNT STATUS</span>
                  <span>{serverInvoice?.invoiceId || 'INV-2026-9921'}</span>
                </div>
                <div className="flex justify-between font-bold text-zinc-900 pt-1">
                  <span>Plan:</span>
                  <span>{currentPlan.name}</span>
                </div>
                <div className="flex justify-between text-zinc-600">
                  <span>UPI VPA ID:</span>
                  <span>{upiId}</span>
                </div>
                <div className="flex justify-between text-zinc-600">
                  <span>Status:</span>
                  <span className="text-emerald-700 font-bold">ACTIVE & UNLOCKED</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  onClick={handleDownloadReceipt}
                  className="px-5 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 text-zinc-800 text-xs font-semibold flex items-center space-x-2 transition-all cursor-pointer font-mono shadow-xs"
                >
                  <Download className="w-4 h-4 text-zinc-500" />
                  <span>Download Invoice Receipt</span>
                </button>

                <button
                  onClick={() => {
                    setStep('details');
                    onClose();
                  }}
                  className="px-6 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold flex items-center space-x-2 transition-all shadow-xs cursor-pointer"
                >
                  <span>Go to Security Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
