/**
 * Email Verification Page (DEPRECATED - Redirects to Signup)
 * ShiftCheck Marketing Website
 *
 * This page has been deprecated. The new signup flow collects email+password
 * together on /auth/signup. This page now redirects to the new signup page,
 * preserving any referral codes in the URL.
 */

import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

export default function VerifyEmailPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Preserve referral code if present
    const ref = searchParams.get('ref');
    const redirectUrl = ref ? `/auth/signup?ref=${ref}` : '/auth/signup';

    // Redirect to the new signup page
    navigate(redirectUrl, { replace: true });
  }, [navigate, searchParams]);

  // Show loading state while redirecting
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-lg sm:rounded-xl sm:px-10">
          <div className="text-center">
            <Loader2 className="animate-spin h-8 w-8 mx-auto text-primary-500" />
            <p className="mt-4 text-sm text-gray-600">Redirecting to sign up...</p>
          </div>
        </div>
      </div>
    </div>
  );
}
