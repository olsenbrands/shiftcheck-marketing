/**
 * Restaurants Page (Step 4)
 * ShiftCheck Marketing Website
 *
 * Create one or more restaurants during sign-up.
 * All restaurants created with is_active=false until subscription.
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, Phone, MapPin, User, Plus, Trash2, Check, Loader2, ArrowRight, Pencil } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { getOwnerProfile, type Owner } from '../../services/ownerService';
import {
  createRestaurant,
  updateRestaurant,
  getOwnerRestaurants,
  deleteRestaurant,
  type Restaurant,
  type CreateRestaurantInput,
  type UpdateRestaurantInput,
} from '../../services/restaurantService';
import { formatPhoneForDisplay, isValidUSPhone } from '../../utils/phone';
import { trackRestaurantCreated } from '../../services/analyticsService';
import { useSignupAbandonmentTracking } from '../../hooks/useSignupAbandonmentTracking';
import { useSignupProgress } from '../../hooks/useSignupProgress';

// localStorage key for restaurant list persistence
const STORAGE_KEY_RESTAURANTS = 'signup_restaurants';

// Helper to save restaurants to localStorage
const saveRestaurantsToStorage = (restaurants: Restaurant[]) => {
  localStorage.setItem(STORAGE_KEY_RESTAURANTS, JSON.stringify(restaurants));
};

// Helper to clear restaurants from localStorage
const clearRestaurantsFromStorage = () => {
  localStorage.removeItem(STORAGE_KEY_RESTAURANTS);
};

export default function RestaurantsPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [owner, setOwner] = useState<Owner | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);

  // Track abandonment (with restaurant count)
  useSignupAbandonmentTracking({ step: 'restaurants', restaurantsCreated: restaurants.length });

  // Signup progress tracking
  const { updateProgress } = useSignupProgress();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingRestaurantId, setEditingRestaurantId] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [restaurantPhone, setRestaurantPhone] = useState('');
  const [managerName, setManagerName] = useState('');
  const [managerPhone, setManagerPhone] = useState('');
  const [isOwnerManaged, setIsOwnerManaged] = useState(false);

  // Load owner profile and restaurants
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

      // If no restaurants yet, show form by default
      if (restaurantData.length === 0) {
        setShowForm(true);
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
      navigate('/auth/login?redirect=/signup/restaurants');
    }
  }, [user, authLoading, navigate]);

  // Auto-populate owner info when "Owner Managed" is checked
  useEffect(() => {
    if (isOwnerManaged && owner) {
      setManagerName(`${owner.first_name} ${owner.last_name}`);
      setManagerPhone(formatPhoneForDisplay(owner.phone));
    } else {
      setManagerName('');
      setManagerPhone('');
    }
  }, [isOwnerManaged, owner]);

  // Save restaurants to localStorage whenever list changes
  useEffect(() => {
    if (restaurants.length > 0) {
      saveRestaurantsToStorage(restaurants);
    }
  }, [restaurants]);

  const resetForm = () => {
    setName('');
    setAddress('');
    setRestaurantPhone('');
    setManagerName('');
    setManagerPhone('');
    setIsOwnerManaged(false);
    setEditingRestaurantId(null);
    setError(null);
  };

  const handleEditRestaurant = (restaurant: Restaurant) => {
    setName(restaurant.name);
    setAddress(restaurant.address || restaurant.restaurant_address || '');
    setRestaurantPhone(formatPhoneForDisplay(restaurant.manager_phone || restaurant.restaurant_phone || ''));
    setManagerName(restaurant.manager_name || '');
    setManagerPhone(formatPhoneForDisplay(restaurant.manager_phone || ''));
    setIsOwnerManaged(restaurant.is_owner_managed || false);
    setEditingRestaurantId(restaurant.id);
    setShowForm(true);
    setError(null);
  };

  const handleSubmitRestaurant = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!name || !address || !restaurantPhone || !managerName || !managerPhone) {
      setError('Please fill in all fields');
      return;
    }

    if (!isValidUSPhone(restaurantPhone)) {
      setError('Please enter a valid restaurant phone number');
      return;
    }

    if (!isValidUSPhone(managerPhone)) {
      setError('Please enter a valid manager phone number');
      return;
    }

    setSaving(true);

    try {
      if (editingRestaurantId) {
        // Update existing restaurant
        const updateInput: UpdateRestaurantInput = {
          name,
          restaurant_address: address,
          restaurant_phone: restaurantPhone,
          manager_name: managerName,
          manager_phone: managerPhone,
          is_owner_managed: isOwnerManaged,
        };

        const { restaurant: updated, error: updateError } = await updateRestaurant(
          editingRestaurantId,
          updateInput
        );

        if (updateError) {
          setError(updateError.message);
          setSaving(false);
          return;
        }

        if (updated) {
          setRestaurants(restaurants.map((r) => (r.id === editingRestaurantId ? updated : r)));
          resetForm();
          setShowForm(false);
        }
      } else {
        // Create new restaurant
        const createInput: CreateRestaurantInput = {
          name,
          restaurant_address: address,
          restaurant_phone: restaurantPhone,
          manager_name: managerName,
          manager_phone: managerPhone,
          is_owner_managed: isOwnerManaged,
        };

        const { restaurant, error: createError } = await createRestaurant(createInput);

        if (createError) {
          setError(createError.message);
          setSaving(false);
          return;
        }

        if (restaurant) {
          const newRestaurantList = [...restaurants, restaurant];
          setRestaurants(newRestaurantList);

          // Track restaurant created
          trackRestaurantCreated({
            restaurant_count: newRestaurantList.length,
            is_owner_managed: isOwnerManaged,
            has_photo: false, // Photo upload not implemented yet
          });

          resetForm();
          setShowForm(false);
        }
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRestaurant = async (restaurantId: string) => {
    if (!confirm('Are you sure you want to remove this restaurant?')) return;

    const { success, error: deleteError } = await deleteRestaurant(restaurantId);

    if (success) {
      setRestaurants(restaurants.filter((r) => r.id !== restaurantId));
    } else {
      setError(deleteError?.message || 'Failed to delete restaurant');
    }
  };

  const handleContinue = () => {
    if (restaurants.length === 0) {
      setError('Please add at least one restaurant to continue');
      return;
    }

    // Update signup progress
    updateProgress('plan');

    // Clear localStorage as restaurants are now persisted in database
    clearRestaurantsFromStorage();
    navigate('/signup/plan');
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-2">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-sm font-medium">
                <Check className="h-4 w-4" />
              </div>
              <span className="ml-2 text-sm font-medium text-emerald-600">Account</span>
            </div>
            <div className="w-12 h-0.5 bg-emerald-600"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-sm font-medium">
                <Check className="h-4 w-4" />
              </div>
              <span className="ml-2 text-sm font-medium text-emerald-600">Profile</span>
            </div>
            <div className="w-12 h-0.5 bg-emerald-600"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-sm font-medium">
                3
              </div>
              <span className="ml-2 text-sm font-medium text-emerald-600">Restaurants</span>
            </div>
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Add Your Restaurants</h1>
          <p className="mt-2 text-gray-600">
            Add the restaurants you want to manage with ShiftCheck
          </p>
        </div>

        {/* Restaurant List */}
        {restaurants.length > 0 && (
          <div className="mb-6 space-y-4">
            {restaurants.map((restaurant) => (
              <div
                key={restaurant.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{restaurant.name}</h3>
                    <p className="text-sm text-gray-500 flex items-center mt-1">
                      <MapPin className="h-4 w-4 mr-1" />
                      {restaurant.address || restaurant.restaurant_address}
                    </p>
                    <p className="text-sm text-gray-500 flex items-center mt-1">
                      <User className="h-4 w-4 mr-1" />
                      {restaurant.manager_name} ({formatPhoneForDisplay(restaurant.manager_phone || '')})
                    </p>
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleEditRestaurant(restaurant)}
                      className="text-gray-500 hover:text-emerald-600 p-2"
                      title="Edit restaurant"
                    >
                      <Pencil className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteRestaurant(restaurant.id)}
                      className="text-red-500 hover:text-red-700 p-2"
                      title="Delete restaurant"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Restaurant Form */}
        {showForm ? (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {editingRestaurantId
                ? 'Edit Restaurant'
                : restaurants.length === 0
                ? 'Add Your First Restaurant'
                : 'Add Another Restaurant'}
            </h2>

            <form onSubmit={handleSubmitRestaurant} className="space-y-6">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Restaurant Info */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Restaurant Name</label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Store className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Downtown Location"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Restaurant Address</label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="123 Main St, City, State 12345"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Restaurant Phone</label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    value={restaurantPhone}
                    onChange={(e) => setRestaurantPhone(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="(801) 555-1234"
                  />
                </div>
              </div>

              {/* Manager Info */}
              <div className="border-t pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-900">Manager Information</h3>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={isOwnerManaged}
                      onChange={(e) => setIsOwnerManaged(e.target.checked)}
                      className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-600">I'll manage this restaurant</span>
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Manager Name</label>
                    <input
                      type="text"
                      value={managerName}
                      onChange={(e) => setManagerName(e.target.value)}
                      disabled={isOwnerManaged}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Manager Phone</label>
                    <input
                      type="tel"
                      value={managerPhone}
                      onChange={(e) => setManagerPhone(e.target.value)}
                      disabled={isOwnerManaged}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      placeholder="(801) 555-5678"
                    />
                  </div>
                </div>
              </div>

              <div className="flex space-x-4">
                {restaurants.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      resetForm();
                      setShowForm(false);
                    }}
                    className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 flex justify-center items-center py-3 px-4 border border-transparent rounded-lg text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50"
                >
                  {saving ? (
                    <Loader2 className="animate-spin h-5 w-5" />
                  ) : editingRestaurantId ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Restaurant
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <button
            onClick={() => setShowForm(true)}
            className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-emerald-500 hover:text-emerald-600 flex items-center justify-center mb-6"
          >
            <Plus className="mr-2 h-5 w-5" />
            Add Another Restaurant
          </button>
        )}

        {/* Summary and Continue */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-600">Restaurants added:</span>
            <span className="text-2xl font-bold text-emerald-600">{restaurants.length}</span>
          </div>

          <button
            onClick={handleContinue}
            disabled={restaurants.length === 0}
            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue to Plan Selection
            <ArrowRight className="ml-2 h-4 w-4" />
          </button>

          {restaurants.length === 0 && (
            <p className="mt-2 text-sm text-center text-gray-500">
              Add at least one restaurant to continue
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
