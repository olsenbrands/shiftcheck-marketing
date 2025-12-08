# Stripe Webhook Event Handling

## Overview

ShiftCheck uses Stripe webhooks to keep subscription data synchronized between Stripe and our database. The webhook handler is located at `api/webhooks/stripe.ts`.

## Endpoint

```
POST /api/webhooks/stripe
```

## Security

### Signature Verification

All incoming webhooks are verified using Stripe's signature verification:

```typescript
const event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
```

- **Never process unverified webhooks**
- Signature uses `STRIPE_WEBHOOK_SECRET` from environment
- Invalid signatures return 400 error

### Idempotency

The handler tracks processed event IDs to prevent duplicate processing:
- Stores last 1000 event IDs in memory
- Returns `{ received: true, duplicate: true }` for duplicates
- Ensures database consistency even with webhook retries

## Handled Events

### 1. `customer.subscription.created`

**Triggered when:** A new subscription is created

**Actions:**
1. Look up owner by Stripe customer ID
2. Create subscription record in database
3. Send subscription confirmation email

**Database changes:**
- Creates entry in `subscriptions` table

**Email sent:** Subscription Confirmed

---

### 2. `customer.subscription.updated`

**Triggered when:** Subscription details change (plan, status, etc.)

**Actions:**
1. Look up owner by Stripe customer ID
2. Update subscription record with new details

**Database changes:**
- Updates `subscriptions` table:
  - `plan_type`
  - `status`
  - `current_period_start`
  - `current_period_end`
  - `max_active_restaurants`

**Email sent:** None (silent update)

---

### 3. `customer.subscription.deleted`

**Triggered when:** Subscription is canceled/terminated

**Actions:**
1. Look up owner by Stripe customer ID
2. Update subscription status to 'canceled'
3. Deactivate all owner's restaurants
4. Send cancellation email

**Database changes:**
- Updates `subscriptions.status` to 'canceled'
- Sets `restaurants.is_active` to false for all owner's restaurants

**Email sent:** Subscription Cancelled

---

### 4. `invoice.payment_succeeded`

**Triggered when:** Payment for invoice succeeds

**Actions:**
1. Look up owner by Stripe customer ID
2. Update subscription status to 'active'

**Database changes:**
- Updates `subscriptions.status` to 'active'

**Email sent:** None (Stripe sends receipt)

---

### 5. `invoice.payment_failed`

**Triggered when:** Payment for invoice fails

**Actions:**
1. Look up owner by Stripe customer ID
2. Update subscription status to 'past_due'
3. Send payment failed email

**Database changes:**
- Updates `subscriptions.status` to 'past_due'

**Email sent:** Payment Failed (with amount and retry instructions)

---

### 6. `customer.subscription.trial_will_end`

**Triggered when:** Trial period will end in 3 days

**Actions:**
1. Look up owner by Stripe customer ID
2. Send trial ending reminder email

**Database changes:** None

**Email sent:** Trial Ending Soon (with end date)

---

## Subscription Status Flow

```
                        ┌─────────────┐
                        │   trialing  │
                        └──────┬──────┘
                               │
              (payment_succeeded or trial ends)
                               │
                               ▼
┌─────────────┐         ┌─────────────┐
│  past_due   │◄────────│   active    │
└──────┬──────┘         └──────┬──────┘
       │                       │
       │ (payment_succeeded)   │ (subscription.deleted)
       │                       │
       ▼                       ▼
┌─────────────┐         ┌─────────────┐
│   active    │         │  canceled   │
└─────────────┘         └─────────────┘
```

## Testing Webhooks

### Local Development

1. Install Stripe CLI:
   ```bash
   brew install stripe/stripe-cli/stripe
   ```

2. Login to Stripe:
   ```bash
   stripe login
   ```

3. Forward webhooks to local:
   ```bash
   stripe listen --forward-to localhost:3005/api/webhooks/stripe
   ```

4. Copy the webhook signing secret from CLI output

5. Set in `.env.local`:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_xxxxx
   ```

### Trigger Test Events

```bash
# Subscription created
stripe trigger customer.subscription.created

# Payment succeeded
stripe trigger invoice.payment_succeeded

# Payment failed
stripe trigger invoice.payment_failed

# Subscription canceled
stripe trigger customer.subscription.deleted
```

### Load Testing

Use the load test script:
```bash
npx tsx scripts/load-test-webhook.ts
```

Results from testing:
- Handles 2,700+ requests/second
- Average response time: 3-6ms
- 100% success rate under load

## Debugging

### Logs

All webhook events are logged with:
- Event type
- Event ID
- Owner ID (when found)
- Email sent status

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| 400 Invalid signature | Wrong webhook secret | Update `STRIPE_WEBHOOK_SECRET` |
| Owner not found | Customer not linked | Check Stripe customer metadata |
| Duplicate events | Stripe retry | Idempotency handles this |
| Email not sent | Brevo API issue | Check `BREVO_API_KEY` |

### Stripe Dashboard

View webhook history:
1. Go to Stripe Dashboard > Developers > Webhooks
2. Click your endpoint
3. View recent events and responses

## Production Configuration

### Stripe Dashboard Setup

1. Go to Developers > Webhooks
2. Add endpoint: `https://shiftcheck.app/api/webhooks/stripe`
3. Select events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `customer.subscription.trial_will_end`

4. Copy signing secret to Vercel environment variables

### Environment Variables

Required in production:
```
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxxxx
BREVO_API_KEY=xxxxx
```

## Error Handling

The webhook handler:
1. Returns 200 even for non-critical errors (prevents Stripe retries)
2. Logs all errors for debugging
3. Returns 400 only for signature verification failures
4. Returns 500 for unrecoverable errors (triggers Stripe retry)

## Email Templates

Emails are sent via Brevo (see `api/email/send.ts`):

| Email | Template | When Sent |
|-------|----------|-----------|
| Subscription Confirmed | `subscription-confirmed` | subscription.created |
| Payment Failed | `payment-failed` | invoice.payment_failed |
| Subscription Cancelled | `subscription-cancelled` | subscription.deleted |
| Trial Ending | `trial-ending` | subscription.trial_will_end |
