/**
 * Auth Callback Page
 * ShiftCheck Marketing Website
 *
 * Handles OAuth redirects and email verification callbacks.
 * Redirects to appropriate page after processing.
 */

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Loader2, CheckCircle, AlertCircle, RefreshCw, Mail } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { ownerProfileExists } from '../../services/ownerService';
import { trackEmailVerified } from '../../services/analyticsService';
import { sendVerificationEmail } from '../../services/authService';
import { getVerificationErrorMessage, getNetworkErrorMessage } from '../../utils/errorMessages';

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [errorAction, setErrorAction] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<'expired' | 'invalid' | 'network' | 'generic' | null>(null);
  const [emailVerified, setEmailVerified] = useState(false);
  const [verifiedEmail, setVerifiedEmail] = useState<string | null>(null);
  const [storedEmail, setStoredEmail] = useState<string | null>(null);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Check if this is an email verification callback
        const callbackType = searchParams.get('type');
        const token = searchParams.get('token');

        if (callbackType === 'email_verification' && token) {
          await handleEmailVerification(token);
          return;
        }

        // Standard OAuth/Supabase callback
        // Get session from URL hash (Supabase puts it there)
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          setError(sessionError.message);
          return;
        }

        if (session) {
          // User is authenticated, check if profile exists
          const hasProfile = await ownerProfileExists();

          if (hasProfile) {
            // Profile exists, go to dashboard
            navigate('/account/dashboard');
          } else {
            // No profile yet, continue sign-up flow
            navigate('/signup/profile');
          }
        } else {
          // No session, redirect to login
          navigate('/auth/login');
        }
      } catch (err) {
        setError('An error occurred during authentication');
      }
    };

    const handleEmailVerification = async (token: string) => {
      // Try to get email from localStorage for resend functionality
      const savedEmail = localStorage.getItem('signup_email');
      if (savedEmail) {
        setStoredEmail(savedEmail);
      }

      try {
        // Verify the token via API
        const response = await fetch('/api/auth/verify-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (!response.ok || !data.valid) {
          // Determine the type of error
          const errorString = data.error?.toLowerCase() || '';
          const errorCode = data.code || data.error || '';

          let detectedErrorType: 'expired' | 'invalid' | 'network' | 'generic' = 'generic';

          if (
            errorString.includes('expired') ||
            errorString.includes('token has expired') ||
            errorCode === 'expired'
          ) {
            detectedErrorType = 'expired';
          } else if (
            errorString.includes('invalid') ||
            errorString.includes('malformed') ||
            errorCode === 'invalid'
          ) {
            detectedErrorType = 'invalid';
          }

          // Get user-friendly error message
          const errorDetails = getVerificationErrorMessage(detectedErrorType);
          setError(errorDetails.message);
          setErrorAction(errorDetails.action || null);
          setErrorType(detectedErrorType);

          // Store email from response if available (for resend)
          if (data.email) {
            setStoredEmail(data.email);
          }
          return;
        }

        // Token is valid, store verified email and show success
        setVerifiedEmail(data.email);
        setEmailVerified(true);

        // Track email verified event
        trackEmailVerified(data.email);

        // Update signup progress
        const progressData = { currentStep: 'login' as const, email: data.email, lastUpdated: Date.now(), expiresAt: Date.now() + 72 * 60 * 60 * 1000 };
        localStorage.setItem('signup_progress', JSON.stringify(progressData));

        // Store verified email in localStorage for sign-up flow
        localStorage.setItem('verified_email', data.email);
        localStorage.setItem('email_verified', 'true');

      } catch (err) {
        // Network or unexpected error
        const errorDetails = getNetworkErrorMessage(err);
        setError(errorDetails.message);
        setErrorAction(errorDetails.action || null);
        setErrorType('network');
      }
    };

    handleCallback();
  }, [navigate, searchParams]);

  // Handle resending verification email
  const handleResendVerification = async () => {
    if (!storedEmail || resendCooldown > 0) return;

    setResendLoading(true);
    setResendSuccess(false);

    try {
      const result = await sendVerificationEmail(storedEmail);

      if (result.success) {
        setResendSuccess(true);
        // Start cooldown
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
      } else {
        setError(result.error || 'Failed to resend verification email');
      }
    } catch {
      setError('Failed to resend verification email. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  // Email verification success state
  if (emailVerified && verifiedEmail) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow-lg sm:rounded-xl sm:px-10">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="mt-6 text-2xl font-bold text-gray-900">
                Email verified!
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Your email <strong>{verifiedEmail}</strong> has been verified.
              </p>
              <p className="mt-4 text-sm text-gray-500">
                Continue to create your account.
              </p>
              <button
                onClick={() => navigate('/auth/signup')}
                className="mt-6 w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
              >
                Continue to sign up
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    const isExpiredOrInvalid = errorType === 'expired' || errorType === 'invalid';
    const canResend = isExpiredOrInvalid && storedEmail;

    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow-lg sm:rounded-xl sm:px-10">
            <div className="text-center">
              {/* Error Icon */}
              <div className={`mx-auto flex items-center justify-center h-16 w-16 rounded-full ${
                errorType === 'expired' ? 'bg-amber-100' : 'bg-red-100'
              }`}>
                {errorType === 'expired' ? (
                  <RefreshCw className="h-8 w-8 text-amber-600" />
                ) : (
                  <AlertCircle className="h-8 w-8 text-red-600" />
                )}
              </div>

              {/* Error Title */}
              <h2 className={`mt-6 text-xl font-bold ${
                errorType === 'expired' ? 'text-amber-700' : 'text-red-600'
              }`}>
                {errorType === 'expired' ? 'Verification Link Expired' :
                 errorType === 'invalid' ? 'Invalid Verification Link' :
                 'Verification Error'}
              </h2>

              {/* Error Message */}
              <p className="mt-2 text-sm text-gray-600">{error}</p>
              {errorAction && (
                <p className="mt-1 text-sm text-gray-500">{errorAction}</p>
              )}

              {/* Resend Success Message */}
              {resendSuccess && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                    <p className="text-sm text-green-700">
                      Verification email sent to <strong>{storedEmail}</strong>
                    </p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="mt-6 space-y-3">
                {/* Resend Button (for expired/invalid links with known email) */}
                {canResend && !resendSuccess && (
                  <button
                    onClick={handleResendVerification}
                    disabled={resendLoading || resendCooldown > 0}
                    className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {resendLoading ? (
                      <>
                        <Loader2 className="animate-spin h-5 w-5 mr-2" />
                        Sending...
                      </>
                    ) : resendCooldown > 0 ? (
                      `Resend in ${resendCooldown}s`
                    ) : (
                      <>
                        <Mail className="h-5 w-5 mr-2" />
                        Send new verification email
                      </>
                    )}
                  </button>
                )}

                {/* Start Over (for cases without email) */}
                {!canResend && (
                  <Link
                    to="/signup/verify-email"
                    className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                  >
                    <Mail className="h-5 w-5 mr-2" />
                    Start over with new email
                  </Link>
                )}

                {/* Sign In Link */}
                <Link
                  to="/auth/login"
                  className="w-full flex justify-center items-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                >
                  Already have an account? Sign in
                </Link>
              </div>

              {/* Email hint if we have stored email */}
              {storedEmail && (
                <p className="mt-4 text-xs text-gray-500">
                  Email on file: {storedEmail}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-lg sm:rounded-xl sm:px-10">
          <div className="text-center">
            <Loader2 className="animate-spin h-8 w-8 mx-auto text-emerald-600" />
            <p className="mt-4 text-sm text-gray-600">Verifying your account...</p>
          </div>
        </div>
      </div>
    </div>
  );
}
