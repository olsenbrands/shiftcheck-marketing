/**
 * Error Messages Tests
 * ShiftCheck Marketing Website
 */

import { describe, it, expect } from 'vitest';
import {
  getStripeErrorMessage,
  getSupabaseAuthErrorMessage,
  getBrevoErrorMessage,
  getVerificationErrorMessage,
  getDuplicateEmailMessage,
  getNetworkErrorMessage,
} from './errorMessages';

describe('getStripeErrorMessage', () => {
  it('should return correct message for card_declined', () => {
    const result = getStripeErrorMessage('card_declined');
    expect(result.message).toContain('declined');
    expect(result.retryable).toBe(true);
  });

  it('should return correct message for insufficient_funds', () => {
    const result = getStripeErrorMessage('insufficient_funds');
    expect(result.message).toContain('insufficient funds');
    expect(result.retryable).toBe(true);
  });

  it('should return correct message for expired_card', () => {
    const result = getStripeErrorMessage('expired_card');
    expect(result.message).toContain('expired');
    expect(result.retryable).toBe(true);
  });

  it('should return correct message for incorrect_cvc', () => {
    const result = getStripeErrorMessage('incorrect_cvc');
    expect(result.message).toContain('CVC');
    expect(result.retryable).toBe(true);
  });

  it('should return correct message for invalid_number', () => {
    const result = getStripeErrorMessage('invalid_number');
    expect(result.message).toContain('card number');
    expect(result.retryable).toBe(true);
  });

  it('should return correct message for rate_limit', () => {
    const result = getStripeErrorMessage('rate_limit');
    expect(result.message).toContain('many requests');
    expect(result.retryable).toBe(true);
  });

  it('should return default message for unknown error', () => {
    const result = getStripeErrorMessage('unknown_error_code_xyz');
    expect(result.message).toBeDefined();
    expect(result.retryable).toBe(true);
  });

  it('should return default message for null/undefined', () => {
    const result = getStripeErrorMessage(undefined);
    expect(result.message).toBeDefined();
  });

  it('should handle authentication_required', () => {
    const result = getStripeErrorMessage('authentication_required');
    expect(result.message).toContain('authentication');
  });
});

describe('getSupabaseAuthErrorMessage', () => {
  it('should return correct message for null error', () => {
    const result = getSupabaseAuthErrorMessage(null);
    expect(result.message).toBeDefined();
    expect(result.retryable).toBe(true);
  });

  it('should handle invalid_credentials', () => {
    const result = getSupabaseAuthErrorMessage({ code: 'invalid_credentials' });
    expect(result.message).toContain('email or password');
    expect(result.retryable).toBe(true);
  });

  it('should handle user_already_exists by code', () => {
    const result = getSupabaseAuthErrorMessage({ code: 'user_already_exists' });
    expect(result.message).toContain('already exists');
    expect(result.retryable).toBe(false);
  });

  it('should handle weak_password', () => {
    const result = getSupabaseAuthErrorMessage({ code: 'weak_password' });
    expect(result.message).toContain('Password');
    expect(result.retryable).toBe(true);
  });

  it('should detect invalid credentials from message', () => {
    const result = getSupabaseAuthErrorMessage({ message: 'Invalid login credentials' });
    expect(result.message).toContain('email or password');
  });

  it('should detect user already exists from message', () => {
    const result = getSupabaseAuthErrorMessage({ message: 'User already registered' });
    expect(result.message).toContain('already exists');
  });

  it('should detect rate limit from message', () => {
    const result = getSupabaseAuthErrorMessage({ message: 'Too many requests' });
    expect(result.message).toContain('many attempts');
    expect(result.retryable).toBe(true);
  });

  it('should detect session errors from message', () => {
    const result = getSupabaseAuthErrorMessage({ message: 'Session expired' });
    expect(result.message).toContain('session');
  });

  it('should use original message for unknown errors', () => {
    const result = getSupabaseAuthErrorMessage({ message: 'Custom error message' });
    expect(result.message).toBe('Custom error message');
  });
});

describe('getBrevoErrorMessage', () => {
  it('should handle invalid_parameter error code', () => {
    const result = getBrevoErrorMessage(undefined, 'invalid_parameter');
    expect(result.message).toContain('email');
    expect(result.retryable).toBe(true);
  });

  it('should handle unauthorized error code', () => {
    const result = getBrevoErrorMessage(undefined, 'unauthorized');
    expect(result.message).toContain('configuration');
    expect(result.retryable).toBe(false);
  });

  it('should handle rate_limit_exceeded error code', () => {
    const result = getBrevoErrorMessage(undefined, 'rate_limit_exceeded');
    expect(result.message).toContain('many email requests');
    expect(result.retryable).toBe(true);
  });

  it('should handle 400 status code', () => {
    const result = getBrevoErrorMessage(400);
    expect(result.retryable).toBe(true);
  });

  it('should handle 401 status code', () => {
    const result = getBrevoErrorMessage(401);
    expect(result.retryable).toBe(false);
  });

  it('should handle 429 status code', () => {
    const result = getBrevoErrorMessage(429);
    expect(result.message).toContain('many');
    expect(result.retryable).toBe(true);
  });

  it('should handle 500 status code', () => {
    const result = getBrevoErrorMessage(500);
    expect(result.retryable).toBe(true);
  });

  it('should return default for unknown errors', () => {
    const result = getBrevoErrorMessage(undefined, undefined, 'unknown');
    expect(result.message).toBeDefined();
    expect(result.retryable).toBe(true);
  });
});

describe('getVerificationErrorMessage', () => {
  it('should handle expired token', () => {
    const result = getVerificationErrorMessage('expired');
    expect(result.message).toContain('expired');
    expect(result.action).toBeDefined();
  });

  it('should handle invalid token', () => {
    const result = getVerificationErrorMessage('invalid');
    expect(result.message).toContain('invalid');
  });

  it('should handle used token', () => {
    const result = getVerificationErrorMessage('used');
    expect(result.message).toContain('already');
  });

  it('should handle unknown error type', () => {
    const result = getVerificationErrorMessage('unknown');
    expect(result.message).toBeDefined();
  });
});

describe('getDuplicateEmailMessage', () => {
  it('should return duplicate email message', () => {
    const result = getDuplicateEmailMessage();
    expect(result.message).toContain('already');
    expect(result.retryable).toBe(false);
  });

  it('should suggest signing in', () => {
    const result = getDuplicateEmailMessage();
    expect(result.action).toContain('sign in');
  });
});

describe('getNetworkErrorMessage', () => {
  it('should handle offline errors', () => {
    const result = getNetworkErrorMessage(new TypeError('Failed to fetch'));
    expect(result.message).toContain('connection');
    expect(result.retryable).toBe(true);
  });

  it('should handle timeout errors', () => {
    const result = getNetworkErrorMessage(new Error('Request timeout'));
    expect(result.message).toContain('time');
    expect(result.retryable).toBe(true);
  });

  it('should handle generic network errors', () => {
    const result = getNetworkErrorMessage(new Error('Network error'));
    expect(result.retryable).toBe(true);
  });
});
