# Change: Add Owner Sign-Up & Account Management

## Why

ShiftCheck needs a complete owner onboarding flow to convert marketing site visitors into paying customers. Currently, there is no self-service sign-up process - owners must be manually onboarded. This creates friction and limits growth.

## What Changes

### New Capabilities
- **Owner Authentication:** Email verification via Brevo, Supabase Auth login
- **Owner Profile:** Personal info collection, billing address for Stripe
- **Restaurant Creation:** Multi-restaurant creation with manager assignment, "Owner Managed" option
- **Subscription Management:** Stripe integration for Free Starter, Grow, and Expand tiers
- **Account Portal:** Dashboard for subscription, restaurant, and referral management
- **Referral System:** Unique referral codes, discount tracking

### Database Changes
- **NEW TABLE:** `owners` - Owner profile data with referral tracking
- **NEW TABLE:** `subscriptions` - Stripe subscription data
- **NEW TABLE:** `pricing_tiers` - Static pricing reference
- **NEW TABLE:** `referral_redemptions` - Referral discount tracking
- **MODIFIED TABLE:** `restaurants` - Added `is_active`, `activated_at`, address/phone fields

### External Integrations
- **Stripe:** Payment Element, subscriptions, webhooks
- **Brevo:** Email verification, welcome emails, trial reminders
- **Segment:** Analytics funnel tracking (optional)

## Impact

- Affected specs:
  - `owner-auth` (NEW)
  - `owner-profile` (NEW)
  - `restaurant-creation` (NEW)
  - `subscriptions` (NEW)
  - `account-portal` (NEW)
  - `referrals` (NEW)

- Affected code:
  - `/src/pages/auth/*` - New authentication pages
  - `/src/pages/signup/*` - Multi-step sign-up flow
  - `/src/pages/account/*` - Account portal pages
  - `/src/services/*` - Service layer functions
  - `/src/api/webhooks/*` - Stripe webhook handlers

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Stripe payment failures | Webhook retry logic, error handling UI |
| Email deliverability | Brevo reputation, verification flow |
| Data loss during sign-up | Local storage persistence |
| RLS policy gaps | Comprehensive testing before launch |

## Success Criteria

- Sign-up completion rate >40%
- Time to complete sign-up <10 minutes
- Payment success rate >95%
- Zero data leaks via RLS bypass
