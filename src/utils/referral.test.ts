/**
 * Referral Utility Tests
 * ShiftCheck Marketing Website
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  generateReferralCode,
  isValidReferralCode,
  extractReferralCodeFromURL,
  generateReferralLink,
} from './referral';

describe('generateReferralCode', () => {
  it('should generate a code starting with OWNER_', () => {
    const code = generateReferralCode();
    expect(code).toMatch(/^OWNER_/);
  });

  it('should generate a code with exactly 18 characters (OWNER_ + 12)', () => {
    const code = generateReferralCode();
    expect(code).toHaveLength(18);
  });

  it('should only contain uppercase letters and numbers after prefix', () => {
    const code = generateReferralCode();
    const suffix = code.replace('OWNER_', '');
    expect(suffix).toMatch(/^[A-Z0-9]{12}$/);
  });

  it('should generate unique codes', () => {
    const codes = new Set();
    for (let i = 0; i < 100; i++) {
      codes.add(generateReferralCode());
    }
    // With 36^12 possibilities, 100 codes should be unique
    expect(codes.size).toBe(100);
  });
});

describe('isValidReferralCode', () => {
  it('should return false for empty input', () => {
    expect(isValidReferralCode('')).toBe(false);
  });

  it('should return false for null/undefined', () => {
    expect(isValidReferralCode(null as unknown as string)).toBe(false);
    expect(isValidReferralCode(undefined as unknown as string)).toBe(false);
  });

  it('should validate correct referral code format', () => {
    expect(isValidReferralCode('OWNER_ABC123XYZ456')).toBe(true);
  });

  it('should validate generated referral codes', () => {
    const code = generateReferralCode();
    expect(isValidReferralCode(code)).toBe(true);
  });

  it('should reject code without OWNER_ prefix', () => {
    expect(isValidReferralCode('ABC123XYZ456')).toBe(false);
  });

  it('should reject code with wrong prefix', () => {
    expect(isValidReferralCode('USER_ABC123XYZ456')).toBe(false);
  });

  it('should reject code with lowercase letters', () => {
    expect(isValidReferralCode('OWNER_abc123xyz456')).toBe(false);
  });

  it('should reject code with wrong length suffix', () => {
    expect(isValidReferralCode('OWNER_ABC123')).toBe(false);
    expect(isValidReferralCode('OWNER_ABC123XYZ456789')).toBe(false);
  });

  it('should reject code with special characters', () => {
    expect(isValidReferralCode('OWNER_ABC123!YZ456')).toBe(false);
  });
});

describe('extractReferralCodeFromURL', () => {
  beforeEach(() => {
    // Mock window.location.origin
    vi.stubGlobal('window', {
      location: { origin: 'https://shiftcheck.app' },
    });
  });

  it('should extract referral code from ?ref= parameter', () => {
    const code = extractReferralCodeFromURL('https://shiftcheck.app/signup?ref=OWNER_ABC123XYZ456');
    expect(code).toBe('OWNER_ABC123XYZ456');
  });

  it('should extract referral code from ?referral= parameter', () => {
    const code = extractReferralCodeFromURL('https://shiftcheck.app/signup?referral=OWNER_ABC123XYZ456');
    expect(code).toBe('OWNER_ABC123XYZ456');
  });

  it('should return null for missing referral code', () => {
    const code = extractReferralCodeFromURL('https://shiftcheck.app/signup');
    expect(code).toBeNull();
  });

  it('should return null for invalid referral code format', () => {
    const code = extractReferralCodeFromURL('https://shiftcheck.app/signup?ref=INVALID');
    expect(code).toBeNull();
  });

  it('should handle relative URLs', () => {
    const code = extractReferralCodeFromURL('/signup?ref=OWNER_ABC123XYZ456');
    expect(code).toBe('OWNER_ABC123XYZ456');
  });

  it('should prefer ref over referral if both present', () => {
    const code = extractReferralCodeFromURL(
      'https://shiftcheck.app/signup?ref=OWNER_ABC123XYZ456&referral=OWNER_DIFFERENT12'
    );
    expect(code).toBe('OWNER_ABC123XYZ456');
  });

  it('should return null for malformed URLs', () => {
    const code = extractReferralCodeFromURL('not-a-valid-url-:::');
    // Should handle gracefully without throwing
    expect(code).toBeNull();
  });
});

describe('generateReferralLink', () => {
  beforeEach(() => {
    vi.stubGlobal('window', {
      location: { origin: 'https://shiftcheck.app' },
    });
  });

  it('should generate link with referral code', () => {
    const link = generateReferralLink('OWNER_ABC123XYZ456');
    expect(link).toBe('https://shiftcheck.app/signup?ref=OWNER_ABC123XYZ456');
  });

  it('should use custom base URL', () => {
    const link = generateReferralLink('OWNER_ABC123XYZ456', 'https://custom.app');
    expect(link).toBe('https://custom.app/signup?ref=OWNER_ABC123XYZ456');
  });

  it('should use default window.location.origin', () => {
    const link = generateReferralLink('OWNER_ABC123XYZ456');
    expect(link).toContain('https://shiftcheck.app');
  });
});
