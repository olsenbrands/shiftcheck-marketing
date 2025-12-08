/**
 * Email Service
 * ShiftCheck Marketing Website
 *
 * Client-side service for triggering transactional emails.
 */

export type EmailType =
  | 'welcome'
  | 'subscription_confirmed'
  | 'trial_ending'
  | 'trial_expired'
  | 'payment_failed'
  | 'subscription_cancelled'
  | 'password_reset';

export interface EmailParams {
  firstName?: string;
  lastName?: string;
  planName?: string;
  trialEndDate?: string;
  amount?: string;
  restaurantCount?: number;
  resetLink?: string;
  [key: string]: string | number | undefined;
}

interface SendEmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Send email via API
 */
async function sendEmail(
  type: EmailType,
  to: { email: string; name?: string },
  params?: EmailParams
): Promise<SendEmailResponse> {
  try {
    const response = await fetch('/api/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ type, to, params }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Failed to send email',
      };
    }

    return {
      success: true,
      messageId: data.messageId,
    };
  } catch (error) {
    console.error('Email service error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

/**
 * Send welcome email after account creation
 */
export async function sendWelcomeEmail(
  email: string,
  firstName: string,
  lastName?: string
): Promise<SendEmailResponse> {
  return sendEmail(
    'welcome',
    { email, name: `${firstName} ${lastName || ''}`.trim() },
    { firstName, lastName }
  );
}

/**
 * Send subscription confirmation email
 */
export async function sendSubscriptionConfirmedEmail(
  email: string,
  firstName: string,
  planName: string,
  restaurantCount: number
): Promise<SendEmailResponse> {
  return sendEmail(
    'subscription_confirmed',
    { email, name: firstName },
    { firstName, planName, restaurantCount }
  );
}

/**
 * Send trial ending reminder email (7 days before expiry)
 */
export async function sendTrialEndingEmail(
  email: string,
  firstName: string,
  trialEndDate: string
): Promise<SendEmailResponse> {
  return sendEmail(
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
): Promise<SendEmailResponse> {
  return sendEmail(
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
): Promise<SendEmailResponse> {
  return sendEmail(
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
): Promise<SendEmailResponse> {
  return sendEmail(
    'subscription_cancelled',
    { email, name: firstName },
    { firstName }
  );
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  email: string,
  resetLink: string
): Promise<SendEmailResponse> {
  return sendEmail(
    'password_reset',
    { email },
    { resetLink }
  );
}
