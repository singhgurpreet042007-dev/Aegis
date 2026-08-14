'use client';

import { useState, useEffect } from 'react';
import { fetchApi } from './api-client';

export type PlanType = 'starter' | 'pro' | 'enterprise';

export interface SubscriptionState {
  activePlan: PlanType;
  billingCycle: 'monthly' | 'quarterly' | 'annual';
  currency: 'USD' | 'INR';
  isTrialActive: boolean;
  trialDaysRemaining: number;
  trialHoursRemaining: number;
  scansCount: number;
  inspectionsCount: number;
}

export function useSubscription() {
  const [subState, setSubState] = useState<SubscriptionState>({
    activePlan: 'starter',
    billingCycle: 'annual',
    currency: 'INR',
    isTrialActive: false,
    trialDaysRemaining: 7,
    trialHoursRemaining: 0,
    scansCount: 0,
    inspectionsCount: 0,
  });

  const [isLoading, setIsLoading] = useState(true);

  // Initialize subscription state from localStorage & backend
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedPlan = (localStorage.getItem('aegis_active_plan') as PlanType) || 'starter';
      const storedCycle = (localStorage.getItem('aegis_plan_billing') as any) || 'annual';
      const storedCurr = (localStorage.getItem('aegis_plan_currency') as any) || 'INR';
      const storedScans = parseInt(localStorage.getItem('aegis_usage_scans') || '0', 10);
      const storedInspections = parseInt(localStorage.getItem('aegis_usage_inspections') || '0', 10);

      let trialActive = false;
      let daysRem = 0;
      let hoursRem = 0;

      const trialExpiresAt = localStorage.getItem('aegis_trial_expires_at');
      if (trialExpiresAt) {
        const now = new Date().getTime();
        const exp = new Date(trialExpiresAt).getTime();
        const diff = exp - now;
        if (diff > 0) {
          trialActive = true;
          daysRem = Math.floor(diff / (1000 * 60 * 60 * 24));
          hoursRem = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        }
      }

      setSubState({
        activePlan: storedPlan,
        billingCycle: storedCycle,
        currency: storedCurr,
        isTrialActive: trialActive,
        trialDaysRemaining: daysRem,
        trialHoursRemaining: hoursRem,
        scansCount: storedScans,
        inspectionsCount: storedInspections,
      });

      setIsLoading(false);
    }

    // Backend sync
    fetchApi('/billing/status').then((res) => {
      if (res?.success) {
        setSubState((prev) => ({
          ...prev,
          activePlan: res.activePlan || prev.activePlan,
          isTrialActive: res.trial?.isActive || prev.isTrialActive,
          trialDaysRemaining: res.trial?.daysRemaining ?? prev.trialDaysRemaining,
          trialHoursRemaining: res.trial?.hoursRemaining ?? prev.trialHoursRemaining,
        }));
      }
    }).catch(() => {});
  }, []);

  // Is user effectively Pro or Enterprise? (either by subscription or active 7-day trial)
  const isPaidPlan = subState.activePlan === 'pro' || subState.activePlan === 'enterprise' || subState.isTrialActive;

  // Feature lock checker
  const isFeatureUnlocked = (featureId: 'honeypot' | 'shap' | 'drift' | 'custom_policy' | 'threat_map') => {
    if (isPaidPlan) return true;
    return false; // Starter free tier has these locked
  };

  // Quota checker (Free tier: 1 scan, 3 session inspections)
  const checkQuota = (type: 'scans' | 'inspections') => {
    if (isPaidPlan) return { allowed: true, remaining: 99999 };

    if (type === 'scans') {
      const remaining = Math.max(0, 1 - subState.scansCount);
      return { allowed: remaining > 0, remaining, limit: 1 };
    }

    if (type === 'inspections') {
      const remaining = Math.max(0, 3 - subState.inspectionsCount);
      return { allowed: remaining > 0, remaining, limit: 3 };
    }

    return { allowed: true, remaining: 100 };
  };

  // Increment usage count for Free tier users
  const incrementUsage = (type: 'scans' | 'inspections') => {
    if (typeof window === 'undefined') return;

    if (type === 'scans') {
      const newCount = subState.scansCount + 1;
      localStorage.setItem('aegis_usage_scans', newCount.toString());
      setSubState((prev) => ({ ...prev, scansCount: newCount }));
    }

    if (type === 'inspections') {
      const newCount = subState.inspectionsCount + 1;
      localStorage.setItem('aegis_usage_inspections', newCount.toString());
      setSubState((prev) => ({ ...prev, inspectionsCount: newCount }));
    }
  };

  // Activate Plan Globally
  const activatePlan = (planId: PlanType, billingCycle: 'monthly' | 'quarterly' | 'annual' = 'annual') => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('aegis_active_plan', planId);
      localStorage.setItem('aegis_plan_billing', billingCycle);

      if (planId === 'pro' || planId === 'enterprise') {
        const now = new Date();
        const expires = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        localStorage.setItem('aegis_trial_claimed', 'true');
        localStorage.setItem('aegis_trial_expires_at', expires.toISOString());
      }
    }

    setSubState((prev) => ({
      ...prev,
      activePlan: planId,
      billingCycle,
      isTrialActive: planId === 'pro' || planId === 'enterprise',
      trialDaysRemaining: 7,
      trialHoursRemaining: 168,
    }));
  };

  return {
    ...subState,
    isLoading,
    isPaidPlan,
    isFeatureUnlocked,
    checkQuota,
    incrementUsage,
    activatePlan,
  };
}
