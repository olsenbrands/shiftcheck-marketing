/**
 * Profile Page (Step 3)
 * ShiftCheck Marketing Website
 *
 * Collects owner personal info (3A) and billing address (3B).
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Phone, MapPin, Building2, Loader2, ArrowRight, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { createOwnerProfile } from '../../services/authService';
import { getOwnerProfile, updateBillingAddress } from '../../services/ownerService';
import { formatPhoneForDisplay, isValidUSPhone } from '../../utils/phone';
import { trackOwnerProfileCompleted } from '../../services/analyticsService';
import { useSignupAbandonmentTracking } from '../../hooks/useSignupAbandonmentTracking';
import { useSignupProgress } from '../../hooks/useSignupProgress';

type Step = 'personal' | 'billing';

// localStorage keys for form persistence
const STORAGE_KEYS = {
  STEP: 'profile_step',
  FIRST_NAME: 'profile_first_name',
  LAST_NAME: 'profile_last_name',
  PHONE: 'profile_phone',
  STREET: 'profile_street',
  CITY: 'profile_city',
  STATE: 'profile_state',
  ZIP: 'profile_zip',
  COUNTRY: 'profile_country',
};

// Helper to clear all profile form data from localStorage
const clearProfileStorage = () => {
  Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
};

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  // Track abandonment
  useSignupAbandonmentTracking({ step: 'profile' });

  // Signup progress tracking
  const { updateProgress } = useSignupProgress();

  // Restore step from localStorage, default to 'personal'
  const [step, setStep] = useState<Step>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.STEP);
    return (saved === 'billing' ? 'billing' : 'personal') as Step;
  });
  const [loading, setLoading] = useState(false);
  const [checkingProfile, setCheckingProfile] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Personal Info (Step 3A) - restore from localStorage
  const [firstName, setFirstName] = useState(() => localStorage.getItem(STORAGE_KEYS.FIRST_NAME) || '');
  const [lastName, setLastName] = useState(() => localStorage.getItem(STORAGE_KEYS.LAST_NAME) || '');
  const [phone, setPhone] = useState(() => localStorage.getItem(STORAGE_KEYS.PHONE) || '');

  // Billing Address (Step 3B) - restore from localStorage
  const [street, setStreet] = useState(() => localStorage.getItem(STORAGE_KEYS.STREET) || '');
  const [city, setCity] = useState(() => localStorage.getItem(STORAGE_KEYS.CITY) || '');
  const [state, setState] = useState(() => localStorage.getItem(STORAGE_KEYS.STATE) || '');
  const [zip, setZip] = useState(() => localStorage.getItem(STORAGE_KEYS.ZIP) || '');
  const [country, setCountry] = useState(() => localStorage.getItem(STORAGE_KEYS.COUNTRY) || 'US');

  // Save form data to localStorage when fields change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STEP, step);
  }, [step]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FIRST_NAME, firstName);
  }, [firstName]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LAST_NAME, lastName);
  }, [lastName]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PHONE, phone);
  }, [phone]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STREET, street);
  }, [street]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CITY, city);
  }, [city]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STATE, state);
  }, [state]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ZIP, zip);
  }, [zip]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.COUNTRY, country);
  }, [country]);

  // Check if profile already exists
  useEffect(() => {
    const checkProfile = async () => {
      if (!user) return;

      const { owner } = await getOwnerProfile();

      if (owner) {
        // Profile exists, skip to restaurants
        if (owner.billing_street) {
          clearProfileStorage();
          navigate('/signup/restaurants');
        } else {
          // Has personal info but no billing, go to billing step
          setFirstName(owner.first_name);
          setLastName(owner.last_name);
          setPhone(formatPhoneForDisplay(owner.phone));
          setStep('billing');
        }
      }

      setCheckingProfile(false);
    };

    if (!authLoading) {
      checkProfile();
    }
  }, [user, authLoading, navigate]);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth/login?redirect=/signup/profile');
    }
  }, [user, authLoading, navigate]);

  const handlePersonalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!firstName || !lastName || !phone) {
      setError('Please fill in all fields');
      return;
    }

    if (!isValidUSPhone(phone)) {
      setError('Please enter a valid US phone number');
      return;
    }

    setLoading(true);

    try {
      // Get referral code from localStorage
      const referralCode = localStorage.getItem('referral_code');
      const email = localStorage.getItem('signup_email') || user?.email || '';

      const { owner, error: createError } = await createOwnerProfile({
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
        referred_by_code: referralCode,
      });

      if (createError) {
        setError(createError.message);
        setLoading(false);
        return;
      }

      if (owner) {
        // Clear referral code from localStorage
        localStorage.removeItem('referral_code');
        setStep('billing');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleBillingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!street || !city || !state || !zip || !country) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      const { owner, error: updateError } = await updateBillingAddress({
        billing_street: street,
        billing_city: city,
        billing_state: state,
        billing_zip: zip,
        billing_country: country,
      });

      if (updateError) {
        setError(updateError.message);
        setLoading(false);
        return;
      }

      if (owner) {
        // Track profile completion
        const referralCode = localStorage.getItem('referral_code');
        trackOwnerProfileCompleted({
          has_referral_code: !!referralCode,
          state,
          country,
        });

        // Update signup progress
        updateProgress('restaurants');

        // Clear profile form data from localStorage on successful completion
        clearProfileStorage();
        navigate('/signup/restaurants');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || checkingProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-2">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-sm font-medium">
                1
              </div>
              <span className="ml-2 text-sm font-medium text-emerald-600">Account</span>
            </div>
            <div className="w-12 h-0.5 bg-emerald-600"></div>
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === 'personal' || step === 'billing' ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                2
              </div>
              <span className={`ml-2 text-sm font-medium ${
                step === 'personal' || step === 'billing' ? 'text-emerald-600' : 'text-gray-500'
              }`}>Profile</span>
            </div>
            <div className={`w-12 h-0.5 ${step === 'billing' ? 'bg-emerald-600' : 'bg-gray-200'}`}></div>
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-sm font-medium">
                3
              </div>
              <span className="ml-2 text-sm font-medium text-gray-500">Restaurants</span>
            </div>
          </div>
        </div>

        <div className="bg-white shadow-lg rounded-xl p-8">
          {step === 'personal' ? (
            <>
              <div className="text-center mb-6">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-emerald-100">
                  <User className="h-6 w-6 text-emerald-600" />
                </div>
                <h2 className="mt-4 text-2xl font-bold text-gray-900">Personal Information</h2>
                <p className="mt-2 text-sm text-gray-600">Tell us a bit about yourself</p>
              </div>

              <form onSubmit={handlePersonalSubmit} className="space-y-6">
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                      First name
                    </label>
                    <input
                      id="firstName"
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                      Last name
                    </label>
                    <input
                      id="lastName"
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Phone number
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="phone"
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="block w-full pl-10 px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="(801) 555-1234"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="animate-spin h-5 w-5" />
                  ) : (
                    <>
                      Continue
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="text-center mb-6">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-emerald-100">
                  <Building2 className="h-6 w-6 text-emerald-600" />
                </div>
                <h2 className="mt-4 text-2xl font-bold text-gray-900">Billing Address</h2>
                <p className="mt-2 text-sm text-gray-600">For your subscription invoices</p>
              </div>

              <form onSubmit={handleBillingSubmit} className="space-y-6">
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <div>
                  <label htmlFor="street" className="block text-sm font-medium text-gray-700">
                    Street address
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="street"
                      type="text"
                      required
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      className="block w-full pl-10 px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="123 Main Street"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                      City
                    </label>
                    <input
                      id="city"
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                      State
                    </label>
                    <input
                      id="state"
                      type="text"
                      required
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="UT"
                      maxLength={2}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="zip" className="block text-sm font-medium text-gray-700">
                      ZIP / Postal code
                    </label>
                    <input
                      id="zip"
                      type="text"
                      required
                      value={zip}
                      onChange={(e) => setZip(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="84041"
                      maxLength={10}
                    />
                  </div>
                  <div>
                    <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                      Country
                    </label>
                    <select
                      id="country"
                      required
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      <option value="US">United States</option>
                      <option value="CA">Canada</option>
                      <option value="MX">Mexico</option>
                      <option value="GB">United Kingdom</option>
                      <option value="AU">Australia</option>
                    </select>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setStep('personal')}
                    className="flex-1 flex justify-center items-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader2 className="animate-spin h-5 w-5" />
                    ) : (
                      <>
                        Continue
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
