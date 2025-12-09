/**
 * Invite Manager Modal
 * ShiftCheck Marketing Website
 *
 * Simplified version of shiftcheck-app's InviteManagerModal.
 * Sends SMS invitation to manager and updates database.
 * Syncs with shiftcheck-app Owner Dashboard.
 */

import { useState, useEffect } from 'react';
import {
  X,
  Send,
  Loader2,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import {
  sendManagerInvitationSms,
  markInvitationSent,
  type Restaurant,
} from '../services/restaurantService';
import { formatPhoneForDisplay } from '../utils/phone';

interface InviteManagerModalProps {
  restaurant: Restaurant;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedRestaurant: Restaurant) => void;
}

export default function InviteManagerModal({
  restaurant,
  isOpen,
  onClose,
  onSuccess,
}: InviteManagerModalProps) {
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showLateNightWarning, setShowLateNightWarning] = useState(false);

  // Check if it's late night (9 PM - 6 AM)
  useEffect(() => {
    const hour = new Date().getHours();
    setShowLateNightWarning(hour >= 21 || hour < 6);
  }, [isOpen]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSuccess(false);
      setError(null);
      setSending(false);
    }
  }, [isOpen]);

  const managerFirstName = restaurant.manager_name?.split(' ')[0] || 'Manager';
  const managerPhone = restaurant.manager_phone;

  const handleSendInvitation = async () => {
    if (!managerPhone) {
      setError('No manager phone number set for this restaurant');
      return;
    }

    setSending(true);
    setError(null);

    try {
      // Step 1: Send SMS
      const smsResult = await sendManagerInvitationSms(
        managerPhone,
        restaurant.name,
        managerFirstName
      );

      if (!smsResult.success) {
        throw new Error(smsResult.error || 'Failed to send SMS');
      }

      // Step 2: Update database (syncs with shiftcheck-app)
      const { restaurant: updated, error: dbError } = await markInvitationSent(
        restaurant.id,
        managerPhone
      );

      if (dbError) {
        console.error('Failed to update database:', dbError);
        // SMS was sent, so show partial success
        setError('SMS sent but failed to update status. Please refresh the page.');
        setSuccess(true);
        return;
      }

      setSuccess(true);

      // Notify parent after brief delay to show success state
      setTimeout(() => {
        if (updated) {
          onSuccess(updated);
        }
        onClose();
      }, 2000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send invitation');
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-md transform rounded-2xl bg-white p-6 shadow-xl transition-all">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Invite Manager
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Success State */}
          {success ? (
            <div className="text-center py-8">
              <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Invitation Sent!
              </h3>
              <p className="text-gray-600">
                SMS sent to {formatPhoneForDisplay(managerPhone || '')}
              </p>
            </div>
          ) : (
            <>
              {/* Restaurant & Manager Info */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <p className="text-sm text-gray-500 mb-1">Restaurant</p>
                <p className="font-medium text-gray-900">{restaurant.name}</p>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500 mb-1">Manager</p>
                  <p className="font-medium text-gray-900">
                    {restaurant.manager_name || 'Not set'}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {formatPhoneForDisplay(managerPhone || '')}
                  </p>
                </div>
              </div>

              {/* Late Night Warning */}
              {showLateNightWarning && (
                <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start">
                  <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 mr-3 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-amber-800">
                      Late Night Warning
                    </p>
                    <p className="text-sm text-amber-700 mt-1">
                      It's currently late. Your manager may not receive this message until morning.
                    </p>
                  </div>
                </div>
              )}

              {/* Message Preview */}
              <div className="mb-6">
                <div className="flex items-center text-sm text-gray-500 mb-2">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Message Preview
                </div>
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                  <p className="text-sm text-gray-700">
                    Hi {managerFirstName}! You've been invited to manage{' '}
                    <span className="font-medium">{restaurant.name}</span> on
                    ShiftCheck. Complete your signup here:{' '}
                    <span className="text-emerald-600 underline">
                      shiftcheck.app/manager/signup
                    </span>
                  </p>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start">
                  <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-3 shrink-0" />
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Already Invited Warning */}
              {restaurant.invitation_sent && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start">
                  <Clock className="h-5 w-5 text-blue-500 mt-0.5 mr-3 shrink-0" />
                  <div>
                    <p className="text-sm text-blue-700">
                      An invitation was already sent
                      {restaurant.invitation_sent_at && (
                        <> on {new Date(restaurant.invitation_sent_at).toLocaleDateString()}</>
                      )}
                      . Sending again will resend to the same number.
                    </p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendInvitation}
                  disabled={sending || !managerPhone}
                  className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {sending ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5 mr-2" />
                      Send Invitation
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
