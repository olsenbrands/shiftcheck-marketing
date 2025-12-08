/**
 * Trial Expiring Cron Job
 * ShiftCheck Marketing Website
 *
 * Runs daily to send reminder emails to users whose trials expire in 7 days.
 * Configured in vercel.json to run at 9:00 AM UTC daily.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { sendTrialEndingEmail } from '../email/send';

// Initialize Supabase with service role for bypassing RLS
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Cron secret for authorization
const CRON_SECRET = process.env.CRON_SECRET;

/**
 * Get subscriptions expiring in exactly N days
 */
async function getTrialsExpiringIn(days: number) {
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + days);

  // Set to start and end of the target day
  const startOfDay = new Date(targetDate);
  startOfDay.setUTCHours(0, 0, 0, 0);

  const endOfDay = new Date(targetDate);
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
    console.error('Error fetching expiring trials:', error);
    throw error;
  }

  return subscriptions || [];
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
    console.log('Running trial-expiring cron job...');

    // Get trials expiring in 7 days
    const expiringTrials = await getTrialsExpiringIn(7);
    console.log(`Found ${expiringTrials.length} trials expiring in 7 days`);

    const results = {
      processed: 0,
      sent: 0,
      errors: 0,
    };

    for (const subscription of expiringTrials) {
      results.processed++;

      const owner = subscription.owners as { id: string; email: string; first_name: string } | null;
      if (!owner?.email) {
        console.warn('No owner email for subscription:', subscription.id);
        results.errors++;
        continue;
      }

      try {
        const trialEndDate = new Date(subscription.current_period_end).toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });

        await sendTrialEndingEmail(
          owner.email,
          owner.first_name || 'there',
          trialEndDate
        );

        console.log('Trial ending email sent to:', owner.email);
        results.sent++;
      } catch (err) {
        console.error('Failed to send email to:', owner.email, err);
        results.errors++;
      }
    }

    console.log('Trial-expiring cron job completed:', results);

    return res.status(200).json({
      success: true,
      message: `Processed ${results.processed} trials, sent ${results.sent} emails`,
      results,
    });
  } catch (error) {
    console.error('Trial-expiring cron error:', error);
    return res.status(500).json({
      success: false,
      error: 'Cron job failed',
    });
  }
}
