/**
 * Referral Code Generation Utility
 * ShiftCheck Marketing Website
 *
 * Generates unique referral codes for owners.
 * Format: OWNER_ABC123XYZ (12 chars after prefix)
 */

/**
 * Generate a unique referral code
 * Format: OWNER_XXXXXXXXXXXX (12 random alphanumeric characters)
 *
 * @returns Unique referral code
 */
export function generateReferralCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'OWNER_';

  for (let i = 0; i < 12; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return code;
}

/**
 * Validate referral code format
 *
 * @param code - Referral code to validate
 * @returns true if valid format
 */
export function isValidReferralCode(code: string): boolean {
  if (!code) return false;

  // Must start with OWNER_ and have 12 alphanumeric chars after
  const pattern = /^OWNER_[A-Z0-9]{12}$/;
  return pattern.test(code);
}

/**
 * Extract referral code from URL
 * Handles both ?ref=CODE and ?referral=CODE query params
 *
 * @param url - Full URL or query string
 * @returns Referral code if found, null otherwise
 */
export function extractReferralCodeFromURL(url: string): string | null {
  try {
    const urlObj = new URL(url, window.location.origin);
    const ref = urlObj.searchParams.get('ref') || urlObj.searchParams.get('referral');

    if (ref && isValidReferralCode(ref)) {
      return ref;
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Generate shareable referral link
 *
 * @param referralCode - Owner's referral code
 * @param baseUrl - Base URL (defaults to current origin)
 * @returns Full shareable URL with referral code
 */
export function generateReferralLink(
  referralCode: string,
  baseUrl: string = window.location.origin
): string {
  return `${baseUrl}/signup?ref=${referralCode}`;
}
