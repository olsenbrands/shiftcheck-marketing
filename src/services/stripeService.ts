/**
 * Stripe Service
 * ShiftCheck Marketing Website
 *
 * Client-side Stripe integration for payment processing.
 * Server-side operations (customer creation, subscription management)
 * handled via API routes and webhooks.
 */

import { loadStripe, Stripe } from '@stripe/stripe-js';
import { fetchWithRetry } from '../utils/retry';

// Initialize Stripe with publishable key
const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

let stripePromise: Promise<Stripe | null> | null = null;

/**
 * Get Stripe instance (singleton pattern)
 */
export function getStripe(): Promise<Stripe | null> {
  if (!stripePromise && stripePublishableKey) {
    stripePromise = loadStripe(stripePublishableKey);
  }
  return stripePromise || Promise.resolve(null);
}

/**
 * Check if Stripe is configured
 */
export function isStripeConfigured(): boolean {
  return Boolean(stripePublishableKey);
}

/**
 * Create a Stripe customer for the owner
 * Called server-side via API route
 */
export async function createStripeCustomer(params: {
  email: string;
  name?: string;
  ownerId: string;
}): Promise<{ customerId: string } | { error: string }> {
  try {
    const response = await fetch('/api/stripe/create-customer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { error: errorData.error || 'Failed to create customer' };
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating Stripe customer:', error);
    return { error: 'Network error - please try again' };
  }
}

/**
 * Create a payment intent for subscription setup
 * This calls our backend API which creates the PaymentIntent
 * Includes automatic retry for transient failures
 */
export async function createPaymentIntent(params: {
  ownerEmail: string;
  planId: string;
  restaurantCount: number;
}): Promise<{ clientSecret: string; customerId: string; paymentIntentId: string } | { error: string }> {
  try {
    const response = await fetchWithRetry(
      '/api/stripe/create-payment-intent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      },
      {
        maxRetries: 2,
        onRetry: (_err, attempt) => {
          console.log(`Retrying payment intent creation (attempt ${attempt})...`);
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return { error: errorData.error || 'Failed to create payment intent' };
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return { error: 'Network error - please check your connection and try again' };
  }
}

/**
 * Create Stripe subscription after successful payment method setup
 * Called server-side via API route
 */
export async function createStripeSubscription(params: {
  customerId: string;
  paymentMethodId: string;
  priceId: string;
  quantity: number;
  ownerId: string;
}): Promise<{ subscriptionId: string; status: string; clientSecret?: string } | { error: string }> {
  try {
    const response = await fetch('/api/stripe/create-subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { error: errorData.error || 'Failed to create subscription' };
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating subscription:', error);
    return { error: 'Network error - please try again' };
  }
}

/**
 * Get pricing for plan and restaurant count
 */
export function calculatePrice(planId: string, restaurantCount: number): number {
  const pricePerRestaurant: Record<string, number> = {
    free_starter: 0,
    grow: 9900, // $99 in cents
    expand: 9900, // $99 in cents
  };

  return (pricePerRestaurant[planId] || 0) * restaurantCount;
}

/**
 * Format price for display
 */
export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

/**
 * Create Stripe Customer Portal session
 * Redirects user to Stripe-hosted portal for managing payment methods
 */
export async function createPortalSession(params: {
  customerId: string;
  returnUrl?: string;
}): Promise<{ url: string } | { error: string }> {
  try {
    const response = await fetch('/api/stripe/create-portal-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { error: errorData.error || 'Failed to create portal session' };
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating portal session:', error);
    return { error: 'Network error - please try again' };
  }
}

/**
 * Invoice data type
 */
export interface InvoiceData {
  id: string;
  number: string | null;
  status: string | null;
  amount_due: number;
  amount_paid: number;
  currency: string;
  created: number;
  period_start: number;
  period_end: number;
  hosted_invoice_url: string | null;
  invoice_pdf: string | null;
}

/**
 * Get billing history (invoices) for a customer
 */
export async function getInvoices(params: {
  customerId: string;
  limit?: number;
}): Promise<{ invoices: InvoiceData[] } | { error: string }> {
  try {
    const response = await fetch('/api/stripe/get-invoices', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { error: errorData.error || 'Failed to fetch invoices' };
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return { error: 'Network error - please try again' };
  }
}

/**
 * Update subscription quantity (for upgrades/downgrades)
 */
export async function updateSubscriptionQuantity(params: {
  subscriptionId: string;
  newQuantity: number;
  prorationBehavior?: 'create_prorations' | 'none' | 'always_invoice';
}): Promise<{
  success: boolean;
  subscription?: {
    id: string;
    status: string;
    quantity: number;
    current_period_end: number;
  };
  change_type?: 'upgrade' | 'downgrade' | 'no_change';
  proration_preview?: {
    amount_due: number;
    subtotal: number;
    total: number;
  } | null;
} | { error: string }> {
  try {
    const response = await fetch('/api/stripe/update-subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subscriptionId: params.subscriptionId,
        newQuantity: params.newQuantity,
        proration_behavior: params.prorationBehavior || 'create_prorations',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { error: errorData.error || 'Failed to update subscription' };
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating subscription:', error);
    return { error: 'Network error - please try again' };
  }
}
