/**
 * Session Expired Modal
 * ShiftCheck Marketing Website
 *
 * Shown when a user returns to the signup flow but their session has expired.
 * Offers to start fresh with a new signup.
 */

import { X, Clock, ArrowRight } from 'lucide-react';

interface SessionExpiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartFresh: () => void;
  email: string | null;
}

export default function SessionExpiredModal({
  isOpen,
  onClose,
  onStartFresh,
  email,
}: SessionExpiredModalProps) {
  if (!isOpen) return null;

  const handleStartFresh = () => {
    onStartFresh();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6 transform transition-all">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Header */}
          <div className="text-center mb-6">
            <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-amber-100 mb-4">
              <Clock className="h-7 w-7 text-amber-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              Session Expired
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Your previous sign-up session has expired
              {email && (
                <>
                  {' '}for <span className="font-medium">{email}</span>
                </>
              )}
            </p>
          </div>

          {/* Explanation */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600">
              For security reasons, sign-up sessions expire after 72 hours of inactivity.
              Don't worry - you can start a new sign-up with the same email address.
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={handleStartFresh}
              className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
            >
              Start New Sign-Up
              <ArrowRight className="ml-2 h-4 w-4" />
            </button>

            <button
              onClick={onClose}
              className="w-full flex items-center justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
            >
              Close
            </button>
          </div>

          {/* Note */}
          <p className="mt-4 text-xs text-center text-gray-500">
            Any previously entered information will need to be re-entered
          </p>
        </div>
      </div>
    </div>
  );
}
