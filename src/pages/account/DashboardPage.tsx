/**
 * Account Dashboard Page
 * ShiftCheck Marketing Website
 *
 * Main account management hub showing quick stats and navigation.
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Store,
  CreditCard,
  Users,
  Download,
  LogOut,
  Loader2,
  ArrowRight,
  Calendar,
  CheckCircle,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { getOwnerProfile, type Owner } from '../../services/ownerService';
import { getOwnerRestaurants, type Restaurant } from '../../services/restaurantService';
import { getOwnerSubscription, type Subscription } from '../../services/subscriptionService';
import { signOut } from '../../services/authService';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [owner, setOwner] = useState<Owner | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

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

      const { restaurants: restaurantData } = await getOwnerRestaurants();
      setRestaurants(restaurantData);

      const { subscription: subData } = await getOwnerSubscription();
      setSubscription(subData);

      setLoading(false);
    };

    if (!authLoading) {
      loadData();
    }
  }, [user, authLoading, navigate]);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth/login?redirect=/account/dashboard');
    }
  }, [user, authLoading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-emerald-600" />
      </div>
    );
  }

  const activeRestaurants = restaurants.filter((r) => r.is_active);
  const renewalDate = subscription?.current_period_end
    ? new Date(subscription.current_period_end).toLocaleDateString()
    : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/" className="text-2xl font-bold text-emerald-600">
                ShiftCheck
              </Link>
              <span className="text-gray-400">|</span>
              <span className="text-gray-600">Account</span>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <LogOut className="h-5 w-5 mr-2" />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {owner?.first_name}!
          </h1>
          <p className="mt-1 text-gray-600">
            Manage your ShiftCheck account and restaurants
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Active Restaurants */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Active Restaurants</p>
                <p className="mt-1 text-3xl font-bold text-emerald-600">
                  {activeRestaurants.length}
                  <span className="text-lg text-gray-400 font-normal">
                    /{restaurants.length}
                  </span>
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center">
                <Store className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </div>

          {/* Current Plan */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Current Plan</p>
                <p className="mt-1 text-3xl font-bold text-gray-900 capitalize">
                  {subscription?.plan_type?.replace('_', ' ') || 'No Plan'}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Renewal Date */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  {subscription?.status === 'trialing' ? 'Trial Ends' : 'Renews On'}
                </p>
                <p className="mt-1 text-3xl font-bold text-gray-900">
                  {renewalDate || 'N/A'}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link
            to="/account/restaurants"
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:border-emerald-300 hover:shadow-md transition-all group"
          >
            <Store className="h-8 w-8 text-emerald-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-emerald-600">
              Restaurants
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Manage restaurants and toggle active status
            </p>
            <div className="mt-4 flex items-center text-emerald-600 text-sm font-medium">
              Manage <ArrowRight className="ml-2 h-4 w-4" />
            </div>
          </Link>

          <Link
            to="/account/subscription"
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:border-emerald-300 hover:shadow-md transition-all group"
          >
            <CreditCard className="h-8 w-8 text-emerald-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-emerald-600">
              Subscription
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              View plan, billing history, and payment methods
            </p>
            <div className="mt-4 flex items-center text-emerald-600 text-sm font-medium">
              Manage <ArrowRight className="ml-2 h-4 w-4" />
            </div>
          </Link>

          <Link
            to="/account/referrals"
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:border-emerald-300 hover:shadow-md transition-all group"
          >
            <Users className="h-8 w-8 text-emerald-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-emerald-600">
              Referrals
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Share your code and earn discounts
            </p>
            <div className="mt-4 flex items-center text-emerald-600 text-sm font-medium">
              View <ArrowRight className="ml-2 h-4 w-4" />
            </div>
          </Link>

          <a
            href="#download"
            className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-sm p-6 hover:shadow-md transition-all group text-white"
          >
            <Download className="h-8 w-8 mb-4" />
            <h3 className="text-lg font-semibold">
              Download App
            </h3>
            <p className="mt-1 text-sm text-emerald-100">
              Get ShiftCheck for your team
            </p>
            <div className="mt-4 flex items-center text-white text-sm font-medium">
              Download <ArrowRight className="ml-2 h-4 w-4" />
            </div>
          </a>
        </div>

        {/* Recent Activity / Status */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Account Status</h2>
          </div>
          <div className="p-6">
            <ul className="space-y-4">
              <li className="flex items-center">
                <CheckCircle className="h-5 w-5 text-emerald-500 mr-3" />
                <span className="text-gray-600">Email verified: {owner?.email}</span>
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-5 w-5 text-emerald-500 mr-3" />
                <span className="text-gray-600">
                  {restaurants.length} restaurant{restaurants.length !== 1 ? 's' : ''} created
                </span>
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-5 w-5 text-emerald-500 mr-3" />
                <span className="text-gray-600">
                  Subscription: {subscription?.status || 'Not active'}
                </span>
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-5 w-5 text-emerald-500 mr-3" />
                <span className="text-gray-600">
                  Referral code: {owner?.referral_code}
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
