-- Migration: 003_sync_owners_to_owner_profiles.sql
-- Purpose: Sync existing owners records to owner_profiles for app compatibility
-- Date: 2025-12-18
-- Context: Marketing website (shiftcheck.app) creates records in `owners` table,
--          but the app (app.shiftcheck.app) reads from `owner_profiles` table.
--          This migration ensures existing owners have corresponding owner_profiles.

-- ============================================
-- INSERT MISSING OWNER_PROFILES
-- ============================================
-- For each owner that doesn't have a corresponding owner_profiles record,
-- create one with sensible defaults.

INSERT INTO owner_profiles (
  owner_id,
  full_name,
  email,
  phone,
  receive_sms,
  receive_email_reports,
  timezone,
  preferred_report_time,
  created_at,
  updated_at
)
SELECT
  o.id as owner_id,
  CONCAT(o.first_name, ' ', o.last_name) as full_name,
  o.email,
  o.phone,
  true as receive_sms,
  true as receive_email_reports,
  'America/New_York' as timezone,
  '8:00 AM' as preferred_report_time,
  o.created_at,
  NOW() as updated_at
FROM owners o
WHERE NOT EXISTS (
  SELECT 1 FROM owner_profiles op WHERE op.owner_id = o.id
);

-- ============================================
-- VERIFY MIGRATION
-- ============================================
-- This query shows how many records were synced
-- Run this to verify: SELECT COUNT(*) FROM owner_profiles WHERE owner_id IN (SELECT id FROM owners);
