/**
 * Sign Up Page (Step 1 & 2 Combined)
 * ShiftCheck Marketing Website
 *
 * Creates account with email/password, then redirects to profile step.
 */

import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { signUp } from '../../services/authService';
import { extractReferralCodeFromURL } from '../../utils/referral';
import { getSupabaseAuthErrorMessage, getNetworkErrorMessage, getDuplicateEmailMessage } from '../../utils/errorMessages';
import ShiftCheckLogo from '../../components/ShiftCheckLogo';

export default function SignUpPage() {
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorAction, setErrorAction] = useState<string | null>(null);
  const [isDuplicateEmail, setIsDuplicateEmail] = useState(false);
  const [success, setSuccess] = useState(false);

  // Extract referral code from URL
  const referralCode = searchParams.get('ref') || extractReferralCodeFromURL(window.location.href);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setErrorAction(null);

    // Validation
    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setErrorAction('Make sure both password fields match exactly.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      setErrorAction('Use a mix of letters, numbers, and symbols for a strong password.');
      return;
    }

    setLoading(true);

    try {
      const { user, error: signUpError } = await signUp({ email, password });

      if (signUpError) {
        // Check for duplicate email error
        const errorMessage = signUpError.message?.toLowerCase() || '';
        const isDuplicate =
          errorMessage.includes('already registered') ||
          errorMessage.includes('already exists') ||
          errorMessage.includes('user_already_exists') ||
          signUpError.code === 'user_already_exists' ||
          signUpError.code === 'email_exists';

        if (isDuplicate) {
          const duplicateError = getDuplicateEmailMessage();
          setError(duplicateError.message);
          setErrorAction(duplicateError.action || null);
          setIsDuplicateEmail(true);
        } else {
          // Get user-friendly error message
          const errorDetails = getSupabaseAuthErrorMessage(signUpError);
          setError(errorDetails.message);
          setErrorAction(errorDetails.action || null);
          setIsDuplicateEmail(false);
        }
        setLoading(false);
        return;
      }

      if (user) {
        // Store referral code in localStorage for later use
        if (referralCode) {
          localStorage.setItem('referral_code', referralCode);
        }

        // Store email for profile step
        localStorage.setItem('signup_email', email);

        // Show success message
        setSuccess(true);
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

  // Success state - email confirmation sent
  if (success) {
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
                We sent a verification link to <strong>{email}</strong>
              </p>
              <p className="mt-4 text-sm text-gray-500">
                Click the link in your email to verify your account and continue setting up ShiftCheck.
              </p>
            </div>

            <div className="mt-6">
              <p className="text-center text-sm text-gray-500">
                Didn't receive an email?{' '}
                <button
                  onClick={() => setSuccess(false)}
                  className="font-medium text-primary-500 hover:text-primary-600"
                >
                  Try again
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <ShiftCheckLogo size="md" showText={true} showTagline={true} />
        </div>

        <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/auth/login" className="font-medium text-primary-500 hover:text-primary-600">
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-lg sm:rounded-xl sm:px-10">
          {referralCode && (
            <div className="mb-6 p-3 bg-primary-50 border border-primary-200 rounded-lg">
              <p className="text-sm text-primary-700">
                You're signing up with a referral code. You'll get 10% off your first month!
              </p>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className={`p-4 border rounded-lg ${isDuplicateEmail ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200'}`}>
                <div className="flex items-start">
                  <AlertCircle className={`h-5 w-5 mt-0.5 mr-2 shrink-0 ${isDuplicateEmail ? 'text-amber-500' : 'text-red-500'}`} />
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${isDuplicateEmail ? 'text-amber-800' : 'text-red-800'}`}>{error}</p>
                    {errorAction && (
                      <p className={`mt-1 text-sm ${isDuplicateEmail ? 'text-amber-600' : 'text-red-600'}`}>{errorAction}</p>
                    )}
                    {isDuplicateEmail && (
                      <div className="mt-3 flex flex-col sm:flex-row gap-2">
                        <Link
                          to="/auth/login"
                          className="inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        >
                          Sign in instead
                        </Link>
                        <Link
                          to="/auth/forgot-password"
                          className="inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        >
                          Forgot password?
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Email */}
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
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="At least 8 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm password
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Confirm your password"
                />
              </div>
            </div>

            {/* Submit */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin h-5 w-5 mr-2" />
                    Creating account...
                  </>
                ) : (
                  'Create account'
                )}
              </button>
            </div>
          </form>

          <p className="mt-6 text-xs text-center text-gray-500">
            By creating an account, you agree to our{' '}
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
    </div>
  );
}
