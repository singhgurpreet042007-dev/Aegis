export class ClaimTrialDto {
  userId?: string;
  email?: string;
  planId?: 'starter' | 'pro' | 'enterprise';
}

export class CheckoutDto {
  planId: 'starter' | 'pro' | 'enterprise';
  billingCycle: 'monthly' | 'quarterly' | 'annual';
  paymentMethod?: 'trial' | 'card' | 'upi' | 'netbanking';
  currency?: 'USD' | 'INR';
  
  // Card Details
  cardName?: string;
  cardNumber?: string;
  expiry?: string;
  cvc?: string;

  // UPI Details
  upiId?: string;

  // Net Banking Details
  bankName?: string;
}

export class VerifyPaymentDto {
  transactionId: string;
  paymentMethod: string;
  upiId?: string;
}

