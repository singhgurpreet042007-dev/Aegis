'use client';

import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Download,
  Sparkles,
  ArrowUpRight,
  Clock,
  Gift,
  Building2,
  Check,
  AlertCircle,
  Globe,
} from 'lucide-react';
import { PRICING_PLANS } from './PaymentGatewayModal';
import { fetchApi } from '@/lib/api-client';

interface BillingViewProps {
  onOpenCheckout?: (planId: 'starter' | 'pro' | 'enterprise') => void;
}

export function BillingView({ onOpenCheckout }: BillingViewProps) {
  const [activePlanId, setActivePlanId] = useState<'starter' | 'pro' | 'enterprise'>('pro');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'quarterly' | 'annual'>('annual');
  const [currency, setCurrency] = useState<'USD' | 'INR'>('INR');
  const [trialInfo, setTrialInfo] = useState<{
    claimed: boolean;
    isActive: boolean;
    daysRemaining: number;
    hoursRemaining: number;
  }>({
    claimed: false,
    isActive: false,
    daysRemaining: 7,
    hoursRemaining: 0,
  });

  const [invoices, setInvoices] = useState<any[]>([
    {
      invoiceId: 'INV-2026-9921',
      date: 'Aug 01, 2026',
      planName: 'Pro SecOps (Annual Plan)',
      amount: '₹3,000.00 INR',
      status: 'PAID',
      paymentMethod: 'UPI (9882776796@ptyes)',
    },
  ]);

  useEffect(() => {
    // 1. Local state check
    if (typeof window !== 'undefined') {
      const storedPlan = localStorage.getItem('aegis_active_plan');
      if (storedPlan && (storedPlan === 'starter' || storedPlan === 'pro' || storedPlan === 'enterprise')) {
        setActivePlanId(storedPlan);
      }

      const storedCurr = localStorage.getItem('aegis_plan_currency');
      if (storedCurr === 'USD' || storedCurr === 'INR') {
        setCurrency(storedCurr);
      }

      const trialExpiresAt = localStorage.getItem('aegis_trial_expires_at');
      if (trialExpiresAt) {
        const now = new Date().getTime();
        const exp = new Date(trialExpiresAt).getTime();
        const diff = exp - now;
        if (diff > 0) {
          const d = Math.floor(diff / (1000 * 60 * 60 * 24));
          const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          setTrialInfo({
            claimed: true,
            isActive: true,
            daysRemaining: d,
            hoursRemaining: h,
          });
        }
      }
    }

    // 2. NestJS Backend status check
    const fetchStatus = async () => {
      try {
        const res = await fetchApi('/api/billing/status');
        if (res?.success) {
          if (res.activePlan) setActivePlanId(res.activePlan);
          if (res.trial) setTrialInfo(res.trial);
          if (res.invoices && res.invoices.length > 0) setInvoices(res.invoices);
        }
      } catch (_) {}
    };

    fetchStatus();
  }, []);

  const activePlan = PRICING_PLANS.find((p) => p.id === activePlanId) || PRICING_PLANS[1];

  const handleDownloadInvoice = (invId: string, amount: string, date: string, pm?: string) => {
    const text = `================================================================================
                    AEGIS AI HISTORICAL BILLING INVOICE
================================================================================
Invoice ID:     ${invId}
Date:           ${date}
Plan:           ${activePlan.name}
Amount Paid:    ${amount}
Status:         PAID & VERIFIED (256-Bit SSL Encrypted)
Payment Method: ${pm || 'UPI Transfer (aegis.secops@okaxis)'}
--------------------------------------------------------------------------------

ISSUED BY:
Aegis AI Zero-Trust Cyber Operations Inc.
San Francisco, CA 94107, USA & Cyber Hub Gurugram, India

================================================================================`;

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Aegis_Invoice_${invId}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const currencySymbol = currency === 'INR' ? '₹' : '$';

  return (
    <div className="space-y-6 text-zinc-900">
      {/* 🎁 7-DAY FREE TRIAL ACTIVE BANNER */}
      {trialInfo.isActive && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <Gift className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded bg-white text-emerald-900 font-mono font-bold text-[10px] uppercase">
                  ACTIVE TRIAL
                </span>
                <h3 className="text-sm font-bold">7-Day Free Trial In Progress</h3>
              </div>
              <p className="text-xs text-emerald-100 font-light mt-0.5">
                You have <strong className="font-mono">{trialInfo.daysRemaining} Days {trialInfo.hoursRemaining} Hours</strong> remaining in your free trial.
              </p>
            </div>
          </div>

          <button
            onClick={() => onOpenCheckout && onOpenCheckout('pro')}
            className="px-4 py-2 rounded-xl bg-white text-emerald-950 hover:bg-emerald-50 font-bold text-xs transition-colors shadow-xs cursor-pointer shrink-0 font-mono"
          >
            Upgrade Subscription 💳
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="border border-zinc-200/80 rounded-2xl p-6 bg-white shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-zinc-900 flex items-center justify-center text-white shrink-0 shadow-xs">
              <CreditCard className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-base font-bold text-zinc-900 tracking-tight">Subscription Billing & Plan Quotas</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-mono font-bold uppercase">
              {trialInfo.isActive ? '7-DAY TRIAL' : `${activePlan.id.toUpperCase()} ACTIVE`}
            </span>
          </div>
          <p className="text-xs text-zinc-500 font-light mt-1">
            Manage your zero-trust biometrics subscription plan, billing cycles, and invoice receipts.
          </p>
        </div>

        <button
          onClick={() => onOpenCheckout && onOpenCheckout('enterprise')}
          className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-xs transition-colors flex items-center space-x-1.5 cursor-pointer shadow-xs font-mono"
        >
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>Upgrade to Enterprise</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Usage Quotas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-5 rounded-2xl bg-white border border-zinc-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-zinc-400 uppercase font-bold">Monitored Session Quota</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <div className="text-2xl font-light font-mono text-zinc-900">14,280 / 50,000</div>
            <p className="text-[11px] text-zinc-500 font-light mt-0.5">28.5% Monthly Quota Used</p>
          </div>
          <div className="w-full bg-zinc-100 rounded-full h-1.5 overflow-hidden border border-zinc-200">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: '28.5%' }} />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-zinc-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-zinc-400 uppercase font-bold">Protected Domain Slots</span>
            <Building2 className="w-4 h-4 text-zinc-900" />
          </div>
          <div>
            <div className="text-2xl font-light font-mono text-zinc-900">2 / 5 Slots</div>
            <p className="text-[11px] text-zinc-500 font-light mt-0.5">3 Available Target Slots</p>
          </div>
          <div className="w-full bg-zinc-100 rounded-full h-1.5 overflow-hidden border border-zinc-200">
            <div className="h-full bg-zinc-900 rounded-full" style={{ width: '40%' }} />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-zinc-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-zinc-400 uppercase font-bold">Sub-147ms ML Inferences</span>
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <div>
            <div className="text-2xl font-light font-mono text-zinc-900">142,980 Calls</div>
            <p className="text-[11px] text-emerald-700 font-mono font-semibold mt-0.5">Sub-147ms Latency Active</p>
          </div>
          <div className="w-full bg-zinc-100 rounded-full h-1.5 overflow-hidden border border-zinc-200">
            <div className="h-full bg-amber-500 rounded-full" style={{ width: '65%' }} />
          </div>
        </div>
      </div>

      {/* ══ PLANS COMPARISON & UPGRADE GRID ══ */}
      <div className="border border-zinc-200/80 rounded-2xl p-6 bg-white shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-100">
          <div>
            <h3 className="text-sm font-bold text-zinc-900">Available Protection Plans</h3>
            <p className="text-xs text-zinc-500 font-light">Select monthly, quarterly, or yearly plans</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Currency Selector Pill */}
            <div className="inline-flex items-center p-1 rounded-xl bg-zinc-100 border border-zinc-200 text-xs font-mono">
              <button
                onClick={() => setCurrency('INR')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  currency === 'INR' ? 'bg-emerald-600 text-white shadow-xs' : 'text-zinc-600'
                }`}
              >
                ₹ INR
              </button>
              <button
                onClick={() => setCurrency('USD')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  currency === 'USD' ? 'bg-zinc-900 text-white shadow-xs' : 'text-zinc-600'
                }`}
              >
                $ USD
              </button>
            </div>

            {/* Billing Cycle Selector Pill */}
            <div className="inline-flex items-center p-1 rounded-xl bg-zinc-100 border border-zinc-200 text-xs font-mono">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  billingCycle === 'monthly' ? 'bg-zinc-900 text-white shadow-xs' : 'text-zinc-600'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('quarterly')}
                className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  billingCycle === 'quarterly' ? 'bg-zinc-900 text-white shadow-xs' : 'text-zinc-600'
                }`}
              >
                3-Months
              </button>
              <button
                onClick={() => setBillingCycle('annual')}
                className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer flex items-center space-x-1 ${
                  billingCycle === 'annual' ? 'bg-zinc-900 text-white shadow-xs' : 'text-zinc-600'
                }`}
              >
                <span>Annual</span>
                <span className="px-1.5 py-0.2 bg-emerald-500 text-white text-[9px] font-bold rounded-full">BEST VALUE</span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PRICING_PLANS.map((plan) => {
            const isCurrent = activePlanId === plan.id;
            const isInr = currency === 'INR';
            let p = plan.monthlyPrice;
            if (billingCycle === 'quarterly') p = isInr ? plan.quarterlyPriceInr : plan.quarterlyPrice;
            if (billingCycle === 'annual') p = isInr ? plan.annualPriceInr : plan.annualPrice;
            if (billingCycle === 'monthly') p = isInr ? plan.monthlyPriceInr : plan.monthlyPrice;

            return (
              <div
                key={plan.id}
                className={`p-6 rounded-2xl border-2 flex flex-col justify-between space-y-5 relative transition-all ${
                  isCurrent
                    ? 'border-emerald-500 bg-emerald-50/20 shadow-sm'
                    : 'border-zinc-200/80 bg-white hover:border-zinc-300 shadow-xs'
                }`}
              >
                {plan.badge && (
                  <span className="absolute -top-3 right-5 px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[9px] font-mono font-bold tracking-wider shadow-xs">
                    {plan.badge}
                  </span>
                )}

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-base font-bold text-zinc-900">{plan.name}</h4>
                    {isCurrent && (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-[9px] font-mono font-bold">
                        CURRENT PLAN
                      </span>
                    )}
                  </div>

                  <div className="flex items-baseline space-x-1">
                    <span className="text-3xl font-bold font-mono text-zinc-900">
                      {currencySymbol}{p.toLocaleString()}
                    </span>
                    <span className="text-xs text-zinc-500 font-mono">
                      /{billingCycle === 'quarterly' ? '3mo' : billingCycle === 'annual' ? 'yr' : 'mo'}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-500 font-light leading-relaxed">{plan.description}</p>

                  <div className="space-y-2 pt-3 border-t border-zinc-100 text-xs">
                    {plan.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start space-x-2 text-zinc-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  {isCurrent ? (
                    <button
                      disabled
                      className="w-full py-2.5 rounded-xl bg-zinc-100 text-zinc-400 text-xs font-semibold font-mono cursor-not-allowed border border-zinc-200"
                    >
                      Active Subscribed Plan
                    </button>
                  ) : (
                    <button
                      onClick={() => onOpenCheckout && onOpenCheckout(plan.id)}
                      className="w-full py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs flex items-center justify-center space-x-1.5"
                    >
                      <span>Switch to {plan.name}</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* HISTORICAL INVOICES */}
      <div className="border border-zinc-200/80 rounded-2xl p-6 bg-white shadow-xs space-y-4">
        <div className="border-b border-zinc-100 pb-3 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-zinc-900">Billing History & Invoices</h3>
            <p className="text-xs text-zinc-500 font-light">Download certified receipts for compliance</p>
          </div>
          <Clock className="w-4 h-4 text-zinc-400" />
        </div>

        <div className="border border-zinc-200/80 rounded-xl overflow-hidden bg-white">
          <table className="w-full text-left text-xs text-zinc-700">
            <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-400 uppercase font-mono text-[10px]">
              <tr>
                <th className="px-5 py-3 font-semibold">Invoice ID</th>
                <th className="px-5 py-3 font-semibold">Date</th>
                <th className="px-5 py-3 font-semibold">Plan</th>
                <th className="px-5 py-3 font-semibold">Amount Paid</th>
                <th className="px-5 py-3 font-semibold">Method</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 text-right font-semibold">Receipt Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 font-mono">
              {invoices.map((inv, idx) => (
                <tr key={idx} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-5 py-3.5 font-bold text-zinc-900">{inv.invoiceId}</td>
                  <td className="px-5 py-3.5 text-zinc-500">{inv.date}</td>
                  <td className="px-5 py-3.5 font-sans font-medium text-zinc-800">{inv.planName}</td>
                  <td className="px-5 py-3.5 text-zinc-900 font-bold">{inv.amount}</td>
                  <td className="px-5 py-3.5 text-zinc-600 text-[11px] truncate max-w-[150px]">
                    {inv.paymentMethod || 'UPI Transfer'}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-mono font-bold">
                      {inv.status || 'PAID'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      onClick={() => handleDownloadInvoice(inv.invoiceId, inv.amount, inv.date, inv.paymentMethod)}
                      className="px-3 py-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-lg text-[11px] font-semibold flex items-center space-x-1.5 ml-auto transition-colors cursor-pointer border border-zinc-200"
                    >
                      <Download className="w-3.5 h-3.5 text-zinc-500" />
                      <span>Download Receipt</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

