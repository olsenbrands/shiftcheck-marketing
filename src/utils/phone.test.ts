/**
 * Phone Utility Tests
 * ShiftCheck Marketing Website
 */

import { describe, it, expect } from 'vitest';
import { normalizePhone, formatPhoneForDisplay, isValidUSPhone } from './phone';

describe('normalizePhone', () => {
  it('should return empty string for empty input', () => {
    expect(normalizePhone('')).toBe('');
  });

  it('should normalize 10-digit phone number', () => {
    expect(normalizePhone('8014581589')).toBe('+18014581589');
  });

  it('should normalize formatted phone with parentheses', () => {
    expect(normalizePhone('(801) 458-1589')).toBe('+18014581589');
  });

  it('should normalize phone with dashes', () => {
    expect(normalizePhone('801-458-1589')).toBe('+18014581589');
  });

  it('should normalize phone with dots', () => {
    expect(normalizePhone('801.458.1589')).toBe('+18014581589');
  });

  it('should normalize 11-digit phone starting with 1', () => {
    expect(normalizePhone('18014581589')).toBe('+18014581589');
  });

  it('should not modify already normalized E.164 phone', () => {
    expect(normalizePhone('+18014581589')).toBe('+18014581589');
  });

  it('should handle mixed formatting', () => {
    expect(normalizePhone('1 (801) 458-1589')).toBe('+18014581589');
  });

  it('should handle spaces only', () => {
    expect(normalizePhone('801 458 1589')).toBe('+18014581589');
  });
});

describe('formatPhoneForDisplay', () => {
  it('should return empty string for empty input', () => {
    expect(formatPhoneForDisplay('')).toBe('');
  });

  it('should format 10-digit phone', () => {
    expect(formatPhoneForDisplay('8014581589')).toBe('(801) 458-1589');
  });

  it('should format E.164 phone with country code', () => {
    expect(formatPhoneForDisplay('+18014581589')).toBe('(801) 458-1589');
  });

  it('should format 11-digit phone starting with 1', () => {
    expect(formatPhoneForDisplay('18014581589')).toBe('(801) 458-1589');
  });

  it('should return unusual formats as-is', () => {
    expect(formatPhoneForDisplay('12345')).toBe('12345');
  });

  it('should handle already formatted input', () => {
    expect(formatPhoneForDisplay('(801) 458-1589')).toBe('(801) 458-1589');
  });
});

describe('isValidUSPhone', () => {
  it('should return false for empty input', () => {
    expect(isValidUSPhone('')).toBe(false);
  });

  it('should validate 10-digit phone', () => {
    expect(isValidUSPhone('8014581589')).toBe(true);
  });

  it('should validate formatted 10-digit phone', () => {
    expect(isValidUSPhone('(801) 458-1589')).toBe(true);
  });

  it('should validate 11-digit phone starting with 1', () => {
    expect(isValidUSPhone('18014581589')).toBe(true);
  });

  it('should validate E.164 format', () => {
    expect(isValidUSPhone('+18014581589')).toBe(true);
  });

  it('should reject 9-digit phone', () => {
    expect(isValidUSPhone('801458158')).toBe(false);
  });

  it('should reject 12-digit phone', () => {
    expect(isValidUSPhone('118014581589')).toBe(false);
  });

  it('should reject 11-digit phone not starting with 1', () => {
    expect(isValidUSPhone('28014581589')).toBe(false);
  });
});
