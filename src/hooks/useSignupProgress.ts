/**
 * Sign-Up Progress Hook
 * ShiftCheck Marketing Website
 *
 * Tracks user progress through the sign-up flow and enables resuming incomplete signups.
 * Stores progress in localStorage with timestamps for expiration handling.
 */

import { useState, useEffect, useCallback } from 'react';

// ============================================================================
// Types
// ============================================================================

export type SignupStep =
  | 'signup'       // Step 1: Create account (email + password)
  | 'verify_email' // Step 2: Verify email (awaiting verification)
  | 'login'        // Step 3: Login after verification
  | 'profile'      // Step 4: Personal info & billing
  | 'restaurants'  // Step 5: Add restaurants
  | 'plan'         // Step 6: Select plan
  | 'payment'      // Step 7: Payment (if paid plan)
  | 'complete';    // Step 8: Completed

export interface SignupProgressData {
  currentStep: SignupStep;
  email?: string;
  lastUpdated: number; // Unix timestamp
  expiresAt: number;   // Unix timestamp
}

export interface SignupProgress {
  // Current state
  hasIncompleteSignup: boolean;
  progressData: SignupProgressData | null;
  currentStep: SignupStep | null;
  email: string | null;
  isExpired: boolean;

  // Actions
  updateProgress: (step: SignupStep, email?: string) => void;
  clearProgress: () => void;
  getResumeUrl: () => string;
}

// ============================================================================
// Constants
// ============================================================================

const STORAGE_KEY = 'signup_progress';
const EXPIRATION_HOURS = 72; // Progress expires after 72 hours

// Step order for determining which step to resume from
const STEP_ORDER: SignupStep[] = [
  'signup',
  'verify_email',
  'login',
  'profile',
  'restaurants',
  'plan',
  'payment',
  'complete',
];

// URL mapping for each step
const STEP_URLS: Record<SignupStep, string> = {
  signup: '/auth/signup',
  verify_email: '/auth/signup', // Show success state with "check your email"
  login: '/auth/login',
  profile: '/signup/profile',
  restaurants: '/signup/restaurants',
  plan: '/signup/plan',
  payment: '/signup/payment',
  complete: '/signup/complete',
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get progress data from localStorage
 */
function getStoredProgress(): SignupProgressData | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const data = JSON.parse(stored) as SignupProgressData;

    // Validate the data structure
    if (!data.currentStep || !data.lastUpdated || !data.expiresAt) {
      return null;
    }

    return data;
  } catch {
    return null;
  }
}

/**
 * Check if progress data has expired
 */
function isProgressExpired(data: SignupProgressData): boolean {
  return Date.now() > data.expiresAt;
}

/**
 * Calculate expiration timestamp
 */
function calculateExpiration(): number {
  return Date.now() + EXPIRATION_HOURS * 60 * 60 * 1000;
}

/**
 * Detect current step based on existing localStorage data
 * This is used to infer progress even if the progress tracker wasn't explicitly updated
 */
function detectCurrentStep(): SignupStep {
  // Check for completion indicators
  const selectedPlan = localStorage.getItem('selected_plan');
  const restaurants = localStorage.getItem('signup_restaurants');
  const profileStep = localStorage.getItem('profile_step');
  const verifiedEmail = localStorage.getItem('verified_email');
  const emailVerified = localStorage.getItem('email_verified');
  const signupEmail = localStorage.getItem('signup_email');

  // Work backwards from most advanced step
  if (selectedPlan) {
    // They've selected a plan - if free, go to complete, else payment
    if (selectedPlan === 'free_starter') {
      return 'complete';
    }
    return 'payment';
  }

  if (restaurants) {
    try {
      const restaurantList = JSON.parse(restaurants);
      if (Array.isArray(restaurantList) && restaurantList.length > 0) {
        return 'plan';
      }
    } catch {
      // Invalid JSON, continue checking
    }
  }

  if (profileStep === 'billing') {
    return 'restaurants';
  }

  if (localStorage.getItem('profile_first_name')) {
    return 'profile';
  }

  if (verifiedEmail || emailVerified === 'true') {
    // Email has been verified, user should login
    return 'login';
  }

  if (signupEmail) {
    // Has signup email but not verified - waiting for verification
    return 'verify_email';
  }

  return 'signup';
}

// ============================================================================
// Hook
// ============================================================================

/**
 * Hook to track and manage sign-up progress
 *
 * @example
 * function SignUpPage() {
 *   const { hasIncompleteSignup, progressData, getResumeUrl } = useSignupProgress();
 *
 *   if (hasIncompleteSignup) {
 *     return <ResumeModal resumeUrl={getResumeUrl()} />;
 *   }
 * }
 */
export function useSignupProgress(): SignupProgress {
  const [progressData, setProgressData] = useState<SignupProgressData | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load progress on mount
  useEffect(() => {
    const stored = getStoredProgress();
    setProgressData(stored);
    setIsLoaded(true);
  }, []);

  // Update progress
  const updateProgress = useCallback((step: SignupStep, email?: string) => {
    const existingEmail = progressData?.email || localStorage.getItem('signup_email') || localStorage.getItem('verified_email');

    const newData: SignupProgressData = {
      currentStep: step,
      email: email || existingEmail || undefined,
      lastUpdated: Date.now(),
      expiresAt: calculateExpiration(),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
    setProgressData(newData);
  }, [progressData?.email]);

  // Clear progress
  const clearProgress = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setProgressData(null);
  }, []);

  // Get resume URL
  const getResumeUrl = useCallback((): string => {
    if (!progressData) {
      // No explicit progress, try to detect from localStorage
      const detectedStep = detectCurrentStep();
      return STEP_URLS[detectedStep];
    }

    // Return URL for the current step (user needs to complete it)
    return STEP_URLS[progressData.currentStep];
  }, [progressData]);

  // Compute derived state
  const isExpired = progressData ? isProgressExpired(progressData) : false;
  const hasIncompleteSignup = isLoaded && progressData !== null && !isExpired && progressData.currentStep !== 'complete';

  return {
    hasIncompleteSignup,
    progressData,
    currentStep: progressData?.currentStep || null,
    email: progressData?.email || null,
    isExpired,
    updateProgress,
    clearProgress,
    getResumeUrl,
  };
}

/**
 * Check if there's an incomplete signup without using the hook
 * Useful for one-time checks in non-component contexts
 */
export function checkIncompleteSignup(): {
  hasIncomplete: boolean;
  isExpired: boolean;
  step: SignupStep | null;
  email: string | null;
  resumeUrl: string;
} {
  const stored = getStoredProgress();

  // Check if there was stored progress but it expired
  if (stored && isProgressExpired(stored)) {
    return {
      hasIncomplete: false,
      isExpired: true,
      step: stored.currentStep,
      email: stored.email || null,
      resumeUrl: '/auth/signup',
    };
  }

  if (!stored || stored.currentStep === 'complete') {
    // Also check localStorage for implicit progress
    const detectedStep = detectCurrentStep();
    if (detectedStep !== 'signup') {
      const email = localStorage.getItem('verified_email') || localStorage.getItem('signup_email');
      return {
        hasIncomplete: true,
        isExpired: false,
        step: detectedStep,
        email,
        resumeUrl: STEP_URLS[detectedStep],
      };
    }

    return {
      hasIncomplete: false,
      isExpired: false,
      step: null,
      email: null,
      resumeUrl: '/auth/signup',
    };
  }

  return {
    hasIncomplete: true,
    isExpired: false,
    step: stored.currentStep,
    email: stored.email || null,
    resumeUrl: STEP_URLS[stored.currentStep],
  };
}

/**
 * Get a human-readable description of a signup step
 */
export function getStepDescription(step: SignupStep): string {
  const descriptions: Record<SignupStep, string> = {
    signup: 'Account creation',
    verify_email: 'Email verification',
    login: 'Sign in',
    profile: 'Profile information',
    restaurants: 'Restaurant setup',
    plan: 'Plan selection',
    payment: 'Payment',
    complete: 'Completed',
  };
  return descriptions[step];
}

/**
 * Get step number (1-7) for display
 */
export function getStepNumber(step: SignupStep): number {
  return STEP_ORDER.indexOf(step) + 1;
}

export default useSignupProgress;
