# External Service Setup Guide

## Phase 1.3: External Service Configuration

This guide covers the external platform setup required for ShiftCheck owner signup.

---

## 1. Stripe Setup (Tasks 1.3.1-1.3.6)

### 1.3.1 Create Stripe Test Account

1. Go to [https://dashboard.stripe.com/register](https://dashboard.stripe.com/register)
2. Create account or login
3. Ensure you're in **Test Mode** (toggle in top-right)

### 1.3.2 Configure Stripe Product

1. Go to **Products** > **Add Product**
2. Create product:
   - **Name:** ShiftCheck Subscription
   - **Description:** Restaurant task verification service
   - **Type:** Service

### 1.3.3 Create Stripe Price ($99/month)

1. In the product, click **Add Price**
2. Configure:
   - **Pricing model:** Standard pricing
   - **Price:** $99.00
   - **Billing period:** Monthly
   - **Usage type:** Licensed (per restaurant)
3. Note the **Price ID** (starts with `price_`)

### 1.3.4 Set Up Webhook Endpoint

1. Go to **Developers** > **Webhooks**
2. Click **Add endpoint**
3. Configure:
   - **Endpoint URL:** `https://shiftcheck.app/api/stripe/webhook`
   - **Events to send:**
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `customer.subscription.trial_will_end`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
4. Click **Add endpoint**

### 1.3.5 Get API Keys

1. Go to **Developers** > **API keys**
2. Copy:
   - **Publishable key:** `pk_test_...`
   - **Secret key:** `sk_test_...` (click to reveal)

### 1.3.6 Get Webhook Signing Secret

1. Go to **Developers** > **Webhooks**
2. Click on your endpoint
3. Under **Signing secret**, click **Reveal**
4. Copy: `whsec_...`

---

## 2. Brevo Setup (Tasks 1.3.7-1.3.9)

### 1.3.7 Create Email Verification Template

1. Go to [https://app.brevo.com](https://app.brevo.com)
2. Navigate to **Campaigns** > **Templates** > **Email Templates**
3. Create template:
   - **Name:** ShiftCheck - Email Verification
   - **Subject:** Verify your ShiftCheck email
   - **Content:** Include `{{params.verificationLink}}`
4. Note the **Template ID** from the URL

### 1.3.8 Create Welcome Email Template

1. Create another template:
   - **Name:** ShiftCheck - Welcome
   - **Subject:** Welcome to ShiftCheck, {{params.firstName}}!
   - **Content:** Include:
     - `{{params.firstName}}`
     - `{{params.dashboardLink}}`
     - `{{params.supportEmail}}`
2. Note the **Template ID**

### Additional Templates Needed

Create templates for:
- **Subscription Confirmed** (Template ID for `BREVO_TEMPLATE_SUBSCRIPTION_CONFIRMED`)
- **Trial Ending** (Template ID for `BREVO_TEMPLATE_TRIAL_ENDING`)
- **Payment Failed** (Template ID for `BREVO_TEMPLATE_PAYMENT_FAILED`)
- **Subscription Cancelled** (Template ID for `BREVO_TEMPLATE_SUBSCRIPTION_CANCELLED`)
- **Password Reset** (Template ID for `BREVO_TEMPLATE_PASSWORD_RESET`)

### 1.3.9 Get Brevo API Key

1. Go to **Settings** (gear icon) > **SMTP & API**
2. Under **API Keys**, click **Generate a new API key**
3. Name it: `ShiftCheck Marketing Website`
4. Copy the key (starts with `xkeysib-...`)

---

## 3. Environment Configuration (Task 1.3.10)

### Update `.env.local`

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://cvlspiwzzhdeemplygmo.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE

# Note: These are only needed for local API testing
# In production, set these in Vercel dashboard
# STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE
# STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET_HERE
```

### Update Vercel Environment Variables

1. Go to [Vercel Dashboard](https://vercel.com) > ShiftCheck project
2. Navigate to **Settings** > **Environment Variables**
3. Add these variables for **Production** and **Preview**:

| Variable | Value | Environment |
|----------|-------|-------------|
| `STRIPE_SECRET_KEY` | `sk_test_...` | Production, Preview |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | Production, Preview |
| `VITE_STRIPE_PUBLISHABLE_KEY` | `pk_test_...` | Production, Preview |
| `SUPABASE_URL` | `https://cvlspiwzzhdeemplygmo.supabase.co` | Production, Preview |
| `SUPABASE_SERVICE_ROLE_KEY` | (from Supabase dashboard) | Production, Preview |
| `BREVO_API_KEY` | `xkeysib-...` | Production, Preview |
| `BREVO_SENDER_EMAIL` | `noreply@shiftcheck.app` | Production, Preview |
| `BREVO_TEMPLATE_WELCOME` | Template ID (e.g., `1`) | Production, Preview |
| `BREVO_TEMPLATE_SUBSCRIPTION_CONFIRMED` | Template ID | Production, Preview |
| `BREVO_TEMPLATE_TRIAL_ENDING` | Template ID | Production, Preview |
| `BREVO_TEMPLATE_PAYMENT_FAILED` | Template ID | Production, Preview |
| `BREVO_TEMPLATE_SUBSCRIPTION_CANCELLED` | Template ID | Production, Preview |
| `BREVO_TEMPLATE_PASSWORD_RESET` | Template ID | Production, Preview |

4. Click **Save** and redeploy

---

## Verification Checklist

After completing setup, verify:

- [ ] Stripe test mode enabled
- [ ] Stripe product and price created
- [ ] Stripe webhook endpoint configured with correct events
- [ ] Stripe API keys copied
- [ ] Brevo account active
- [ ] All 6 Brevo email templates created
- [ ] Brevo API key generated
- [ ] All environment variables added to Vercel
- [ ] Redeploy triggered to pick up new env vars

---

## Testing

### Test Stripe Integration

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login to Stripe
stripe login

# Forward webhooks to local dev
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Trigger test events
stripe trigger customer.subscription.created
```

### Test Brevo Integration

1. Deploy to preview environment
2. Trigger a test email via the app
3. Check Brevo dashboard for delivery status

---

## Production Checklist

Before going live:

- [ ] Switch Stripe to **Live Mode**
- [ ] Update webhook endpoint URL to production domain
- [ ] Update all API keys to live versions
- [ ] Verify Brevo sender email is verified/authenticated
- [ ] Set up SPF/DKIM for email deliverability
