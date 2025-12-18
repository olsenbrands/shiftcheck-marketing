/**
 * Authenticated Navbar
 * ShiftCheck Marketing Website
 *
 * Shared navigation bar for authenticated pages (signup flow, account pages).
 * Provides consistent navigation with ShiftCheck branding and sign out.
 */

import { Link, useNavigate } from 'react-router-dom';
import { LogOut, ChevronLeft } from 'lucide-react';
import { signOut } from '../services/authService';

interface AuthenticatedNavbarProps {
  /** Current section label (e.g., "Account", "Sign Up") */
  section?: string;
  /** Show back button instead of sign out */
  showBack?: boolean;
  /** Back button destination */
  backTo?: string;
  /** Back button label */
  backLabel?: string;
}

export default function AuthenticatedNavbar({
  section = 'Account',
  showBack = false,
  backTo = '/account/dashboard',
  backLabel = 'Back to Dashboard',
}: AuthenticatedNavbarProps) {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/" className="text-2xl font-bold text-primary-500">
              ShiftCheck
            </Link>
            <span className="text-gray-400">|</span>
            <span className="text-gray-600">{section}</span>
          </div>

          {showBack ? (
            <Link
              to={backTo}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ChevronLeft className="h-5 w-5 mr-1" />
              {backLabel}
            </Link>
          ) : (
            <button
              onClick={handleSignOut}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <LogOut className="h-5 w-5 mr-2" />
              Sign Out
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
