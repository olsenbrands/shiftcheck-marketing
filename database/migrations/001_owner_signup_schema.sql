-- Migration: 001_owner_signup_schema.sql
-- Purpose: Create Owner Sign-Up & Account Management tables
-- Date: 2025-12-06
-- Related: openspec/changes/add-owner-signup-account/

-- ============================================
-- 1. OWNERS TABLE
-- ============================================
-- Links to auth.users via id, stores profile and billing info

CREATE TABLE IF NOT EXISTS owners (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Personal Info (Step 3A)
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL, -- E.164 format: +1XXXXXXXXXX

  -- Billing Address (Step 3B)
  billing_street TEXT,
  billing_city TEXT,
  billing_state TEXT,
  billing_zip TEXT,
  billing_country TEXT DEFAULT 'US',

  -- Referral System
  referral_code TEXT UNIQUE NOT NULL, -- Generated: OWNER_ABC123XYZ
  referred_by_code TEXT, -- Code they used when signing up

  -- Verification
  email_verified BOOLEAN DEFAULT FALSE,
  email_verified_at TIMESTAMPTZ,

  -- Progress Tracking
  sign_up_completed_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE owners ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 2. PRICING_TIERS TABLE (Static Reference)
-- ============================================
-- $99/month per restaurant pricing

CREATE TABLE IF NOT EXISTS pricing_tiers (
  id TEXT PRIMARY KEY, -- 'free_starter', 'grow', 'expand'
  name TEXT NOT NULL,
  description TEXT,
  price_per_restaurant_cents INTEGER NOT NULL, -- 9900 = $99.00
  min_restaurants INTEGER NOT NULL DEFAULT 1,
  max_restaurants INTEGER, -- NULL means unlimited
  features JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS (read-only for everyone)
ALTER TABLE pricing_tiers ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 3. SUBSCRIPTIONS TABLE
-- ============================================
-- Stripe subscription data (Stripe is source of truth)

CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES owners(id) ON DELETE CASCADE,

  -- Stripe IDs
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  stripe_price_id TEXT,

  -- Plan Details
  plan_type TEXT NOT NULL REFERENCES pricing_tiers(id),
  quantity INTEGER NOT NULL DEFAULT 1, -- Number of restaurants
  max_active_restaurants INTEGER NOT NULL DEFAULT 1,

  -- Status (from Stripe webhooks)
  status TEXT NOT NULL DEFAULT 'incomplete',
  -- Values: incomplete, incomplete_expired, trialing, active, past_due, canceled, unpaid, paused

  -- Billing Period
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  trial_start TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 4. REFERRAL_REDEMPTIONS TABLE
-- ============================================
-- Track referral discounts

CREATE TABLE IF NOT EXISTS referral_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Who referred
  referrer_owner_id UUID NOT NULL REFERENCES owners(id) ON DELETE CASCADE,
  referrer_code TEXT NOT NULL,

  -- Who was referred
  referred_owner_id UUID NOT NULL REFERENCES owners(id) ON DELETE CASCADE,

  -- Discount Details
  discount_type TEXT NOT NULL DEFAULT 'percentage', -- 'percentage' or 'fixed'
  discount_value INTEGER NOT NULL DEFAULT 10, -- 10% or $10

  -- Redemption Status
  redeemed_at TIMESTAMPTZ DEFAULT NOW(),
  discount_applied_at TIMESTAMPTZ,
  discount_expires_at TIMESTAMPTZ, -- 12 months from redemption

  -- Tracking
  stripe_coupon_id TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Prevent duplicate referrals
  UNIQUE(referrer_owner_id, referred_owner_id)
);

-- Enable RLS
ALTER TABLE referral_redemptions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 5. MODIFY RESTAURANTS TABLE
-- ============================================
-- Add owner sign-up related columns

-- Add owner_id if it doesn't exist (links restaurant to owner account)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'restaurants' AND column_name = 'owner_id'
  ) THEN
    ALTER TABLE restaurants ADD COLUMN owner_id UUID REFERENCES owners(id);
  END IF;
END $$;

-- Add is_active for subscription-based activation
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'restaurants' AND column_name = 'is_active'
  ) THEN
    ALTER TABLE restaurants ADD COLUMN is_active BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- Add activated_at timestamp
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'restaurants' AND column_name = 'activated_at'
  ) THEN
    ALTER TABLE restaurants ADD COLUMN activated_at TIMESTAMPTZ;
  END IF;
END $$;

-- Add restaurant_address (full address for sign-up)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'restaurants' AND column_name = 'restaurant_address'
  ) THEN
    ALTER TABLE restaurants ADD COLUMN restaurant_address TEXT;
  END IF;
END $$;

-- Add restaurant_phone (E.164 format)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'restaurants' AND column_name = 'restaurant_phone'
  ) THEN
    ALTER TABLE restaurants ADD COLUMN restaurant_phone TEXT;
  END IF;
END $$;

-- Add restaurant_photo_url
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'restaurants' AND column_name = 'restaurant_photo_url'
  ) THEN
    ALTER TABLE restaurants ADD COLUMN restaurant_photo_url TEXT;
  END IF;
END $$;

-- ============================================
-- 6. INDEXES FOR PERFORMANCE
-- ============================================

-- Owners indexes
CREATE INDEX IF NOT EXISTS idx_owners_email ON owners(email);
CREATE INDEX IF NOT EXISTS idx_owners_referral_code ON owners(referral_code);
CREATE INDEX IF NOT EXISTS idx_owners_phone ON owners(phone);

-- Subscriptions indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_owner_id ON subscriptions(owner_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

-- Restaurants indexes (for owner queries)
CREATE INDEX IF NOT EXISTS idx_restaurants_owner_id ON restaurants(owner_id);
CREATE INDEX IF NOT EXISTS idx_restaurants_owner_active ON restaurants(owner_id, is_active);

-- Referral indexes
CREATE INDEX IF NOT EXISTS idx_referral_redemptions_referrer ON referral_redemptions(referrer_owner_id);
CREATE INDEX IF NOT EXISTS idx_referral_redemptions_referred ON referral_redemptions(referred_owner_id);

-- ============================================
-- 7. SEED PRICING TIERS
-- ============================================

INSERT INTO pricing_tiers (id, name, description, price_per_restaurant_cents, min_restaurants, max_restaurants, features, sort_order)
VALUES
  (
    'free_starter',
    'Free Starter',
    'Perfect for trying ShiftCheck with one restaurant',
    0,
    1,
    1,
    '["1 restaurant", "Full feature access", "30-day trial", "Email support"]'::jsonb,
    1
  ),
  (
    'grow',
    'Grow',
    'For owners with 1-3 restaurants',
    9900, -- $99.00
    1,
    3,
    '["1-3 restaurants", "Full feature access", "Priority support", "Analytics dashboard"]'::jsonb,
    2
  ),
  (
    'expand',
    'Expand',
    'For owners with 4+ restaurants',
    9900, -- $99.00
    4,
    NULL, -- unlimited
    '["4+ restaurants", "Full feature access", "Dedicated support", "Advanced analytics", "Custom onboarding"]'::jsonb,
    3
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price_per_restaurant_cents = EXCLUDED.price_per_restaurant_cents,
  min_restaurants = EXCLUDED.min_restaurants,
  max_restaurants = EXCLUDED.max_restaurants,
  features = EXCLUDED.features,
  sort_order = EXCLUDED.sort_order;

-- ============================================
-- 8. RLS POLICIES
-- ============================================

-- Pricing tiers: Everyone can read (public pricing)
CREATE POLICY "Anyone can view pricing tiers"
ON pricing_tiers FOR SELECT
TO anon, authenticated
USING (is_active = true);

-- Owners: Can only see/update own profile
CREATE POLICY "Owners see own profile"
ON owners FOR SELECT
TO authenticated
USING (id = auth.uid());

CREATE POLICY "Owners update own profile"
ON owners FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

CREATE POLICY "Owners insert own profile"
ON owners FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());

-- Subscriptions: Owners see own subscriptions
CREATE POLICY "Owners view own subscriptions"
ON subscriptions FOR SELECT
TO authenticated
USING (owner_id = auth.uid());

-- Subscriptions: Service role manages subscriptions (for webhooks)
CREATE POLICY "Service role manages subscriptions"
ON subscriptions FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Referral redemptions: Owners see their referrals (as referrer)
CREATE POLICY "Owners see referrals they made"
ON referral_redemptions FOR SELECT
TO authenticated
USING (referrer_owner_id = auth.uid());

-- Referral redemptions: Owners see referrals they received
CREATE POLICY "Owners see referrals they received"
ON referral_redemptions FOR SELECT
TO authenticated
USING (referred_owner_id = auth.uid());

-- ============================================
-- 9. UPDATE RESTAURANTS RLS FOR OWNERS
-- ============================================

-- Owners can see all their restaurants
CREATE POLICY "Owners see all their restaurants"
ON restaurants FOR SELECT
TO authenticated
USING (owner_id = auth.uid());

-- Owners can create restaurants
CREATE POLICY "Owners create restaurants"
ON restaurants FOR INSERT
TO authenticated
WITH CHECK (owner_id = auth.uid());

-- Owners can update their restaurants
CREATE POLICY "Owners update their restaurants"
ON restaurants FOR UPDATE
TO authenticated
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

-- Managers see active assigned restaurants (updated to include is_active check)
-- Note: This may need adjustment based on existing manager policies
CREATE POLICY "Managers see active assigned restaurants"
ON restaurants FOR SELECT
TO authenticated
USING (
  is_active = true
  AND normalize_phone(manager_phone) = normalize_phone(auth.jwt()->>'phone')
);

-- ============================================
-- 10. UPDATED_AT TRIGGERS
-- ============================================

-- Function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for owners
DROP TRIGGER IF EXISTS update_owners_updated_at ON owners;
CREATE TRIGGER update_owners_updated_at
  BEFORE UPDATE ON owners
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for subscriptions
DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
