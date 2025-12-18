/**
 * Owner Service
 * ShiftCheck Marketing Website
 *
 * Handles owner profile CRUD operations (except createOwnerProfile which is in authService).
 * All operations use `owner_profiles` as the single source of truth.
 * All operations require authenticated user (owner).
 */

import { supabase } from '../lib/supabase';
import { normalizePhone } from '../utils/phone';
import type { Owner } from './authService';

// Re-export Owner type for backward compatibility
export type { Owner } from './authService';

// ============================================
// Types
// ============================================

export interface UpdateOwnerProfileInput {
  first_name?: string;
  last_name?: string;
  phone?: string;
}

export interface UpdateBillingAddressInput {
  billing_street: string;
  billing_city: string;
  billing_state: string;
  billing_zip: string;
  billing_country?: string;
}

// ============================================
// Get Owner Profile
// ============================================

/**
 * Get current owner's profile
 */
export async function getOwnerProfile(): Promise<{
  owner: Owner | null;
  error: Error | null;
}> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { owner: null, error: new Error('User not authenticated') };
  }

  const { data, error } = await supabase
    .from('owner_profiles')
    .select('*')
    .eq('owner_id', user.id)
    .single();

  if (error) {
    // No owner record yet is not an error during sign-up
    if (error.code === 'PGRST116') {
      return { owner: null, error: null };
    }
    return { owner: null, error: new Error(error.message) };
  }

  return { owner: data as Owner, error: null };
}

/**
 * Check if owner profile exists for current user
 */
export async function ownerProfileExists(): Promise<boolean> {
  const { owner } = await getOwnerProfile();
  return owner !== null;
}

// ============================================
// Update Owner Profile
// ============================================

/**
 * Update owner personal info (Step 3A fields)
 * Note: full_name is auto-computed by database trigger when first_name or last_name changes
 */
export async function updateOwnerProfile(input: UpdateOwnerProfileInput): Promise<{
  owner: Owner | null;
  error: Error | null;
}> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { owner: null, error: new Error('User not authenticated') };
  }

  const updates: Partial<Owner> = {};

  if (input.first_name) updates.first_name = input.first_name;
  if (input.last_name) updates.last_name = input.last_name;
  if (input.phone) updates.phone = normalizePhone(input.phone);

  const { data, error } = await supabase
    .from('owner_profiles')
    .update(updates)
    .eq('owner_id', user.id)
    .select()
    .single();

  if (error) {
    return { owner: null, error: new Error(error.message) };
  }

  return { owner: data as Owner, error: null };
}

/**
 * Update owner billing address (Step 3B fields)
 */
export async function updateBillingAddress(input: UpdateBillingAddressInput): Promise<{
  owner: Owner | null;
  error: Error | null;
}> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { owner: null, error: new Error('User not authenticated') };
  }

  const { data, error } = await supabase
    .from('owner_profiles')
    .update({
      billing_street: input.billing_street,
      billing_city: input.billing_city,
      billing_state: input.billing_state,
      billing_zip: input.billing_zip,
      billing_country: input.billing_country || 'US',
    })
    .eq('owner_id', user.id)
    .select()
    .single();

  if (error) {
    return { owner: null, error: new Error(error.message) };
  }

  return { owner: data as Owner, error: null };
}

/**
 * Mark sign-up as completed (called at Step 7)
 */
export async function markSignUpCompleted(): Promise<{
  owner: Owner | null;
  error: Error | null;
}> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { owner: null, error: new Error('User not authenticated') };
  }

  const { data, error } = await supabase
    .from('owner_profiles')
    .update({
      sign_up_completed_at: new Date().toISOString(),
    })
    .eq('owner_id', user.id)
    .select()
    .single();

  if (error) {
    return { owner: null, error: new Error(error.message) };
  }

  return { owner: data as Owner, error: null };
}

// ============================================
// Referral Lookup
// ============================================

/**
 * Validate and lookup referral code
 * Returns referrer's owner ID if valid
 */
export async function lookupReferralCode(code: string): Promise<{
  referrerId: string | null;
  error: Error | null;
}> {
  const { data, error } = await supabase
    .from('owner_profiles')
    .select('owner_id')
    .eq('referral_code', code)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return { referrerId: null, error: new Error('Invalid referral code') };
    }
    return { referrerId: null, error: new Error(error.message) };
  }

  return { referrerId: data.owner_id, error: null };
}
