/**
 * Login Page
 * ShiftCheck Marketing Website
 *
 * Sign in existing users with email/password.
 */

import { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { signIn } from '../../services/authService';
import { ownerProfileExists } from '../../services/ownerService';
import { getSupabaseAuthErrorMessage, getNetworkErrorMessage } from '../../utils/errorMessages';
import ShiftCheckLogo from '../../components/ShiftCheckLogo';

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectParam = searchParams.get('redirect');

  // Pre-fill email from verification flow or signup
  const getInitialEmail = () => {
    return localStorage.getItem('verified_email') ||
           localStorage.getItem('signup_email') ||
           '';
  };

  const [email, setEmail] = useState(getInitialEmail);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorAction, setErrorAction] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setErrorAction(null);

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      const { user, error: signInError } = await signIn({ email, password });

      if (signInError) {
        // Get user-friendly error message
        const errorDetails = getSupabaseAuthErrorMessage(signInError);
        setError(errorDetails.message);
        setErrorAction(errorDetails.action || null);
        setLoading(false);
        return;
      }

      if (user) {
        // Check if owner profile exists to determine redirect
        const hasProfile = await ownerProfileExists();

        if (redirectParam) {
          // Use explicit redirect from URL param
          navigate(redirectParam);
        } else if (hasProfile) {
          // Profile exists, go to account dashboard
          navigate('/account/dashboard');
        } else {
          // No profile yet, continue sign-up flow
          navigate('/signup/profile');
        }
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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <ShiftCheckLogo size="md" showText={true} showTagline={true} />
        </div>

        <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link to="/auth/verify-email" className="font-medium text-primary-500 hover:text-primary-600">
            Sign up
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-lg sm:rounded-xl sm:px-10">
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
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Your password"
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

            {/* Forgot Password */}
            <div className="flex items-center justify-end">
              <Link
                to="/auth/forgot-password"
                className="text-sm font-medium text-primary-500 hover:text-primary-600"
              >
                Forgot your password?
              </Link>
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
                    Signing in...
                  </>
                ) : (
                  'Sign in'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
