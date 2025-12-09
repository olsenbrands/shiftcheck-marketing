/**
 * Payment Page (Step 6)
 * ShiftCheck Marketing Website
 *
 * Stripe payment integration for Grow/Expand plans.
 * Uses Stripe Elements for secure payment collection.
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { CreditCard, Lock, Loader2, ArrowLeft, Check, AlertCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { getOwnerProfile, type Owner } from '../../services/ownerService';
import { getOwnerRestaurants, type Restaurant } from '../../services/restaurantService';
import { getPricingTier, type PricingTier } from '../../services/subscriptionService';
import {
  trackPaymentStarted,
  trackPaymentCompleted,
  trackPaymentFailed,
} from '../../services/analyticsService';
import { useSignupAbandonmentTracking } from '../../hooks/useSignupAbandonmentTracking';
import { useSignupProgress } from '../../hooks/useSignupProgress';
import { getStripeErrorMessage, getNetworkErrorMessage } from '../../utils/errorMessages';

// Initialize Stripe outside component to avoid recreating on re-renders
const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

/**
 * Inner checkout form component that uses Stripe hooks
 */
function CheckoutForm({
  owner,
  tier,
  restaurantCount,
  monthlyTotal,
  onSuccess,
  onBack,
}: {
  owner: Owner;
  tier: PricingTier;
  restaurantCount: number;
  monthlyTotal: number;
  onSuccess: () => void;
  onBack: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorAction, setErrorAction] = useState<string | null>(null);
  const [canRetry, setCanRetry] = useState(true);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const formatPrice = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!agreedToTerms) {
      setError('Please agree to the terms of service');
      setErrorAction(null);
      setCanRetry(true);
      return;
    }

    if (!stripe || !elements) {
      setError('Payment system not loaded. Please refresh the page.');
      setErrorAction('Refresh the page to reload the payment form.');
      setCanRetry(true);
      return;
    }

    setProcessing(true);
    setError(null);
    setErrorAction(null);
    setCanRetry(true);

    // Track payment started
    trackPaymentStarted({
      plan_name: tier.name,
      amount: monthlyTotal / 100, // Convert cents to dollars
      restaurant_count: restaurantCount,
    });

    try {
      // Confirm payment with Stripe
      const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/signup/complete`,
          receipt_email: owner.email,
        },
        redirect: 'if_required',
      });

      if (stripeError) {
        // Track payment failed
        trackPaymentFailed({
          plan_name: tier.name,
          amount: monthlyTotal / 100,
          error_code: stripeError.code,
          error_message: stripeError.message,
        });

        // Get user-friendly error message
        const errorDetails = getStripeErrorMessage(
          stripeError.code,
          stripeError.decline_code,
          stripeError.message
        );

        setError(errorDetails.message);
        setErrorAction(errorDetails.action || null);
        setCanRetry(errorDetails.retryable);
        setProcessing(false);
        return;
      }

      // Payment succeeded without redirect
      if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Track payment completed
        trackPaymentCompleted({
          plan_name: tier.name,
          amount: monthlyTotal / 100,
          restaurant_count: restaurantCount,
          stripe_subscription_id: paymentIntent.id,
        });
        onSuccess();
      }
    } catch (err) {
      console.error('Payment error:', err);
      // Track payment failed
      trackPaymentFailed({
        plan_name: tier.name,
        amount: monthlyTotal / 100,
        error_message: 'Unexpected error',
      });

      // Get user-friendly network error message
      const errorDetails = getNetworkErrorMessage(err);
      setError(errorDetails.message);
      setErrorAction(errorDetails.action || null);
      setCanRetry(errorDetails.retryable);
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800">{error}</p>
              {errorAction && (
                <p className="mt-1 text-sm text-red-600">{errorAction}</p>
              )}
            </div>
          </div>
          {canRetry && !processing && (
            <button
              type="button"
              onClick={() => {
                setError(null);
                setErrorAction(null);
              }}
              className="mt-3 flex items-center text-sm text-red-700 hover:text-red-800 font-medium"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Try again
            </button>
          )}
        </div>
      )}

      {/* Stripe Payment Element */}
      <div className="border border-gray-200 rounded-lg p-4">
        <PaymentElement
          options={{
            layout: 'tabs',
            paymentMethodOrder: ['card'],
          }}
        />
      </div>

      {/* Order Summary (compact) */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">{tier.name} Plan</span>
          <span className="text-gray-900">{formatPrice(tier.price_per_restaurant_cents)}/mo x {restaurantCount}</span>
        </div>
        <div className="flex justify-between font-semibold">
          <span className="text-gray-900">Monthly Total</span>
          <span className="text-emerald-600">{formatPrice(monthlyTotal)}/mo</span>
        </div>
      </div>

      {/* Terms Agreement */}
      <label className="flex items-start cursor-pointer">
        <input
          type="checkbox"
          checked={agreedToTerms}
          onChange={(e) => setAgreedToTerms(e.target.checked)}
          className="h-4 w-4 mt-1 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
        />
        <span className="ml-2 text-sm text-gray-600">
          I agree to the{' '}
          <a href="/terms" className="text-emerald-600 hover:underline" target="_blank" rel="noopener noreferrer">
            Terms of Service
          </a>{' '}
          and authorize ShiftCheck to charge my payment method monthly
        </span>
      </label>

      <div className="flex space-x-4">
        <button
          type="button"
          onClick={onBack}
          disabled={processing}
          className="flex-1 flex justify-center items-center py-3 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </button>
        <button
          type="submit"
          disabled={processing || !stripe || !elements}
          className="flex-1 flex justify-center items-center py-3 px-4 border border-transparent rounded-lg text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50"
        >
          {processing ? (
            <>
              <Loader2 className="animate-spin h-5 w-5 mr-2" />
              Processing...
            </>
          ) : (
            <>
              <Lock className="mr-2 h-4 w-4" />
              Pay {formatPrice(monthlyTotal)}/mo
            </>
          )}
        </button>
      </div>

      <p className="text-xs text-center text-gray-500 flex items-center justify-center">
        <Lock className="h-3 w-3 mr-1" />
        Secured by Stripe. Your payment info is encrypted.
      </p>
    </form>
  );
}

/**
 * Fallback form when Stripe is not configured (dev/demo mode)
 */
function DemoCheckoutForm({
  tier,
  restaurantCount,
  monthlyTotal,
  onSuccess,
  onBack,
}: {
  tier: PricingTier;
  restaurantCount: number;
  monthlyTotal: number;
  onSuccess: () => void;
  onBack: () => void;
}) {
  const [processing, setProcessing] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatPrice = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!agreedToTerms) {
      setError('Please agree to the terms of service');
      return;
    }

    setProcessing(true);
    setError(null);

    // Track payment started (demo mode)
    trackPaymentStarted({
      plan_name: tier.name,
      amount: monthlyTotal / 100,
      restaurant_count: restaurantCount,
    });

    // Demo mode: simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Track payment completed (demo mode)
    trackPaymentCompleted({
      plan_name: tier.name,
      amount: monthlyTotal / 100,
      restaurant_count: restaurantCount,
    });

    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-6">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Demo Mode Notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start">
          <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 mr-2 shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-800">Demo Mode</p>
            <p className="text-sm text-amber-700 mt-1">
              Stripe is not configured. In production, you&apos;ll enter your card details here.
              Click &quot;Complete Payment&quot; to simulate a successful payment.
            </p>
          </div>
        </div>
      </div>

      {/* Simulated Card Input */}
      <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
          <input
            type="text"
            value="4242 4242 4242 4242"
            disabled
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-500"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Expiry</label>
            <input
              type="text"
              value="12/28"
              disabled
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">CVC</label>
            <input
              type="text"
              value="123"
              disabled
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-500"
            />
          </div>
        </div>
      </div>

      {/* Order Summary */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">{tier.name} Plan</span>
          <span className="text-gray-900">{formatPrice(tier.price_per_restaurant_cents)}/mo x {restaurantCount}</span>
        </div>
        <div className="flex justify-between font-semibold">
          <span className="text-gray-900">Monthly Total</span>
          <span className="text-emerald-600">{formatPrice(monthlyTotal)}/mo</span>
        </div>
      </div>

      {/* Terms Agreement */}
      <label className="flex items-start cursor-pointer">
        <input
          type="checkbox"
          checked={agreedToTerms}
          onChange={(e) => setAgreedToTerms(e.target.checked)}
          className="h-4 w-4 mt-1 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
        />
        <span className="ml-2 text-sm text-gray-600">
          I agree to the{' '}
          <a href="/terms" className="text-emerald-600 hover:underline" target="_blank" rel="noopener noreferrer">
            Terms of Service
          </a>{' '}
          and authorize ShiftCheck to charge my payment method monthly
        </span>
      </label>

      <div className="flex space-x-4">
        <button
          type="button"
          onClick={onBack}
          disabled={processing}
          className="flex-1 flex justify-center items-center py-3 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </button>
        <button
          type="submit"
          disabled={processing}
          className="flex-1 flex justify-center items-center py-3 px-4 border border-transparent rounded-lg text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50"
        >
          {processing ? (
            <>
              <Loader2 className="animate-spin h-5 w-5 mr-2" />
              Processing...
            </>
          ) : (
            <>
              <Lock className="mr-2 h-4 w-4" />
              Complete Payment
            </>
          )}
        </button>
      </div>

      <p className="text-xs text-center text-gray-500 flex items-center justify-center">
        <Lock className="h-3 w-3 mr-1" />
        Demo mode - no actual charges
      </p>
    </form>
  );
}

/**
 * Main Payment Page Component
 */
export default function PaymentPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  // Track abandonment
  useSignupAbandonmentTracking({ step: 'payment' });

  // Signup progress tracking
  const { updateProgress } = useSignupProgress();

  const [owner, setOwner] = useState<Owner | null>(null);
  const [_restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [tier, setTier] = useState<PricingTier | null>(null);
  const [loading, setLoading] = useState(true);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [restaurantCount, setRestaurantCount] = useState<number>(0);

  // Load data and create payment intent
  useEffect(() => {
    const loadData = async () => {
      if (!user) return;

      // Get selected plan from localStorage
      const selectedPlan = localStorage.getItem('selected_plan');
      if (!selectedPlan || selectedPlan === 'free_starter') {
        navigate('/signup/complete');
        return;
      }

      // Get restaurant count from localStorage (includes pending restaurants)
      const storedCount = localStorage.getItem('restaurant_count');
      const count = storedCount ? parseInt(storedCount, 10) : 0;

      // Load owner profile
      const { owner: ownerData } = await getOwnerProfile();
      if (!ownerData) {
        navigate('/signup/profile');
        return;
      }
      setOwner(ownerData);

      // Load restaurants
      const { restaurants: restaurantData } = await getOwnerRestaurants();
      if (restaurantData.length === 0) {
        navigate('/signup/restaurants');
        return;
      }
      setRestaurants(restaurantData);

      // Use stored count if available and valid, otherwise use actual restaurant count
      const effectiveCount = count > 0 ? count : restaurantData.length;
      setRestaurantCount(effectiveCount);

      // Load tier details
      const { tier: tierData } = await getPricingTier(selectedPlan);
      if (!tierData) {
        navigate('/signup/plan');
        return;
      }
      setTier(tierData);

      // Create payment intent if Stripe is configured
      if (stripePublishableKey) {
        try {
          const response = await fetch('/api/stripe/create-payment-intent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              planId: selectedPlan,
              restaurantCount: effectiveCount,
              ownerEmail: ownerData.email,
            }),
          });

          if (response.ok) {
            const data = await response.json();
            setClientSecret(data.clientSecret);
          }
        } catch (err) {
          console.error('Failed to create payment intent:', err);
          // Continue without clientSecret - will show demo mode
        }
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
      navigate('/auth/login?redirect=/signup/payment');
    }
  }, [user, authLoading, navigate]);

  const formatPrice = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  const monthlyTotal = tier ? tier.price_per_restaurant_cents * restaurantCount : 0;

  const handlePaymentSuccess = () => {
    // Update signup progress
    updateProgress('complete');
    navigate('/signup/complete');
  };

  const handleBack = () => {
    navigate('/signup/plan');
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-emerald-600" />
      </div>
    );
  }

  if (!owner || !tier) {
    return null;
  }

  // Determine if we should use real Stripe or demo mode
  const useRealStripe = stripePromise && clientSecret;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg mx-auto">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-2">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-sm font-medium">
                  <Check className="h-4 w-4" />
                </div>
                {step < 4 && <div className="w-8 sm:w-12 h-0.5 bg-emerald-600"></div>}
              </div>
            ))}
            <div className="w-8 sm:w-12 h-0.5 bg-emerald-600"></div>
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-sm font-medium">
              5
            </div>
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Complete Payment</h1>
          <p className="mt-2 text-gray-600">Secure payment powered by Stripe</p>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Order Summary</h2>
          </div>
          <div className="p-6 space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Plan</span>
              <span className="font-medium text-gray-900">{tier.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Restaurants</span>
              <span className="font-medium text-gray-900">{restaurantCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Price per restaurant</span>
              <span className="font-medium text-gray-900">
                {formatPrice(tier.price_per_restaurant_cents)}/mo
              </span>
            </div>
            <div className="border-t pt-3 flex justify-between">
              <span className="font-semibold text-gray-900">Monthly Total</span>
              <span className="font-bold text-emerald-600 text-xl">
                {formatPrice(monthlyTotal)}/mo
              </span>
            </div>
          </div>
        </div>

        {/* Billing Info */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Billing Address</h2>
          </div>
          <div className="p-6">
            <p className="text-gray-600">
              {owner.billing_street}<br />
              {owner.billing_city}, {owner.billing_state} {owner.billing_zip}
            </p>
          </div>
        </div>

        {/* Payment Form */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <CreditCard className="h-5 w-5 mr-2 text-emerald-600" />
              Payment Details
            </h2>
          </div>

          {useRealStripe ? (
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret,
                appearance: {
                  theme: 'stripe',
                  variables: {
                    colorPrimary: '#059669', // emerald-600
                    colorBackground: '#ffffff',
                    colorText: '#1f2937',
                    colorDanger: '#dc2626',
                    fontFamily: 'system-ui, sans-serif',
                    borderRadius: '8px',
                  },
                },
              }}
            >
              <CheckoutForm
                owner={owner}
                tier={tier}
                restaurantCount={restaurantCount}
                monthlyTotal={monthlyTotal}
                onSuccess={handlePaymentSuccess}
                onBack={handleBack}
              />
            </Elements>
          ) : (
            <DemoCheckoutForm
              tier={tier}
              restaurantCount={restaurantCount}
              monthlyTotal={monthlyTotal}
              onSuccess={handlePaymentSuccess}
              onBack={handleBack}
            />
          )}
        </div>
      </div>
    </div>
  );
}
