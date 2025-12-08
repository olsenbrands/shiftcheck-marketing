/**
 * Stripe Create Subscription API Route
 * ShiftCheck Marketing Website
 *
 * Creates a Stripe subscription for an owner.
 * Vercel Serverless Function.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';

// Initialize Stripe with secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-04-30.basil',
});

// Stripe Price IDs (configured in Stripe Dashboard)
// These should be moved to environment variables for production
const PRICE_IDS: Record<string, string> = {
  grow: process.env.STRIPE_PRICE_ID_GROW || 'price_grow_placeholder',
  expand: process.env.STRIPE_PRICE_ID_EXPAND || 'price_expand_placeholder',
};

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Only allow POST
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { customerId, paymentMethodId, priceId, quantity, ownerId } = req.body;

    // Validate input
    if (!customerId || !paymentMethodId || !priceId || !quantity || !ownerId) {
      return res.status(400).json({
        error: 'Missing required fields: customerId, paymentMethodId, priceId, quantity, ownerId',
      });
    }

    // Get Stripe price ID from plan
    const stripePriceId = PRICE_IDS[priceId] || priceId;

    // Attach payment method to customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });

    // Set as default payment method
    await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [
        {
          price: stripePriceId,
          quantity: quantity,
        },
      ],
      payment_behavior: 'default_incomplete',
      payment_settings: {
        save_default_payment_method: 'on_subscription',
      },
      expand: ['latest_invoice.payment_intent'],
      metadata: {
        owner_id: ownerId,
        plan_id: priceId,
        restaurant_count: quantity.toString(),
      },
    });

    // Get client secret for payment confirmation if needed
    const invoice = subscription.latest_invoice as Stripe.Invoice;
    const paymentIntent = invoice.payment_intent as Stripe.PaymentIntent;

    return res.status(200).json({
      subscriptionId: subscription.id,
      status: subscription.status,
      clientSecret: paymentIntent?.client_secret || null,
    });
  } catch (error) {
    console.error('Error creating Stripe subscription:', error);

    if (error instanceof Stripe.errors.StripeError) {
      return res.status(400).json({
        error: error.message,
      });
    }

    return res.status(500).json({
      error: 'Failed to create subscription',
    });
  }
}
