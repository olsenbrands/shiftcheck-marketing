/**
 * Service Layer Index
 * ShiftCheck Marketing Website
 *
 * Re-exports all services for convenient imports.
 *
 * @example
 * import { signUp, getOwnerRestaurants, createReferralRedemption } from './services';
 */

// Authentication
export * from './authService';

// Owner Profile
export * from './ownerService';

// Restaurants
export * from './restaurantService';

// Subscriptions & Pricing
export * from './subscriptionService';

// Stripe Payments
export * from './stripeService';

// Emails
export * from './emailService';

// Referrals
export * from './referralService';

// Analytics
export * from './analyticsService';
