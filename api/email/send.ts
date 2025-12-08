/**
 * Brevo Email Service API
 * ShiftCheck Marketing Website
 *
 * Sends transactional emails via Brevo (formerly Sendinblue).
 * Supports templated emails for various triggers.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

// Brevo API configuration
const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';
const BREVO_API_KEY = process.env.BREVO_API_KEY!;

// Email templates (Brevo template IDs)
const EMAIL_TEMPLATES = {
  welcome: parseInt(process.env.BREVO_TEMPLATE_WELCOME || '1', 10),
  subscription_confirmed: parseInt(process.env.BREVO_TEMPLATE_SUBSCRIPTION_CONFIRMED || '2', 10),
  trial_ending: parseInt(process.env.BREVO_TEMPLATE_TRIAL_ENDING || '3', 10),
  trial_expired: parseInt(process.env.BREVO_TEMPLATE_TRIAL_EXPIRED || '4', 10),
  payment_failed: parseInt(process.env.BREVO_TEMPLATE_PAYMENT_FAILED || '5', 10),
  subscription_cancelled: parseInt(process.env.BREVO_TEMPLATE_SUBSCRIPTION_CANCELLED || '6', 10),
  password_reset: parseInt(process.env.BREVO_TEMPLATE_PASSWORD_RESET || '7', 10),
};

// Sender configuration
const DEFAULT_SENDER = {
  name: 'ShiftCheck',
  email: process.env.BREVO_SENDER_EMAIL || 'noreply@shiftcheck.app',
};

// Email type definitions
export type EmailType = keyof typeof EMAIL_TEMPLATES;

export interface EmailParams {
  firstName?: string;
  lastName?: string;
  planName?: string;
  trialEndDate?: string;
  amount?: string;
  restaurantCount?: number;
  resetLink?: string;
  dashboardLink?: string;
  supportEmail?: string;
  [key: string]: string | number | boolean | undefined;
}

interface SendEmailRequest {
  type: EmailType;
  to: {
    email: string;
    name?: string;
  };
  params?: EmailParams;
}

/**
 * Send email via Brevo API
 */
async function sendBrevoEmail(
  type: EmailType,
  to: { email: string; name?: string },
  params: EmailParams = {}
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const templateId = EMAIL_TEMPLATES[type];

  if (!templateId) {
    return { success: false, error: `Unknown email type: ${type}` };
  }

  // Default params for all emails
  const defaultParams = {
    supportEmail: 'support@shiftcheck.app',
    dashboardLink: 'https://shiftcheck.app/account/dashboard',
    ...params,
  };

  const payload = {
    templateId,
    to: [{ email: to.email, name: to.name || to.email }],
    sender: DEFAULT_SENDER,
    params: defaultParams,
  };

  try {
    const response = await fetch(BREVO_API_URL, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'api-key': BREVO_API_KEY,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Brevo API error:', response.status, errorData);
      return {
        success: false,
        error: `Brevo API error: ${response.status} - ${errorData.message || 'Unknown error'}`,
      };
    }

    const data = await response.json();
    return { success: true, messageId: data.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send welcome email
 */
export async function sendWelcomeEmail(
  email: string,
  firstName: string,
  lastName?: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  return sendBrevoEmail('welcome', { email, name: `${firstName} ${lastName || ''}`.trim() }, {
    firstName,
    lastName,
  });
}

/**
 * Send subscription confirmed email
 */
export async function sendSubscriptionConfirmedEmail(
  email: string,
  firstName: string,
  planName: string,
  restaurantCount: number
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  return sendBrevoEmail(
    'subscription_confirmed',
    { email, name: firstName },
    { firstName, planName, restaurantCount }
  );
}

/**
 * Send trial ending reminder email
 */
export async function sendTrialEndingEmail(
  email: string,
  firstName: string,
  trialEndDate: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  return sendBrevoEmail(
    'trial_ending',
    { email, name: firstName },
    { firstName, trialEndDate }
  );
}

/**
 * Send trial expired email
 */
export async function sendTrialExpiredEmail(
  email: string,
  firstName: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  return sendBrevoEmail(
    'trial_expired',
    { email, name: firstName },
    { firstName }
  );
}

/**
 * Send payment failed email
 */
export async function sendPaymentFailedEmail(
  email: string,
  firstName: string,
  amount: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  return sendBrevoEmail(
    'payment_failed',
    { email, name: firstName },
    { firstName, amount }
  );
}

/**
 * Send subscription cancelled email
 */
export async function sendSubscriptionCancelledEmail(
  email: string,
  firstName: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  return sendBrevoEmail(
    'subscription_cancelled',
    { email, name: firstName },
    { firstName }
  );
}

/**
 * API Handler
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verify API key is configured
  if (!BREVO_API_KEY) {
    console.error('BREVO_API_KEY not configured');
    return res.status(500).json({ error: 'Email service not configured' });
  }

  // Validate request body
  const body = req.body as SendEmailRequest;

  if (!body.type) {
    return res.status(400).json({ error: 'Missing email type' });
  }

  if (!body.to?.email) {
    return res.status(400).json({ error: 'Missing recipient email' });
  }

  // Validate email type
  if (!EMAIL_TEMPLATES[body.type]) {
    return res.status(400).json({ error: `Invalid email type: ${body.type}` });
  }

  try {
    const result = await sendBrevoEmail(body.type, body.to, body.params);

    if (result.success) {
      return res.status(200).json({
        success: true,
        messageId: result.messageId,
      });
    } else {
      return res.status(500).json({
        success: false,
        error: result.error,
      });
    }
  } catch (error) {
    console.error('Email handler error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to send email',
    });
  }
}
