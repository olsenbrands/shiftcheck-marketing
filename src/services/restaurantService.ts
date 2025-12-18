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
  // Address fields (separate for App compatibility)
  address: string;  // DB column - legacy combined address
  street: string | null;  // DB column - street address
  suite: string | null;  // DB column - suite/unit
  city: string | null;  // DB column - city
  state: string | null;  // DB column - state
  zip_code: string | null;  // DB column - zip code
  country: string;  // DB column - 'US' or 'CA'
  store_phone: string | null;  // DB column - restaurant phone
  // Manager fields
  manager_name: string;  // DB column - combined name (legacy)
  manager_first_name: string | null;  // DB column - first name
  manager_last_name: string | null;  // DB column - last name
  manager_email: string;  // DB column
  manager_phone: string;  // DB column
  // Restaurant settings
  active_task_library: string;  // DB column - 'empty' or 'subway'
  photo_url: string | null;  // DB column
  emoji_icon: string | null;  // DB column - emoji instead of photo
  short_code: string | null;  // DB column - pairing code
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
  // Address fields (separate - matches App)
  street: string;
  suite?: string;
  city: string;
  state: string;
  zip_code: string;
  country?: string;  // 'US' or 'CA', defaults to 'US'
  store_phone: string;
  // Task library
  active_task_library?: string;  // 'empty' or 'subway', defaults to 'empty'
  // Manager fields (separate - matches App)
  manager_first_name: string;
  manager_last_name?: string;
  manager_email: string;
  manager_phone: string;
  managed_by_owner?: boolean;
  // Photo/emoji
  photo_url?: string | null;
  emoji_icon?: string | null;  // Emoji instead of photo
  // Legacy fields (for backward compatibility)
  restaurant_address?: string;  // Computed from separate fields if not provided
  manager_name?: string;  // Computed from first + last if not provided
}

export interface UpdateRestaurantInput {
  name?: string;
  // Address fields (separate - matches App)
  street?: string;
  suite?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;  // 'US' or 'CA'
  store_phone?: string;
  // Task library
  active_task_library?: string;  // 'empty' or 'subway'
  // Manager fields (separate - matches App)
  manager_first_name?: string;
  manager_last_name?: string;
  manager_email?: string;
  manager_phone?: string;
  managed_by_owner?: boolean;
  // Photo/emoji
  photo_url?: string | null;
  emoji_icon?: string | null;  // Emoji instead of photo
  // Legacy fields (for backward compatibility)
  restaurant_address?: string;
  manager_name?: string;
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

  // Build combined address for legacy compatibility
  const combinedAddress = input.restaurant_address || buildCombinedAddress(input);

  // Build combined manager name for legacy compatibility
  const combinedManagerName = input.manager_name ||
    `${input.manager_first_name}${input.manager_last_name ? ' ' + input.manager_last_name : ''}`.trim();

  const { data, error } = await supabase
    .from('restaurants')
    .insert({
      name: input.name,
      owner_id: user.id,
      // Address fields (separate)
      street: input.street,
      suite: input.suite || null,
      city: input.city,
      state: input.state,
      zip_code: input.zip_code,
      country: input.country || 'US',
      store_phone: normalizePhone(input.store_phone),
      // Legacy combined address
      address: combinedAddress,
      // Manager fields (separate)
      manager_first_name: input.manager_first_name,
      manager_last_name: input.manager_last_name || null,
      manager_email: input.manager_email,
      manager_phone: normalizePhone(input.manager_phone),
      // Legacy combined name
      manager_name: combinedManagerName,
      // Settings
      active_task_library: input.active_task_library || 'empty',
      photo_url: input.photo_url || null,
      emoji_icon: input.emoji_icon || null,
      managed_by_owner: input.managed_by_owner || false,
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
 * Build combined address string from separate fields
 */
function buildCombinedAddress(input: CreateRestaurantInput | UpdateRestaurantInput): string {
  const parts: string[] = [];
  if ('street' in input && input.street) parts.push(input.street);
  if ('suite' in input && input.suite) parts.push(`Ste ${input.suite}`);
  if ('city' in input && input.city) parts.push(input.city);
  if ('state' in input && input.state && 'zip_code' in input && input.zip_code) {
    parts.push(`${input.state} ${input.zip_code}`);
  } else {
    if ('state' in input && input.state) parts.push(input.state);
    if ('zip_code' in input && input.zip_code) parts.push(input.zip_code);
  }
  return parts.join(', ');
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

  // Basic info
  if (input.name) updates.name = input.name;

  // Address fields (separate)
  if (input.street) updates.street = input.street;
  if (input.suite !== undefined) updates.suite = input.suite || null;
  if (input.city) updates.city = input.city;
  if (input.state) updates.state = input.state;
  if (input.zip_code) updates.zip_code = input.zip_code;
  if (input.country) updates.country = input.country;
  if (input.store_phone) updates.store_phone = normalizePhone(input.store_phone);

  // Build combined address if any address field changed
  if (input.street || input.city || input.state || input.zip_code) {
    updates.address = input.restaurant_address || buildCombinedAddress(input);
  } else if (input.restaurant_address) {
    updates.address = input.restaurant_address;
  }

  // Manager fields (separate)
  if (input.manager_first_name) updates.manager_first_name = input.manager_first_name;
  if (input.manager_last_name !== undefined) updates.manager_last_name = input.manager_last_name || null;
  if (input.manager_email) updates.manager_email = input.manager_email;
  if (input.manager_phone) updates.manager_phone = normalizePhone(input.manager_phone);

  // Build combined manager name if any name field changed
  if (input.manager_first_name || input.manager_last_name !== undefined) {
    const firstName = input.manager_first_name || '';
    const lastName = input.manager_last_name || '';
    updates.manager_name = input.manager_name || `${firstName}${lastName ? ' ' + lastName : ''}`.trim();
  } else if (input.manager_name) {
    updates.manager_name = input.manager_name;
  }

  // Settings
  if (input.active_task_library) updates.active_task_library = input.active_task_library;
  if (input.photo_url !== undefined) updates.photo_url = input.photo_url;
  if (input.emoji_icon !== undefined) updates.emoji_icon = input.emoji_icon;
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
