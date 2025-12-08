/**
 * Analytics Service
 * ShiftCheck Marketing Website
 *
 * Provides a flexible analytics abstraction layer for tracking signup funnel events.
 * Currently uses console logging for development. Can be configured to use:
 * - Segment (industry standard CDP)
 * - PostHog (open-source, self-hostable)
 * - Mixpanel (product analytics)
 * - Google Analytics 4
 *
 * To switch providers, set VITE_ANALYTICS_PROVIDER in .env
 */

// ============================================================================
// Types
// ============================================================================

/**
 * Analytics event names for the signup funnel
 */
export type AnalyticsEvent =
  | 'signup_started'
  | 'email_verification_sent'
  | 'email_verified'
  | 'owner_profile_completed'
  | 'restaurant_created'
  | 'plan_selected'
  | 'payment_started'
  | 'payment_completed'
  | 'payment_failed'
  | 'signup_completed'
  | 'signup_abandoned';

/**
 * Properties for each event type
 */
export interface SignupStartedProps {
  source?: string; // 'direct' | 'referral' | 'google_ads' | etc.
  referral_code?: string;
}

export interface EmailVerificationSentProps {
  email: string;
  is_resend: boolean;
}

export interface EmailVerifiedProps {
  email: string;
  verification_time_seconds?: number;
}

export interface OwnerProfileCompletedProps {
  has_referral_code: boolean;
  state?: string;
  country?: string;
}

export interface RestaurantCreatedProps {
  restaurant_count: number; // Total restaurants after this creation
  is_owner_managed: boolean;
  has_photo: boolean;
}

export interface PlanSelectedProps {
  plan_name: 'free_starter' | 'grow' | 'expand';
  plan_price: number;
  restaurant_count: number;
  is_upgrade?: boolean;
}

export interface PaymentStartedProps {
  plan_name: string;
  amount: number;
  restaurant_count: number;
}

export interface PaymentCompletedProps {
  plan_name: string;
  amount: number;
  restaurant_count: number;
  stripe_subscription_id?: string;
}

export interface PaymentFailedProps {
  plan_name: string;
  amount: number;
  error_code?: string;
  error_message?: string;
}

export interface SignupCompletedProps {
  plan_name: string;
  restaurant_count: number;
  total_signup_time_seconds?: number;
  has_referral: boolean;
}

export interface SignupAbandonedProps {
  last_step: 'email' | 'login' | 'profile' | 'restaurants' | 'plan' | 'payment';
  time_on_step_seconds?: number;
  restaurants_created?: number;
}

/**
 * User identity for analytics
 */
export interface UserIdentity {
  userId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  plan?: string;
  createdAt?: string;
}

/**
 * Map of event names to their property types
 */
export type EventPropsMap = {
  signup_started: SignupStartedProps;
  email_verification_sent: EmailVerificationSentProps;
  email_verified: EmailVerifiedProps;
  owner_profile_completed: OwnerProfileCompletedProps;
  restaurant_created: RestaurantCreatedProps;
  plan_selected: PlanSelectedProps;
  payment_started: PaymentStartedProps;
  payment_completed: PaymentCompletedProps;
  payment_failed: PaymentFailedProps;
  signup_completed: SignupCompletedProps;
  signup_abandoned: SignupAbandonedProps;
};

// ============================================================================
// Analytics Provider Interface
// ============================================================================

interface AnalyticsProvider {
  track<E extends AnalyticsEvent>(event: E, properties?: EventPropsMap[E]): void;
  identify(identity: UserIdentity): void;
  page(name: string, properties?: Record<string, unknown>): void;
  reset(): void;
}

// ============================================================================
// Console Provider (Development)
// ============================================================================

const consoleProvider: AnalyticsProvider = {
  track(event, properties) {
    console.log(`[Analytics] Track: ${event}`, properties);
  },
  identify(identity) {
    console.log(`[Analytics] Identify:`, identity);
  },
  page(name, properties) {
    console.log(`[Analytics] Page: ${name}`, properties);
  },
  reset() {
    console.log(`[Analytics] Reset`);
  },
};

// ============================================================================
// Segment Provider
// ============================================================================

declare global {
  interface Window {
    analytics?: {
      track: (event: string, properties?: Record<string, unknown>) => void;
      identify: (userId: string, traits?: Record<string, unknown>) => void;
      page: (name?: string, properties?: Record<string, unknown>) => void;
      reset: () => void;
    };
  }
}

const segmentProvider: AnalyticsProvider = {
  track(event, properties) {
    if (window.analytics) {
      window.analytics.track(event, properties as Record<string, unknown>);
    } else {
      console.warn('[Analytics] Segment not loaded, falling back to console');
      consoleProvider.track(event, properties);
    }
  },
  identify(identity) {
    if (window.analytics) {
      window.analytics.identify(identity.userId, {
        email: identity.email,
        firstName: identity.firstName,
        lastName: identity.lastName,
        phone: identity.phone,
        plan: identity.plan,
        createdAt: identity.createdAt,
      });
    } else {
      consoleProvider.identify(identity);
    }
  },
  page(name, properties) {
    if (window.analytics) {
      window.analytics.page(name, properties);
    } else {
      consoleProvider.page(name, properties);
    }
  },
  reset() {
    if (window.analytics) {
      window.analytics.reset();
    } else {
      consoleProvider.reset();
    }
  },
};

// ============================================================================
// PostHog Provider
// ============================================================================

declare global {
  interface Window {
    posthog?: {
      capture: (event: string, properties?: Record<string, unknown>) => void;
      identify: (userId: string, properties?: Record<string, unknown>) => void;
      reset: () => void;
    };
  }
}

const posthogProvider: AnalyticsProvider = {
  track(event, properties) {
    if (window.posthog) {
      window.posthog.capture(event, properties as Record<string, unknown>);
    } else {
      console.warn('[Analytics] PostHog not loaded, falling back to console');
      consoleProvider.track(event, properties);
    }
  },
  identify(identity) {
    if (window.posthog) {
      window.posthog.identify(identity.userId, {
        email: identity.email,
        first_name: identity.firstName,
        last_name: identity.lastName,
        phone: identity.phone,
        plan: identity.plan,
        created_at: identity.createdAt,
      });
    } else {
      consoleProvider.identify(identity);
    }
  },
  page(name, properties) {
    // PostHog auto-captures page views, but we can still track manually
    if (window.posthog) {
      window.posthog.capture('$pageview', { page_name: name, ...properties });
    } else {
      consoleProvider.page(name, properties);
    }
  },
  reset() {
    if (window.posthog) {
      window.posthog.reset();
    } else {
      consoleProvider.reset();
    }
  },
};

// ============================================================================
// Google Analytics 4 Provider
// ============================================================================

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

const ga4Provider: AnalyticsProvider = {
  track(event, properties) {
    if (window.gtag) {
      window.gtag('event', event, properties);
    } else {
      console.warn('[Analytics] GA4 not loaded, falling back to console');
      consoleProvider.track(event, properties);
    }
  },
  identify(identity) {
    if (window.gtag) {
      window.gtag('set', 'user_properties', {
        user_id: identity.userId,
        email: identity.email,
        first_name: identity.firstName,
        last_name: identity.lastName,
        plan: identity.plan,
      });
    } else {
      consoleProvider.identify(identity);
    }
  },
  page(name, properties) {
    if (window.gtag) {
      window.gtag('event', 'page_view', {
        page_title: name,
        ...properties,
      });
    } else {
      consoleProvider.page(name, properties);
    }
  },
  reset() {
    // GA4 doesn't have a reset method, clear user_id
    if (window.gtag) {
      window.gtag('set', 'user_properties', { user_id: null });
    }
    consoleProvider.reset();
  },
};

// ============================================================================
// Provider Selection
// ============================================================================

type ProviderName = 'console' | 'segment' | 'posthog' | 'ga4';

const providers: Record<ProviderName, AnalyticsProvider> = {
  console: consoleProvider,
  segment: segmentProvider,
  posthog: posthogProvider,
  ga4: ga4Provider,
};

/**
 * Get the configured analytics provider
 */
function getProvider(): AnalyticsProvider {
  const providerName = (import.meta.env.VITE_ANALYTICS_PROVIDER || 'console') as ProviderName;
  return providers[providerName] || consoleProvider;
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Track an analytics event
 *
 * @example
 * track('signup_started', { source: 'google_ads' });
 * track('restaurant_created', { restaurant_count: 2, is_owner_managed: true });
 */
export function track<E extends AnalyticsEvent>(
  event: E,
  properties?: EventPropsMap[E]
): void {
  try {
    const provider = getProvider();
    provider.track(event, properties);
  } catch (error) {
    console.error('[Analytics] Failed to track event:', error);
  }
}

/**
 * Identify a user for analytics
 *
 * @example
 * identify({
 *   userId: 'user_123',
 *   email: 'owner@restaurant.com',
 *   firstName: 'John',
 *   lastName: 'Doe',
 *   plan: 'grow'
 * });
 */
export function identify(identity: UserIdentity): void {
  try {
    const provider = getProvider();
    provider.identify(identity);
  } catch (error) {
    console.error('[Analytics] Failed to identify user:', error);
  }
}

/**
 * Track a page view
 *
 * @example
 * page('Sign Up - Step 3');
 */
export function page(name: string, properties?: Record<string, unknown>): void {
  try {
    const provider = getProvider();
    provider.page(name, properties);
  } catch (error) {
    console.error('[Analytics] Failed to track page:', error);
  }
}

/**
 * Reset analytics (on logout)
 */
export function reset(): void {
  try {
    const provider = getProvider();
    provider.reset();
  } catch (error) {
    console.error('[Analytics] Failed to reset:', error);
  }
}

// ============================================================================
// Convenience Functions for Signup Funnel
// ============================================================================

/**
 * Track when user starts the signup flow
 */
export function trackSignupStarted(props?: SignupStartedProps): void {
  track('signup_started', props || {});
}

/**
 * Track when verification email is sent
 */
export function trackEmailVerificationSent(email: string, isResend = false): void {
  track('email_verification_sent', { email, is_resend: isResend });
}

/**
 * Track when email is verified
 */
export function trackEmailVerified(email: string, verificationTimeSeconds?: number): void {
  track('email_verified', { email, verification_time_seconds: verificationTimeSeconds });
}

/**
 * Track when owner profile is completed
 */
export function trackOwnerProfileCompleted(props: OwnerProfileCompletedProps): void {
  track('owner_profile_completed', props);
}

/**
 * Track when a restaurant is created
 */
export function trackRestaurantCreated(props: RestaurantCreatedProps): void {
  track('restaurant_created', props);
}

/**
 * Track when a plan is selected
 */
export function trackPlanSelected(props: PlanSelectedProps): void {
  track('plan_selected', props);
}

/**
 * Track when payment flow starts
 */
export function trackPaymentStarted(props: PaymentStartedProps): void {
  track('payment_started', props);
}

/**
 * Track when payment succeeds
 */
export function trackPaymentCompleted(props: PaymentCompletedProps): void {
  track('payment_completed', props);
}

/**
 * Track when payment fails
 */
export function trackPaymentFailed(props: PaymentFailedProps): void {
  track('payment_failed', props);
}

/**
 * Track when signup is fully completed
 */
export function trackSignupCompleted(props: SignupCompletedProps): void {
  track('signup_completed', props);
}

/**
 * Track when signup is abandoned
 */
export function trackSignupAbandoned(props: SignupAbandonedProps): void {
  track('signup_abandoned', props);
}

/**
 * Identify user after signup completion
 */
export function identifyUser(user: UserIdentity): void {
  identify(user);
}
