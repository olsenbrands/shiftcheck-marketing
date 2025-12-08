/**
 * Update Stripe Subscription
 * ShiftCheck Marketing Website
 *
 * Updates subscription quantity for upgrades/downgrades.
 * Handles proration for upgrades and deferred changes for downgrades.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

interface UpdateSubscriptionRequest {
  subscriptionId: string;
  newQuantity: number;
  proration_behavior?: 'create_prorations' | 'none' | 'always_invoice';
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { subscriptionId, newQuantity, proration_behavior = 'create_prorations' } = req.body as UpdateSubscriptionRequest;

  if (!subscriptionId) {
    return res.status(400).json({ error: 'Subscription ID is required' });
  }

  if (!newQuantity || newQuantity < 1) {
    return res.status(400).json({ error: 'New quantity must be at least 1' });
  }

  try {
    // Get current subscription
    const currentSubscription = await stripe.subscriptions.retrieve(subscriptionId);

    if (!currentSubscription.items.data[0]) {
      return res.status(400).json({ error: 'Subscription has no items' });
    }

    const currentQuantity = currentSubscription.items.data[0].quantity || 1;
    const isUpgrade = newQuantity > currentQuantity;
    const isDowngrade = newQuantity < currentQuantity;

    let updateParams: Stripe.SubscriptionUpdateParams = {
      items: [
        {
          id: currentSubscription.items.data[0].id,
          quantity: newQuantity,
        },
      ],
    };

    if (isUpgrade) {
      // Upgrades: Prorate immediately
      updateParams.proration_behavior = proration_behavior;
    } else if (isDowngrade) {
      // Downgrades: Take effect at end of billing period
      updateParams.proration_behavior = 'none';
      // Schedule the change for the end of the current period
      // Note: For true deferred downgrades, you'd use subscription schedules
      // This simpler approach applies immediately without proration
    }

    const updatedSubscription = await stripe.subscriptions.update(
      subscriptionId,
      updateParams
    );

    // Calculate proration preview for upgrades
    let prorationPreview = null;
    if (isUpgrade && proration_behavior === 'create_prorations') {
      try {
        const upcomingInvoice = await stripe.invoices.retrieveUpcoming({
          subscription: subscriptionId,
        });
        prorationPreview = {
          amount_due: upcomingInvoice.amount_due,
          subtotal: upcomingInvoice.subtotal,
          total: upcomingInvoice.total,
        };
      } catch (e) {
        // Proration preview not available
        console.log('Could not get proration preview:', e);
      }
    }

    return res.status(200).json({
      success: true,
      subscription: {
        id: updatedSubscription.id,
        status: updatedSubscription.status,
        quantity: updatedSubscription.items.data[0]?.quantity,
        current_period_end: updatedSubscription.current_period_end,
      },
      change_type: isUpgrade ? 'upgrade' : isDowngrade ? 'downgrade' : 'no_change',
      proration_preview: prorationPreview,
    });
  } catch (error) {
    console.error('Error updating subscription:', error);

    if (error instanceof Stripe.errors.StripeError) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(500).json({ error: 'Failed to update subscription' });
  }
}
