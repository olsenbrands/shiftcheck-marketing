# Stripe Product & Price Configuration

## Overview

ShiftCheck uses Stripe for subscription billing. This document explains how to configure products and prices in the Stripe Dashboard.

## Subscription Plans

| Plan | Price | Billing | Restaurants | Price ID (Production) |
|------|-------|---------|-------------|----------------------|
| Free Trial | $0 | 30 days | 1 | N/A (no billing) |
| Grow | $99/month | Monthly | 1 | `price_grow_monthly` |
| Expand | $349/month | Monthly | 5 | `price_expand_monthly` |
| Enterprise | Custom | Custom | Custom | Contact sales |

## Creating Products in Stripe Dashboard

### Step 1: Create the Product

1. Go to **Products** in Stripe Dashboard
2. Click **+ Add product**
3. Enter:
   - **Name:** `ShiftCheck Grow` (or Expand)
   - **Description:** Monthly subscription for restaurant accountability
   - **Image:** Upload ShiftCheck logo

### Step 2: Create the Price

1. Under the product, click **Add a price**
2. Configure:
   - **Pricing model:** Standard pricing
   - **Price:** $99.00 (or $349.00 for Expand)
   - **Billing period:** Monthly
   - **Price ID:** Use custom ID or note the generated one

### Step 3: Add Metadata

Add these metadata fields to each price:

```json
{
  "plan_id": "grow",           // or "expand"
  "restaurant_count": "1",     // or "5" for Expand
  "max_managers": "2",
  "max_shift_leads": "unlimited"
}
```

## Product Configuration Reference

### Grow Plan Product

```
Product Name: ShiftCheck Grow
Description: Perfect for single-store restaurant owners

Price:
  - Amount: $99.00 USD
  - Billing: Monthly recurring
  - Price ID: price_grow_monthly

Metadata:
  plan_id: grow
  restaurant_count: 1
  max_managers: 2
  max_shift_leads: unlimited
```

### Expand Plan Product

```
Product Name: ShiftCheck Expand
Description: For growing restaurant groups with multiple locations

Price:
  - Amount: $349.00 USD
  - Billing: Monthly recurring
  - Price ID: price_expand_monthly

Metadata:
  plan_id: expand
  restaurant_count: 5
  max_managers: 2 (per store)
  max_shift_leads: unlimited
```

## Trial Configuration

### Free Trial Settings

Trials are configured at subscription creation time:

```typescript
const subscription = await stripe.subscriptions.create({
  customer: customerId,
  items: [{ price: priceId }],
  trial_period_days: 30,
  metadata: {
    plan_id: 'trial',
    owner_phone: ownerPhone,
  },
});
```

### Trial Limitations

During trial:
- 1 restaurant only
- 3 checklists per day
- 10 tasks per checklist
- 1 manager
- 3 shift leads

## Environment Variables

### Development (Test Mode)

```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

### Production (Live Mode)

```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

## Price ID References in Code

The frontend references prices in `src/pages/signup/PlanSelectionPage.tsx`:

```typescript
const plans = [
  {
    id: 'trial',
    name: 'Free Trial',
    price: 0,
    priceId: null, // No Stripe price for trial
    restaurantCount: 1,
  },
  {
    id: 'grow',
    name: 'Grow',
    price: 99,
    priceId: 'price_grow_monthly',
    restaurantCount: 1,
  },
  {
    id: 'expand',
    name: 'Expand',
    price: 349,
    priceId: 'price_expand_monthly',
    restaurantCount: 5,
  },
];
```

## Subscription Flow

### 1. Customer Creation

```typescript
const customer = await stripe.customers.create({
  email: ownerEmail,
  name: `${firstName} ${lastName}`,
  phone: ownerPhone,
  metadata: {
    owner_id: ownerId,
    plan_id: selectedPlan,
  },
});
```

### 2. Payment Intent (for card collection)

```typescript
const paymentIntent = await stripe.paymentIntents.create({
  amount: planPrice * 100, // cents
  currency: 'usd',
  customer: customerId,
  setup_future_usage: 'off_session',
  metadata: {
    plan_id: planId,
    restaurant_count: restaurantCount.toString(),
  },
});
```

### 3. Subscription Creation

```typescript
const subscription = await stripe.subscriptions.create({
  customer: customerId,
  items: [{ price: priceId }],
  default_payment_method: paymentMethodId,
  metadata: {
    plan_id: planId,
    restaurant_count: restaurantCount.toString(),
    owner_phone: ownerPhone,
  },
});
```

## Upgrading/Downgrading

### Upgrade (Proration)

```typescript
const subscription = await stripe.subscriptions.update(subscriptionId, {
  items: [{
    id: subscriptionItemId,
    price: newPriceId,
  }],
  proration_behavior: 'create_prorations',
  metadata: {
    plan_id: newPlanId,
    restaurant_count: newRestaurantCount.toString(),
  },
});
```

### Downgrade

Same as upgrade, but change takes effect at period end:

```typescript
const subscription = await stripe.subscriptions.update(subscriptionId, {
  items: [{
    id: subscriptionItemId,
    price: newPriceId,
  }],
  proration_behavior: 'none',
  billing_cycle_anchor: 'unchanged',
});
```

## Customer Portal

Enable self-service subscription management:

```typescript
const session = await stripe.billingPortal.sessions.create({
  customer: customerId,
  return_url: 'https://shiftcheck.app/account',
});

// Redirect customer to session.url
```

### Portal Configuration

In Stripe Dashboard > Settings > Billing > Customer Portal:

1. **Enable portal**
2. **Allow customers to:**
   - View invoice history
   - Update payment methods
   - Cancel subscriptions
   - Switch plans (optional)

3. **Branding:**
   - Add ShiftCheck logo
   - Set brand color
   - Customize messaging

## Webhook Events to Handle

Configure these webhooks (see WEBHOOK-EVENTS.md):

- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`
- `customer.subscription.trial_will_end`

## Testing

### Test Card Numbers

| Scenario | Card Number |
|----------|-------------|
| Successful payment | 4242 4242 4242 4242 |
| Declined card | 4000 0000 0000 0002 |
| Requires authentication | 4000 0025 0000 3155 |
| Insufficient funds | 4000 0000 0000 9995 |

Use any future expiry date and any 3-digit CVC.

### Test Webhook Events

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local
stripe listen --forward-to localhost:3005/api/webhooks/stripe

# Trigger test events
stripe trigger customer.subscription.created
stripe trigger invoice.payment_failed
```

## Production Checklist

Before going live:

- [ ] Create live mode products and prices
- [ ] Update environment variables to `pk_live_` and `sk_live_`
- [ ] Configure live webhook endpoint
- [ ] Update webhook secret
- [ ] Test complete flow in live mode with real card
- [ ] Enable Customer Portal
- [ ] Set up fraud prevention rules
- [ ] Configure email receipts
