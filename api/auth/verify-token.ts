/**
 * Verify Email Token API
 * ShiftCheck Marketing Website
 *
 * Verifies a signed email verification token and returns the email if valid.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createHmac } from 'crypto';

// Configuration
const VERIFICATION_SECRET = process.env.VERIFICATION_SECRET || process.env.STRIPE_WEBHOOK_SECRET!;

/**
 * Verify a signed token
 * Token format: base64url(email:expiry:signature)
 */
function verifyToken(token: string): { valid: boolean; email?: string; error?: string } {
  try {
    // Decode token
    const decoded = Buffer.from(token, 'base64url').toString();
    const parts = decoded.split(':');

    if (parts.length !== 3) {
      return { valid: false, error: 'Invalid token format' };
    }

    const [email, expiryStr, signature] = parts;
    const expiry = parseInt(expiryStr, 10);

    // Check expiration
    if (Date.now() > expiry) {
      return { valid: false, error: 'Token has expired' };
    }

    // Verify signature
    const data = `${email}:${expiryStr}`;
    const expectedSignature = createHmac('sha256', VERIFICATION_SECRET)
      .update(data)
      .digest('hex');

    if (signature !== expectedSignature) {
      return { valid: false, error: 'Invalid token signature' };
    }

    return { valid: true, email };
  } catch (error) {
    console.error('Token verification error:', error);
    return { valid: false, error: 'Token verification failed' };
  }
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

  const { token } = req.body || {};

  if (!token) {
    return res.status(400).json({ error: 'Token is required' });
  }

  const result = verifyToken(token);

  if (result.valid) {
    return res.status(200).json({
      valid: true,
      email: result.email,
    });
  } else {
    return res.status(400).json({
      valid: false,
      error: result.error,
    });
  }
}
