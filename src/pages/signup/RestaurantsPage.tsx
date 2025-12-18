/**
 * Restaurants Page (Step 4)
 * ShiftCheck Marketing Website
 *
 * Create one or more restaurants during sign-up.
 * All restaurants created with is_active=false until subscription.
 *
 * Form fields match the App's Edit Restaurant modal exactly.
 */

import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Store, Phone, MapPin, User, Plus, Trash2, Check, Loader2, ArrowRight, Pencil, Camera, Mail, Smartphone } from 'lucide-react';
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

// US States for dropdown
const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

// Canadian Provinces for dropdown
const CA_PROVINCES = [
  'AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'NT', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT'
];

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
  const [searchParams] = useSearchParams();
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

  // Form state - Restaurant Information
  const [name, setName] = useState('');
  const [street, setStreet] = useState('');
  const [suite, setSuite] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [isCanada, setIsCanada] = useState(false);
  const [storePhone, setStorePhone] = useState('');
  const [taskLibrary, setTaskLibrary] = useState('empty');

  // Form state - Manager Information
  const [managerFirstName, setManagerFirstName] = useState('');
  const [managerLastName, setManagerLastName] = useState('');
  const [managerEmail, setManagerEmail] = useState('');
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
      setManagerFirstName(owner.first_name || '');
      setManagerLastName(owner.last_name || '');
      setManagerEmail(owner.email || '');
      setManagerPhone(formatPhoneForDisplay(owner.phone || ''));
    } else if (!isOwnerManaged && !editingRestaurantId) {
      // Only clear if not editing (to preserve existing data)
      setManagerFirstName('');
      setManagerLastName('');
      setManagerEmail('');
      setManagerPhone('');
    }
  }, [isOwnerManaged, owner, editingRestaurantId]);

  // Save restaurants to localStorage whenever list changes
  useEffect(() => {
    if (restaurants.length > 0) {
      saveRestaurantsToStorage(restaurants);
    }
  }, [restaurants]);

  // Auto-open edit form from URL ?edit=<id> parameter
  useEffect(() => {
    const editId = searchParams.get('edit');
    if (editId && restaurants.length > 0 && !loading) {
      const restaurantToEdit = restaurants.find(r => r.id === editId);
      if (restaurantToEdit) {
        loadRestaurantIntoForm(restaurantToEdit);
      }
    }
  }, [searchParams, restaurants, loading]);

  const loadRestaurantIntoForm = (restaurant: Restaurant) => {
    setName(restaurant.name);
    // Address fields
    setStreet(restaurant.street || '');
    setSuite(restaurant.suite || '');
    setCity(restaurant.city || '');
    setState(restaurant.state || '');
    setZipCode(restaurant.zip_code || '');
    setIsCanada(restaurant.country === 'CA');
    setStorePhone(formatPhoneForDisplay(restaurant.store_phone || ''));
    setTaskLibrary(restaurant.active_task_library || 'empty');
    // Manager fields
    setManagerFirstName(restaurant.manager_first_name || '');
    setManagerLastName(restaurant.manager_last_name || '');
    setManagerEmail(restaurant.manager_email || '');
    setManagerPhone(formatPhoneForDisplay(restaurant.manager_phone || ''));
    setIsOwnerManaged(restaurant.managed_by_owner || false);
    // Set editing state
    setEditingRestaurantId(restaurant.id);
    setShowForm(true);
    setError(null);
  };

  const resetForm = () => {
    setName('');
    setStreet('');
    setSuite('');
    setCity('');
    setState('');
    setZipCode('');
    setIsCanada(false);
    setStorePhone('');
    setTaskLibrary('empty');
    setManagerFirstName('');
    setManagerLastName('');
    setManagerEmail('');
    setManagerPhone('');
    setIsOwnerManaged(false);
    setEditingRestaurantId(null);
    setError(null);
  };

  const handleEditRestaurant = (restaurant: Restaurant) => {
    loadRestaurantIntoForm(restaurant);
  };

  const handleSubmitRestaurant = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!name || !street || !city || !state || !zipCode || !storePhone) {
      setError('Please fill in all required restaurant fields');
      return;
    }

    if (!managerFirstName || !managerEmail || !managerPhone) {
      setError('Please fill in all required manager fields');
      return;
    }

    if (!isValidUSPhone(storePhone)) {
      setError('Please enter a valid store phone number');
      return;
    }

    if (!isValidUSPhone(managerPhone)) {
      setError('Please enter a valid manager phone number');
      return;
    }

    // Basic email validation
    if (!managerEmail.includes('@')) {
      setError('Please enter a valid manager email address');
      return;
    }

    setSaving(true);

    try {
      if (editingRestaurantId) {
        // Update existing restaurant
        const updateInput: UpdateRestaurantInput = {
          name,
          street,
          suite,
          city,
          state,
          zip_code: zipCode,
          country: isCanada ? 'CA' : 'US',
          store_phone: storePhone,
          active_task_library: taskLibrary,
          manager_first_name: managerFirstName,
          manager_last_name: managerLastName,
          manager_email: managerEmail,
          manager_phone: managerPhone,
          managed_by_owner: isOwnerManaged,
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
          street,
          suite,
          city,
          state,
          zip_code: zipCode,
          country: isCanada ? 'CA' : 'US',
          store_phone: storePhone,
          active_task_library: taskLibrary,
          manager_first_name: managerFirstName,
          manager_last_name: managerLastName,
          manager_email: managerEmail,
          manager_phone: managerPhone,
          managed_by_owner: isOwnerManaged,
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
            has_photo: false,
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

  // Get display address for restaurant card
  const getDisplayAddress = (restaurant: Restaurant) => {
    if (restaurant.street) {
      const parts = [restaurant.street];
      if (restaurant.suite) parts.push(`Ste ${restaurant.suite}`);
      if (restaurant.city) parts.push(restaurant.city);
      if (restaurant.state && restaurant.zip_code) {
        parts.push(`${restaurant.state} ${restaurant.zip_code}`);
      }
      return parts.join(', ');
    }
    return restaurant.address || '';
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-primary-500" />
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
              <div className="w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center text-sm font-medium">
                <Check className="h-4 w-4" />
              </div>
              <span className="ml-2 text-sm font-medium text-primary-500">Account</span>
            </div>
            <div className="w-12 h-0.5 bg-primary-500"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center text-sm font-medium">
                <Check className="h-4 w-4" />
              </div>
              <span className="ml-2 text-sm font-medium text-primary-500">Profile</span>
            </div>
            <div className="w-12 h-0.5 bg-primary-500"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center text-sm font-medium">
                3
              </div>
              <span className="ml-2 text-sm font-medium text-primary-500">Restaurants</span>
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
                      {getDisplayAddress(restaurant)}
                    </p>
                    <p className="text-sm text-gray-500 flex items-center mt-1">
                      <User className="h-4 w-4 mr-1" />
                      {restaurant.manager_first_name || restaurant.manager_name} {restaurant.manager_last_name || ''} ({formatPhoneForDisplay(restaurant.manager_phone || '')})
                    </p>
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleEditRestaurant(restaurant)}
                      className="text-gray-500 hover:text-primary-500 p-2"
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

              {/* Restaurant Information Section */}
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center">
                  <Store className="h-4 w-4 mr-2 text-primary-500" />
                  Restaurant Information
                </h3>

                {/* Restaurant Name */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Restaurant Name *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Downtown Location"
                  />
                </div>

                {/* Street and Suite */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Street *</label>
                    <input
                      type="text"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                      placeholder="123 Main St"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Suite</label>
                    <input
                      type="text"
                      value={suite}
                      onChange={(e) => setSuite(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                      placeholder="101"
                    />
                  </div>
                </div>

                {/* City, State, ZIP */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">City *</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Salt Lake City"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">State *</label>
                    <select
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="">Select...</option>
                      {(isCanada ? CA_PROVINCES : US_STATES).map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">ZIP Code *</label>
                    <input
                      type="text"
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                      placeholder="84101"
                    />
                  </div>
                </div>

                {/* Canada Checkbox */}
                <div className="mb-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={isCanada}
                      onChange={(e) => {
                        setIsCanada(e.target.checked);
                        setState(''); // Reset state when switching country
                      }}
                      className="h-4 w-4 text-primary-500 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-600">This restaurant is in Canada</span>
                  </label>
                </div>

                {/* Store Phone */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Store Phone *</label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="tel"
                      value={storePhone}
                      onChange={(e) => setStorePhone(formatPhoneForDisplay(e.target.value))}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                      placeholder="(801) 555-1234"
                    />
                  </div>
                </div>

                {/* Task Library */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Task Library</label>
                  <p className="text-xs text-gray-500 mb-1">Choose which pre-populated task library your managers will use.</p>
                  <select
                    value={taskLibrary}
                    onChange={(e) => setTaskLibrary(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="empty">Empty Library (Start from scratch)</option>
                    <option value="subway">Subway Task Library (80+ pre-loaded tasks)</option>
                  </select>
                </div>
              </div>

              {/* Manager Information Section */}
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-gray-900 flex items-center">
                    <User className="h-4 w-4 mr-2 text-primary-500" />
                    Manager Information
                  </h3>
                </div>

                {/* Managed by Owner Checkbox */}
                <div className="mb-4 p-3 bg-white rounded-lg border border-gray-200">
                  <label className="flex items-start cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isOwnerManaged}
                      onChange={(e) => setIsOwnerManaged(e.target.checked)}
                      className="h-4 w-4 mt-0.5 text-primary-500 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <div className="ml-3">
                      <span className="text-sm font-medium text-gray-900">Managed by Owner</span>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Use your Owner profile info as the Manager. You'll be able to access the Manager Dashboard with your existing credentials.
                      </p>
                    </div>
                  </label>
                </div>

                {/* First Name and Last Name */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">First Name *</label>
                    <input
                      type="text"
                      value={managerFirstName}
                      onChange={(e) => setManagerFirstName(e.target.value)}
                      disabled={isOwnerManaged}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      placeholder="Jane"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Last Name</label>
                    <input
                      type="text"
                      value={managerLastName}
                      onChange={(e) => setManagerLastName(e.target.value)}
                      disabled={isOwnerManaged}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      placeholder="Doe (Optional)"
                    />
                  </div>
                </div>

                {/* Manager Email */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Manager Email *</label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      value={managerEmail}
                      onChange={(e) => setManagerEmail(e.target.value)}
                      disabled={isOwnerManaged}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      placeholder="manager@example.com"
                    />
                  </div>
                </div>

                {/* Manager Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Manager's personal phone (must be able to receive texts) *</label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Smartphone className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="tel"
                      value={managerPhone}
                      onChange={(e) => setManagerPhone(formatPhoneForDisplay(e.target.value))}
                      disabled={isOwnerManaged}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      placeholder="(801) 555-5678"
                    />
                  </div>
                </div>
              </div>

              {/* Restaurant Photo Section */}
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
                  <Camera className="h-4 w-4 mr-2 text-primary-500" />
                  Restaurant Photo
                </h3>
                <p className="text-xs text-gray-500 mb-3">Upload a photo of your restaurant</p>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                    <Camera className="h-6 w-6 text-gray-400" />
                  </div>
                  <button
                    type="button"
                    className="px-4 py-2 bg-primary-500 text-white text-sm rounded-lg hover:bg-primary-600"
                    onClick={() => alert('Photo upload coming soon!')}
                  >
                    Upload Photo
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-2">Recommended: Square image, at least 400x400px. Max 5MB.</p>
              </div>

              {/* Paired Device Section */}
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
                  <Smartphone className="h-4 w-4 mr-2 text-primary-500" />
                  Paired Device
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span className="inline-block w-2 h-2 rounded-full bg-gray-400"></span>
                  <span>Inactive</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Device pairing will be available after signup.</p>
              </div>

              {/* Form Actions */}
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
                  className="flex-1 flex justify-center items-center py-3 px-4 border border-transparent rounded-lg text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 disabled:opacity-50"
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
            className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-primary-500 hover:text-primary-500 flex items-center justify-center mb-6"
          >
            <Plus className="mr-2 h-5 w-5" />
            Add Another Restaurant
          </button>
        )}

        {/* Summary and Continue */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-600">Restaurants added:</span>
            <span className="text-2xl font-bold text-primary-500">{restaurants.length}</span>
          </div>

          <button
            onClick={handleContinue}
            disabled={restaurants.length === 0}
            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
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
