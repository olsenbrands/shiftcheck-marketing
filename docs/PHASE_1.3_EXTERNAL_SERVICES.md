# Phase 1.3: External Service Setup Requirements

This document details what's needed to complete Phase 1.3 of the Owner Sign-Up feature.

## Status: PENDING (0/10 tasks)

---

## 1. Stripe Setup (Tasks 1.3.1 - 1.3.6)

### What's Needed

1. **Stripe Account** (1.3.1)
   - Create/access Stripe dashboard at https://dashboard.stripe.com
   - Enable test mode for development

2. **Product Configuration** (1.3.2)
   - Create product: "ShiftCheck Subscription"
   - Set billing type: Recurring (monthly)

3. **Price Configuration** (1.3.3)
   - Create price: $99.00/month per restaurant
   - Enable metered billing (quantity = restaurant count)

4. **Webhook Endpoint** (1.3.4)
   - URL: `https://[your-domain]/api/stripe/webhook`
   - Events to subscribe:
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`

5. **API Keys** (1.3.5)
   - Get from: Dashboard → Developers → API keys
   - Need:
     - `pk_test_...` (Publishable key)
     - `sk_test_...` (Secret key)

6. **Webhook Secret** (1.3.6)
   - Get from: Dashboard → Developers → Webhooks → [Your endpoint] → Signing secret
   - Format: `whsec_...`

### Environment Variables to Add

```bash
# .env.local (client-side, publishable only)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Server environment (Vercel/API routes)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID=price_... # From the $99/mo price
```

---

## 2. Brevo Setup (Tasks 1.3.7 - 1.3.9)

### What's Needed

1. **Email Verification Template** (1.3.7)
   - Create transactional template
   - Subject: "Verify your ShiftCheck email"
   - Content: Verification link, expiration notice
   - Template ID: Note this for code

2. **Welcome Email Template** (1.3.8)
   - Create transactional template
   - Subject: "Welcome to ShiftCheck!"
   - Content: Getting started guide, app download links
   - Template ID: Note this for code

3. **API Key** (1.3.9)
   - Get from: Brevo Dashboard → SMTP & API → API keys
   - Create new key with "Transactional emails" permission

### Environment Variables to Add

```bash
# Server environment
BREVO_API_KEY=xkeysib-...
BREVO_VERIFICATION_TEMPLATE_ID=123
BREVO_WELCOME_TEMPLATE_ID=456
```

### Architecture Decision: Email Verification Strategy

**Decision Date:** December 6, 2025
**Status:** APPROVED
**Decision:** Use Supabase Auth emails for MVP; defer Brevo to Phase 5

#### Context

The Owner Sign-Up flow requires email verification. Two options were considered:

| Option | Pros | Cons |
|--------|------|------|
| **Supabase Auth (built-in)** | Zero setup, works immediately, reliable | Generic templates, no custom branding |
| **Brevo (external)** | Custom branded emails, analytics, better deliverability | Requires API setup, template creation, additional service |

#### Decision

**Use Supabase Auth's built-in email verification for MVP.**

Rationale:
1. **Faster time-to-market** - No external service setup required
2. **Proven reliability** - Supabase handles email delivery infrastructure
3. **Sufficient for MVP** - Email verification works; branding is nice-to-have
4. **No blocking dependencies** - Stripe is the only blocking external service

#### Consequences

- Tasks 1.3.7, 1.3.8, 1.3.9 (Brevo templates and API key) are **DEFERRED to Phase 5**
- Sign-up flow uses `supabase.auth.signUp()` which sends verification email automatically
- Custom branded emails will be a Phase 5 enhancement
- Email analytics will not be available until Phase 5

#### Implementation Notes

Current implementation in `ownerService.ts`:
```typescript
// Uses Supabase Auth - sends verification email automatically
const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: { emailRedirectTo: `${window.location.origin}/signup/verify-email` }
});
```

**Priority:** Stripe setup is BLOCKING for paid plans. Brevo is deferred to Phase 5.

---

## 3. Environment Configuration (Task 1.3.10)

### Local Development (.env.local)

```bash
# Supabase (already configured)
VITE_SUPABASE_URL=https://cvlspiwzzhdeemplygmo.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1...

# Stripe (add these)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### Vercel Production Environment

Add these in Vercel Dashboard → Settings → Environment Variables:

| Variable | Environment | Value |
|----------|-------------|-------|
| `STRIPE_SECRET_KEY` | Production, Preview | `sk_test_...` (or `sk_live_...` for prod) |
| `STRIPE_WEBHOOK_SECRET` | Production, Preview | `whsec_...` |
| `STRIPE_PRICE_ID` | Production, Preview | `price_...` |
| `BREVO_API_KEY` | Production, Preview | `xkeysib-...` |

---

## Implementation Order

1. **HIGH PRIORITY:** Stripe API keys + publishable key
   - Enables payment page to work
   - Currently falls back to demo mode

2. **MEDIUM PRIORITY:** Stripe webhook setup
   - Required for subscription management
   - Can test locally with `stripe listen --forward-to`

3. **LOWER PRIORITY:** Brevo integration
   - Current Supabase emails work
   - Phase 5 enhancement

---

## Testing Stripe Locally

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local dev
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Note the webhook signing secret it provides (starts with whsec_)
```

---

## Completion Checklist

- [ ] 1.3.1 Create/access Stripe test account
- [ ] 1.3.2 Create ShiftCheck product in Stripe
- [ ] 1.3.3 Create $99/month price
- [ ] 1.3.4 Set up webhook endpoint URL
- [ ] 1.3.5 Get test API keys (pk_test, sk_test)
- [ ] 1.3.6 Get webhook signing secret (whsec_)
- [ ] 1.3.7 Create Brevo verification email template (can defer)
- [ ] 1.3.8 Create Brevo welcome email template (can defer)
- [ ] 1.3.9 Get Brevo API key (can defer)
- [ ] 1.3.10 Add all keys to .env.local and Vercel
