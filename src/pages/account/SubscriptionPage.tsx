/**
 * Account Subscription Page
 * ShiftCheck Marketing Website
 *
 * View and manage subscription: plan details, billing, payment methods.
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CreditCard,
  Calendar,
  CheckCircle,
  AlertCircle,
  Loader2,
  ExternalLink,
  ArrowUpRight,
  Download,
  FileText,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import AuthenticatedNavbar from '../../components/AuthenticatedNavbar';
import { getOwnerProfile, type Owner } from '../../services/ownerService';
import { getOwnerRestaurants, type Restaurant } from '../../services/restaurantService';
import {
  getOwnerSubscription,
  getPricingTiers,
  type Subscription,
  type PricingTier,
} from '../../services/subscriptionService';
import {
  createPortalSession,
  getInvoices,
  type InvoiceData,
} from '../../services/stripeService';

export default function SubscriptionPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [owner, setOwner] = useState<Owner | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [tiers, setTiers] = useState<PricingTier[]>([]);
  const [invoices, setInvoices] = useState<InvoiceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);

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

      const { tiers: tierData } = await getPricingTiers();
      setTiers(tierData);

      // Load invoices if customer has Stripe ID
      if (subData?.stripe_customer_id) {
        const invoiceResult = await getInvoices({ customerId: subData.stripe_customer_id });
        if ('invoices' in invoiceResult) {
          setInvoices(invoiceResult.invoices);
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
      navigate('/auth/login?redirect=/account/subscription');
    }
  }, [user, authLoading, navigate]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-primary-500" />
      </div>
    );
  }

  const currentTier = tiers.find((t) => t.id === subscription?.plan_type);
  const activeRestaurants = restaurants.filter((r) => r.is_active);
  const formatPrice = (cents: number) => `$${(cents / 100).toFixed(2)}`;
  const monthlyTotal = currentTier
    ? currentTier.price_per_restaurant_cents * activeRestaurants.length
    : 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-primary-100 text-primary-700';
      case 'trialing':
        return 'bg-blue-100 text-blue-700';
      case 'past_due':
        return 'bg-red-100 text-red-700';
      case 'canceled':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const handleOpenPortal = async () => {
    if (!subscription?.stripe_customer_id) return;

    setPortalLoading(true);
    const result = await createPortalSession({
      customerId: subscription.stripe_customer_id,
      returnUrl: window.location.href,
    });

    if ('url' in result) {
      window.location.href = result.url;
    } else {
      alert(result.error || 'Failed to open payment portal');
      setPortalLoading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  const formatInvoiceAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AuthenticatedNavbar
        section="Subscription"
        showBack={true}
        backTo="/account/dashboard"
        backLabel="Back to Dashboard"
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Subscription</h1>
          <p className="mt-1 text-gray-600">
            Manage your plan and billing
          </p>
        </div>

        {/* Current Plan */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
          <div className="px-6 py-4 bg-primary-500">
            <h2 className="text-lg font-semibold text-white flex items-center">
              <CreditCard className="h-5 w-5 mr-2" />
              Current Plan
            </h2>
          </div>
          <div className="p-6">
            {subscription ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 capitalize">
                      {currentTier?.name || subscription.plan_type.replace('_', ' ')}
                    </h3>
                    <p className="text-gray-500">{currentTier?.description}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                      subscription.status
                    )}`}
                  >
                    {subscription.status === 'trialing'
                      ? 'Free Trial'
                      : subscription.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="grid md:grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <p className="text-sm text-gray-500">Active Restaurants</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {activeRestaurants.length} of {subscription.max_active_restaurants}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Monthly Cost</p>
                    <p className="text-lg font-semibold text-primary-500">
                      {currentTier?.price_per_restaurant_cents === 0
                        ? 'Free'
                        : `${formatPrice(monthlyTotal)}/mo`}
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                    <div>
                      <p className="text-sm text-gray-500">
                        {subscription.status === 'trialing' ? 'Trial Ends' : 'Current Period'}
                      </p>
                      <p className="font-medium text-gray-900">
                        {subscription.current_period_end
                          ? new Date(subscription.current_period_end).toLocaleDateString()
                          : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Features List */}
                {currentTier?.features && (
                  <div className="pt-4 border-t">
                    <p className="text-sm font-medium text-gray-700 mb-2">Included Features:</p>
                    <ul className="grid md:grid-cols-2 gap-2">
                      {currentTier.features.map((feature, index) => (
                        <li key={index} className="flex items-center text-sm text-gray-600">
                          <CheckCircle className="h-4 w-4 text-primary-600 mr-2 shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-6">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Subscription</h3>
                <p className="text-gray-500 mb-4">Choose a plan to activate your restaurants</p>
                <Link
                  to="/signup/plan"
                  className="inline-flex items-center px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
                >
                  Choose a Plan
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Upgrade Options */}
        {subscription && subscription.plan_type !== 'expand' && (
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl shadow-lg p-6 mb-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold mb-1">Need more restaurants?</h3>
                <p className="text-primary-100">
                  Upgrade your plan to manage more locations
                </p>
              </div>
              <Link
                to="/signup/plan"
                className="flex items-center px-4 py-2 bg-white text-primary-500 rounded-lg font-medium hover:bg-primary-50 transition-colors"
              >
                Upgrade Plan
                <ArrowUpRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        )}

        {/* Billing Info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Billing Information</h2>
          </div>
          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Billing Address</p>
                {owner?.billing_street ? (
                  <div className="text-gray-900">
                    <p>{owner.billing_street}</p>
                    <p>
                      {owner.billing_city}, {owner.billing_state} {owner.billing_zip}
                    </p>
                    <p>{owner.billing_country}</p>
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No billing address on file</p>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Contact Email</p>
                <p className="text-gray-900">{owner?.email}</p>
              </div>
            </div>

            {/* Stripe Customer Portal Link */}
            {subscription?.stripe_customer_id && (
              <div className="mt-6 pt-6 border-t">
                <button
                  onClick={handleOpenPortal}
                  disabled={portalLoading}
                  className="inline-flex items-center text-primary-500 hover:text-primary-700 font-medium disabled:opacity-50"
                >
                  {portalLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Opening portal...
                    </>
                  ) : (
                    <>
                      Manage Payment Methods
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Billing History */}
        {subscription?.stripe_customer_id && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-gray-500" />
                Billing History
              </h2>
            </div>
            <div className="divide-y divide-gray-200">
              {invoices.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  No invoices yet. Your first invoice will appear here after your first billing cycle.
                </div>
              ) : (
                invoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="px-6 py-4 flex items-center justify-between"
                  >
                    <div className="flex-1">
                      <div className="flex items-center">
                        <p className="font-medium text-gray-900">
                          {invoice.number || 'Invoice'}
                        </p>
                        <span
                          className={`ml-3 px-2 py-0.5 rounded-full text-xs font-medium ${
                            invoice.status === 'paid'
                              ? 'bg-primary-100 text-primary-700'
                              : invoice.status === 'open'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {invoice.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {formatDate(invoice.created)} &middot;{' '}
                        {formatInvoiceAmount(invoice.amount_paid || invoice.amount_due, invoice.currency)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      {invoice.hosted_invoice_url && (
                        <a
                          href={invoice.hosted_invoice_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary-500 hover:text-primary-700 font-medium"
                        >
                          View
                        </a>
                      )}
                      {invoice.invoice_pdf && (
                        <a
                          href={invoice.invoice_pdf}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
                        >
                          <Download className="h-4 w-4 mr-1" />
                          PDF
                        </a>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Pricing Comparison */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">All Plans</h2>
          </div>
          <div className="p-6">
            <div className="grid md:grid-cols-3 gap-4">
              {tiers.map((tier) => {
                const isCurrentPlan = tier.id === subscription?.plan_type;

                return (
                  <div
                    key={tier.id}
                    className={`rounded-xl border-2 p-4 ${
                      isCurrentPlan
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{tier.name}</h3>
                      {isCurrentPlan && (
                        <span className="text-xs font-medium text-primary-500 bg-primary-100 px-2 py-1 rounded-full">
                          Current
                        </span>
                      )}
                    </div>
                    <p className="text-2xl font-bold text-gray-900 mb-2">
                      {tier.price_per_restaurant_cents === 0 ? (
                        'Free'
                      ) : (
                        <>
                          {formatPrice(tier.price_per_restaurant_cents)}
                          <span className="text-sm font-normal text-gray-500">/mo/restaurant</span>
                        </>
                      )}
                    </p>
                    <p className="text-sm text-gray-500 mb-3">{tier.description}</p>
                    <p className="text-sm text-gray-600">
                      {tier.max_restaurants
                        ? `Up to ${tier.max_restaurants} restaurants`
                        : 'Unlimited restaurants'}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
