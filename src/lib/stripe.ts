/**
 * Stripe Client Configuration
 * ShiftCheck Marketing Website
 *
 * Provides the Stripe.js instance for frontend payment processing.
 * Uses lazy loading to avoid loading Stripe on pages that don't need it.
 */

import { loadStripe, Stripe } from '@stripe/stripe-js';
import { STRIPE_PUBLISHABLE_KEY } from './config';

// Singleton promise for Stripe instance
let stripePromise: Promise<Stripe | null> | null = null;

/**
 * Get the Stripe instance (lazy loaded)
 * Call this when you need to use Stripe Elements or confirm payments.
 *
 * @example
 * const stripe = await getStripe();
 * if (stripe) {
 *   const { error } = await stripe.confirmPayment(...);
 * }
 */
export const getStripe = (): Promise<Stripe | null> => {
  if (!stripePromise) {
    stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);
  }
  return stripePromise;
};

/**
 * Preload Stripe.js
 * Call this on pages where you know payment will be needed
 * (e.g., on plan selection page before they reach payment page)
 */
export const preloadStripe = (): void => {
  getStripe();
};

// Re-export types for convenience
export type { Stripe, StripeElements, StripeError } from '@stripe/stripe-js';
