/**
 * Authentication Service
 * ShiftCheck Marketing Website
 *
 * Handles:
 * - Email verification via Brevo
 * - Supabase Auth sign up/sign in
 * - Session management
 */

import { supabase } from '../lib/supabase';
import type { User, Session, AuthError } from '../lib/supabase';
import { normalizePhone } from '../utils/phone';
import { generateReferralCode } from '../utils/referral';
import { fetchWithRetry } from '../utils/retry';

// ============================================
// Types
// ============================================

export interface SignUpCredentials {
  email: string;
  password: string;
}

export interface SignInCredentials {
  email: string;
  password: string;
}

export interface AuthResult {
  user: User | null;
  session: Session | null;
  error: AuthError | null;
}

export interface Owner {
  id: string;              // Auto-generated profile ID
  owner_id: string;        // References auth.users(id) - this is the primary identifier
  first_name: string;
  last_name: string;
  full_name: string;       // Auto-computed from first_name + last_name
  email: string;
  phone: string;
  billing_street: string | null;
  billing_city: string | null;
  billing_state: string | null;
  billing_zip: string | null;
  billing_country: string;
  referral_code: string;
  referred_by_code: string | null;
  email_verified: boolean;
  email_verified_at: string | null;
  sign_up_completed_at: string | null;
  // App-specific fields
  receive_sms: boolean;
  receive_email_reports: boolean;
  timezone: string;
  preferred_report_time: string;
  created_at: string;
  updated_at: string;
}

export interface CreateOwnerInput {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  referred_by_code?: string | null;
}

// ============================================
// Sign Up / Sign In
// ============================================

/**
 * Sign up a new user with email and password
 * Creates auth.users record in Supabase Auth.
 *
 * NOTE: Email confirmation is handled via Brevo (not Supabase's built-in emails).
 * Ensure "Confirm email" is DISABLED in Supabase Dashboard > Authentication > Providers > Email
 * to prevent double emails being sent.
 */
export async function signUp(credentials: SignUpCredentials): Promise<AuthResult> {
  const { data, error } = await supabase.auth.signUp({
    email: credentials.email,
    password: credentials.password,
    // No emailRedirectTo needed - we use Brevo for verification emails
  });

  return {
    user: data.user,
    session: data.session,
    error,
  };
}

/**
 * Sign in an existing user with email and password
 */
export async function signIn(credentials: SignInCredentials): Promise<AuthResult> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: credentials.email,
    password: credentials.password,
  });

  return {
    user: data.user,
    session: data.session,
    error,
  };
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<{ error: AuthError | null }> {
  const { error } = await supabase.auth.signOut();
  return { error };
}

// ============================================
// Session Management
// ============================================

/**
 * Get current session
 */
export async function getSession(): Promise<Session | null> {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

/**
 * Get current user
 */
export async function getCurrentUser(): Promise<User | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

/**
 * Subscribe to auth state changes
 */
export function onAuthStateChange(
  callback: (event: string, session: Session | null) => void
) {
  return supabase.auth.onAuthStateChange(callback);
}

// ============================================
// Password Management
// ============================================

/**
 * Send password reset email
 */
export async function resetPassword(email: string): Promise<{ error: AuthError | null }> {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  });
  return { error };
}

/**
 * Update password (for authenticated users)
 */
export async function updatePassword(newPassword: string): Promise<{ error: AuthError | null }> {
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });
  return { error };
}

// ============================================
// Email Verification
// ============================================

/**
 * Send verification email via Brevo API
 * This is for the initial email verification step (Step 1)
 * Includes automatic retry for transient failures
 */
export async function sendVerificationEmail(email: string): Promise<{
  success: boolean;
  error: string | null;
  errorCode?: string;
  statusCode?: number;
  retryable?: boolean;
}> {
  try {
    const response = await fetchWithRetry(
      '/api/auth/send-verification',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      },
      {
        maxRetries: 2,
        onRetry: (_err, attempt) => {
          console.log(`Retrying email send (attempt ${attempt})...`);
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Failed to send verification email',
        errorCode: data.code,
        statusCode: response.status,
        retryable: response.status >= 500 || response.status === 429,
      };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Error sending verification email:', error);
    return {
      success: false,
      error: 'Network error - please check your connection and try again',
      retryable: true,
    };
  }
}

/**
 * Resend verification email (legacy - uses Supabase built-in)
 */
export async function resendVerificationEmail(email: string): Promise<{ error: AuthError | null }> {
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
  });
  return { error };
}

/**
 * Check if current user's email is verified
 */
export async function isEmailVerified(): Promise<boolean> {
  const user = await getCurrentUser();
  return user?.email_confirmed_at !== null;
}

// ============================================
// Owner Profile Creation
// ============================================

/**
 * Create owner profile for authenticated user
 * Called after sign up during profile step (Step 3)
 *
 * Uses `owner_profiles` as the single source of truth for owner data.
 * This table is shared between the marketing website (shiftcheck.app)
 * and the main app (app.shiftcheck.app).
 */
export async function createOwnerProfile(input: CreateOwnerInput): Promise<{
  owner: Owner | null;
  error: Error | null;
}> {
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { owner: null, error: new Error('User not authenticated') };
  }

  // Generate unique referral code
  const referralCode = generateReferralCode();
  const normalizedPhone = normalizePhone(input.phone);

  // Create owner record in owner_profiles (single source of truth)
  // Note: full_name is auto-computed by database trigger from first_name + last_name
  const { data, error } = await supabase
    .from('owner_profiles')
    .insert({
      owner_id: user.id,
      first_name: input.first_name,
      last_name: input.last_name,
      email: input.email,
      phone: normalizedPhone,
      referral_code: referralCode,
      referred_by_code: input.referred_by_code || null,
      email_verified: !!user.email_confirmed_at,
      email_verified_at: user.email_confirmed_at || null,
      // App-specific defaults
      receive_sms: true,
      receive_email_reports: true,
      timezone: 'America/New_York',
      preferred_report_time: '8:00 AM',
    })
    .select()
    .single();

  if (error) {
    return { owner: null, error: new Error(error.message) };
  }

  return { owner: data as Owner, error: null };
}
