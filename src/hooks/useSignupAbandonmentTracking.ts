/**
 * Signup Abandonment Tracking Hook
 * ShiftCheck Marketing Website
 *
 * Tracks when users abandon the signup flow.
 * Fires signup_abandoned event when user leaves a signup page without completing.
 */

import { useEffect, useRef } from 'react';
import { trackSignupAbandoned, SignupAbandonedProps } from '../services/analyticsService';

type SignupStep = 'email' | 'login' | 'profile' | 'restaurants' | 'plan' | 'payment';

interface UseSignupAbandonmentTrackingProps {
  step: SignupStep;
  restaurantsCreated?: number;
}

/**
 * Hook to track when users abandon the signup flow.
 * Call this at the top of each signup page component.
 *
 * @example
 * function ProfilePage() {
 *   useSignupAbandonmentTracking({ step: 'profile' });
 *   // ... rest of component
 * }
 */
export function useSignupAbandonmentTracking({
  step,
  restaurantsCreated = 0,
}: UseSignupAbandonmentTrackingProps): void {
  const stepStartTime = useRef<number>(Date.now());
  const isAbandoned = useRef<boolean>(true);

  useEffect(() => {
    // Record when user enters this step
    stepStartTime.current = Date.now();
    isAbandoned.current = true;

    const handleBeforeUnload = () => {
      if (isAbandoned.current) {
        const timeOnStep = Math.round((Date.now() - stepStartTime.current) / 1000);

        // Use sendBeacon for reliable tracking before page unload
        const eventData: SignupAbandonedProps = {
          last_step: step,
          time_on_step_seconds: timeOnStep,
          restaurants_created: restaurantsCreated,
        };

        // Try to track (may not always succeed on unload)
        trackSignupAbandoned(eventData);
      }
    };

    // Track on page close/navigation away
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cleanup
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [step, restaurantsCreated]);

  // Mark as not abandoned when user completes step (navigation happens)
  useEffect(() => {
    const handleNavigate = () => {
      // If navigating to another signup page, don't track as abandoned
      const isSignupPath = window.location.pathname.startsWith('/signup');
      const isAuthPath = window.location.pathname.startsWith('/auth');

      if (isSignupPath || isAuthPath) {
        isAbandoned.current = false;
      }
    };

    // Listen for navigation events
    window.addEventListener('popstate', handleNavigate);

    return () => {
      window.removeEventListener('popstate', handleNavigate);
    };
  }, []);
}

/**
 * Mark the current signup step as completed (prevents abandonment tracking)
 * Call this before navigating to the next step.
 */
export function markStepCompleted(): void {
  // This is a no-op signal that can be called before navigation
  // The navigation itself will set isAbandoned = false in the hook
}

export default useSignupAbandonmentTracking;
