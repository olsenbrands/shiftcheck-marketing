/**
 * Resume Signup Modal
 * ShiftCheck Marketing Website
 *
 * Shown when a user returns to the signup flow with incomplete progress.
 * Offers to resume where they left off or start fresh.
 */

import { X, ArrowRight, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SignupStep, getStepDescription, getStepNumber } from '../hooks/useSignupProgress';

interface ResumeSignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartFresh: () => void;
  email: string | null;
  currentStep: SignupStep;
  resumeUrl: string;
}

export default function ResumeSignupModal({
  isOpen,
  onClose,
  onStartFresh,
  email,
  currentStep,
  resumeUrl,
}: ResumeSignupModalProps) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleResume = () => {
    onClose();
    navigate(resumeUrl);
  };

  const handleStartFresh = () => {
    onStartFresh();
    onClose();
  };

  const stepNumber = getStepNumber(currentStep);
  const stepDescription = getStepDescription(currentStep);

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
            <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-primary-100 mb-4">
              <RefreshCw className="h-7 w-7 text-primary-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              Welcome back!
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              We found an incomplete sign-up
              {email && (
                <>
                  {' '}for <span className="font-medium">{email}</span>
                </>
              )}
            </p>
          </div>

          {/* Progress indicator */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Your progress</span>
              <span className="text-sm font-medium text-primary-500">
                Step {stepNumber} of 7
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div
                className="bg-primary-500 h-2 rounded-full transition-all"
                style={{ width: `${(stepNumber / 7) * 100}%` }}
              />
            </div>
            <p className="text-sm text-gray-600">
              You were on: <span className="font-medium">{stepDescription}</span>
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={handleResume}
              className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
            >
              Continue where I left off
              <ArrowRight className="ml-2 h-4 w-4" />
            </button>

            <button
              onClick={handleStartFresh}
              className="w-full flex items-center justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
            >
              Start fresh
            </button>
          </div>

          {/* Note */}
          <p className="mt-4 text-xs text-center text-gray-500">
            Starting fresh will clear your saved progress
          </p>
        </div>
      </div>
    </div>
  );
}
