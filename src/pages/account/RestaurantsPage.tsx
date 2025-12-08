/**
 * Account Restaurants Page
 * ShiftCheck Marketing Website
 *
 * Manage restaurants: toggle active status, edit details, add new.
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Store,
  ArrowLeft,
  Plus,
  MapPin,
  Phone,
  User,
  Loader2,
  ToggleLeft,
  ToggleRight,
  AlertCircle,
  Pencil,
  Trash2,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { getOwnerProfile } from '../../services/ownerService';
import {
  getOwnerRestaurants,
  toggleRestaurantActive,
  deleteRestaurant,
  type Restaurant,
} from '../../services/restaurantService';
import { getOwnerSubscription, type Subscription } from '../../services/subscriptionService';
import { formatPhoneForDisplay } from '../../utils/phone';

export default function AccountRestaurantsPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      if (!user) return;

      const { owner } = await getOwnerProfile();
      if (!owner) {
        navigate('/signup/profile');
        return;
      }

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
      navigate('/auth/login?redirect=/account/restaurants');
    }
  }, [user, authLoading, navigate]);

  const activeCount = restaurants.filter((r) => r.is_active).length;
  const maxActive = subscription?.max_active_restaurants || 1;
  const canActivateMore = activeCount < maxActive;

  const handleToggleActive = async (restaurant: Restaurant) => {
    setError(null);

    // Check if trying to activate and at limit
    if (!restaurant.is_active && !canActivateMore) {
      setError(
        `You can only have ${maxActive} active restaurant${maxActive !== 1 ? 's' : ''} on your current plan. Upgrade to add more.`
      );
      return;
    }

    setToggling(restaurant.id);

    const { restaurant: updated, error: toggleError } = await toggleRestaurantActive(
      restaurant.id
    );

    if (updated) {
      setRestaurants(
        restaurants.map((r) =>
          r.id === restaurant.id ? updated : r
        )
      );
    } else {
      setError(toggleError?.message || 'Failed to update restaurant status');
    }

    setToggling(null);
  };

  const handleDeleteRestaurant = async (restaurantId: string) => {
    if (!confirm('Are you sure you want to delete this restaurant? This cannot be undone.')) {
      return;
    }

    const { success, error: deleteError } = await deleteRestaurant(restaurantId);

    if (success) {
      setRestaurants(restaurants.filter((r) => r.id !== restaurantId));
    } else {
      setError(deleteError?.message || 'Failed to delete restaurant');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-emerald-600" />
      </div>
    );
  }

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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Your Restaurants</h1>
            <p className="mt-1 text-gray-600">
              {activeCount} of {maxActive} restaurants active
            </p>
          </div>
          <Link
            to="/signup/restaurants"
            className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Restaurant
          </Link>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-3 shrink-0" />
            <div>
              <p className="text-sm text-red-600">{error}</p>
              {error.includes('Upgrade') && (
                <Link
                  to="/account/subscription"
                  className="mt-2 inline-block text-sm font-medium text-red-700 hover:text-red-800"
                >
                  Upgrade your plan &rarr;
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Limit Warning */}
        {!canActivateMore && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start">
            <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 mr-3 shrink-0" />
            <div>
              <p className="text-sm text-amber-700">
                You've reached your limit of {maxActive} active restaurant{maxActive !== 1 ? 's' : ''}.
                To activate more, upgrade your plan or deactivate an existing restaurant.
              </p>
              <Link
                to="/account/subscription"
                className="mt-2 inline-block text-sm font-medium text-amber-800 hover:text-amber-900"
              >
                Upgrade your plan &rarr;
              </Link>
            </div>
          </div>
        )}

        {/* Restaurant List */}
        <div className="space-y-4">
          {restaurants.map((restaurant) => (
            <div
              key={restaurant.id}
              className={`bg-white rounded-xl shadow-sm border p-6 transition-all ${
                restaurant.is_active
                  ? 'border-emerald-200 bg-emerald-50/30'
                  : 'border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center">
                    <Store className="h-5 w-5 text-emerald-600 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      {restaurant.name}
                    </h3>
                    <span
                      className={`ml-3 px-2 py-1 rounded-full text-xs font-medium ${
                        restaurant.is_active
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {restaurant.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <div className="mt-3 space-y-1">
                    {restaurant.restaurant_address && (
                      <p className="text-sm text-gray-500 flex items-center">
                        <MapPin className="h-4 w-4 mr-2" />
                        {restaurant.restaurant_address}
                      </p>
                    )}
                    {restaurant.restaurant_phone && (
                      <p className="text-sm text-gray-500 flex items-center">
                        <Phone className="h-4 w-4 mr-2" />
                        {formatPhoneForDisplay(restaurant.restaurant_phone)}
                      </p>
                    )}
                    {restaurant.manager_name && (
                      <p className="text-sm text-gray-500 flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        {restaurant.manager_name}
                        {restaurant.manager_phone && (
                          <span className="ml-1">
                            ({formatPhoneForDisplay(restaurant.manager_phone)})
                          </span>
                        )}
                        {restaurant.is_owner_managed && (
                          <span className="ml-2 text-xs text-emerald-600">(Owner Managed)</span>
                        )}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {/* Toggle Button */}
                  <button
                    onClick={() => handleToggleActive(restaurant)}
                    disabled={toggling === restaurant.id}
                    className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
                      restaurant.is_active
                        ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    } disabled:opacity-50`}
                    title={restaurant.is_active ? 'Deactivate' : 'Activate'}
                  >
                    {toggling === restaurant.id ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : restaurant.is_active ? (
                      <ToggleRight className="h-5 w-5" />
                    ) : (
                      <ToggleLeft className="h-5 w-5" />
                    )}
                  </button>

                  {/* Edit Button */}
                  <button
                    onClick={() => navigate(`/signup/restaurants?edit=${restaurant.id}`)}
                    className="p-2 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                    title="Edit restaurant"
                  >
                    <Pencil className="h-5 w-5" />
                  </button>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDeleteRestaurant(restaurant.id)}
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete restaurant"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {restaurants.length === 0 && (
          <div className="text-center py-12">
            <Store className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No restaurants yet</h3>
            <p className="text-gray-500 mb-4">Add your first restaurant to get started</p>
            <Link
              to="/signup/restaurants"
              className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Restaurant
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
