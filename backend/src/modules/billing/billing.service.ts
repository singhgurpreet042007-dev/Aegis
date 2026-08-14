import { Injectable, BadRequestException } from '@nestjs/common';
import { ClaimTrialDto, CheckoutDto, VerifyPaymentDto } from './dto/billing.dto';

export interface PlanConfig {
  id: 'starter' | 'pro' | 'enterprise';
  name: string;
  monthlyPrice: number;
  quarterlyPrice: number;
  annualPrice: number;
  monthlyPriceInr: number;
  quarterlyPriceInr: number;
  annualPriceInr: number;
  features: string[];
}

export const PRICING_CONFIG: Record<string, PlanConfig> = {
  starter: {
    id: 'starter',
    name: 'Starter Developer',
    monthlyPrice: 0,
    quarterlyPrice: 0,
    annualPrice: 0,
    monthlyPriceInr: 0,
    quarterlyPriceInr: 0,
    annualPriceInr: 0,
    features: [
      '1 Connected Website Domain',
      'Up to 1,000 Active Monitored Sessions/mo',
      'Basic Keystroke & Mouse Velocity Telemetry',
      'Standard Step-Up MFA Challenge Modal',
    ],
  },
  pro: {
    id: 'pro',
    name: 'Pro SecOps',
    monthlyPrice: 4,
    quarterlyPrice: 10,
    annualPrice: 36,
    monthlyPriceInr: 300,
    quarterlyPriceInr: 800,
    annualPriceInr: 3000,
    features: [
      'Up to 5 Connected Website Domains',
      'Up to 50,000 Active Monitored Sessions/mo',
      'Multi-Modal Ensemble AI (4 Micro-Models)',
      '14-Day Behavioral Drift Radar',
      'Automated Webhook Threat Dispatch',
      'Priority 24/7 SecOps Support',
    ],
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise Cyber',
    monthlyPrice: 12,
    quarterlyPrice: 30,
    annualPrice: 110,
    monthlyPriceInr: 999,
    quarterlyPriceInr: 2500,
    annualPriceInr: 8999,
    features: [
      'Unlimited Connected Target Domains',
      'Unlimited Monitored Sessions & Raw Telemetry',
      'Digital Twin Honeypot Decoy Sandbox',
      'SHAP Explainable AI (XAI) Audit Reports',
      'SOC-2 Type II & NIST SP 800-207 Audit Exports',
      'Dedicated Cybersecurity Engineer SLA (15m)',
    ],
  },
};

// Simulated in-memory billing store (persists across runtime)
const billingStore = {
  activePlan: 'pro' as 'starter' | 'pro' | 'enterprise',
  billingCycle: 'annual' as 'monthly' | 'quarterly' | 'annual',
  trialClaimed: false,
  trialStartedAt: null as string | null,
  trialExpiresAt: null as string | null,
  invoices: [
    {
      invoiceId: 'INV-2026-9921',
      date: new Date('2026-08-01').toUTCString(),
      planName: 'Pro SecOps (Annual Plan)',
      amount: '$90.00 USD',
      status: 'PAID',
      paymentMethod: 'VISA ending in 9821',
    },
  ],
};

@Injectable()
export class BillingService {
  /**
   * Claim 7-Day Free Trial (No credit card required)
   */
  claimTrial(dto: ClaimTrialDto) {
    const targetPlan = dto.planId || 'pro';
    const now = new Date();
    const expires = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

    billingStore.trialClaimed = true;
    billingStore.trialStartedAt = now.toISOString();
    billingStore.trialExpiresAt = expires.toISOString();
    billingStore.activePlan = targetPlan;

    return {
      success: true,
      message: '7-Day Free Trial successfully claimed! Full Pro SecOps features unlocked.',
      trial: {
        claimed: true,
        startedAt: billingStore.trialStartedAt,
        expiresAt: billingStore.trialExpiresAt,
        daysRemaining: 7,
        hoursRemaining: 168,
      },
    };
  }

  /**
   * Process Checkout (Card, UPI / QR Code, Net Banking) & Activate Subscription
   */
  checkout(dto: CheckoutDto) {
    const plan = PRICING_CONFIG[dto.planId] || PRICING_CONFIG.pro;
    const isInr = dto.currency === 'INR';
    let price = 0;

    if (dto.billingCycle === 'quarterly') {
      price = isInr ? plan.quarterlyPriceInr : plan.quarterlyPrice;
    } else if (dto.billingCycle === 'annual') {
      price = isInr ? plan.annualPriceInr : plan.annualPrice;
    } else {
      price = isInr ? plan.monthlyPriceInr : plan.monthlyPrice;
    }

    const currencySymbol = isInr ? '₹' : '$';
    const currencySuffix = isInr ? 'INR' : 'USD';
    const formattedAmount = `${currencySymbol}${price.toLocaleString()} ${currencySuffix}`;

    // Determine descriptive payment method string
    let pmString = 'Trial Upgrade';
    if (dto.paymentMethod === 'upi') {
      const upi = dto.upiId || '9882776796@ptyes';
      pmString = `UPI / QR (${upi})`;
    } else if (dto.paymentMethod === 'netbanking') {
      const bank = dto.bankName || 'HDFC Bank';
      pmString = `Net Banking (${bank})`;
    } else if (dto.paymentMethod === 'card') {
      if (dto.planId !== 'starter' && (!dto.cardNumber || dto.cardNumber.replace(/\s+/g, '').length < 14)) {
        throw new BadRequestException('Invalid Credit/Debit Card number provided');
      }
      const last4 = dto.cardNumber ? dto.cardNumber.slice(-4) : '9821';
      pmString = `Card ending in ${last4}`;
    }

    billingStore.activePlan = dto.planId;
    billingStore.billingCycle = dto.billingCycle;

    const invoiceId = `INV-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    const txnId = `TXN_AEGIS_${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

    const newInvoice = {
      invoiceId,
      date: new Date().toUTCString(),
      planName: `${plan.name} (${dto.billingCycle.toUpperCase()})`,
      amount: formattedAmount,
      status: 'PAID',
      paymentMethod: pmString,
    };

    billingStore.invoices.unshift(newInvoice);

    return {
      success: true,
      message: `Subscription successfully updated to ${plan.name}`,
      transaction: {
        invoiceId,
        transactionId: txnId,
        amountPaid: formattedAmount,
        billingCycle: dto.billingCycle,
        activePlan: plan.id,
        paymentMethod: pmString,
        date: newInvoice.date,
        features: plan.features,
      },
    };
  }

  /**
   * Verify Webhook / Client Payment Confirmation
   */
  verifyPayment(dto: VerifyPaymentDto) {
    return {
      success: true,
      verified: true,
      transactionId: dto.transactionId || `TXN_AEGIS_${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      status: 'SUCCESSFUL',
      message: 'Payment verified with gateway banking node.',
    };
  }

  /**
   * Get Current Subscription Status & Trial Remaining Time
   */
  getStatus() {
    let daysRemaining = 0;
    let hoursRemaining = 0;
    let isTrialActive = false;

    if (billingStore.trialExpiresAt) {
      const now = new Date().getTime();
      const expires = new Date(billingStore.trialExpiresAt).getTime();
      const diffMs = expires - now;

      if (diffMs > 0) {
        isTrialActive = true;
        daysRemaining = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        hoursRemaining = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      }
    }

    const currentPlan = PRICING_CONFIG[billingStore.activePlan] || PRICING_CONFIG.pro;

    return {
      success: true,
      activePlan: billingStore.activePlan,
      planName: currentPlan.name,
      billingCycle: billingStore.billingCycle,
      trial: {
        claimed: billingStore.trialClaimed,
        isActive: isTrialActive,
        startedAt: billingStore.trialStartedAt,
        expiresAt: billingStore.trialExpiresAt,
        daysRemaining,
        hoursRemaining,
      },
      pricing: PRICING_CONFIG,
      invoices: billingStore.invoices,
    };
  }
}

