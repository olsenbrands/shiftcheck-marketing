# Owner Sign-Up & Account Management - Technical Design

## Context

ShiftCheck is a restaurant task verification app. Owners sign up via the marketing website (shiftcheck.app), create restaurants, subscribe to a plan, then download the app. The existing architecture uses:
- Supabase for auth and database
- Phone-as-Key for manager identification
- RLS for data security

This change adds owner onboarding and subscription management, integrating Stripe for payments and Brevo for transactional emails.

## Goals

- Enable self-service owner sign-up with no manual intervention
- Support multiple restaurants per owner with flexible activation
- Integrate Stripe for reliable subscription billing
- Maintain RLS security model
- Provide seamless resume capability for interrupted sign-ups

## Non-Goals

- Native mobile app sign-up (web-only initially)
- Custom enterprise pricing (manual negotiation)
- Multi-currency support (USD only)
- SSO/OAuth sign-up (email/password only)

## Decisions

### 1. Multi-Step Form with Local Storage

**Decision:** Use local storage to persist sign-up progress across sessions.

**Rationale:**
- Sign-up is 7 steps - users may need to pause
- Prevents data loss on browser crash/close
- Enables "Resume signup?" flow
- No server storage until each step completes

**Alternatives considered:**
- Draft records in database: More complex, requires cleanup
- Session storage only: Lost on tab close
- URL parameters: Security risk for sensitive data

### 2. Restaurants Created Before Subscription

**Decision:** Owners create all restaurants in Step 4 (with `is_active = false`), then choose plan in Step 5.

**Rationale:**
- Owners see what they're paying for before payment
- Decouples restaurant count from immediate billing
- Allows "create now, activate later" workflow
- Supports seasonal restaurants (activate/deactivate)

**Trade-off:** Orphan restaurants if sign-up abandoned. Mitigation: cleanup job for incomplete sign-ups >30 days.

### 3. is_active Boolean for Restaurant State

**Decision:** Single `is_active` boolean on restaurants table controls access.

**Rationale:**
- Simple, queryable, indexable
- Works with existing RLS patterns
- Enables future features: seasonal closures, temporary deactivation
- No complex state machine needed

**Alternatives considered:**
- Status enum (active/inactive/suspended): Over-engineering for current needs
- Separate active_restaurants junction table: Unnecessary complexity

### 4. Stripe as Source of Truth for Billing

**Decision:** All billing state comes from Stripe via webhooks. Our `subscriptions` table is a cache/convenience.

**Rationale:**
- Stripe handles PCI compliance, failed payments, retries
- Webhooks provide reliable state updates
- Reduces billing bugs from out-of-sync state
- Customer portal for payment method updates

**Implementation:**
- Never trust frontend for billing state
- Webhook handler is only writer to subscriptions table
- Frontend reads from our table, writes to Stripe API

### 5. Phone Normalization Everywhere

**Decision:** All phone numbers normalized to E.164 format (+1XXXXXXXXXX) on input.

**Rationale:**
- Consistent with core ShiftCheck Phone-as-Key architecture
- Prevents duplicate managers from formatting differences
- Required for SMS delivery

**Function:**
```javascript
export function normalize_phone(phone) {
  const cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.length === 10) return '+1' + cleaned;
  if (cleaned.length === 11 && cleaned[0] === '1') return '+' + cleaned;
  return '+' + cleaned;
}
```

### 6. Referral System Design

**Decision:** Unique referral codes per owner, tracked via `referral_redemptions` table.

**Rationale:**
- Simple to implement (no complex affiliate tracking)
- Discount applied at subscription level
- Can track referral conversion rates
- Time-limited discounts (12 months)

**Flow:**
1. Existing owner shares code (OWNER_ABC123XYZ)
2. New owner enters code during sign-up
3. On subscription creation, create redemption record
4. Apply discount to referrer's next billing cycle

### 7. Brevo for Transactional Email

**Decision:** Use Brevo (existing integration) for all transactional emails.

**Rationale:**
- Already integrated for manager SMS invites
- Template-based for easy updates
- Good deliverability
- Sufficient for current volume

**Templates needed:**
- Email verification
- Welcome email
- Trial expiring (7 days)
- Trial expired
- Payment failed

### 8. Service Layer Architecture

**Decision:** All database operations via service layer functions.

**Structure:**
```
/src/services/
├── authService.ts       # Email verification, profile creation
├── restaurantService.ts # CRUD, activation
├── stripeService.ts     # Stripe API calls
├── subscriptionService.ts # Subscription logic
├── emailService.ts      # Brevo API wrapper
└── referralService.ts   # Referral tracking
```

**Rationale:**
- Centralized business logic
- Testable in isolation
- Consistent error handling
- Phone normalization in one place

## Database Schema

### Entity Relationship

```
auth.users (Supabase)
    │
    ▼
  owners (1:1)
    │
    ├──▶ subscriptions (1:1 active)
    │
    ├──▶ restaurants (1:many)
    │       │
    │       └──▶ managers (via phone)
    │
    └──▶ referral_redemptions (1:many as referrer)
             │
             └──▶ owners (as referred)
```

### Key Constraints

- `owners.id` references `auth.users(id)` - cascade delete
- `subscriptions.owner_id` references `owners(id)` - cascade delete
- `restaurants.owner_id` references `owners(id)` - no cascade (preserve data)
- `referral_redemptions.referrer_owner_id` references `owners(id)`

## Stripe Integration

### Subscription Flow

```
Step 6 Payment
    │
    ▼
Frontend: stripe.confirmPayment()
    │
    ▼
Stripe: Creates PaymentIntent → Subscription
    │
    ▼
Webhook: customer.subscription.created
    │
    ▼
Backend: Create/update subscriptions record
    │
    ▼
Backend: Activate restaurants
```

### Webhook Events

| Event | Action |
|-------|--------|
| `customer.subscription.created` | Create subscription record |
| `customer.subscription.updated` | Update status, dates |
| `invoice.payment_succeeded` | Set status = 'active' |
| `invoice.payment_failed` | Set status = 'past_due', send email |
| `customer.subscription.deleted` | Set status = 'canceled', deactivate restaurants |

### Idempotency

- Store Stripe event IDs to prevent duplicate processing
- Use database transactions for webhook handlers
- Check subscription exists before update

## Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Webhook failures | Medium | High | Retry logic, dead letter queue, monitoring |
| Stale subscription state | Low | Medium | Stripe as source of truth, periodic sync |
| RLS bypass | Low | Critical | Comprehensive testing, security audit |
| Email deliverability | Medium | Medium | Brevo reputation, SPF/DKIM setup |
| Payment fraud | Low | High | Stripe Radar, 3D Secure enforcement |

## Migration Plan

1. **Phase 1:** Deploy database schema (non-breaking)
2. **Phase 2:** Deploy sign-up flow (new pages, no existing disruption)
3. **Phase 3:** Deploy Stripe webhooks (test mode first)
4. **Phase 4:** Deploy account portal
5. **Phase 5:** Enable production Stripe
6. **Phase 6:** Announce to users

### Rollback

- Each phase is independently rollable
- Database migrations have down migrations
- Feature flags for gradual rollout (if needed)

## Open Questions

1. **Trial conversion:** What happens if Free Starter doesn't add payment method after 30 days?
   - Decision: Restaurants become inactive, owner can reactivate by adding payment

2. **Downgrade timing:** Should downgrades take effect immediately or at renewal?
   - Decision: At next renewal (Stripe default behavior)

3. **Restaurant limit enforcement:** Where to enforce max_active_restaurants?
   - Decision: React UI + database trigger as backup

4. **Referral abuse:** How to prevent self-referrals or gaming?
   - Decision: Different email domains required, manual review of high-volume referrers
