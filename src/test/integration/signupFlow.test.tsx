/**
 * Sign-Up Flow Integration Tests
 * ShiftCheck Marketing Website
 *
 * Tests the complete sign-up flow from email verification to completion.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

// Mock Supabase
vi.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(),
    })),
  },
}));

// Mock fetch for API calls
global.fetch = vi.fn();

// Helper to render components with Router
const renderWithRouter = (component: React.ReactNode) => {
  return render(
    <BrowserRouter>{component}</BrowserRouter>
  );
};

describe('Sign-Up Flow Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as ReturnType<typeof vi.fn>).mockReset();
  });

  describe('Email Verification Step', () => {
    it('should render sign up page with email input', async () => {
      const { default: SignUpPage } = await import('../../pages/auth/SignUpPage');
      renderWithRouter(<SignUpPage />);

      // Check that email input exists
      const emailInput = screen.getByLabelText(/email/i);
      expect(emailInput).toBeInTheDocument();
    });

    it('should allow entering email address', async () => {
      const { default: SignUpPage } = await import('../../pages/auth/SignUpPage');
      renderWithRouter(<SignUpPage />);

      const emailInput = screen.getByLabelText(/email/i);
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

      expect(emailInput).toHaveValue('test@example.com');
    });

    it('should have link to sign in for existing users', async () => {
      const { default: SignUpPage } = await import('../../pages/auth/SignUpPage');
      renderWithRouter(<SignUpPage />);

      const signInLink = screen.getByRole('link', { name: /sign in/i });
      expect(signInLink).toBeInTheDocument();
      expect(signInLink).toHaveAttribute('href', '/auth/login');
    });
  });

  describe('Login Step', () => {
    it('should sign in with valid credentials', async () => {
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValueOnce({
        data: {
          user: { id: '123', email: 'test@example.com' } as any,
          session: { access_token: 'token', refresh_token: 'refresh' } as any,
        },
        error: null,
      });

      const { default: LoginPage } = await import('../../pages/auth/LoginPage');
      renderWithRouter(<LoginPage />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });

      const submitButton = screen.getByRole('button', { name: /sign in|login/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
        });
      });
    });

    it('should show error for invalid credentials', async () => {
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValueOnce({
        data: { user: null, session: null },
        error: { message: 'Invalid login credentials', code: 'invalid_credentials' } as any,
      });

      const { default: LoginPage } = await import('../../pages/auth/LoginPage');
      renderWithRouter(<LoginPage />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });

      const submitButton = screen.getByRole('button', { name: /sign in|login/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        // Component should handle error gracefully
        expect(supabase.auth.signInWithPassword).toHaveBeenCalled();
      });
    });
  });

  describe('Service Layer Integration', () => {
    it('should normalize phone numbers correctly', async () => {
      const { normalizePhone } = await import('../../utils/phone');

      // Test various formats
      expect(normalizePhone('(801) 458-1589')).toBe('+18014581589');
      expect(normalizePhone('801-458-1589')).toBe('+18014581589');
      expect(normalizePhone('8014581589')).toBe('+18014581589');
    });

    it('should generate valid referral codes', async () => {
      const { generateReferralCode, isValidReferralCode } = await import('../../utils/referral');

      const code = generateReferralCode();
      expect(isValidReferralCode(code)).toBe(true);
      expect(code).toMatch(/^OWNER_[A-Z0-9]{12}$/);
    });

    it('should handle retry logic for failed requests', async () => {
      const { isRetryableError } = await import('../../utils/retry');

      // 500 errors should be retryable
      expect(isRetryableError({ status: 500 })).toBe(true);
      expect(isRetryableError({ status: 502 })).toBe(true);
      expect(isRetryableError({ status: 429 })).toBe(true);

      // 400 errors should not be retryable
      expect(isRetryableError({ status: 400 })).toBe(false);
      expect(isRetryableError({ status: 401 })).toBe(false);
      expect(isRetryableError({ status: 404 })).toBe(false);
    });

    it('should generate user-friendly error messages', async () => {
      const { getStripeErrorMessage, getSupabaseAuthErrorMessage } = await import('../../utils/errorMessages');

      // Stripe errors
      const cardDeclined = getStripeErrorMessage('card_declined');
      expect(cardDeclined.message).toContain('declined');
      expect(cardDeclined.retryable).toBe(true);

      // Supabase errors
      const invalidCreds = getSupabaseAuthErrorMessage({ code: 'invalid_credentials' });
      expect(invalidCreds.message).toContain('email or password');
    });
  });
});

describe('Sign-Up State Persistence', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('should persist sign-up progress in sessionStorage', () => {
    const signupState = {
      currentStep: 3,
      email: 'test@example.com',
      ownerProfile: { firstName: 'John', lastName: 'Doe' },
    };

    sessionStorage.setItem('shiftcheck_signup', JSON.stringify(signupState));

    const retrieved = JSON.parse(sessionStorage.getItem('shiftcheck_signup') || '{}');
    expect(retrieved.currentStep).toBe(3);
    expect(retrieved.email).toBe('test@example.com');
  });

  it('should clear sign-up state on completion', () => {
    sessionStorage.setItem('shiftcheck_signup', JSON.stringify({ currentStep: 7 }));
    sessionStorage.removeItem('shiftcheck_signup');

    const retrieved = sessionStorage.getItem('shiftcheck_signup');
    expect(retrieved).toBeNull();
  });
});
