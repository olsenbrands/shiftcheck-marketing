# Stripe Testing Guide

ShiftCheck Marketing Website - Phase 3.3 Stripe Testing

## Prerequisites

### 1. Environment Setup
Ensure these environment variables are configured in `.env.local`:

```bash
# Stripe Test Mode Keys (from Stripe Dashboard > Developers > API keys)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Price IDs (create in Stripe Dashboard > Products)
STRIPE_PRICE_ID_GROW=price_...
STRIPE_PRICE_ID_EXPAND=price_...
```

### 2. Start Local Development Server
```bash
npm run dev
```

### 3. Start Stripe CLI Webhook Forwarding
```bash
# Install Stripe CLI if not installed
brew install stripe/stripe-cli/stripe

# Login to Stripe
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:5173/api/webhooks/stripe
```

Copy the webhook signing secret from the CLI output and update `STRIPE_WEBHOOK_SECRET`.

---

## Test Cards Reference

| Card Number | Description | Expected Result |
|-------------|-------------|-----------------|
| `4242 4242 4242 4242` | Success | Payment succeeds |
| `4000 0000 0000 0002` | Declined | Card declined error |
| `4000 0025 0000 3155` | 3D Secure | Requires authentication |
| `4000 0000 0000 9995` | Insufficient funds | Payment fails |
| `4000 0000 0000 0069` | Expired card | Card expired error |

**For all test cards:**
- Expiry: Any future date (e.g., `12/28`)
- CVC: Any 3 digits (e.g., `123`)
- ZIP: Any 5 digits (e.g., `84037`)

---

## Test 3.3.1: Success Card (4242 4242 4242 4242)

### Steps
1. Navigate to `/signup/email` and complete sign-up flow through Step 4
2. On Plan Selection (Step 5), select **Grow** or **Expand** plan
3. Click "Continue to Payment"
4. On Payment Page (Step 6):
   - Verify order summary shows correct plan and price
   - Verify billing address displays correctly
   - Enter test card: `4242 4242 4242 4242`
   - Expiry: `12/28`
   - CVC: `123`
   - Check "I agree to Terms of Service"
   - Click "Pay $XX/mo"
5. Wait for processing (loading spinner appears)
6. Should redirect to `/signup/complete` (Step 7)

### Expected Results
- [ ] Payment processes without errors
- [ ] Loading state shows during processing
- [ ] Redirects to completion page on success
- [ ] No error messages displayed

---

## Test 3.3.2: Decline Card (4000 0000 0000 0002)

### Steps
1. Navigate to payment page (complete Steps 1-5 first)
2. Enter decline test card: `4000 0000 0000 0002`
3. Expiry: `12/28`, CVC: `123`
4. Check Terms of Service
5. Click "Pay $XX/mo"

### Expected Results
- [ ] Error message appears: "Your card was declined"
- [ ] User remains on payment page (no redirect)
- [ ] Form remains editable for retry
- [ ] Can enter different card and retry

---

## Test 3.3.3: 3D Secure Card (4000 0025 0000 3155)

### Steps
1. Navigate to payment page (complete Steps 1-5 first)
2. Enter 3D Secure test card: `4000 0025 0000 3155`
3. Expiry: `12/28`, CVC: `123`
4. Check Terms of Service
5. Click "Pay $XX/mo"
6. 3D Secure modal/redirect appears
7. Complete authentication (click "Complete" in test modal)

### Expected Results
- [ ] 3D Secure authentication modal appears
- [ ] After completing auth, payment succeeds
- [ ] Redirects to completion page
- [ ] If auth cancelled, shows appropriate error

---

## Test 3.3.4: Verify Subscription in Stripe Dashboard

### Steps
1. After successful payment (Test 3.3.1), go to [Stripe Dashboard](https://dashboard.stripe.com/test/subscriptions)
2. Find the newly created subscription

### Verification Checklist
- [ ] Subscription exists with status "active" or "trialing"
- [ ] Customer email matches sign-up email
- [ ] Plan matches selected tier (Grow/Expand)
- [ ] Quantity matches restaurant count
- [ ] Metadata contains:
  - `owner_id` (UUID)
  - `plan_id` (grow/expand)
  - `restaurant_count`

### Stripe Dashboard Locations
- Subscriptions: https://dashboard.stripe.com/test/subscriptions
- Customers: https://dashboard.stripe.com/test/customers
- Payments: https://dashboard.stripe.com/test/payments
- Webhooks: https://dashboard.stripe.com/test/webhooks

---

## Test 3.3.5: Verify Subscription in Supabase

### Steps
1. After successful payment, open Supabase Dashboard
2. Navigate to Table Editor > `subscriptions` table
3. Find record by `owner_id` or `stripe_subscription_id`

### Verification Checklist
- [ ] Record exists in `subscriptions` table
- [ ] `owner_id` matches authenticated user's ID
- [ ] `stripe_subscription_id` matches Stripe subscription ID
- [ ] `stripe_customer_id` matches Stripe customer ID
- [ ] `plan_type` is correct (grow/expand)
- [ ] `status` is "active" or "trialing"
- [ ] `max_active_restaurants` matches quantity
- [ ] `current_period_start` and `current_period_end` are set
- [ ] `created_at` timestamp is recent

### SQL Query
```sql
SELECT * FROM subscriptions
WHERE owner_id = 'YOUR_USER_ID'
ORDER BY created_at DESC
LIMIT 1;
```

---

## Test 3.3.6: Verify Webhook Events

### Steps
1. Check Stripe CLI output for received events
2. Check Stripe Dashboard > Developers > Webhooks > Recent events
3. Check server logs for webhook processing

### Expected Webhook Events (in order)
1. `customer.created` (if new customer)
2. `payment_intent.created`
3. `payment_intent.succeeded`
4. `customer.subscription.created`
5. `invoice.created`
6. `invoice.finalized`
7. `invoice.paid`
8. `invoice.payment_succeeded`

### Verification Checklist
- [ ] `customer.subscription.created` event received
- [ ] Event shows status 200 (successfully processed)
- [ ] No duplicate events processed (idempotency working)
- [ ] Subscription record updated in Supabase after webhook

### Stripe CLI Output Example
```
2024-01-15 10:30:45   --> customer.subscription.created [evt_xxx]
2024-01-15 10:30:45   <-- [200] POST http://localhost:5173/api/webhooks/stripe
```

### Check Webhook Logs
In Stripe Dashboard > Developers > Webhooks > Select endpoint > Recent deliveries:
- [ ] All events show "Succeeded" status
- [ ] Response code is 200
- [ ] Response body shows `{"received": true}`

---

## Troubleshooting

### Payment Fails Unexpectedly
1. Check browser console for JavaScript errors
2. Check Network tab for failed API requests
3. Verify Stripe publishable key is correct
4. Check server logs for API errors

### Webhook Not Received
1. Verify Stripe CLI is running: `stripe listen --forward-to ...`
2. Check webhook secret matches CLI output
3. Verify endpoint path is correct: `/api/webhooks/stripe`
4. Check Vercel function logs if deployed

### Subscription Not Created in Supabase
1. Check webhook handler logs for errors
2. Verify `SUPABASE_SERVICE_ROLE_KEY` is set
3. Check RLS policies allow service role inserts
4. Look for Supabase error messages in logs

### 3D Secure Not Working
1. Ensure using correct test card: `4000 0025 0000 3155`
2. Check if PaymentElement is properly configured
3. Verify `confirmPayment` has `redirect: 'if_required'`

---

## Test Summary Checklist

After completing all tests, verify:

- [ ] **3.3.1** Success card payment works end-to-end
- [ ] **3.3.2** Decline card shows proper error, allows retry
- [ ] **3.3.3** 3D Secure authentication flow works
- [ ] **3.3.4** Subscription visible in Stripe Dashboard
- [ ] **3.3.5** Subscription record created in Supabase
- [ ] **3.3.6** Webhook events processed correctly

---

## Environment-Specific Notes

### Local Development
- Use Stripe CLI for webhook forwarding
- Test mode keys only (pk_test_*, sk_test_*)
- Webhook secret from CLI output

### Vercel Preview/Production
- Configure webhook endpoint in Stripe Dashboard
- Use environment-specific webhook secrets
- Monitor Vercel function logs for errors
