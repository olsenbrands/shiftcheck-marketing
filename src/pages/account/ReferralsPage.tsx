/**
 * Account Referrals Page
 * ShiftCheck Marketing Website
 *
 * Share referral code and view referral stats/discounts.
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Users,
  Copy,
  Check,
  Share2,
  Gift,
  Loader2,
  DollarSign,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { getOwnerProfile, type Owner } from '../../services/ownerService';
import {
  getMyReferrals,
  getReferralStats,
  type ReferralRedemption,
  type ReferralStats,
} from '../../services/referralService';
import { generateReferralLink } from '../../utils/referral';

export default function ReferralsPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [owner, setOwner] = useState<Owner | null>(null);
  const [referrals, setReferrals] = useState<ReferralRedemption[]>([]);
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<'code' | 'link' | null>(null);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      if (!user) return;

      const { owner: ownerData } = await getOwnerProfile();
      if (!ownerData) {
        navigate('/signup/profile');
        return;
      }
      setOwner(ownerData);

      // Load referrals and stats
      const [referralsResult, statsResult] = await Promise.all([
        getMyReferrals(),
        getReferralStats(),
      ]);

      if (referralsResult.referrals) {
        setReferrals(referralsResult.referrals);
      }
      if (statsResult.stats) {
        setStats(statsResult.stats);
      }

      setLoading(false);
    };

    if (!authLoading) {
      loadData();
    }
  }, [user, authLoading, navigate]);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth/login?redirect=/account/referrals');
    }
  }, [user, authLoading, navigate]);

  const handleCopyCode = async () => {
    if (!owner?.referral_code) return;

    try {
      await navigator.clipboard.writeText(owner.referral_code);
      setCopied('code');
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleCopyLink = async () => {
    if (!owner?.referral_code) return;

    try {
      const link = generateReferralLink(owner.referral_code);
      await navigator.clipboard.writeText(link);
      setCopied('link');
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleShare = async () => {
    if (!owner?.referral_code) return;

    const link = generateReferralLink(owner.referral_code);
    const shareData = {
      title: 'Join ShiftCheck',
      text: 'Check out ShiftCheck - the restaurant task verification app. Use my referral code for 10% off your first month!',
      url: link,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback to copy link
        handleCopyLink();
      }
    } catch (err) {
      console.error('Share failed:', err);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-primary-500" />
      </div>
    );
  }

  const referralLink = owner?.referral_code
    ? generateReferralLink(owner.referral_code)
    : '';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center">
            <Link
              to="/account/dashboard"
              className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Referrals</h1>
          <p className="mt-1 text-gray-600">
            Share ShiftCheck and earn rewards
          </p>
        </div>

        {/* How It Works */}
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl shadow-lg p-6 mb-8 text-white">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <Gift className="h-6 w-6 mr-2" />
            How Referrals Work
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3">
                <span className="text-xl font-bold">1</span>
              </div>
              <h3 className="font-semibold mb-1">Share Your Code</h3>
              <p className="text-sm text-primary-100">
                Give friends your unique referral code
              </p>
            </div>
            <div className="text-center">
              <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3">
                <span className="text-xl font-bold">2</span>
              </div>
              <h3 className="font-semibold mb-1">They Sign Up</h3>
              <p className="text-sm text-primary-100">
                They get 10% off their first month
              </p>
            </div>
            <div className="text-center">
              <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3">
                <span className="text-xl font-bold">3</span>
              </div>
              <h3 className="font-semibold mb-1">You Earn</h3>
              <p className="text-sm text-primary-100">
                You get 10% off your next month
              </p>
            </div>
          </div>
        </div>

        {/* Your Referral Code */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Users className="h-5 w-5 mr-2 text-primary-500" />
              Your Referral Code
            </h2>
          </div>
          <div className="p-6">
            {/* Referral Code */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-500 mb-2">
                Code
              </label>
              <div className="flex">
                <div className="flex-1 bg-gray-50 border border-gray-300 rounded-l-lg px-4 py-3 font-mono text-lg text-gray-900">
                  {owner?.referral_code || 'Loading...'}
                </div>
                <button
                  onClick={handleCopyCode}
                  className="px-4 py-3 bg-primary-500 text-white rounded-r-lg hover:bg-primary-600 transition-colors flex items-center"
                >
                  {copied === 'code' ? (
                    <>
                      <Check className="h-5 w-5 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-5 w-5 mr-2" />
                      Copy
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Referral Link */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-500 mb-2">
                Shareable Link
              </label>
              <div className="flex">
                <div className="flex-1 bg-gray-50 border border-gray-300 rounded-l-lg px-4 py-3 text-gray-600 truncate">
                  {referralLink}
                </div>
                <button
                  onClick={handleCopyLink}
                  className="px-4 py-3 bg-primary-500 text-white rounded-r-lg hover:bg-primary-600 transition-colors flex items-center"
                >
                  {copied === 'link' ? (
                    <>
                      <Check className="h-5 w-5 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-5 w-5 mr-2" />
                      Copy
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Share Button */}
            <button
              onClick={handleShare}
              className="w-full flex items-center justify-center px-6 py-3 bg-primary-50 text-primary-500 rounded-lg font-medium hover:bg-primary-100 transition-colors"
            >
              <Share2 className="h-5 w-5 mr-2" />
              Share via...
            </button>
          </div>
        </div>

        {/* Referral Stats */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <DollarSign className="h-5 w-5 mr-2 text-primary-500" />
              Your Rewards
            </h2>
          </div>
          <div className="p-6">
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-3xl font-bold text-gray-900">
                  {stats?.totalReferrals || 0}
                </p>
                <p className="text-sm text-gray-500">Referrals Made</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-3xl font-bold text-primary-500">
                  ${((stats?.totalDiscountEarned || 0) / 100).toFixed(2)}
                </p>
                <p className="text-sm text-gray-500">Total Savings</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-3xl font-bold text-gray-900">
                  {stats?.activeDiscounts || 0}
                </p>
                <p className="text-sm text-gray-500">Active Discounts</p>
              </div>
            </div>

            <p className="mt-4 text-center text-sm text-gray-500">
              Referral rewards are applied automatically to your next billing cycle
            </p>
          </div>
        </div>

        {/* Successful Referrals List */}
        {referrals.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <Users className="h-5 w-5 mr-2 text-primary-500" />
                Your Referrals
              </h2>
            </div>
            <div className="divide-y divide-gray-200">
              {referrals.map((referral) => {
                const isExpired = referral.discount_expires_at
                  ? new Date(referral.discount_expires_at) < new Date()
                  : false;
                const expiresDate = referral.discount_expires_at
                  ? new Date(referral.discount_expires_at).toLocaleDateString()
                  : null;

                return (
                  <div key={referral.id} className="px-6 py-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">
                        Referral #{referral.id.slice(0, 8)}
                      </p>
                      <p className="text-sm text-gray-500">
                        Signed up {new Date(referral.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      {referral.discount_applied ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-700">
                          Discount Applied: ${((referral.discount_amount_cents || 0) / 100).toFixed(2)}
                        </span>
                      ) : isExpired ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                          Expired
                        </span>
                      ) : (
                        <div>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                            Pending
                          </span>
                          {expiresDate && (
                            <p className="text-xs text-gray-500 mt-1">
                              Expires: {expiresDate}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Active Discounts */}
        {stats && stats.activeDiscounts > 0 && (
          <div className="bg-primary-50 border border-primary-200 rounded-xl p-6 mb-8">
            <div className="flex items-center mb-4">
              <Gift className="h-6 w-6 text-primary-500 mr-3" />
              <h3 className="font-semibold text-primary-800">
                You have {stats.activeDiscounts} active discount{stats.activeDiscounts !== 1 ? 's' : ''}!
              </h3>
            </div>
            <div className="space-y-3">
              {referrals
                .filter(
                  (r) =>
                    !r.discount_applied &&
                    r.discount_expires_at &&
                    new Date(r.discount_expires_at) > new Date()
                )
                .map((referral) => (
                  <div
                    key={referral.id}
                    className="bg-white rounded-lg p-4 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium text-gray-900">10% off your next month</p>
                      <p className="text-sm text-gray-500">
                        From referral on {new Date(referral.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-primary-500">
                        Expires: {new Date(referral.discount_expires_at!).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
            <p className="mt-4 text-sm text-primary-700">
              Discounts are automatically applied to your next billing cycle
            </p>
          </div>
        )}

        {/* Referred By */}
        {owner?.referred_by_code && (
          <div className="bg-primary-50 border border-primary-200 rounded-xl p-6">
            <div className="flex items-center">
              <Gift className="h-8 w-8 text-primary-500 mr-4" />
              <div>
                <h3 className="font-semibold text-primary-800">You were referred!</h3>
                <p className="text-sm text-primary-700">
                  You signed up with referral code: {owner.referred_by_code}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
