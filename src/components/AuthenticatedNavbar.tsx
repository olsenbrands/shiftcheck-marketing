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
            <Link to="/" className="flex items-center gap-2">
              {/* Camera Logo */}
              <svg width="32" height="32" viewBox="0 0 200 200" className="flex-shrink-0">
                {/* Camera top (flash/viewfinder) */}
                <rect x="70" y="30" width="60" height="25" rx="8" fill="#435b20" />
                {/* Camera body */}
                <rect x="30" y="50" width="140" height="110" rx="15" fill="#6c8f32" />
                {/* Lens circle (white) */}
                <circle cx="100" cy="105" r="45" fill="#ffffff" />
                {/* Checkmark */}
                <path
                  d="M 75 105 L 92 122 L 125 85"
                  stroke="#6c8f32"
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
                {/* Flash dot */}
                <circle cx="150" cy="75" r="8" fill="#C55E30" />
              </svg>
              <span className="text-2xl font-bold text-primary-500">ShiftCheck</span>
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
