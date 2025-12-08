/**
 * Trial Expired Cron Job
 * ShiftCheck Marketing Website
 *
 * Runs daily to send notification emails to users whose trials have expired.
 * Also deactivates restaurants for expired trial accounts.
 * Configured in vercel.json to run at 10:00 AM UTC daily.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { sendTrialExpiredEmail } from '../email/send';

// Initialize Supabase with service role for bypassing RLS
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Cron secret for authorization
const CRON_SECRET = process.env.CRON_SECRET;

/**
 * Get trials that expired yesterday (to avoid duplicate sends on same day)
 */
async function getExpiredTrials() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  // Set to start and end of yesterday
  const startOfDay = new Date(yesterday);
  startOfDay.setUTCHours(0, 0, 0, 0);

  const endOfDay = new Date(yesterday);
  endOfDay.setUTCHours(23, 59, 59, 999);

  const { data: subscriptions, error } = await supabase
    .from('subscriptions')
    .select(`
      id,
      owner_id,
      current_period_end,
      status,
      owners (
        id,
        email,
        first_name
      )
    `)
    .eq('status', 'trialing')
    .gte('current_period_end', startOfDay.toISOString())
    .lte('current_period_end', endOfDay.toISOString());

  if (error) {
    console.error('Error fetching expired trials:', error);
    throw error;
  }

  return subscriptions || [];
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
 * Update subscription status to expired
 */
async function markSubscriptionExpired(subscriptionId: string) {
  const { error } = await supabase
    .from('subscriptions')
    .update({
      status: 'canceled',
      updated_at: new Date().toISOString(),
    })
    .eq('id', subscriptionId);

  if (error) {
    console.error('Error updating subscription status:', error);
    throw error;
  }
}

/**
 * Main cron handler
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Verify authorization - CRON_SECRET must be configured
  const authHeader = req.headers.authorization;
  if (!CRON_SECRET) {
    console.error('CRON_SECRET not configured - rejecting request for security');
    return res.status(500).json({ error: 'Server configuration error' });
  }
  if (authHeader !== `Bearer ${CRON_SECRET}`) {
    console.warn('Unauthorized cron request attempt');
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Only allow GET requests (Vercel cron uses GET)
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Running trial-expired cron job...');

    // Get trials that expired yesterday
    const expiredTrials = await getExpiredTrials();
    console.log(`Found ${expiredTrials.length} expired trials`);

    const results = {
      processed: 0,
      emailsSent: 0,
      subscriptionsUpdated: 0,
      restaurantsDeactivated: 0,
      errors: 0,
    };

    for (const subscription of expiredTrials) {
      results.processed++;

      const owner = subscription.owners as { id: string; email: string; first_name: string } | null;

      try {
        // Update subscription status
        await markSubscriptionExpired(subscription.id);
        results.subscriptionsUpdated++;

        // Deactivate restaurants
        if (owner?.id) {
          await deactivateOwnerRestaurants(owner.id);
          results.restaurantsDeactivated++;
        }

        // Send email notification
        if (owner?.email) {
          await sendTrialExpiredEmail(
            owner.email,
            owner.first_name || 'there'
          );
          console.log('Trial expired email sent to:', owner.email);
          results.emailsSent++;
        }
      } catch (err) {
        console.error('Failed to process expired trial:', subscription.id, err);
        results.errors++;
      }
    }

    console.log('Trial-expired cron job completed:', results);

    return res.status(200).json({
      success: true,
      message: `Processed ${results.processed} expired trials`,
      results,
    });
  } catch (error) {
    console.error('Trial-expired cron error:', error);
    return res.status(500).json({
      success: false,
      error: 'Cron job failed',
    });
  }
}
