/**
 * Plan Selection Page (Step 5)
 * ShiftCheck Marketing Website
 *
 * Shows pricing tiers and allows selection.
 * Free Starter skips payment, Grow/Expand go to payment page.
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Loader2, ArrowRight, Store, Plus, Minus } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import AuthenticatedNavbar from '../../components/AuthenticatedNavbar';
import { getOwnerRestaurants, type Restaurant } from '../../services/restaurantService';
import { getPricingTiers, type PricingTier } from '../../services/subscriptionService';
import { trackPlanSelected } from '../../services/analyticsService';
import { useSignupAbandonmentTracking } from '../../hooks/useSignupAbandonmentTracking';
import { useSignupProgress } from '../../hooks/useSignupProgress';

export default function PlanPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  // Track abandonment
  useSignupAbandonmentTracking({ step: 'plan' });

  // Signup progress tracking
  const { updateProgress } = useSignupProgress();

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [tiers, setTiers] = useState<PricingTier[]>([]);
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [restaurantCount, setRestaurantCount] = useState(1);
  const [activeRestaurantIds, setActiveRestaurantIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      if (!user) return;

      // Load restaurants
      const { restaurants: restaurantData, error: restError } = await getOwnerRestaurants();
      if (restError) {
        setError(restError.message);
        return;
      }

      if (restaurantData.length === 0) {
        navigate('/signup/restaurants');
        return;
      }

      setRestaurants(restaurantData);
      setRestaurantCount(restaurantData.length);
      // Initially mark all restaurants as active
      setActiveRestaurantIds(restaurantData.map(r => r.id));

      // Load pricing tiers
      const { tiers: tierData, error: tierError } = await getPricingTiers();
      if (tierError) {
        setError(tierError.message);
        return;
      }

      setTiers(tierData);

      // Auto-select appropriate tier based on restaurant count
      if (restaurantData.length === 1) {
        setSelectedTier('free_starter'); // Default to free for 1 restaurant
      } else if (restaurantData.length <= 3) {
        setSelectedTier('grow');
      } else {
        setSelectedTier('expand');
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
      navigate('/auth/login?redirect=/signup/plan');
    }
  }, [user, authLoading, navigate]);

  // Sync active restaurants when quantity changes
  useEffect(() => {
    if (restaurants.length === 0) return;

    // If quantity decreased, trim to the allowed count
    if (activeRestaurantIds.length > restaurantCount) {
      setActiveRestaurantIds(activeRestaurantIds.slice(0, restaurantCount));
    }
    // If quantity increased, auto-add inactive restaurants to fill
    else if (activeRestaurantIds.length < restaurantCount) {
      const inactive = restaurants
        .filter(r => !activeRestaurantIds.includes(r.id))
        .map(r => r.id);
      const toAdd = inactive.slice(0, restaurantCount - activeRestaurantIds.length);
      if (toAdd.length > 0) {
        setActiveRestaurantIds([...activeRestaurantIds, ...toAdd]);
      }
    }
  }, [restaurantCount, restaurants.length]);

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(0)}`;
  };

  const calculateMonthlyTotal = (tier: PricingTier) => {
    if (tier.price_per_restaurant_cents === 0) return 0;
    return tier.price_per_restaurant_cents * restaurantCount;
  };

  const handleContinue = () => {
    if (!selectedTier) {
      setError('Please select a plan');
      return;
    }

    // Get selected tier details for tracking
    const tier = tiers.find((t) => t.id === selectedTier);
    const monthlyPrice = tier ? calculateMonthlyTotal(tier) : 0;

    // Track plan selection
    trackPlanSelected({
      plan_name: selectedTier as 'free_starter' | 'grow' | 'expand',
      plan_price: monthlyPrice / 100, // Convert cents to dollars
      restaurant_count: restaurantCount,
    });

    // Store selection in localStorage
    localStorage.setItem('selected_plan', selectedTier);
    localStorage.setItem('restaurant_count', restaurantCount.toString());
    localStorage.setItem('active_restaurant_ids', JSON.stringify(activeRestaurantIds));

    // Update signup progress
    if (selectedTier === 'free_starter') {
      updateProgress('complete');
      navigate('/signup/complete');
    } else {
      updateProgress('payment');
      navigate('/signup/payment');
    }
  };

  const getTierRecommendation = (tier: PricingTier) => {
    const count = restaurants.length;

    if (tier.id === 'free_starter' && count === 1) {
      return 'Perfect for getting started';
    }
    if (tier.id === 'grow' && count >= 1 && count <= 3) {
      return 'Recommended for your restaurants';
    }
    if (tier.id === 'expand' && count >= 4) {
      return 'Best value for multiple locations';
    }
    return null;
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-primary-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AuthenticatedNavbar section="Sign Up" />
      <div className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-2">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center text-sm font-medium">
                <Check className="h-4 w-4" />
              </div>
              <span className="ml-2 text-sm font-medium text-primary-500 hidden sm:inline">Account</span>
            </div>
            <div className="w-8 sm:w-12 h-0.5 bg-primary-500"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center text-sm font-medium">
                <Check className="h-4 w-4" />
              </div>
              <span className="ml-2 text-sm font-medium text-primary-500 hidden sm:inline">Profile</span>
            </div>
            <div className="w-8 sm:w-12 h-0.5 bg-primary-500"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center text-sm font-medium">
                <Check className="h-4 w-4" />
              </div>
              <span className="ml-2 text-sm font-medium text-primary-500 hidden sm:inline">Restaurants</span>
            </div>
            <div className="w-8 sm:w-12 h-0.5 bg-primary-500"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center text-sm font-medium">
                4
              </div>
              <span className="ml-2 text-sm font-medium text-primary-500 hidden sm:inline">Plan</span>
            </div>
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Choose Your Plan</h1>
          <p className="mt-2 text-gray-600">
            You have {restaurants.length} restaurant{restaurants.length !== 1 ? 's' : ''} to manage
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {tiers.map((tier) => {
            const isSelected = selectedTier === tier.id;
            const recommendation = getTierRecommendation(tier);
            // monthlyTotal calculated but shown elsewhere in UI
            void calculateMonthlyTotal(tier);

            return (
              <div
                key={tier.id}
                onClick={() => {
                  setSelectedTier(tier.id);
                  // Set appropriate quantity based on tier
                  if (tier.id === 'free_starter') {
                    setRestaurantCount(1);
                  } else if (tier.id === 'grow') {
                    // Keep current count if valid for Grow (1-4), otherwise set to 1
                    if (restaurantCount > 4) {
                      setRestaurantCount(1);
                    } else if (restaurantCount < 1) {
                      setRestaurantCount(1);
                    }
                  } else if (tier.id === 'expand' && tier.min_restaurants) {
                    setRestaurantCount(Math.max(tier.min_restaurants, restaurantCount));
                  }
                }}
                className={`relative rounded-2xl border-2 p-6 cursor-pointer transition-all ${
                  isSelected
                    ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-500'
                    : 'border-gray-200 bg-white hover:border-primary-300'
                }`}
              >
                {recommendation && (
                  <div className="absolute -top-3 left-0 right-0 flex justify-center">
                    <span className="bg-primary-500 text-white text-xs font-medium px-3 py-1 rounded-full whitespace-nowrap shadow-sm">
                      {recommendation}
                    </span>
                  </div>
                )}

                <div className="text-center">
                  <h3 className="text-xl font-bold text-gray-900">{tier.name}</h3>
                  <p className="mt-2 text-sm text-gray-500">
                    {tier.id === 'grow' ? 'For owners with 1-4 restaurants' : tier.description}
                  </p>

                  <div className="mt-4">
                    {tier.price_per_restaurant_cents === 0 ? (
                      <div>
                        <span className="text-4xl font-bold text-gray-900">Free</span>
                        <span className="text-gray-500 block text-sm mt-1">30-day trial</span>
                      </div>
                    ) : (
                      <div>
                        <span className="text-4xl font-bold text-gray-900">
                          {formatPrice(tier.price_per_restaurant_cents)}
                        </span>
                        <span className="text-gray-500">/mo per restaurant</span>
                      </div>
                    )}
                  </div>

                  <ul className="mt-6 space-y-3 text-left">
                    {tier.features.map((feature, index) => {
                      // Override "1-3 restaurants" to "1-4 restaurants" for Grow tier
                      const displayFeature = tier.id === 'grow' && feature === '1-3 restaurants'
                        ? '1-4 restaurants'
                        : feature;
                      return (
                        <li key={index} className="flex items-start">
                          <Check className="h-5 w-5 text-primary-600 shrink-0" />
                          <span className="ml-2 text-sm text-gray-600">{displayFeature}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Plan Summary */}
        {selectedTier && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-gray-600">Selected plan:</span>
                <span className="ml-2 font-semibold text-gray-900">
                  {tiers.find((t) => t.id === selectedTier)?.name}
                </span>
              </div>
              <div className="flex items-center text-gray-600">
                <Store className="h-5 w-5 mr-2" />
                {restaurants.length} restaurant{restaurants.length !== 1 ? 's' : ''} added
              </div>
            </div>

            {/* Restaurant Quantity Selector */}
            {(() => {
              const expandTier = tiers.find((t) => t.id === 'expand');
              const expandMin = expandTier?.min_restaurants || 5;

              // Minimum is always 1 (we allow switching tiers by decreasing)
              const minCount = 1;

              // Handle decrease with auto-switching back to Grow
              const handleDecrease = () => {
                if (restaurantCount <= minCount) return;

                const newCount = restaurantCount - 1;

                // Expand plan: if going below minimum, switch to Grow
                if (selectedTier === 'expand' && newCount < expandMin) {
                  setSelectedTier('grow');
                  // Set to max of Grow (4) or the new count
                  setRestaurantCount(Math.min(newCount, 4));
                  return;
                }

                setRestaurantCount(newCount);
              };

              // Handle increase with auto-switching
              const handleIncrease = () => {
                const newCount = restaurantCount + 1;

                // Free plan: switching to Grow
                if (selectedTier === 'free_starter') {
                  setSelectedTier('grow');
                  setRestaurantCount(2);
                  // Auto-select first two restaurants
                  setActiveRestaurantIds(restaurants.slice(0, 2).map(r => r.id));
                  return;
                }

                // Grow plan: if going above 4, switch to Expand
                if (selectedTier === 'grow' && newCount > 4) {
                  setSelectedTier('expand');
                  setRestaurantCount(expandMin);
                  return;
                }

                // Otherwise just increment
                setRestaurantCount(newCount);
              };

              // Toggle a restaurant's active status
              const handleToggleRestaurant = (restaurantId: string) => {
                const isCurrentlyActive = activeRestaurantIds.includes(restaurantId);

                if (isCurrentlyActive) {
                  // Can only deactivate if we have more than 1 active
                  if (activeRestaurantIds.length > 1) {
                    setActiveRestaurantIds(activeRestaurantIds.filter(id => id !== restaurantId));
                  }
                } else {
                  // If at limit, swap: remove first active and add clicked one
                  if (activeRestaurantIds.length >= restaurantCount) {
                    // Swap: remove the first active restaurant, add clicked one
                    const newActive = [...activeRestaurantIds.slice(1), restaurantId];
                    setActiveRestaurantIds(newActive);
                  } else {
                    // Under limit, just add
                    setActiveRestaurantIds([...activeRestaurantIds, restaurantId]);
                  }
                }
              };

              const inactiveCount = restaurants.length - restaurantCount;

              return (
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Active restaurants</p>
                    <p className="text-sm text-gray-500">
                      How many restaurants do you want active?
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={handleDecrease}
                      disabled={restaurantCount <= minCount}
                      className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="h-4 w-4 text-gray-600" />
                    </button>
                    <span className="text-xl font-bold text-gray-900 w-8 text-center">
                      {restaurantCount}
                    </span>
                    <button
                      onClick={handleIncrease}
                      className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                      aria-label="Increase quantity"
                    >
                      <Plus className="h-4 w-4 text-gray-600" />
                    </button>
                  </div>
                </div>

                {/* Restaurant Selection List */}
                {restaurants.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {restaurants.map((restaurant) => {
                      const isActive = activeRestaurantIds.includes(restaurant.id);
                      // Active can only deactivate if more than 1 active
                      // Inactive can always toggle (either add if under limit, or swap if at limit)
                      const canToggle = isActive
                        ? activeRestaurantIds.length > 1
                        : true;

                      return (
                        <div
                          key={restaurant.id}
                          onClick={() => canToggle && handleToggleRestaurant(restaurant.id)}
                          className={`flex items-center p-3 rounded-lg border transition-all ${
                            isActive
                              ? 'bg-primary-50 border-primary-200 cursor-pointer'
                              : canToggle
                              ? 'bg-white border-gray-200 cursor-pointer hover:border-gray-300'
                              : 'bg-gray-100 border-gray-200 opacity-60 cursor-not-allowed'
                          }`}
                        >
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center mr-3 transition-colors ${
                            isActive
                              ? 'bg-primary-500 border-primary-500'
                              : 'bg-white border-gray-300'
                          }`}>
                            {isActive && <Check className="h-3 w-3 text-white" />}
                          </div>
                          <div className="flex-1">
                            <p className={`font-medium ${isActive ? 'text-gray-900' : 'text-gray-500'}`}>
                              {restaurant.name}
                            </p>
                            <p className={`text-sm ${isActive ? 'text-gray-600' : 'text-gray-400'}`}>
                              {restaurant.address || restaurant.restaurant_address}
                            </p>
                          </div>
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                            isActive
                              ? 'bg-primary-100 text-primary-700'
                              : 'bg-gray-200 text-gray-500'
                          }`}>
                            {isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      );
                    })}

                    {/* Placeholder cards for additional restaurants beyond entered count */}
                    {restaurantCount > restaurants.length && (
                      Array.from({ length: restaurantCount - restaurants.length }).map((_, index) => (
                        <div
                          key={`placeholder-${index}`}
                          className="flex items-center p-3 rounded-lg border border-dashed border-gray-300 bg-gray-50"
                        >
                          <div className="w-5 h-5 rounded border-2 border-dashed border-gray-300 flex items-center justify-center mr-3">
                            <Plus className="h-3 w-3 text-gray-400" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-500">
                              New Restaurant {restaurants.length + index + 1}
                            </p>
                            <p className="text-sm text-gray-400">
                              Enter your restaurant information on the next screen
                            </p>
                          </div>
                          <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                            Pending
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Notification when quantity < total restaurants */}
                {inactiveCount > 0 && (
                  <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-sm text-amber-700">
                      <span className="font-medium">Increase Active restaurants to {restaurants.length}</span> to activate all of your restaurants.
                    </p>
                  </div>
                )}

                {selectedTier === 'free_starter' && (
                  <p className="mt-3 text-sm text-gray-500">
                    Free trial includes 1 active restaurant
                  </p>
                )}
                {selectedTier === 'expand' && (
                  <p className="mt-3 text-sm text-gray-500">
                    Expand plan includes minimum {expandMin} active restaurants
                  </p>
                )}
              </div>
              );
            })()}

            <div className="flex items-center justify-between border-t pt-4">
              <div>
                <span className="text-gray-600">Monthly total:</span>
                <span className="ml-2 text-2xl font-bold text-primary-500">
                  {selectedTier === 'free_starter'
                    ? 'Free'
                    : formatPrice(calculateMonthlyTotal(tiers.find((t) => t.id === selectedTier)!))}
                </span>
              </div>
              <button
                onClick={handleContinue}
                className="flex items-center px-6 py-3 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors"
              >
                {selectedTier === 'free_starter' ? 'Start Free Trial' : 'Continue to Payment'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
