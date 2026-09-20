// src/services/paymentService.ts
import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase';

export const PLANS = [
  {
    id: 'essential_monthly',
    name: 'Essential',
    description: '20 searches/month, unlimited favorites',
    price: 499,
    currency: 'usd',
    type: 'subscription' as const,
    stripePriceId: process.env.EXPO_PUBLIC_STRIPE_ESSENTIAL_PRICE_ID || '',
    highlight: false,
  },
  {
    id: 'premium_monthly',
    name: 'Premium',
    description: 'Unlimited searches, full catalog, priority AI',
    price: 999,
    currency: 'usd',
    type: 'subscription' as const,
    stripePriceId: process.env.EXPO_PUBLIC_STRIPE_PREMIUM_MONTHLY_PRICE_ID || '',
    highlight: true,
  },
  {
    id: 'premium_yearly',
    name: 'Premium (Yearly)',
    description: 'Everything in Premium — save 40%',
    price: 5999,
    currency: 'usd',
    type: 'subscription' as const,
    stripePriceId: process.env.EXPO_PUBLIC_STRIPE_PREMIUM_YEARLY_PRICE_ID || '',
    highlight: false,
    badge: 'Best value',
  },
];

export async function createSubscription(priceId: string): Promise<{ subscriptionId: string; clientSecret: string }> {
  const fn = httpsCallable<{ priceId: string }, { subscriptionId: string; clientSecret: string }>(functions, 'createSubscription');
  const result = await fn({ priceId });
  return result.data;
}

export async function cancelSubscription(subscriptionId: string): Promise<void> {
  const fn = httpsCallable<{ subscriptionId: string }, void>(functions, 'cancelSubscription');
  await fn({ subscriptionId });
}

export async function getSubscriptionStatus(): Promise<{ active: boolean; plan: string; expiresAt?: number }> {
  const fn = httpsCallable<void, { active: boolean; plan: string; expiresAt?: number }>(functions, 'getSubscriptionStatus');
  const result = await fn();
  return result.data;
}
