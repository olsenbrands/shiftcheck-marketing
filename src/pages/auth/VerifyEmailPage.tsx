/**
 * Email Verification Page (Step 1)
 * ShiftCheck Marketing Website
 *
 * First step of sign-up flow - verify email address before account creation.
 * Uses Brevo for transactional email delivery.
 */

import { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Mail, Loader2, CheckCircle, ArrowRight, AlertCircle } from 'lucide-react';
import { sendVerificationEmail } from '../../services/authService';
import { extractReferralCodeFromURL, isValidReferralCode } from '../../utils/referral';
import { trackSignupStarted, trackEmailVerificationSent } from '../../services/analyticsService';
import { useSignupAbandonmentTracking } from '../../hooks/useSignupAbandonmentTracking';
import { useSignupProgress, checkIncompleteSignup } from '../../hooks/useSignupProgress';
import ResumeSignupModal from '../../components/ResumeSignupModal';
import SessionExpiredModal from '../../components/SessionExpiredModal';
import { getBrevoErrorMessage, getNetworkErrorMessage } from '../../utils/errorMessages';

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();

  // Track abandonment
  useSignupAbandonmentTracking({ step: 'email' });

  // Signup progress for resume functionality
  const { updateProgress, clearProgress } = useSignupProgress();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorAction, setErrorAction] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Resume signup modal state
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [resumeData, setResumeData] = useState<{
    step: string;
    email: string | null;
    resumeUrl: string;
  } | null>(null);

  // Session expired modal state
  const [showExpiredModal, setShowExpiredModal] = useState(false);
  const [expiredEmail, setExpiredEmail] = useState<string | null>(null);

  // Check for incomplete or expired signup on mount
  useEffect(() => {
    const incomplete = checkIncompleteSignup();

    // Check for expired session first
    if (incomplete.isExpired) {
      setExpiredEmail(incomplete.email);
      setShowExpiredModal(true);
      return;
    }

    // Check for resumable progress
    if (incomplete.hasIncomplete && incomplete.step !== 'email') {
      setResumeData({
        step: incomplete.step || 'email',
        email: incomplete.email,
        resumeUrl: incomplete.resumeUrl,
      });
      setShowResumeModal(true);
    }
  }, []);

  // Extract referral code from URL
  const referralCode = searchParams.get('ref') || extractReferralCodeFromURL(window.location.href);
  const hasValidReferral = referralCode && isValidReferralCode(referralCode);

  // Track signup started on mount (once)
  const hasTrackedStart = useRef(false);
  useEffect(() => {
    if (!hasTrackedStart.current) {
      hasTrackedStart.current = true;
      trackSignupStarted({
        source: hasValidReferral ? 'referral' : 'direct',
        referral_code: hasValidReferral ? referralCode : undefined,
      });
    }
  }, [hasValidReferral, referralCode]);

  // Validate email format
  const isValidEmail = EMAIL_REGEX.test(email);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setErrorAction(null);

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    if (!isValidEmail) {
      setError('Please enter a valid email address');
      setErrorAction('Make sure you enter a complete email like you@example.com');
      return;
    }

    setLoading(true);

    try {
      const result = await sendVerificationEmail(email);

      if (result.error) {
        // Get user-friendly error message
        const errorDetails = getBrevoErrorMessage(
          result.statusCode,
          result.errorCode,
          result.error
        );
        setError(errorDetails.message);
        setErrorAction(errorDetails.action || null);
        setLoading(false);
        return;
      }

      // Store email and referral code for later steps
      localStorage.setItem('signup_email', email);
      if (hasValidReferral) {
        localStorage.setItem('referral_code', referralCode);
      }

      // Track email verification sent
      trackEmailVerificationSent(email, false);

      // Update signup progress
      updateProgress('email', email);

      setEmailSent(true);
      startResendCooldown();
    } catch (err) {
      // Get user-friendly network error message
      const errorDetails = getNetworkErrorMessage(err);
      setError(errorDetails.message);
      setErrorAction(errorDetails.action || null);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;

    setLoading(true);
    setError(null);
    setErrorAction(null);

    try {
      const result = await sendVerificationEmail(email);

      if (result.error) {
        // Get user-friendly error message
        const errorDetails = getBrevoErrorMessage(
          result.statusCode,
          result.errorCode,
          result.error
        );
        setError(errorDetails.message);
        setErrorAction(errorDetails.action || null);
      } else {
        // Track resend
        trackEmailVerificationSent(email, true);
        startResendCooldown();
      }
    } catch (err) {
      // Get user-friendly network error message
      const errorDetails = getNetworkErrorMessage(err);
      setError(errorDetails.message);
      setErrorAction(errorDetails.action || null);
    } finally {
      setLoading(false);
    }
  };

  const startResendCooldown = () => {
    setResendCooldown(60);
    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Handle starting fresh - clear all progress and localStorage
  const handleStartFresh = () => {
    // Clear signup progress
    clearProgress();

    // Clear all signup-related localStorage
    localStorage.removeItem('signup_email');
    localStorage.removeItem('verified_email');
    localStorage.removeItem('email_verified');
    localStorage.removeItem('referral_code');
    localStorage.removeItem('selected_plan');
    localStorage.removeItem('restaurant_count');
    localStorage.removeItem('signup_restaurants');
    localStorage.removeItem('profile_step');
    localStorage.removeItem('profile_first_name');
    localStorage.removeItem('profile_last_name');
    localStorage.removeItem('profile_phone');
    localStorage.removeItem('profile_street');
    localStorage.removeItem('profile_city');
    localStorage.removeItem('profile_state');
    localStorage.removeItem('profile_zip');
    localStorage.removeItem('profile_country');

    setShowResumeModal(false);
    setResumeData(null);
  };

  // Success state - verification email sent
  if (emailSent) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow-lg sm:rounded-xl sm:px-10">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="mt-6 text-2xl font-bold text-gray-900">
                Check your email
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                We sent a verification link to
              </p>
              <p className="mt-1 text-sm font-medium text-gray-900">
                {email}
              </p>
              <p className="mt-4 text-sm text-gray-500">
                Click the link in your email to verify your address and continue setting up your ShiftCheck account.
              </p>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="mt-6 space-y-4">
              <p className="text-center text-sm text-gray-500">
                Didn't receive an email?{' '}
                <button
                  onClick={handleResend}
                  disabled={resendCooldown > 0 || loading}
                  className="font-medium text-primary-500 hover:text-primary-600 disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    'Sending...'
                  ) : resendCooldown > 0 ? (
                    `Resend in ${resendCooldown}s`
                  ) : (
                    'Resend email'
                  )}
                </button>
              </p>

              <button
                onClick={() => setEmailSent(false)}
                className="w-full text-center text-sm text-gray-500 hover:text-gray-700"
              >
                Use a different email address
              </button>
            </div>
          </div>

          <p className="mt-8 text-center text-sm text-gray-500">
            Already verified?{' '}
            <Link to="/auth/login" className="font-medium text-primary-500 hover:text-primary-600">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    );
  }

  // Initial state - email input form
  return (
    <>
      {/* Resume Signup Modal */}
      {resumeData && (
        <ResumeSignupModal
          isOpen={showResumeModal}
          onClose={() => setShowResumeModal(false)}
          onStartFresh={handleStartFresh}
          email={resumeData.email}
          currentStep={resumeData.step as 'email' | 'login' | 'profile' | 'restaurants' | 'plan' | 'payment' | 'complete'}
          resumeUrl={resumeData.resumeUrl}
        />
      )}

      {/* Session Expired Modal */}
      <SessionExpiredModal
        isOpen={showExpiredModal}
        onClose={() => setShowExpiredModal(false)}
        onStartFresh={handleStartFresh}
        email={expiredEmail}
      />

      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Get started with ShiftCheck
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Enter your email to begin setting up your account
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-lg sm:rounded-xl sm:px-10">
          {hasValidReferral && (
            <div className="mb-6 p-3 bg-primary-50 border border-primary-200 rounded-lg">
              <p className="text-sm text-primary-700">
                You're signing up with a referral code. You'll get 10% off your first month!
              </p>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-red-800">{error}</p>
                    {errorAction && (
                      <p className="mt-1 text-sm text-red-600">{errorAction}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`block w-full pl-10 pr-3 py-2 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                    email && !isValidEmail
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                      : 'border-gray-300'
                  }`}
                  placeholder="you@restaurant.com"
                />
              </div>
              {email && !isValidEmail && (
                <p className="mt-1 text-sm text-red-600">
                  Please enter a valid email address
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={loading || !isValidEmail}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin h-5 w-5 mr-2" />
                    Sending verification email...
                  </>
                ) : (
                  <>
                    Send verification email
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Already have an account?
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                to="/auth/login"
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Sign in instead
              </Link>
            </div>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-gray-500">
          By continuing, you agree to our{' '}
          <Link to="/terms" className="text-primary-500 hover:text-primary-600">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link to="/privacy" className="text-primary-500 hover:text-primary-600">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
    </>
  );
}
