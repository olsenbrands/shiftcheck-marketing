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
        <Loader2 className="animate-spin h-8 w-8 text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-2">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-sm font-medium">
                <Check className="h-4 w-4" />
              </div>
              <span className="ml-2 text-sm font-medium text-emerald-600 hidden sm:inline">Account</span>
            </div>
            <div className="w-8 sm:w-12 h-0.5 bg-emerald-600"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-sm font-medium">
                <Check className="h-4 w-4" />
              </div>
              <span className="ml-2 text-sm font-medium text-emerald-600 hidden sm:inline">Profile</span>
            </div>
            <div className="w-8 sm:w-12 h-0.5 bg-emerald-600"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-sm font-medium">
                <Check className="h-4 w-4" />
              </div>
              <span className="ml-2 text-sm font-medium text-emerald-600 hidden sm:inline">Restaurants</span>
            </div>
            <div className="w-8 sm:w-12 h-0.5 bg-emerald-600"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-sm font-medium">
                4
              </div>
              <span className="ml-2 text-sm font-medium text-emerald-600 hidden sm:inline">Plan</span>
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
            const monthlyTotal = calculateMonthlyTotal(tier);
            const isDisabled = tier.max_restaurants && restaurants.length > tier.max_restaurants;

            return (
              <div
                key={tier.id}
                onClick={() => !isDisabled && setSelectedTier(tier.id)}
                className={`relative rounded-2xl border-2 p-6 cursor-pointer transition-all ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500'
                    : isDisabled
                    ? 'border-gray-200 bg-gray-100 cursor-not-allowed opacity-60'
                    : 'border-gray-200 bg-white hover:border-emerald-300'
                }`}
              >
                {recommendation && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-emerald-500 text-white text-xs font-medium px-3 py-1 rounded-full">
                      {recommendation}
                    </span>
                  </div>
                )}

                <div className="text-center">
                  <h3 className="text-xl font-bold text-gray-900">{tier.name}</h3>
                  <p className="mt-2 text-sm text-gray-500">{tier.description}</p>

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
                        {restaurants.length > 1 && (
                          <div className="mt-2 text-sm text-emerald-600 font-medium">
                            {formatPrice(monthlyTotal)}/mo for {restaurants.length} restaurants
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <ul className="mt-6 space-y-3 text-left">
                    {tier.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="h-5 w-5 text-emerald-500 shrink-0" />
                        <span className="ml-2 text-sm text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {isDisabled && (
                    <p className="mt-4 text-sm text-red-500">
                      Maximum {tier.max_restaurants} restaurant{tier.max_restaurants !== 1 ? 's' : ''}
                    </p>
                  )}
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
            {selectedTier !== 'free_starter' && (
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Subscription quantity</p>
                    <p className="text-sm text-gray-500">
                      How many restaurants will you manage?
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setRestaurantCount(Math.max(restaurants.length, restaurantCount - 1))}
                      disabled={restaurantCount <= restaurants.length}
                      className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="h-4 w-4 text-gray-600" />
                    </button>
                    <span className="text-xl font-bold text-gray-900 w-8 text-center">
                      {restaurantCount}
                    </span>
                    <button
                      onClick={() => setRestaurantCount(restaurantCount + 1)}
                      className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                      aria-label="Increase quantity"
                    >
                      <Plus className="h-4 w-4 text-gray-600" />
                    </button>
                  </div>
                </div>
                {restaurantCount > restaurants.length && (
                  <p className="mt-2 text-sm text-emerald-600">
                    You can add {restaurantCount - restaurants.length} more restaurant{restaurantCount - restaurants.length !== 1 ? 's' : ''} after sign-up
                  </p>
                )}
                {restaurantCount === restaurants.length && (
                  <p className="mt-2 text-sm text-gray-500">
                    Increase to pre-pay for additional restaurants you plan to add
                  </p>
                )}
              </div>
            )}

            <div className="flex items-center justify-between border-t pt-4">
              <div>
                <span className="text-gray-600">Monthly total:</span>
                <span className="ml-2 text-2xl font-bold text-emerald-600">
                  {selectedTier === 'free_starter'
                    ? 'Free'
                    : formatPrice(calculateMonthlyTotal(tiers.find((t) => t.id === selectedTier)!))}
                </span>
              </div>
              <button
                onClick={handleContinue}
                className="flex items-center px-6 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors"
              >
                {selectedTier === 'free_starter' ? 'Start Free Trial' : 'Continue to Payment'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
