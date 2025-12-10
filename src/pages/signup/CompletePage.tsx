/**
 * Sign-Up Complete Page (Step 7)
 * ShiftCheck Marketing Website
 *
 * Congratulates user on completing sign-up.
 * Shows account summary and download links.
 */

import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CheckCircle, Download, Store, Loader2, ExternalLink } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { getOwnerProfile, markSignUpCompleted, type Owner } from '../../services/ownerService';
import { getOwnerRestaurants, activateRestaurantsUpToLimit, type Restaurant } from '../../services/restaurantService';
import {
  createFreeTrialSubscription,
  getOwnerSubscription,
  type Subscription,
} from '../../services/subscriptionService';
import { sendWelcomeEmail } from '../../services/emailService';
import { trackSignupCompleted, identifyUser } from '../../services/analyticsService';
import { useSignupProgress } from '../../hooks/useSignupProgress';

export default function CompletePage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { clearProgress } = useSignupProgress();

  const [owner, setOwner] = useState<Owner | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState(false);

  // Load data and activate restaurants
  useEffect(() => {
    const loadAndActivate = async () => {
      if (!user) return;

      // Load owner profile
      const { owner: ownerData } = await getOwnerProfile();
      if (!ownerData) {
        navigate('/signup/profile');
        return;
      }
      setOwner(ownerData);

      // Load restaurants
      const { restaurants: restaurantData } = await getOwnerRestaurants();
      setRestaurants(restaurantData);

      // Mark sign-up as completed if not already and send welcome email
      if (!ownerData.sign_up_completed_at) {
        await markSignUpCompleted();

        // Send welcome email
        try {
          await sendWelcomeEmail(
            ownerData.email,
            ownerData.first_name,
            ownerData.last_name
          );
          console.log('Welcome email sent to:', ownerData.email);
        } catch (emailError) {
          // Don't block on email failure
          console.error('Failed to send welcome email:', emailError);
        }
      }

      // Get selected plan from localStorage
      const selectedPlan = localStorage.getItem('selected_plan');
      const restaurantCount = parseInt(localStorage.getItem('restaurant_count') || '1', 10);

      // Create subscription based on plan
      setActivating(true);

      if (selectedPlan === 'free_starter') {
        // Create free trial subscription
        const { subscription: newSub, error: subError } = await createFreeTrialSubscription();
        if (subError) {
          console.error('Failed to create free trial subscription:', subError);
        } else {
          setSubscription(newSub);
        }
      } else {
        // For paid plans, subscription is created via Stripe webhook
        // Just fetch any existing subscription
        const { subscription: existingSub } = await getOwnerSubscription();
        setSubscription(existingSub);
      }

      // For free_starter, activate 1 restaurant
      // For grow/expand, activate up to the count they're paying for
      let maxActive = 1;
      if (selectedPlan === 'grow') {
        maxActive = Math.min(restaurantCount, 3);
      } else if (selectedPlan === 'expand') {
        maxActive = restaurantCount;
      }

      await activateRestaurantsUpToLimit(maxActive);

      // Refresh restaurant list
      const { restaurants: updatedRestaurants } = await getOwnerRestaurants();
      setRestaurants(updatedRestaurants);

      // Track signup completion and identify user
      const referralCode = localStorage.getItem('referral_code');
      trackSignupCompleted({
        plan_name: selectedPlan || 'free_starter',
        restaurant_count: restaurantData.length,
        has_referral: !!referralCode,
      });

      // Identify user for analytics
      identifyUser({
        userId: user.id,
        email: ownerData.email,
        firstName: ownerData.first_name,
        lastName: ownerData.last_name,
        phone: ownerData.phone,
        plan: selectedPlan || 'free_starter',
        createdAt: ownerData.created_at,
      });

      // Clear localStorage
      localStorage.removeItem('selected_plan');
      localStorage.removeItem('restaurant_count');
      localStorage.removeItem('signup_email');
      localStorage.removeItem('referral_code');

      // Clear signup progress tracking
      clearProgress();

      setActivating(false);
      setLoading(false);
    };

    if (!authLoading) {
      loadAndActivate();
    }
  }, [user, authLoading, navigate]);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth/login');
    }
  }, [user, authLoading, navigate]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-emerald-600 mb-4" />
        <p className="text-gray-600">
          {activating ? 'Activating your restaurants...' : 'Loading...'}
        </p>
      </div>
    );
  }

  const activeRestaurants = restaurants.filter((r) => r.is_active);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-emerald-100">
            <CheckCircle className="h-10 w-10 text-emerald-600" />
          </div>
          <h1 className="mt-6 text-3xl font-bold text-gray-900">
            Welcome to ShiftCheck!
          </h1>
          <p className="mt-2 text-gray-600">
            Your account is set up and ready to go
          </p>
        </div>

        {/* Account Summary */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="px-6 py-4 bg-emerald-600">
            <h2 className="text-lg font-semibold text-white">Account Summary</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Owner</span>
              <span className="font-medium text-gray-900">
                {owner?.first_name} {owner?.last_name}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Email</span>
              <span className="font-medium text-gray-900">{owner?.email}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Active Restaurants</span>
              <span className="font-medium text-emerald-600">
                {activeRestaurants.length} of {restaurants.length}
              </span>
            </div>
            {subscription && (
              <>
                <div className="border-t pt-4 flex justify-between items-center">
                  <span className="text-gray-600">Plan</span>
                  <span className="font-medium text-gray-900 capitalize">
                    {subscription.plan_type.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Status</span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      subscription.status === 'active' || subscription.status === 'trialing'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {subscription.status === 'trialing' ? 'Free Trial' : subscription.status}
                  </span>
                </div>
                {subscription.trial_end && subscription.status === 'trialing' && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Trial Ends</span>
                    <span className="font-medium text-gray-900">
                      {new Date(subscription.trial_end).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Restaurant List */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Store className="h-5 w-5 mr-2 text-emerald-600" />
              Your Restaurants
            </h2>
          </div>
          <div className="divide-y divide-gray-200">
            {restaurants.map((restaurant) => (
              <div key={restaurant.id} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">{restaurant.name}</h3>
                  <p className="text-sm text-gray-500">{restaurant.restaurant_address}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    restaurant.is_active
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {restaurant.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Download CTA */}
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl shadow-lg p-8 text-center text-white mb-8">
          <Download className="h-12 w-12 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Download the ShiftCheck App</h2>
          <p className="mb-6 text-emerald-100">
            Download directly from our website. Your managers and team members need the app to complete tasks.
          </p>
          <a
            href="https://app.shiftcheck.app/download"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-8 py-4 bg-white text-emerald-600 rounded-lg font-semibold text-lg hover:bg-emerald-50 transition-colors shadow-md"
          >
            <Download className="w-6 h-6 mr-2" />
            Download App
          </a>
          <p className="mt-4 text-emerald-200 text-sm">
            Works on iPhone, Android, and desktop browsers
          </p>
        </div>

        {/* Next Steps */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">What's Next?</h2>
          <ul className="space-y-3">
            <li className="flex items-start">
              <span className="flex items-center justify-center h-6 w-6 rounded-full bg-emerald-100 text-emerald-600 text-sm font-medium mr-3">
                1
              </span>
              <span className="text-gray-600">
                Download the ShiftCheck app on your managers' devices
              </span>
            </li>
            <li className="flex items-start">
              <span className="flex items-center justify-center h-6 w-6 rounded-full bg-emerald-100 text-emerald-600 text-sm font-medium mr-3">
                2
              </span>
              <span className="text-gray-600">
                Managers log in with their phone number and create checklists
              </span>
            </li>
            <li className="flex items-start">
              <span className="flex items-center justify-center h-6 w-6 rounded-full bg-emerald-100 text-emerald-600 text-sm font-medium mr-3">
                3
              </span>
              <span className="text-gray-600">
                Team members pair their devices and start completing tasks
              </span>
            </li>
          </ul>
        </div>

        {/* Account Portal Link */}
        <div className="mt-8 text-center">
          <Link
            to="/account/dashboard"
            className="inline-flex items-center text-emerald-600 hover:text-emerald-700 font-medium"
          >
            Go to Account Portal
            <ExternalLink className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
