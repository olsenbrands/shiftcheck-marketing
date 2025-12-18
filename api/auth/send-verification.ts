/**
 * Send Email Verification API
 * ShiftCheck Marketing Website
 *
 * Sends a verification email via Brevo with a signed token.
 * Token contains the email and expiration, signed with a secret.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createHmac } from 'crypto';

// Configuration
const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';
const BREVO_API_KEY = process.env.BREVO_API_KEY!;
const VERIFICATION_SECRET = process.env.VERIFICATION_SECRET || process.env.STRIPE_WEBHOOK_SECRET!;
const BASE_URL = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : 'http://localhost:5173';

// Token expiration (24 hours)
const TOKEN_EXPIRY_HOURS = 24;

// Email template ID for verification (Template 8 = Email Verification, Template 7 = Password Reset)
const VERIFICATION_TEMPLATE_ID = parseInt(process.env.BREVO_TEMPLATE_EMAIL_VERIFICATION || '8', 10);

// Sender configuration
const SENDER = {
  name: 'ShiftCheck',
  email: process.env.BREVO_SENDER_EMAIL || 'noreply@shiftcheck.app',
};

/**
 * Generate a signed verification token
 */
function generateVerificationToken(email: string): string {
  const expiry = Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000;
  const data = `${email}:${expiry}`;
  const signature = createHmac('sha256', VERIFICATION_SECRET)
    .update(data)
    .digest('hex');

  // Token format: base64(email:expiry:signature)
  const token = Buffer.from(`${data}:${signature}`).toString('base64url');
  return token;
}

/**
 * Generate verification link
 */
function generateVerificationLink(token: string): string {
  return `${BASE_URL}/auth/callback?type=email_verification&token=${token}`;
}

/**
 * Send verification email via Brevo
 */
async function sendVerificationEmail(
  email: string,
  verificationLink: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const payload = {
    templateId: VERIFICATION_TEMPLATE_ID,
    to: [{ email, name: email }],
    sender: SENDER,
    params: {
      verificationLink,
      email,
      supportEmail: 'support@shiftcheck.app',
      expiryHours: TOKEN_EXPIRY_HOURS,
    },
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
        error: `Failed to send email: ${errorData.message || response.status}`,
      };
    }

    const data = await response.json();
    return { success: true, messageId: data.messageId };
  } catch (error) {
    console.error('Error sending verification email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Validate email format
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Get allowed CORS origin
 */
function getAllowedOrigin(requestOrigin: string | undefined): string | null {
  const allowedOrigins = [
    'https://shiftcheck.app',
    'https://www.shiftcheck.app',
  ];

  // Add Vercel preview URLs
  if (process.env.VERCEL_URL) {
    allowedOrigins.push(`https://${process.env.VERCEL_URL}`);
  }

  // Allow localhost in development
  if (process.env.NODE_ENV === 'development' || process.env.VERCEL_ENV === 'development') {
    allowedOrigins.push('http://localhost:5173');
    allowedOrigins.push('http://localhost:3001');
    allowedOrigins.push('http://localhost:3002');
    allowedOrigins.push('http://localhost:3003');
  }

  if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
    return requestOrigin;
  }

  // In development, be more permissive
  if (process.env.NODE_ENV === 'development' || process.env.VERCEL_ENV === 'development') {
    return requestOrigin || '*';
  }

  return null;
}

/**
 * API Handler
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // CORS headers - restricted to allowed origins
  const origin = req.headers.origin;
  const allowedOrigin = getAllowedOrigin(origin);

  if (allowedOrigin) {
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verify Brevo is configured
  if (!BREVO_API_KEY) {
    console.error('BREVO_API_KEY not configured');
    return res.status(500).json({ error: 'Email service not configured' });
  }

  // Get and validate email
  const { email } = req.body || {};

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  try {
    // Generate verification token and link
    const token = generateVerificationToken(email);
    const verificationLink = generateVerificationLink(token);

    // Send verification email
    const result = await sendVerificationEmail(email, verificationLink);

    if (result.success) {
      console.log(`Verification email sent to ${email}`);
      return res.status(200).json({
        success: true,
        messageId: result.messageId,
      });
    } else {
      return res.status(500).json({
        success: false,
        error: result.error || 'Failed to send verification email',
      });
    }
  } catch (error) {
    console.error('Verification email handler error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
}
