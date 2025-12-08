/**
 * Phone Normalization Utility
 * ShiftCheck Marketing Website
 *
 * Normalizes phone numbers to E.164 format (+1XXXXXXXXXX)
 * Critical for Phone-as-Key architecture consistency.
 *
 * Based on shiftcheck-mcp skill patterns.
 */

/**
 * Normalize a phone number to E.164 format
 * Handles various input formats:
 * - (801) 458-1589 -> +18014581589
 * - 801-458-1589   -> +18014581589
 * - 8014581589     -> +18014581589
 * - 18014581589    -> +18014581589
 * - +18014581589   -> +18014581589 (unchanged)
 *
 * @param phone - Raw phone number in any format
 * @returns E.164 formatted phone number (+1XXXXXXXXXX)
 */
export function normalizePhone(phone: string): string {
  if (!phone) return '';

  // Remove all non-digit characters
  const cleaned = phone.replace(/[^0-9]/g, '');

  // Handle different lengths
  if (cleaned.length === 10) {
    // 10 digits: assume US, add +1
    return '+1' + cleaned;
  }

  if (cleaned.length === 11 && cleaned[0] === '1') {
    // 11 digits starting with 1: add +
    return '+' + cleaned;
  }

  // For other cases, just add + prefix
  return '+' + cleaned;
}

/**
 * Format a phone number for display
 * Converts E.164 to readable format
 *
 * @param phone - E.164 phone number (+1XXXXXXXXXX)
 * @returns Formatted phone number: (XXX) XXX-XXXX
 */
export function formatPhoneForDisplay(phone: string): string {
  if (!phone) return '';

  // Extract digits
  const cleaned = phone.replace(/[^0-9]/g, '');

  // Handle 10-digit format
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }

  // Handle 11-digit format (with country code)
  if (cleaned.length === 11 && cleaned[0] === '1') {
    return `(${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }

  // Return as-is if unusual format
  return phone;
}

/**
 * Validate phone number format
 *
 * @param phone - Phone number to validate
 * @returns true if valid US phone number format
 */
export function isValidUSPhone(phone: string): boolean {
  if (!phone) return false;

  const cleaned = phone.replace(/[^0-9]/g, '');

  // Must be 10 or 11 digits (with country code)
  if (cleaned.length === 10) return true;
  if (cleaned.length === 11 && cleaned[0] === '1') return true;

  return false;
}
