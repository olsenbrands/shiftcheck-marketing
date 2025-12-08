/**
 * Stripe Create Payment Intent API Route
 * ShiftCheck Marketing Website
 *
 * Creates a PaymentIntent for subscription setup.
 * Vercel Serverless Function.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';

// Initialize Stripe with secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-04-30.basil',
});

// Price per restaurant in cents ($99)
const PRICE_PER_RESTAURANT_CENTS = 9900;

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
    const { planId, restaurantCount, ownerEmail } = req.body;

    // Validate required fields
    if (!planId || restaurantCount === undefined || !ownerEmail) {
      return res.status(400).json({
        error: 'Missing required fields: planId, restaurantCount, ownerEmail',
      });
    }

    // Validate planId is a valid string
    const validPlans = ['free_starter', 'grow', 'expand'];
    if (typeof planId !== 'string' || !validPlans.includes(planId)) {
      return res.status(400).json({
        error: 'Invalid plan. Must be one of: free_starter, grow, expand',
      });
    }

    // Validate restaurantCount is a positive integer within reasonable bounds
    const count = parseInt(restaurantCount, 10);
    if (isNaN(count) || count < 1 || count > 100) {
      return res.status(400).json({
        error: 'Restaurant count must be a number between 1 and 100',
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (typeof ownerEmail !== 'string' || !emailRegex.test(ownerEmail)) {
      return res.status(400).json({
        error: 'Invalid email format',
      });
    }

    // Free starter doesn't need payment
    if (planId === 'free_starter') {
      return res.status(400).json({
        error: 'Free Starter plan does not require payment',
      });
    }

    // Calculate amount using validated count
    const amount = PRICE_PER_RESTAURANT_CENTS * count;

    // Find or create customer
    let customer: Stripe.Customer;
    const existingCustomers = await stripe.customers.list({
      email: ownerEmail,
      limit: 1,
    });

    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0];
    } else {
      customer = await stripe.customers.create({
        email: ownerEmail,
        metadata: {
          plan_id: planId,
          restaurant_count: count.toString(),
        },
      });
    }

    // Create PaymentIntent for subscription setup
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      customer: customer.id,
      setup_future_usage: 'off_session', // Allow future charges
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        plan_id: planId,
        restaurant_count: count.toString(),
        owner_email: ownerEmail,
      },
      receipt_email: ownerEmail,
      description: `ShiftCheck ${planId} plan - ${count} restaurant(s)`,
    });

    return res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      customerId: customer.id,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);

    if (error instanceof Stripe.errors.StripeError) {
      return res.status(400).json({
        error: error.message,
      });
    }

    return res.status(500).json({
      error: 'Failed to create payment intent',
    });
  }
}
