/**
 * Restaurant Service
 * ShiftCheck Marketing Website
 *
 * Handles restaurant CRUD and activation for owners.
 * Restaurants are created during sign-up (Step 4) with is_active=false.
 * Activation happens based on subscription plan.
 */

import { supabase } from '../lib/supabase';
import { normalizePhone } from '../utils/phone';

// ============================================
// Types
// ============================================

export interface Restaurant {
  id: string;
  name: string;
  owner_id: string;
  address: string;  // DB column
  manager_name: string;  // DB column
  manager_email: string;  // DB column
  manager_phone: string;  // DB column
  photo_url: string | null;  // DB column
  manager_invited: boolean;  // DB column (legacy)
  soft_deleted: boolean;  // DB column
  // Invitation tracking (syncs with shiftcheck-app Owner Dashboard)
  invitation_sent: boolean;  // DB column - TRUE when SMS sent
  invitation_sent_at: string | null;  // DB column - timestamp of send
  invitation_sent_to_phone: string | null;  // DB column - E.164 phone
  // Owner-managed flag (syncs with shiftcheck-app)
  managed_by_owner: boolean;  // DB column - TRUE when owner manages this restaurant
  // Aliases for backward compatibility in UI code
  restaurant_address?: string | null;
  restaurant_phone?: string | null;
  is_active?: boolean;
  activated_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateRestaurantInput {
  name: string;
  restaurant_address: string;
  restaurant_phone?: string;  // Optional - not in DB schema
  restaurant_photo_url?: string | null;
  manager_name: string;
  manager_email?: string;  // Required by DB but optional here (defaults to owner email)
  manager_phone: string;
  managed_by_owner?: boolean; // If true, owner is the manager (syncs with DB column)
}

export interface UpdateRestaurantInput {
  name?: string;
  restaurant_address?: string;
  restaurant_phone?: string;
  restaurant_photo_url?: string | null;
  manager_name?: string;
  manager_phone?: string;
  managed_by_owner?: boolean; // Syncs with DB column
}

// ============================================
// Create Restaurant
// ============================================

/**
 * Create a new restaurant for the current owner
 * Created with is_active=false until subscription activates it
 */
export async function createRestaurant(input: CreateRestaurantInput): Promise<{
  restaurant: Restaurant | null;
  error: Error | null;
}> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { restaurant: null, error: new Error('User not authenticated') };
  }

  const { data, error } = await supabase
    .from('restaurants')
    .insert({
      name: input.name,
      owner_id: user.id,
      address: input.restaurant_address,  // DB column is 'address'
      manager_name: input.manager_name,
      manager_email: input.manager_email || 'manager@example.com', // Required by DB schema
      manager_phone: normalizePhone(input.manager_phone),
      photo_url: input.restaurant_photo_url || null,  // DB column is 'photo_url'
      managed_by_owner: input.managed_by_owner || false,  // Persist checkbox state
    })
    .select()
    .single();

  if (error) {
    return { restaurant: null, error: new Error(error.message) };
  }

  // If owner is managing this restaurant, create a manager record
  if (input.managed_by_owner) {
    await createManagerRecordForOwner(user.id, data.id, input.manager_phone);
  }

  return { restaurant: data as Restaurant, error: null };
}

/**
 * Create manager record when owner manages the restaurant
 * This enables the owner to access manager dashboard with their phone
 */
async function createManagerRecordForOwner(
  _ownerId: string, // Reserved for future use linking owner to manager record
  restaurantId: string,
  phone: string
): Promise<void> {
  const normalizedPhone = normalizePhone(phone);

  // Check if manager record already exists for this phone
  const { data: existing } = await supabase
    .from('managers')
    .select('id')
    .eq('phone', normalizedPhone)
    .single();

  if (!existing) {
    // Create new manager record
    await supabase.from('managers').insert({
      phone: normalizedPhone,
      restaurant_id: restaurantId,
      // Other fields can be populated later
    });
  }
}

// ============================================
// Get Restaurants
// ============================================

/**
 * Get all restaurants for current owner
 */
export async function getOwnerRestaurants(): Promise<{
  restaurants: Restaurant[];
  error: Error | null;
}> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { restaurants: [], error: new Error('User not authenticated') };
  }

  const { data, error } = await supabase
    .from('restaurants')
    .select('*')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    return { restaurants: [], error: new Error(error.message) };
  }

  return { restaurants: data as Restaurant[], error: null };
}

/**
 * Get single restaurant by ID (must belong to current owner)
 */
export async function getRestaurant(restaurantId: string): Promise<{
  restaurant: Restaurant | null;
  error: Error | null;
}> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { restaurant: null, error: new Error('User not authenticated') };
  }

  const { data, error } = await supabase
    .from('restaurants')
    .select('*')
    .eq('id', restaurantId)
    .eq('owner_id', user.id)
    .single();

  if (error) {
    return { restaurant: null, error: new Error(error.message) };
  }

  return { restaurant: data as Restaurant, error: null };
}

/**
 * Get count of restaurants for current owner
 */
export async function getRestaurantCount(): Promise<{
  total: number;
  active: number;
  error: Error | null;
}> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { total: 0, active: 0, error: new Error('User not authenticated') };
  }

  const { data, error } = await supabase
    .from('restaurants')
    .select('id, is_active')
    .eq('owner_id', user.id);

  if (error) {
    return { total: 0, active: 0, error: new Error(error.message) };
  }

  const total = data.length;
  const active = data.filter(r => r.is_active).length;

  return { total, active, error: null };
}

// ============================================
// Update Restaurant
// ============================================

/**
 * Update restaurant details
 */
export async function updateRestaurant(
  restaurantId: string,
  input: UpdateRestaurantInput
): Promise<{
  restaurant: Restaurant | null;
  error: Error | null;
}> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { restaurant: null, error: new Error('User not authenticated') };
  }

  const updates: Record<string, unknown> = {};

  if (input.name) updates.name = input.name;
  if (input.restaurant_address) updates.address = input.restaurant_address;  // DB column is 'address'
  if (input.restaurant_photo_url !== undefined) updates.photo_url = input.restaurant_photo_url;  // DB column is 'photo_url'
  if (input.manager_name) updates.manager_name = input.manager_name;
  if (input.manager_phone) updates.manager_phone = normalizePhone(input.manager_phone);
  // Always include managed_by_owner when provided (even if false)
  if (input.managed_by_owner !== undefined) updates.managed_by_owner = input.managed_by_owner;

  const { data, error } = await supabase
    .from('restaurants')
    .update(updates)
    .eq('id', restaurantId)
    .eq('owner_id', user.id) // Ensure owner owns this restaurant
    .select()
    .single();

  if (error) {
    return { restaurant: null, error: new Error(error.message) };
  }

  return { restaurant: data as Restaurant, error: null };
}

// ============================================
// Delete Restaurant
// ============================================

/**
 * Delete restaurant (only if not active and during sign-up)
 */
export async function deleteRestaurant(restaurantId: string): Promise<{
  success: boolean;
  error: Error | null;
}> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: new Error('User not authenticated') };
  }

  // First check if restaurant exists and is inactive
  const { data: restaurant, error: fetchError } = await supabase
    .from('restaurants')
    .select('is_active')
    .eq('id', restaurantId)
    .eq('owner_id', user.id)
    .single();

  if (fetchError) {
    return { success: false, error: new Error(fetchError.message) };
  }

  if (restaurant.is_active) {
    return { success: false, error: new Error('Cannot delete an active restaurant') };
  }

  const { error } = await supabase
    .from('restaurants')
    .delete()
    .eq('id', restaurantId)
    .eq('owner_id', user.id);

  if (error) {
    return { success: false, error: new Error(error.message) };
  }

  return { success: true, error: null };
}

// ============================================
// Activation / Deactivation
// ============================================

/**
 * Activate a restaurant (called after successful subscription)
 * Requires available slots in subscription
 */
export async function activateRestaurant(restaurantId: string): Promise<{
  restaurant: Restaurant | null;
  error: Error | null;
}> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { restaurant: null, error: new Error('User not authenticated') };
  }

  const { data, error } = await supabase
    .from('restaurants')
    .update({
      is_active: true,
      activated_at: new Date().toISOString(),
    })
    .eq('id', restaurantId)
    .eq('owner_id', user.id)
    .select()
    .single();

  if (error) {
    return { restaurant: null, error: new Error(error.message) };
  }

  return { restaurant: data as Restaurant, error: null };
}

/**
 * Deactivate a restaurant
 * Managers/teams lose access until reactivated
 */
export async function deactivateRestaurant(restaurantId: string): Promise<{
  restaurant: Restaurant | null;
  error: Error | null;
}> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { restaurant: null, error: new Error('User not authenticated') };
  }

  const { data, error } = await supabase
    .from('restaurants')
    .update({
      is_active: false,
    })
    .eq('id', restaurantId)
    .eq('owner_id', user.id)
    .select()
    .single();

  if (error) {
    return { restaurant: null, error: new Error(error.message) };
  }

  return { restaurant: data as Restaurant, error: null };
}

/**
 * Toggle restaurant active status
 */
export async function toggleRestaurantActive(restaurantId: string): Promise<{
  restaurant: Restaurant | null;
  error: Error | null;
}> {
  // Get current state
  const { restaurant, error: fetchError } = await getRestaurant(restaurantId);

  if (fetchError || !restaurant) {
    return { restaurant: null, error: fetchError };
  }

  if (restaurant.is_active) {
    return deactivateRestaurant(restaurantId);
  } else {
    return activateRestaurant(restaurantId);
  }
}

/**
 * Activate multiple restaurants up to a limit
 * Used when subscription is created/upgraded
 */
export async function activateRestaurantsUpToLimit(maxActive: number): Promise<{
  activatedCount: number;
  error: Error | null;
}> {
  const { restaurants, error: fetchError } = await getOwnerRestaurants();

  if (fetchError) {
    return { activatedCount: 0, error: fetchError };
  }

  // Get inactive restaurants
  const inactive = restaurants.filter(r => !r.is_active);

  // Get currently active count
  const currentActive = restaurants.filter(r => r.is_active).length;

  // Calculate how many we can activate
  const canActivate = Math.max(0, maxActive - currentActive);
  const toActivate = inactive.slice(0, canActivate);

  let activatedCount = 0;

  for (const restaurant of toActivate) {
    const { error } = await activateRestaurant(restaurant.id);
    if (!error) {
      activatedCount++;
    }
  }

  return { activatedCount, error: null };
}

// ============================================
// Manager Invitation
// ============================================

/**
 * Mark manager invitation as sent
 * Updates both legacy (manager_invited) and new (invitation_sent) columns
 * This syncs with shiftcheck-app Owner Dashboard
 */
export async function markInvitationSent(
  restaurantId: string,
  phoneNumber: string
): Promise<{
  restaurant: Restaurant | null;
  error: Error | null;
}> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { restaurant: null, error: new Error('User not authenticated') };
  }

  const normalizedPhone = normalizePhone(phoneNumber);

  const { data, error } = await supabase
    .from('restaurants')
    .update({
      // New columns (used by shiftcheck-app Owner Dashboard)
      invitation_sent: true,
      invitation_sent_at: new Date().toISOString(),
      invitation_sent_to_phone: normalizedPhone,
      // Legacy column (backward compatibility)
      manager_invited: true,
    })
    .eq('id', restaurantId)
    .eq('owner_id', user.id)
    .select()
    .single();

  if (error) {
    return { restaurant: null, error: new Error(error.message) };
  }

  return { restaurant: data as Restaurant, error: null };
}

/**
 * Send manager invitation SMS
 * Calls the /api/sms/send-invitation endpoint
 */
export async function sendManagerInvitationSms(
  phone: string,
  restaurantName: string,
  managerFirstName: string
): Promise<{
  success: boolean;
  messageSid?: string;
  error?: string;
}> {
  const normalizedPhone = normalizePhone(phone);

  // Generate signup link
  const signupLink = `https://app.shiftcheck.app/manager/signup?phone=${encodeURIComponent(normalizedPhone)}`;

  // Build message (matches shiftcheck-app template)
  const message = `Hi ${managerFirstName}! You've been invited to manage ${restaurantName} on ShiftCheck. Complete your signup here: ${signupLink}`;

  try {
    const response = await fetch('/api/sms/send-invitation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: normalizedPhone,
        message
      })
    });

    // Handle empty responses (e.g., when API server isn't running)
    const text = await response.text();
    if (!text) {
      return {
        success: false,
        error: 'SMS service unavailable. In development, run: npm run dev:api'
      };
    }

    // Parse JSON safely
    let result;
    try {
      result = JSON.parse(text);
    } catch {
      console.error('Invalid JSON response:', text);
      return {
        success: false,
        error: 'Invalid response from SMS service'
      };
    }

    if (!response.ok) {
      return {
        success: false,
        error: result.error || result.details || 'Failed to send SMS'
      };
    }

    return {
      success: true,
      messageSid: result.messageSid
    };
  } catch (error) {
    console.error('SMS send error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error sending SMS'
    };
  }
}
