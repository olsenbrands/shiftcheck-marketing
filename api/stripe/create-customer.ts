/**
 * Stripe Create Customer API Route
 * ShiftCheck Marketing Website
 *
 * Creates a Stripe customer for an owner.
 * Vercel Serverless Function.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';

// Initialize Stripe with secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-04-30.basil',
});

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
    const { email, name, ownerId } = req.body;

    // Validate input
    if (!email || !ownerId) {
      return res.status(400).json({
        error: 'Missing required fields: email, ownerId',
      });
    }

    // Check if customer already exists
    const existingCustomers = await stripe.customers.list({
      email,
      limit: 1,
    });

    if (existingCustomers.data.length > 0) {
      // Return existing customer
      return res.status(200).json({
        customerId: existingCustomers.data[0].id,
        existing: true,
      });
    }

    // Create new customer
    const customer = await stripe.customers.create({
      email,
      name: name || undefined,
      metadata: {
        owner_id: ownerId,
        source: 'shiftcheck_signup',
      },
    });

    return res.status(200).json({
      customerId: customer.id,
      existing: false,
    });
  } catch (error) {
    console.error('Error creating Stripe customer:', error);

    if (error instanceof Stripe.errors.StripeError) {
      return res.status(400).json({
        error: error.message,
      });
    }

    return res.status(500).json({
      error: 'Failed to create customer',
    });
  }
}
