-- Migration: 004_consolidate_owner_tables.sql
-- Purpose: Consolidate owners and owner_profiles into single source of truth
-- Date: 2025-12-18
--
-- This migration:
-- 1. Adds missing columns from 'owners' to 'owner_profiles'
-- 2. Creates trigger to auto-compute full_name
-- 3. Migrates all data from 'owners' to 'owner_profiles'
-- 4. Updates foreign key references
-- 5. Drops the 'owners' table
--
-- IMPORTANT: Run this in a transaction and backup your database first!

BEGIN;

-- ============================================
-- PHASE 1: ADD MISSING COLUMNS TO OWNER_PROFILES
-- ============================================

-- Personal info (split name into first/last)
ALTER TABLE owner_profiles
ADD COLUMN IF NOT EXISTS first_name TEXT;

ALTER TABLE owner_profiles
ADD COLUMN IF NOT EXISTS last_name TEXT;

-- Billing address fields
ALTER TABLE owner_profiles
ADD COLUMN IF NOT EXISTS billing_street TEXT;

ALTER TABLE owner_profiles
ADD COLUMN IF NOT EXISTS billing_city TEXT;

ALTER TABLE owner_profiles
ADD COLUMN IF NOT EXISTS billing_state TEXT;

ALTER TABLE owner_profiles
ADD COLUMN IF NOT EXISTS billing_zip TEXT;

ALTER TABLE owner_profiles
ADD COLUMN IF NOT EXISTS billing_country TEXT DEFAULT 'US';

-- Referral system
ALTER TABLE owner_profiles
ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;

ALTER TABLE owner_profiles
ADD COLUMN IF NOT EXISTS referred_by_code TEXT;

-- Email verification
ALTER TABLE owner_profiles
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;

ALTER TABLE owner_profiles
ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMPTZ;

-- Progress tracking
ALTER TABLE owner_profiles
ADD COLUMN IF NOT EXISTS sign_up_completed_at TIMESTAMPTZ;

-- ============================================
-- PHASE 2: CREATE TRIGGER FOR FULL_NAME
-- ============================================
-- Auto-compute full_name from first_name + last_name

CREATE OR REPLACE FUNCTION compute_full_name()
RETURNS TRIGGER AS $$
BEGIN
  -- Only compute if first_name or last_name changed and both are present
  IF NEW.first_name IS NOT NULL AND NEW.last_name IS NOT NULL THEN
    NEW.full_name = TRIM(NEW.first_name || ' ' || NEW.last_name);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS compute_owner_full_name ON owner_profiles;
CREATE TRIGGER compute_owner_full_name
  BEFORE INSERT OR UPDATE OF first_name, last_name ON owner_profiles
  FOR EACH ROW
  EXECUTE FUNCTION compute_full_name();

-- ============================================
-- PHASE 3: MIGRATE DATA FROM OWNERS
-- ============================================

-- Update existing owner_profiles records with data from owners
UPDATE owner_profiles op
SET
  first_name = COALESCE(op.first_name, o.first_name),
  last_name = COALESCE(op.last_name, o.last_name),
  billing_street = COALESCE(op.billing_street, o.billing_street),
  billing_city = COALESCE(op.billing_city, o.billing_city),
  billing_state = COALESCE(op.billing_state, o.billing_state),
  billing_zip = COALESCE(op.billing_zip, o.billing_zip),
  billing_country = COALESCE(op.billing_country, o.billing_country),
  referral_code = COALESCE(op.referral_code, o.referral_code),
  referred_by_code = COALESCE(op.referred_by_code, o.referred_by_code),
  email_verified = COALESCE(op.email_verified, o.email_verified),
  email_verified_at = COALESCE(op.email_verified_at, o.email_verified_at),
  sign_up_completed_at = COALESCE(op.sign_up_completed_at, o.sign_up_completed_at),
  email = COALESCE(op.email, o.email),
  phone = COALESCE(op.phone, o.phone)
FROM owners o
WHERE op.owner_id = o.id;

-- Insert owner_profiles for any owners that don't have one yet
INSERT INTO owner_profiles (
  owner_id,
  first_name,
  last_name,
  full_name,
  email,
  phone,
  billing_street,
  billing_city,
  billing_state,
  billing_zip,
  billing_country,
  referral_code,
  referred_by_code,
  email_verified,
  email_verified_at,
  sign_up_completed_at,
  receive_sms,
  receive_email_reports,
  timezone,
  preferred_report_time,
  created_at
)
SELECT
  o.id as owner_id,
  o.first_name,
  o.last_name,
  TRIM(o.first_name || ' ' || o.last_name) as full_name,
  o.email,
  o.phone,
  o.billing_street,
  o.billing_city,
  o.billing_state,
  o.billing_zip,
  o.billing_country,
  o.referral_code,
  o.referred_by_code,
  o.email_verified,
  o.email_verified_at,
  o.sign_up_completed_at,
  true as receive_sms,
  true as receive_email_reports,
  'America/New_York' as timezone,
  '8:00 AM' as preferred_report_time,
  o.created_at
FROM owners o
WHERE NOT EXISTS (
  SELECT 1 FROM owner_profiles op WHERE op.owner_id = o.id
);

-- For existing owner_profiles that only have full_name, parse into first/last
UPDATE owner_profiles
SET
  first_name = SPLIT_PART(full_name, ' ', 1),
  last_name = CASE
    WHEN POSITION(' ' IN full_name) > 0
    THEN SUBSTRING(full_name FROM POSITION(' ' IN full_name) + 1)
    ELSE ''
  END
WHERE first_name IS NULL AND full_name IS NOT NULL;

-- ============================================
-- PHASE 4: CREATE INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_owner_profiles_email ON owner_profiles(email);
CREATE INDEX IF NOT EXISTS idx_owner_profiles_referral_code ON owner_profiles(referral_code);
CREATE INDEX IF NOT EXISTS idx_owner_profiles_phone ON owner_profiles(phone);

-- ============================================
-- PHASE 5: UPDATE FOREIGN KEY REFERENCES
-- ============================================

-- Note: The tables (subscriptions, referral_redemptions, restaurants)
-- currently reference owners(id). We need to update them to reference
-- owner_profiles(owner_id).

-- First, drop existing foreign key constraints on subscriptions
ALTER TABLE subscriptions
DROP CONSTRAINT IF EXISTS subscriptions_owner_id_fkey;

-- Add new foreign key to owner_profiles
ALTER TABLE subscriptions
ADD CONSTRAINT subscriptions_owner_id_fkey
FOREIGN KEY (owner_id) REFERENCES owner_profiles(owner_id) ON DELETE CASCADE;

-- Update referral_redemptions
ALTER TABLE referral_redemptions
DROP CONSTRAINT IF EXISTS referral_redemptions_referrer_owner_id_fkey;

ALTER TABLE referral_redemptions
DROP CONSTRAINT IF EXISTS referral_redemptions_referred_owner_id_fkey;

ALTER TABLE referral_redemptions
ADD CONSTRAINT referral_redemptions_referrer_owner_id_fkey
FOREIGN KEY (referrer_owner_id) REFERENCES owner_profiles(owner_id) ON DELETE CASCADE;

ALTER TABLE referral_redemptions
ADD CONSTRAINT referral_redemptions_referred_owner_id_fkey
FOREIGN KEY (referred_owner_id) REFERENCES owner_profiles(owner_id) ON DELETE CASCADE;

-- Update restaurants (if owner_id references owners)
ALTER TABLE restaurants
DROP CONSTRAINT IF EXISTS restaurants_owner_id_fkey;

ALTER TABLE restaurants
ADD CONSTRAINT restaurants_owner_id_fkey
FOREIGN KEY (owner_id) REFERENCES owner_profiles(owner_id) ON DELETE SET NULL;

-- ============================================
-- PHASE 6: UPDATE RLS POLICIES FOR OWNER_PROFILES
-- ============================================

-- Drop existing policies and recreate with proper permissions
DROP POLICY IF EXISTS "Owners can manage own profile" ON owner_profiles;

-- Owners can view their own profile
CREATE POLICY "Owners view own profile"
ON owner_profiles FOR SELECT
TO authenticated
USING (owner_id = auth.uid());

-- Owners can update their own profile
CREATE POLICY "Owners update own profile"
ON owner_profiles FOR UPDATE
TO authenticated
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

-- Owners can insert their own profile
CREATE POLICY "Owners insert own profile"
ON owner_profiles FOR INSERT
TO authenticated
WITH CHECK (owner_id = auth.uid());

-- Service role can manage all profiles (for backend operations)
CREATE POLICY "Service role manages profiles"
ON owner_profiles FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================
-- PHASE 7: DROP OWNERS TABLE
-- ============================================

-- Drop RLS policies on owners first
DROP POLICY IF EXISTS "Owners see own profile" ON owners;
DROP POLICY IF EXISTS "Owners update own profile" ON owners;
DROP POLICY IF EXISTS "Owners insert own profile" ON owners;

-- Drop triggers
DROP TRIGGER IF EXISTS update_owners_updated_at ON owners;

-- Drop indexes
DROP INDEX IF EXISTS idx_owners_email;
DROP INDEX IF EXISTS idx_owners_referral_code;
DROP INDEX IF EXISTS idx_owners_phone;

-- Finally, drop the owners table
DROP TABLE IF EXISTS owners CASCADE;

-- ============================================
-- VERIFICATION QUERIES (run after migration)
-- ============================================
-- SELECT COUNT(*) as total_profiles FROM owner_profiles;
-- SELECT * FROM owner_profiles LIMIT 5;
-- SELECT op.owner_id, op.first_name, op.last_name, op.full_name, op.referral_code
-- FROM owner_profiles op LIMIT 5;

COMMIT;
