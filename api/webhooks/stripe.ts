/**
 * Stripe Webhook Handler
 * ShiftCheck Marketing Website
 *
 * Handles Stripe webhook events for subscription management.
 * Updates database based on payment events.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import {
  sendSubscriptionConfirmedEmail,
  sendPaymentFailedEmail,
  sendSubscriptionCancelledEmail,
  sendTrialEndingEmail,
} from '../email/send';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-04-30.basil',
});

// Initialize Supabase with service role for bypassing RLS
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Webhook signing secret
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// Idempotency: Track processed events
const processedEvents = new Set<string>();

/**
 * Get raw body for webhook signature verification
 */
async function getRawBody(req: VercelRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

/**
 * Get owner details by ID
 */
async function getOwnerById(ownerId: string) {
  const { data: owner } = await supabase
    .from('owners')
    .select('email, first_name, last_name')
    .eq('id', ownerId)
    .single();

  return owner;
}

/**
 * Find owner by Stripe customer ID
 */
async function findOwnerByCustomerId(customerId: string) {
  // First check if we have a subscription with this customer ID
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('owner_id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (subscription) {
    return subscription.owner_id;
  }

  // Otherwise, look up by email from Stripe customer
  const customer = await stripe.customers.retrieve(customerId);
  if (customer.deleted || !('email' in customer) || !customer.email) {
    return null;
  }

  const { data: owner } = await supabase
    .from('owners')
    .select('id')
    .eq('email', customer.email)
    .single();

  return owner?.id || null;
}

/**
 * Create or update subscription record
 */
async function upsertSubscription(
  ownerId: string,
  stripeSubscription: Stripe.Subscription
) {
  const subscriptionData = {
    owner_id: ownerId,
    stripe_subscription_id: stripeSubscription.id,
    stripe_customer_id: stripeSubscription.customer as string,
    plan_type: stripeSubscription.metadata?.plan_id || 'grow',
    status: stripeSubscription.status,
    current_period_start: new Date(stripeSubscription.current_period_start * 1000).toISOString(),
    current_period_end: new Date(stripeSubscription.current_period_end * 1000).toISOString(),
    max_active_restaurants: parseInt(stripeSubscription.metadata?.restaurant_count || '1', 10),
    updated_at: new Date().toISOString(),
  };

  // Check if subscription exists
  const { data: existing } = await supabase
    .from('subscriptions')
    .select('id')
    .eq('stripe_subscription_id', stripeSubscription.id)
    .single();

  if (existing) {
    // Update existing
    const { error } = await supabase
      .from('subscriptions')
      .update(subscriptionData)
      .eq('id', existing.id);

    if (error) {
      console.error('Error updating subscription:', error);
      throw error;
    }
  } else {
    // Insert new
    const { error } = await supabase
      .from('subscriptions')
      .insert({
        ...subscriptionData,
        created_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  }
}

/**
 * Deactivate all restaurants for an owner
 */
async function deactivateOwnerRestaurants(ownerId: string) {
  const { error } = await supabase
    .from('restaurants')
    .update({
      is_active: false,
      updated_at: new Date().toISOString(),
    })
    .eq('owner_id', ownerId);

  if (error) {
    console.error('Error deactivating restaurants:', error);
    throw error;
  }
}

/**
 * Handle customer.subscription.created
 */
async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  const ownerId = await findOwnerByCustomerId(customerId);

  if (!ownerId) {
    console.error('No owner found for customer:', customerId);
    return;
  }

  await upsertSubscription(ownerId, subscription);
  console.log('Subscription created for owner:', ownerId);

  // Send confirmation email
  const owner = await getOwnerById(ownerId);
  if (owner) {
    const planName = subscription.metadata?.plan_id || 'Grow';
    const restaurantCount = parseInt(subscription.metadata?.restaurant_count || '1', 10);

    await sendSubscriptionConfirmedEmail(
      owner.email,
      owner.first_name,
      planName.charAt(0).toUpperCase() + planName.slice(1),
      restaurantCount
    );
    console.log('Subscription confirmation email sent to:', owner.email);
  }
}

/**
 * Handle customer.subscription.updated
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  const ownerId = await findOwnerByCustomerId(customerId);

  if (!ownerId) {
    console.error('No owner found for customer:', customerId);
    return;
  }

  await upsertSubscription(ownerId, subscription);
  console.log('Subscription updated for owner:', ownerId);
}

/**
 * Handle customer.subscription.deleted
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  const ownerId = await findOwnerByCustomerId(customerId);

  if (!ownerId) {
    console.error('No owner found for customer:', customerId);
    return;
  }

  // Update subscription status to canceled
  const { error } = await supabase
    .from('subscriptions')
    .update({
      status: 'canceled',
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id);

  if (error) {
    console.error('Error updating subscription status:', error);
  }

  // Deactivate all restaurants
  await deactivateOwnerRestaurants(ownerId);
  console.log('Subscription canceled, restaurants deactivated for owner:', ownerId);

  // Send cancellation email
  const owner = await getOwnerById(ownerId);
  if (owner) {
    await sendSubscriptionCancelledEmail(owner.email, owner.first_name);
    console.log('Subscription cancellation email sent to:', owner.email);
  }
}

/**
 * Handle invoice.payment_succeeded
 */
async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;
  const subscriptionId = invoice.subscription as string;

  if (!subscriptionId) {
    // One-time payment, not subscription
    return;
  }

  const ownerId = await findOwnerByCustomerId(customerId);
  if (!ownerId) {
    console.error('No owner found for customer:', customerId);
    return;
  }

  // Update subscription status to active
  const { error } = await supabase
    .from('subscriptions')
    .update({
      status: 'active',
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscriptionId);

  if (error) {
    console.error('Error updating subscription status:', error);
  }

  console.log('Payment succeeded for owner:', ownerId);
}

/**
 * Handle invoice.payment_failed
 */
async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;
  const subscriptionId = invoice.subscription as string;

  if (!subscriptionId) {
    return;
  }

  const ownerId = await findOwnerByCustomerId(customerId);
  if (!ownerId) {
    console.error('No owner found for customer:', customerId);
    return;
  }

  // Update subscription status to past_due
  const { error } = await supabase
    .from('subscriptions')
    .update({
      status: 'past_due',
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscriptionId);

  if (error) {
    console.error('Error updating subscription status:', error);
  }

  console.log('Payment failed for owner:', ownerId);

  // Send payment failed email
  const owner = await getOwnerById(ownerId);
  if (owner) {
    const amountDue = invoice.amount_due ? `$${(invoice.amount_due / 100).toFixed(2)}` : 'your subscription';
    await sendPaymentFailedEmail(owner.email, owner.first_name, amountDue);
    console.log('Payment failed email sent to:', owner.email);
  }
}

/**
 * Handle customer.subscription.trial_will_end
 * Fires 3 days before trial ends
 */
async function handleTrialWillEnd(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  const ownerId = await findOwnerByCustomerId(customerId);

  if (!ownerId) {
    console.error('No owner found for customer:', customerId);
    return;
  }

  const owner = await getOwnerById(ownerId);
  if (owner && subscription.trial_end) {
    const trialEndDate = new Date(subscription.trial_end * 1000).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    await sendTrialEndingEmail(owner.email, owner.first_name, trialEndDate);
    console.log('Trial ending email sent to:', owner.email);
  }
}

/**
 * Main webhook handler
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get raw body for signature verification
    const rawBody = await getRawBody(req);
    const signature = req.headers['stripe-signature'] as string;

    if (!signature) {
      return res.status(400).json({ error: 'Missing Stripe signature' });
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return res.status(400).json({ error: 'Invalid signature' });
    }

    // Idempotency check
    if (processedEvents.has(event.id)) {
      console.log('Duplicate event ignored:', event.id);
      return res.status(200).json({ received: true, duplicate: true });
    }
    processedEvents.add(event.id);

    // Clean up old events (keep last 1000)
    if (processedEvents.size > 1000) {
      const eventsArray = Array.from(processedEvents);
      eventsArray.slice(0, 500).forEach((id) => processedEvents.delete(id));
    }

    console.log('Processing webhook event:', event.type, event.id);

    // Handle different event types
    switch (event.type) {
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      case 'customer.subscription.trial_will_end':
        await handleTrialWillEnd(event.data.object as Stripe.Subscription);
        break;

      default:
        console.log('Unhandled event type:', event.type);
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({ error: 'Webhook handler failed' });
  }
}

// Vercel config: disable body parsing for raw body access
export const config = {
  api: {
    bodyParser: false,
  },
};
