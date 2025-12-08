/**
 * Subscription Service
 * ShiftCheck Marketing Website
 *
 * Handles subscription queries and updates.
 * Note: Subscription creation/modification happens via Stripe webhooks.
 * This service is for reading subscription data.
 */

import { supabase } from '../lib/supabase';

// ============================================
// Types
// ============================================

export interface Subscription {
  id: string;
  owner_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  stripe_price_id: string | null;
  plan_type: string;
  quantity: number;
  max_active_restaurants: number;
  status: string;
  current_period_start: string | null;
  current_period_end: string | null;
  trial_start: string | null;
  trial_end: string | null;
  canceled_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PricingTier {
  id: string;
  name: string;
  description: string | null;
  price_per_restaurant_cents: number;
  min_restaurants: number;
  max_restaurants: number | null;
  features: string[];
  is_active: boolean;
  sort_order: number;
}

// ============================================
// Pricing Tiers
// ============================================

/**
 * Get all active pricing tiers
 */
export async function getPricingTiers(): Promise<{
  tiers: PricingTier[];
  error: Error | null;
}> {
  const { data, error } = await supabase
    .from('pricing_tiers')
    .select('*')
    .eq('is_active', true)
    .order('sort_order');

  if (error) {
    return { tiers: [], error: new Error(error.message) };
  }

  return { tiers: data as PricingTier[], error: null };
}

/**
 * Get single pricing tier by ID
 */
export async function getPricingTier(tierId: string): Promise<{
  tier: PricingTier | null;
  error: Error | null;
}> {
  const { data, error } = await supabase
    .from('pricing_tiers')
    .select('*')
    .eq('id', tierId)
    .single();

  if (error) {
    return { tier: null, error: new Error(error.message) };
  }

  return { tier: data as PricingTier, error: null };
}

/**
 * Calculate monthly price for a plan and restaurant count
 * @param tierId - Pricing tier ID
 * @param restaurantCount - Number of restaurants
 * @returns Price in cents
 */
export async function calculateMonthlyPrice(
  tierId: string,
  restaurantCount: number
): Promise<{
  priceCents: number;
  error: Error | null;
}> {
  const { tier, error } = await getPricingTier(tierId);

  if (error || !tier) {
    return { priceCents: 0, error: error || new Error('Tier not found') };
  }

  // Free starter is $0
  if (tier.price_per_restaurant_cents === 0) {
    return { priceCents: 0, error: null };
  }

  // Calculate: price per restaurant * number of restaurants
  const priceCents = tier.price_per_restaurant_cents * restaurantCount;

  return { priceCents, error: null };
}

// ============================================
// Subscription Queries
// ============================================

/**
 * Get current owner's subscription
 */
export async function getOwnerSubscription(): Promise<{
  subscription: Subscription | null;
  error: Error | null;
}> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { subscription: null, error: new Error('User not authenticated') };
  }

  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('owner_id', user.id)
    .single();

  if (error) {
    // No subscription yet is not an error during sign-up
    if (error.code === 'PGRST116') {
      return { subscription: null, error: null };
    }
    return { subscription: null, error: new Error(error.message) };
  }

  return { subscription: data as Subscription, error: null };
}

/**
 * Check if owner has an active subscription
 */
export async function hasActiveSubscription(): Promise<boolean> {
  const { subscription } = await getOwnerSubscription();

  if (!subscription) return false;

  // Active statuses
  const activeStatuses = ['trialing', 'active'];
  return activeStatuses.includes(subscription.status);
}

/**
 * Get subscription status details
 */
export async function getSubscriptionStatus(): Promise<{
  status: string;
  isActive: boolean;
  isPastDue: boolean;
  isTrialing: boolean;
  isCanceled: boolean;
  daysUntilRenewal: number | null;
  error: Error | null;
}> {
  const { subscription, error } = await getOwnerSubscription();

  if (error) {
    return {
      status: 'none',
      isActive: false,
      isPastDue: false,
      isTrialing: false,
      isCanceled: false,
      daysUntilRenewal: null,
      error,
    };
  }

  if (!subscription) {
    return {
      status: 'none',
      isActive: false,
      isPastDue: false,
      isTrialing: false,
      isCanceled: false,
      daysUntilRenewal: null,
      error: null,
    };
  }

  const status = subscription.status;
  const isActive = ['trialing', 'active'].includes(status);
  const isPastDue = status === 'past_due';
  const isTrialing = status === 'trialing';
  const isCanceled = status === 'canceled' || subscription.canceled_at !== null;

  let daysUntilRenewal: number | null = null;
  if (subscription.current_period_end) {
    const endDate = new Date(subscription.current_period_end);
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    daysUntilRenewal = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  return {
    status,
    isActive,
    isPastDue,
    isTrialing,
    isCanceled,
    daysUntilRenewal,
    error: null,
  };
}

/**
 * Get max active restaurants allowed by subscription
 */
export async function getMaxActiveRestaurants(): Promise<{
  maxActive: number;
  error: Error | null;
}> {
  const { subscription, error } = await getOwnerSubscription();

  if (error) {
    return { maxActive: 0, error };
  }

  // No subscription = 0 active restaurants
  if (!subscription) {
    return { maxActive: 0, error: null };
  }

  // Check if subscription is active
  const activeStatuses = ['trialing', 'active'];
  if (!activeStatuses.includes(subscription.status)) {
    return { maxActive: 0, error: null };
  }

  return { maxActive: subscription.max_active_restaurants, error: null };
}

/**
 * Check if owner can activate another restaurant
 */
export async function canActivateRestaurant(): Promise<{
  canActivate: boolean;
  currentActive: number;
  maxActive: number;
  error: Error | null;
}> {
  const { maxActive, error: subError } = await getMaxActiveRestaurants();

  if (subError) {
    return { canActivate: false, currentActive: 0, maxActive: 0, error: subError };
  }

  // Get current active count
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { canActivate: false, currentActive: 0, maxActive: 0, error: new Error('User not authenticated') };
  }

  const { data, error } = await supabase
    .from('restaurants')
    .select('id')
    .eq('owner_id', user.id)
    .eq('is_active', true);

  if (error) {
    return { canActivate: false, currentActive: 0, maxActive: 0, error: new Error(error.message) };
  }

  const currentActive = data.length;
  const canActivate = currentActive < maxActive;

  return { canActivate, currentActive, maxActive, error: null };
}

// ============================================
// Subscription Management (Client-side helpers)
// ============================================

/**
 * Create a pending subscription record after successful payment
 * This is called client-side before the webhook arrives for immediate UX
 * The webhook will later update this record with proper Stripe IDs
 */
export async function createPendingSubscription(params: {
  planId: string;
  restaurantCount: number;
  stripeCustomerId?: string;
}): Promise<{
  subscription: Subscription | null;
  error: Error | null;
}> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { subscription: null, error: new Error('User not authenticated') };
  }

  // Check if subscription already exists
  const { subscription: existing } = await getOwnerSubscription();
  if (existing) {
    return { subscription: existing, error: null };
  }

  const { data, error } = await supabase
    .from('subscriptions')
    .insert({
      owner_id: user.id,
      stripe_customer_id: params.stripeCustomerId || null,
      plan_type: params.planId,
      max_active_restaurants: params.restaurantCount,
      status: 'pending', // Will be updated by webhook to 'active'
      quantity: params.restaurantCount,
    })
    .select()
    .single();

  if (error) {
    return { subscription: null, error: new Error(error.message) };
  }

  return { subscription: data as Subscription, error: null };
}

/**
 * Create a free trial subscription (no Stripe involved)
 */
export async function createFreeTrialSubscription(): Promise<{
  subscription: Subscription | null;
  error: Error | null;
}> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { subscription: null, error: new Error('User not authenticated') };
  }

  // Check if subscription already exists
  const { subscription: existing } = await getOwnerSubscription();
  if (existing) {
    return { subscription: existing, error: null };
  }

  // Calculate trial end (30 days from now)
  const trialStart = new Date();
  const trialEnd = new Date();
  trialEnd.setDate(trialEnd.getDate() + 30);

  const { data, error } = await supabase
    .from('subscriptions')
    .insert({
      owner_id: user.id,
      plan_type: 'free_starter',
      max_active_restaurants: 1,
      status: 'trialing',
      quantity: 1,
      trial_start: trialStart.toISOString(),
      trial_end: trialEnd.toISOString(),
      current_period_start: trialStart.toISOString(),
      current_period_end: trialEnd.toISOString(),
    })
    .select()
    .single();

  if (error) {
    return { subscription: null, error: new Error(error.message) };
  }

  return { subscription: data as Subscription, error: null };
}

/**
 * Create subscription record from Stripe webhook data
 * Called from webhook handler when subscription.created event is received
 */
export async function createSubscriptionRecord(params: {
  ownerId: string;
  stripeSubscriptionId: string;
  stripeCustomerId: string;
  stripePriceId?: string;
  planType: string;
  quantity: number;
  maxActiveRestaurants: number;
  status: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  trialStart?: Date;
  trialEnd?: Date;
}): Promise<{
  subscription: Subscription | null;
  error: Error | null;
}> {
  // Check if subscription already exists for this owner
  const { data: existing } = await supabase
    .from('subscriptions')
    .select('id')
    .eq('owner_id', params.ownerId)
    .single();

  if (existing) {
    // Update existing subscription instead
    const { data, error } = await supabase
      .from('subscriptions')
      .update({
        stripe_subscription_id: params.stripeSubscriptionId,
        stripe_customer_id: params.stripeCustomerId,
        stripe_price_id: params.stripePriceId || null,
        plan_type: params.planType,
        quantity: params.quantity,
        max_active_restaurants: params.maxActiveRestaurants,
        status: params.status,
        current_period_start: params.currentPeriodStart.toISOString(),
        current_period_end: params.currentPeriodEnd.toISOString(),
        trial_start: params.trialStart?.toISOString() || null,
        trial_end: params.trialEnd?.toISOString() || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id)
      .select()
      .single();

    if (error) {
      return { subscription: null, error: new Error(error.message) };
    }
    return { subscription: data as Subscription, error: null };
  }

  // Create new subscription record
  const { data, error } = await supabase
    .from('subscriptions')
    .insert({
      owner_id: params.ownerId,
      stripe_subscription_id: params.stripeSubscriptionId,
      stripe_customer_id: params.stripeCustomerId,
      stripe_price_id: params.stripePriceId || null,
      plan_type: params.planType,
      quantity: params.quantity,
      max_active_restaurants: params.maxActiveRestaurants,
      status: params.status,
      current_period_start: params.currentPeriodStart.toISOString(),
      current_period_end: params.currentPeriodEnd.toISOString(),
      trial_start: params.trialStart?.toISOString() || null,
      trial_end: params.trialEnd?.toISOString() || null,
    })
    .select()
    .single();

  if (error) {
    return { subscription: null, error: new Error(error.message) };
  }

  return { subscription: data as Subscription, error: null };
}

/**
 * Update subscription after Stripe webhook confirms payment
 * Called from webhook handler (server-side)
 */
export async function updateSubscriptionFromStripe(params: {
  ownerId: string;
  stripeSubscriptionId: string;
  stripeCustomerId: string;
  status: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
}): Promise<{
  success: boolean;
  error: Error | null;
}> {
  const { error } = await supabase
    .from('subscriptions')
    .update({
      stripe_subscription_id: params.stripeSubscriptionId,
      stripe_customer_id: params.stripeCustomerId,
      status: params.status,
      current_period_start: params.currentPeriodStart.toISOString(),
      current_period_end: params.currentPeriodEnd.toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('owner_id', params.ownerId);

  if (error) {
    return { success: false, error: new Error(error.message) };
  }

  return { success: true, error: null };
}
