/**
 * Referral Service
 * ShiftCheck Marketing Website
 *
 * Handles referral code tracking and redemption.
 * - Validates referral codes
 * - Creates redemption records
 * - Queries referral statistics
 */

import { supabase } from '../lib/supabase';
import { isValidReferralCode, generateReferralCode } from '../utils/referral';

// ============================================
// Types
// ============================================

export interface ReferralRedemption {
  id: string;
  referrer_owner_id: string;
  referred_owner_id: string;
  referral_code: string;
  discount_applied: boolean;
  discount_amount_cents: number | null;
  discount_expires_at: string | null;
  created_at: string;
}

export interface ReferralStats {
  totalReferrals: number;
  successfulReferrals: number;
  pendingReferrals: number;
  totalDiscountEarned: number;
  activeDiscounts: number;
}

// ============================================
// Referral Code Validation
// ============================================

/**
 * Validate a referral code and return the referrer's owner ID
 */
export async function validateReferralCode(code: string): Promise<{
  isValid: boolean;
  referrerOwnerId: string | null;
  error: Error | null;
}> {
  // First check format
  if (!isValidReferralCode(code)) {
    return { isValid: false, referrerOwnerId: null, error: null };
  }

  // Check if code exists in database
  const { data, error } = await supabase
    .from('owners')
    .select('id')
    .eq('referral_code', code)
    .single();

  if (error) {
    // Code doesn't exist
    if (error.code === 'PGRST116') {
      return { isValid: false, referrerOwnerId: null, error: null };
    }
    return { isValid: false, referrerOwnerId: null, error: new Error(error.message) };
  }

  return { isValid: true, referrerOwnerId: data.id, error: null };
}

// ============================================
// Referral Redemption
// ============================================

/**
 * Create a referral redemption record
 * Called when a new owner signs up with a valid referral code
 */
export async function createReferralRedemption(params: {
  referralCode: string;
  referrerOwnerId: string;
}): Promise<{
  redemption: ReferralRedemption | null;
  error: Error | null;
}> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { redemption: null, error: new Error('User not authenticated') };
  }

  // Check if this user has already redeemed a referral code
  const { data: existing } = await supabase
    .from('referral_redemptions')
    .select('id')
    .eq('referred_owner_id', user.id)
    .single();

  if (existing) {
    return { redemption: null, error: new Error('Already redeemed a referral code') };
  }

  // Prevent self-referral
  if (params.referrerOwnerId === user.id) {
    return { redemption: null, error: new Error('Cannot use your own referral code') };
  }

  // Calculate discount expiration (12 months from now)
  const discountExpiresAt = new Date();
  discountExpiresAt.setFullYear(discountExpiresAt.getFullYear() + 1);

  const { data, error } = await supabase
    .from('referral_redemptions')
    .insert({
      referrer_owner_id: params.referrerOwnerId,
      referred_owner_id: user.id,
      referral_code: params.referralCode,
      discount_applied: false,
      discount_amount_cents: null, // Set when discount is actually applied
      discount_expires_at: discountExpiresAt.toISOString(),
    })
    .select()
    .single();

  if (error) {
    return { redemption: null, error: new Error(error.message) };
  }

  return { redemption: data as ReferralRedemption, error: null };
}

/**
 * Mark a referral discount as applied
 * Called when the referrer's subscription is billed with discount
 */
export async function markDiscountApplied(
  redemptionId: string,
  discountAmountCents: number
): Promise<{
  success: boolean;
  error: Error | null;
}> {
  const { error } = await supabase
    .from('referral_redemptions')
    .update({
      discount_applied: true,
      discount_amount_cents: discountAmountCents,
    })
    .eq('id', redemptionId);

  if (error) {
    return { success: false, error: new Error(error.message) };
  }

  return { success: true, error: null };
}

// ============================================
// Referral Queries
// ============================================

/**
 * Get all referrals made by the current owner
 */
export async function getMyReferrals(): Promise<{
  referrals: ReferralRedemption[];
  error: Error | null;
}> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { referrals: [], error: new Error('User not authenticated') };
  }

  const { data, error } = await supabase
    .from('referral_redemptions')
    .select('*')
    .eq('referrer_owner_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    return { referrals: [], error: new Error(error.message) };
  }

  return { referrals: data as ReferralRedemption[], error: null };
}

/**
 * Get referral statistics for current owner
 */
export async function getReferralStats(): Promise<{
  stats: ReferralStats | null;
  error: Error | null;
}> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { stats: null, error: new Error('User not authenticated') };
  }

  const { data, error } = await supabase
    .from('referral_redemptions')
    .select('*')
    .eq('referrer_owner_id', user.id);

  if (error) {
    return { stats: null, error: new Error(error.message) };
  }

  const referrals = data as ReferralRedemption[];
  const now = new Date();

  const stats: ReferralStats = {
    totalReferrals: referrals.length,
    successfulReferrals: referrals.filter(r => r.discount_applied).length,
    pendingReferrals: referrals.filter(r => !r.discount_applied).length,
    totalDiscountEarned: referrals.reduce(
      (sum, r) => sum + (r.discount_amount_cents || 0),
      0
    ),
    activeDiscounts: referrals.filter(
      r =>
        !r.discount_applied &&
        r.discount_expires_at &&
        new Date(r.discount_expires_at) > now
    ).length,
  };

  return { stats, error: null };
}

/**
 * Get current owner's referral code
 * Creates one if it doesn't exist
 */
export async function getOrCreateReferralCode(): Promise<{
  referralCode: string | null;
  error: Error | null;
}> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { referralCode: null, error: new Error('User not authenticated') };
  }

  // Get owner's referral code
  const { data: owner, error: fetchError } = await supabase
    .from('owners')
    .select('referral_code')
    .eq('id', user.id)
    .single();

  if (fetchError) {
    return { referralCode: null, error: new Error(fetchError.message) };
  }

  // Return existing code
  if (owner.referral_code) {
    return { referralCode: owner.referral_code, error: null };
  }

  // Generate new code if none exists
  const newCode = generateReferralCode();

  const { error: updateError } = await supabase
    .from('owners')
    .update({ referral_code: newCode })
    .eq('id', user.id);

  if (updateError) {
    return { referralCode: null, error: new Error(updateError.message) };
  }

  return { referralCode: newCode, error: null };
}

/**
 * Check if current owner was referred by someone
 */
export async function getMyReferrer(): Promise<{
  referredBy: string | null; // referral code used
  error: Error | null;
}> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { referredBy: null, error: new Error('User not authenticated') };
  }

  const { data: owner, error } = await supabase
    .from('owners')
    .select('referred_by_code')
    .eq('id', user.id)
    .single();

  if (error) {
    return { referredBy: null, error: new Error(error.message) };
  }

  return { referredBy: owner.referred_by_code, error: null };
}
