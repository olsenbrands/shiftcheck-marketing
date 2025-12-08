/**
 * Environment Configuration
 * ShiftCheck Marketing Website
 *
 * Centralizes all environment variable access with validation.
 * See .env.local for local development values.
 */

// ========================================
// Validation Helpers
// ========================================

function getRequiredEnv(key: string): string {
  const value = import.meta.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function getOptionalEnv(key: string, defaultValue: string = ''): string {
  return import.meta.env[key] || defaultValue;
}

// ========================================
// Supabase Configuration
// ========================================

export const SUPABASE_URL = getRequiredEnv('VITE_SUPABASE_URL');
export const SUPABASE_ANON_KEY = getRequiredEnv('VITE_SUPABASE_ANON_KEY');

// ========================================
// Stripe Configuration
// ========================================

export const STRIPE_PUBLISHABLE_KEY = getRequiredEnv('VITE_STRIPE_PUBLISHABLE_KEY');
export const STRIPE_PRICE_ID = getRequiredEnv('VITE_STRIPE_PRICE_ID');

// Server-side only (used in API routes)
// These are accessed via process.env in Vercel serverless functions
export const stripeConfig = {
  publishableKey: STRIPE_PUBLISHABLE_KEY,
  priceId: STRIPE_PRICE_ID,
  // Monthly price per restaurant in cents
  monthlyPricePerRestaurant: 9900, // $99.00
};

// ========================================
// Brevo Configuration
// ========================================

export const brevoConfig = {
  senderEmail: getOptionalEnv('BREVO_SENDER_EMAIL', 'jordan@olsenbrands.com'),
  senderName: getOptionalEnv('BREVO_SENDER_NAME', 'ShiftCheck'),
  templates: {
    welcome: parseInt(getOptionalEnv('BREVO_TEMPLATE_WELCOME', '1')),
    subscriptionConfirmed: parseInt(getOptionalEnv('BREVO_TEMPLATE_SUBSCRIPTION_CONFIRMED', '2')),
    trialEnding: parseInt(getOptionalEnv('BREVO_TEMPLATE_TRIAL_ENDING', '3')),
    paymentFailed: parseInt(getOptionalEnv('BREVO_TEMPLATE_PAYMENT_FAILED', '4')),
    subscriptionCancelled: parseInt(getOptionalEnv('BREVO_TEMPLATE_SUBSCRIPTION_CANCELLED', '5')),
    passwordReset: parseInt(getOptionalEnv('BREVO_TEMPLATE_PASSWORD_RESET', '6')),
  },
};

// ========================================
// App Configuration
// ========================================

export const appConfig = {
  name: 'ShiftCheck',
  supportEmail: 'support@shiftcheck.app',
  marketingUrl: 'https://shiftcheck.app',
  appDownloadUrl: {
    ios: 'https://apps.apple.com/app/shiftcheck', // TODO: Update with real URL
    android: 'https://play.google.com/store/apps/details?id=app.shiftcheck', // TODO: Update with real URL
  },
  // Free tier limits
  freeTier: {
    maxActiveRestaurants: 1,
    trialDays: 30,
  },
  // Pricing tiers (synced with pricing_tiers table)
  pricing: {
    freeStarter: {
      name: 'Free Starter',
      maxRestaurants: 1,
      monthlyPrice: 0,
    },
    grow: {
      name: 'Grow',
      maxRestaurants: 3,
      monthlyPricePerRestaurant: 99,
    },
    expand: {
      name: 'Expand',
      maxRestaurants: null, // unlimited
      monthlyPricePerRestaurant: 99,
    },
  },
};

// ========================================
// Development Helpers
// ========================================

export const isDevelopment = import.meta.env.DEV;
export const isProduction = import.meta.env.PROD;

// Log configuration in development (without sensitive values)
if (isDevelopment) {
  console.log('[Config] Environment loaded:', {
    supabaseUrl: SUPABASE_URL,
    stripeConfigured: !!STRIPE_PUBLISHABLE_KEY,
    environment: isDevelopment ? 'development' : 'production',
  });
}
