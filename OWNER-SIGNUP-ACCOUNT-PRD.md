# ShiftCheck Owner Sign-Up & Account Management PRD

**Version:** 1.0  
**Date:** December 6, 2025  
**Status:** 🟢 APPROVED & READY FOR IMPLEMENTATION  
**Scope:** Complete owner onboarding flow + account management portal  

---

## 📋 Executive Summary

This PRD defines the complete Owner onboarding and account management experience for ShiftCheck. The flow includes email verification, multi-step restaurant creation, subscription tier selection, Stripe payment processing, and a unified account portal accessible from both the React app and the marketing website (shiftcheck.app).

**Key Principle:** Owners create unlimited restaurants during sign-up, then select a subscription tier that determines how many can be "active" simultaneously. They can activate/deactivate restaurants anytime without re-paying.

---

## 🎯 Sign-Up Flow Overview

### Complete Journey
```
1. Email Verification (Brevo) 
2. Owner Login
3. Owner Profile Creation 
4. Restaurant(s) Creation (1+)
5. Subscription Plan Selection
6. Stripe Payment Processing
7. Account Portal + Download Link
8. Welcome Email Confirmation
9. Manager Invitation Flow (post-sign-up)
```

### Key Architecture Decisions

| Decision | Rationale |
|----------|-----------|
| **Multi-step form with local storage** | Allows owners to pause/resume, prevents data loss |
| **Restaurants created BEFORE plan selection** | Owners understand what they're subscribing to |
| **is_active boolean on restaurants table** | Simple, flexible for future features (seasonal closures, etc.) |
| **Immediate Stripe subscription creation** | Stripe is source of truth for billing |
| **Restaurant activation enforcement in React UI** | UX reminder: gray out inactive restaurants |
| **Brevo for email** | Existing integration, reliable delivery |
| **Phone-as-Key for manager access** | Consistent with core ShiftCheck architecture |
| **Unified account portal** | Same data reflected on app and marketing website |

---

## 📊 Database Schema Design

### 1. Owners Table (NEW)
```sql
CREATE TABLE owners (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Profile Info
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,  -- Owner's personal phone
  
  -- Billing Address (for Stripe invoicing)
  billing_street_address TEXT,
  billing_city TEXT,
  billing_state TEXT,
  billing_zip_code TEXT,
  billing_country TEXT DEFAULT 'US',
  
  -- Referral System
  referral_code TEXT UNIQUE NOT NULL,  -- Generated on account creation
  referred_by_code TEXT,  -- If owner used a referral code
  referred_by_owner_id UUID REFERENCES owners(id),  -- Track who referred them
  
  -- Account Status
  email_verified BOOLEAN DEFAULT FALSE,
  email_verified_at TIMESTAMPTZ,
  sign_up_started_at TIMESTAMPTZ DEFAULT NOW(),
  sign_up_completed_at TIMESTAMPTZ,  -- Completed when first subscription created
  
  -- Tracking
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: Owners see only their own record
CREATE POLICY "Owners see own profile" ON owners
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Owners update own profile" ON owners
  FOR UPDATE USING (auth.uid() = id);

-- Indexes
CREATE INDEX idx_owners_email ON owners(email);
CREATE INDEX idx_owners_referral_code ON owners(referral_code);
CREATE INDEX idx_owners_referred_by ON owners(referred_by_owner_id);
```

### 2. Subscriptions Table (NEW)
```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES owners(id) ON DELETE CASCADE,
  
  -- Stripe Integration
  stripe_subscription_id TEXT UNIQUE NOT NULL,  -- Stripe subscription ID
  stripe_customer_id TEXT NOT NULL,  -- Stripe customer ID
  
  -- Plan Details
  plan_type TEXT NOT NULL  -- 'free_starter', 'grow', 'expand', 'custom'
    CHECK (plan_type IN ('free_starter', 'grow', 'expand', 'custom')),
  
  max_active_restaurants INTEGER NOT NULL,  -- How many can be active
  price_per_month DECIMAL(10, 2) NOT NULL,  -- For this subscription
  total_restaurants_included INTEGER NOT NULL,  -- Can create unlimited, but only X active
  
  -- Billing Cycle
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  renewal_date TIMESTAMPTZ NOT NULL,  -- When next payment is due
  
  -- Payment Status
  status TEXT NOT NULL  -- 'active', 'past_due', 'canceled', 'incomplete'
    CHECK (status IN ('active', 'past_due', 'canceled', 'incomplete')),
  
  -- Trial Info (for free_starter)
  trial_ends_at TIMESTAMPTZ,  -- 30 days from sign-up for free tier
  
  -- Referral Discounts
  referral_discount_amount DECIMAL(10, 2) DEFAULT 0,  -- Monthly discount from referrals
  referral_discount_until TIMESTAMPTZ,  -- When this discount expires
  
  -- Tracking
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: Owners see their own subscriptions
CREATE POLICY "Owners view own subscriptions" ON subscriptions
  FOR SELECT USING (
    owner_id IN (SELECT id FROM owners WHERE id = auth.uid())
  );

-- Indexes
CREATE INDEX idx_subscriptions_owner ON subscriptions(owner_id);
CREATE INDEX idx_subscriptions_stripe_id ON subscriptions(stripe_subscription_id);
CREATE INDEX idx_subscriptions_renewal ON subscriptions(renewal_date) 
  WHERE status = 'active';
```

### 3. Modify Restaurants Table (EXTEND)
```sql
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT FALSE;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS activated_at TIMESTAMPTZ;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS restaurant_address TEXT;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS restaurant_phone TEXT;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS restaurant_photo_url TEXT;

-- RLS: Ensure owners can only activate restaurants up to their subscription limit
-- (Enforced in React UI, but good to have at DB level as safety check)

-- Indexes
CREATE INDEX idx_restaurants_owner_active ON restaurants(owner_id, is_active);
CREATE INDEX idx_restaurants_activated_at ON restaurants(activated_at);
```

### 4. Referral Redemptions Table (NEW)
```sql
CREATE TABLE referral_redemptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  referrer_owner_id UUID NOT NULL REFERENCES owners(id),  -- Who referred
  referred_owner_id UUID NOT NULL REFERENCES owners(id),  -- Who was referred
  
  referred_owner_restaurants_count INTEGER NOT NULL,  -- How many restaurants they created
  discount_amount DECIMAL(10, 2) NOT NULL,  -- $99 * restaurant count
  discount_applied_to_subscription_id UUID REFERENCES subscriptions(id),
  discount_valid_from TIMESTAMPTZ NOT NULL,
  discount_valid_until TIMESTAMPTZ NOT NULL,
  
  status TEXT DEFAULT 'pending'  -- 'pending', 'applied', 'expired'
    CHECK (status IN ('pending', 'applied', 'expired')),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: Owners see referrals they made and referrals applied to them
CREATE POLICY "Owners see referrals" ON referral_redemptions
  FOR SELECT USING (
    referrer_owner_id = auth.uid() OR referred_owner_id = auth.uid()
  );

-- Indexes
CREATE INDEX idx_referral_referrer ON referral_redemptions(referrer_owner_id);
CREATE INDEX idx_referral_referred ON referral_redemptions(referred_owner_id);
CREATE INDEX idx_referral_status ON referral_redemptions(status, discount_valid_until);
```

### 5. Pricing Table (NEW - Static Reference)
```sql
CREATE TABLE pricing_tiers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  plan_type TEXT UNIQUE NOT NULL  -- 'free_starter', 'grow', 'expand'
    CHECK (plan_type IN ('free_starter', 'grow', 'expand')),
  
  display_name TEXT NOT NULL,  -- "Free Starter", "Grow", "Expand"
  description TEXT,
  
  price_per_month DECIMAL(10, 2),  -- NULL for free tier
  max_active_restaurants INTEGER NOT NULL,
  
  -- Features
  features JSONB DEFAULT '[]',  -- List of feature strings
  
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed data
INSERT INTO pricing_tiers (plan_type, display_name, description, price_per_month, max_active_restaurants, features)
VALUES
  ('free_starter', 'Free Starter', '30-day free trial. 1 restaurant active.', NULL, 1, '["30 day free trial", "1 restaurant", "Basic checklists", "Team dashboard"]'),
  ('grow', 'Grow', 'Scale to multiple locations. $99 per restaurant per month.', 99.00, 3, '["Multiple restaurants", "Advanced analytics", "Priority support", "Phone-based manager access"]'),
  ('expand', 'Expand', 'Enterprise solution. Pay per restaurant.', 99.00, 999, '["Unlimited restaurants", "Custom integrations", "Dedicated support", "Advanced reporting"]');
```

---

## 🔐 RLS Policies (Sign-Up Related)

### Restaurant Access with Subscription Check
```sql
-- Owners see all their restaurants (active and inactive)
CREATE POLICY "Owners see all their restaurants" ON restaurants
  FOR SELECT USING (auth.uid() = owner_id);

-- Owners can update their own restaurants
CREATE POLICY "Owners update their restaurants" ON restaurants
  FOR UPDATE USING (auth.uid() = owner_id);

-- Managers see only ACTIVE restaurants where they're assigned
CREATE POLICY "Managers see active assigned restaurants" ON restaurants
  FOR SELECT USING (
    is_active = TRUE AND
    normalize_phone(manager_phone) IN (
      SELECT normalize_phone(phone) FROM managers WHERE user_id = auth.uid()
    )
  );

-- Store devices can access ACTIVE restaurants
CREATE POLICY "Store devices access active restaurants" ON restaurants
  FOR SELECT USING (
    is_active = TRUE AND
    auth.jwt()->>'role' = 'service_role'
  );
```

### Subscription Access
```sql
-- Owners can only see their own subscriptions
CREATE POLICY "Owners view own subscriptions" ON subscriptions
  FOR SELECT USING (owner_id = auth.uid());

-- Only service role can create subscriptions (via webhook)
CREATE POLICY "Service role manages subscriptions" ON subscriptions
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');
```

---

## 📝 Multi-Step Sign-Up Form Specification

### Step 1: Email Verification (Gate)
**Purpose:** Ensure valid email before proceeding  
**Trigger:** User clicks "Sign Up" on marketing site

**UI:**
- Email input field
- "Send Verification Email" button
- Message: "We've sent a verification link to [email]. Click the link to continue."
- "Didn't receive an email?" + resend button

**Flow:**
1. User enters email
2. Click "Send Verification Email"
3. Call Brevo API to send verification email (magic link)
4. Show "Check your email" message
5. User clicks link in email → Redirected to login page
6. Set `email_verified = true` in `owners` table

**Database:**
- Create `owners` record with `email_verified = false`
- Store `email_verified_at` when verified

---

### Step 2: Owner Login
**Purpose:** Authenticate owner for sign-up session  
**Prerequisites:** Email verified

**UI:**
- Email input (pre-filled from verification)
- Password input
- "Sign In" button
- "Don't have an account?" link to sign-up

**Flow:**
1. Supabase Auth: `signInWithPassword(email, password)`
2. On success, redirect to Step 3
3. Set `email_verified = true` in owners table

**Database:**
- No new records; use Supabase auth.users table

---

### Step 3: Owner Profile Creation
**Purpose:** Capture owner personal info and billing address  
**Prerequisites:** User authenticated

**UI - Step 3A: Personal Info**
- First Name (required)
- Last Name (required)
- Phone (required) - This is owner's personal phone for manager communication
- Submit to continue

**UI - Step 3B: Billing Address**
- Street Address (required)
- City (required)
- State (required)
- ZIP Code (required)
- Country (default: "US")
- Submit to continue

**Flow:**
1. Validate all fields on client before submit
2. Save to `owners` table
3. Generate unique `referral_code` (e.g., "OWNER_" + 8 random chars)
4. Check if `referred_by_code` in URL params → Save to `referred_by_code`
5. Proceed to Step 4

**Database:**
```javascript
// Save owner profile
await supabase.from('owners').upsert({
  id: userId,
  first_name: formData.firstName,
  last_name: formData.lastName,
  email: user.email,
  phone: normalize_phone(formData.phone),
  billing_street_address: formData.street,
  billing_city: formData.city,
  billing_state: formData.state,
  billing_zip_code: formData.zip,
  referred_by_code: urlParams.referralCode,
  email_verified: true,
  email_verified_at: new Date()
});
```

**Local Storage:** Save progress
```javascript
localStorage.setItem('signup_progress', JSON.stringify({
  step: 3,
  ownerData: { firstName, lastName, phone, address... },
  restaurantCount: 0
}));
```

---

### Step 4: Restaurant(s) Creation
**Purpose:** Create one or more restaurants with manager assignments  
**Prerequisites:** Owner profile complete

**UI - Restaurant Creation Form**
**First Restaurant (Required):**
- Restaurant Name (required)
- Restaurant Address (required)
- Restaurant Phone (required) - Store's unique phone number
- Restaurant Photo (optional)
- Manager Name (required)
- Manager Phone (required)
- **"Owner Managed" Checkbox (NEW)**
  - When checked: Auto-populate manager fields with owner info, gray out
  - When unchecked: Allow manual manager input
- "Save Restaurant" button

**UI - Add More Restaurants (After First)**
- Button: "+ Add Another Restaurant"
- Same form appears below (can create as many as wanted)
- Each restaurant shows on a card with ability to edit/delete

**Flow per Restaurant:**
1. Validate all required fields
2. If "Owner Managed" checked:
   - Auto-populate manager_name with owner first_name + last_name
   - Auto-populate manager_phone with owner phone
   - Gray out fields
3. Create `restaurants` record with:
   - `owner_id` = current user
   - `manager_phone` = normalized phone
   - `is_active` = false (will activate after subscription)
   - `restaurant_address`
   - `restaurant_phone`
   - `restaurant_photo_url` (if uploaded)
4. If "Owner Managed":
   - Create `managers` record with owner's phone → owner can immediately access manager dashboard
5. Save state to local storage
6. Show success message
7. Allow adding more or proceed to next step

**Database:**
```javascript
// Create restaurant
const { data: restaurant } = await supabase
  .from('restaurants')
  .insert({
    owner_id: userId,
    name: formData.restaurantName,
    restaurant_address: formData.address,
    restaurant_phone: normalize_phone(formData.restaurantPhone),
    manager_phone: normalize_phone(formData.managerPhone),
    restaurant_photo_url: photoUrl || null,
    is_active: false,
    created_at: new Date()
  })
  .select()
  .single();

// If "Owner Managed", also create manager record
if (formData.ownerManaged) {
  await supabase.from('managers').insert({
    user_id: userId,
    phone: normalize_phone(ownerPhone)
  }).on_conflict('phone').do_nothing();  // Don't error if already exists
}
```

**Local Storage:** Track restaurants
```javascript
localStorage.setItem('signup_progress', JSON.stringify({
  step: 4,
  restaurants: [
    {
      id: uuidv4(),
      name: 'Main Location',
      address: '...',
      phone: '...',
      managerPhone: '...',
      ownerManaged: true,
      photoUrl: '...'
    },
    // Can have multiple
  ]
}));
```

**UI State:** 
- Show count: "You've created X restaurant(s)"
- Show message: "You can create as many restaurants as you want. After subscription, you'll activate the ones you need."

---

### Step 5: Subscription Plan Selection
**Purpose:** Owner selects how many restaurants to activate  
**Prerequisites:** At least one restaurant created

**UI:**
```
You've created [X] restaurants.
Your plan determines how many can be active at once.

┌─────────────────────────────────────────────────────┐
│  FREE STARTER (Recommended for new owners)          │
│  ─────────────────────────────────────────────────  │
│  • 30 days free trial (no credit card)              │
│  • 1 restaurant active                              │
│  • Full access to all features                      │
│  • After 30 days: $99/month to continue             │
│  [SELECT PLAN]                                       │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  GROW ($99/month per restaurant)                    │
│  ─────────────────────────────────────────────────  │
│  • Pay as you grow                                  │
│  • Add restaurants for $99 each                     │
│  • 3 restaurants active at a time                   │
│  • Priority support                                 │
│  ☐ 1 Restaurant: $99/month                          │
│  ☐ 2 Restaurants: $198/month                        │
│  ☐ 3 Restaurants: $297/month                        │
│  [SELECT PLAN]                                       │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  EXPAND (Pay per restaurant)                        │
│  ─────────────────────────────────────────────────  │
│  • Unlimited active restaurants                     │
│  • $99 per restaurant per month                     │
│  • 4+ Restaurants: Custom pricing                   │
│  ☐ 4 Restaurants: $396/month                        │
│  ☐ 5+ Restaurants: Contact sales                    │
│  [SELECT PLAN]                                       │
└─────────────────────────────────────────────────────┘
```

**Flow:**
1. Display available plans (fetch from `pricing_tiers` table)
2. For Grow/Expand: Show checkboxes to select # restaurants
3. Show calculated monthly cost
4. For Free Starter: No credit card needed
5. For Grow/Expand: Proceed to Stripe payment
6. Store selection in local storage

**Business Logic:**
- **Free Starter:** 1 restaurant active, 30-day trial
- **Grow:** $99 per restaurant (1-3 restaurants)
- **Expand:** $99 per restaurant (4+ restaurants)
- Owner can change selection anytime by toggling restaurants in app

**Database (Not Yet):** 
- Store selection temporarily in local storage
- Create subscription record in Step 6 after Stripe payment

---

### Step 6: Stripe Payment (Conditional)
**Purpose:** Collect payment for non-free plans  
**Prerequisites:** Plan selected (if not Free Starter)

**UI - For Free Starter:**
- Message: "Your 30-day free trial starts now!"
- "No credit card required"
- "Continue" button → Step 7

**UI - For Grow/Expand:**
```
You've selected: [2 Restaurants: $198/month]

Your billing information:
├─ Name: John Doe
├─ Email: john@example.com
├─ Address: [from Step 3]
└─ Country: United States

[Embedded Stripe Payment Element]

☐ I agree to the Terms of Service
[Continue to Download]
```

**Stripe Integration:**
1. Use **Stripe Payment Element** (PCI compliant, handles 3D Secure)
2. On "Continue" button click:
   - Create Stripe Customer (if doesn't exist)
   - Create Stripe Subscription with:
     - `customer` = Stripe customer ID
     - `items` = Selected restaurants count × $99
     - `metadata` = Owner ID, restaurant count, selected restaurants
     - `trial_settings` = 30 days (only for Free Starter converting to paid)
3. If payment succeeds:
   - Webhook creates/updates `subscriptions` record
   - Proceed to Step 7
4. If payment fails:
   - Show error: "Payment declined. Please try again or use a different card."
   - Allow retry

**Stripe Webhook Handler (Async):**
```javascript
// Handle events:
// - payment_intent.succeeded → Create subscription
// - invoice.payment_succeeded → Update subscription status
// - customer.subscription.updated → Update subscription
// - customer.subscription.deleted → Mark as canceled
```

---

### Step 7: Account Portal + Download
**Purpose:** Confirm sign-up complete, show account info, provide download link  
**Prerequisites:** All steps complete

**UI:**
```
🎉 Welcome to ShiftCheck!

Your account is ready.

Account Details:
├─ Owner Name: John Doe
├─ Email: john@example.com
├─ Plan: Grow (2 Restaurants: $198/month)
└─ Trial Ends: [Date, if applicable]

Restaurants:
├─ Main Location (Active) ✓
└─ Branch 2 (Active) ✓

[Download ShiftCheck App]

← View Your Account  |  Manage Subscription →
```

**Flow:**
1. Show account summary
2. Show which restaurants are active (based on plan)
3. Provide "Download App" button → Links to app download page
4. Provide "View Your Account" button → Redirects to account portal
5. Save all data to database
6. Send welcome email (async)

**Database:**
```javascript
// Activate appropriate number of restaurants
const planMaxActive = getPlanMaxActive(selectedPlan);
const restaurantIds = getSelectedRestaurantIds();

for (let i = 0; i < Math.min(planMaxActive, restaurantIds.length); i++) {
  await supabase
    .from('restaurants')
    .update({ is_active: true, activated_at: new Date() })
    .eq('id', restaurantIds[i]);
}

// Update owner sign-up completion
await supabase.from('owners').update({
  sign_up_completed_at: new Date()
}).eq('id', userId);
```

---

### Step 8: Welcome Email (Async)
**Purpose:** Confirm sign-up, show next steps  
**Trigger:** After Step 7 completes

**Email (Brevo Template):**
```
Subject: Welcome to ShiftCheck! Your restaurant just leveled up 📱

Dear [Owner First Name],

Welcome to ShiftCheck! Your 30-day free trial is now active.

Account Summary:
├─ Plan: [Free Starter / Grow / Expand]
├─ Active Restaurants: X of Y
├─ Trial Expires: [Date]
└─ Next Payment: [Date] (if applicable)

Your Restaurants:
├─ [Restaurant 1] ✓ Active
└─ [Restaurant 2] (Inactive - Upgrade to activate)

NEXT STEPS:
1. Download the ShiftCheck app: [Link]
2. Add your manager(s) - They'll receive SMS invites
3. Create your first checklist
4. Start verifying tasks with photos!

HELP & SUPPORT:
- Help Center: [Link]
- Chat with us: [AI Bot Link]
- Email support: support@shiftcheck.app

Questions? Reply to this email or chat with our AI assistant.

Your Success Team,
ShiftCheck
```

**Brevo Integration:**
```javascript
// Call Brevo API
const brevoResponse = await fetch('https://api.brevo.com/v3/smtp/email', {
  method: 'POST',
  headers: { 'api-key': BREVO_API_KEY },
  body: JSON.stringify({
    to: [{ email: ownerEmail, name: ownerName }],
    templateId: BREVO_WELCOME_EMAIL_TEMPLATE,
    params: {
      ownerFirstName: ownerFirstName,
      planName: selectedPlan,
      activeRestaurants: activeCount,
      trialExpiresDate: trialEndDate,
      restaurantsList: restaurants.map(r => r.name).join(', ')
    }
  })
});
```

---

## 💳 Stripe Integration Architecture

### Stripe Setup

**Test Mode Credentials:**
- Publishable Key: `pk_test_...` (in .env.local, not committed)
- Secret Key: `sk_test_...` (backend only)

**Live Mode Credentials:**
- Will be configured in Vercel after testing

### Stripe Objects Flow

```
SIGN-UP FLOW:
Owner Info → Stripe Customer → Stripe Subscription → Webhook → DB

DETAIL:
1. Step 3 (Owner Profile) → No Stripe object yet
2. Step 6 (Payment):
   a. Create/Get Stripe Customer:
      {
        "email": owner.email,
        "name": owner.first_name + owner.last_name,
        "phone": owner.phone,
        "address": { ... },
        "metadata": { "owner_id": userId }
      }
   b. Create Stripe Subscription:
      {
        "customer": stripe_customer_id,
        "items": [{ "price_data": {
          "currency": "usd",
          "unit_amount": 9900,  // $99.00
          "recurring": { "interval": "month" },
          "product_data": { "name": "ShiftCheck for 1 Restaurant" }
        }, "quantity": selected_restaurant_count }],
        "trial_period_days": 30,  // For free_starter
        "metadata": {
          "owner_id": userId,
          "plan_type": plan,
          "restaurant_count": count
        }
      }
   c. On success: Redirect to Step 7
   d. On error: Show Stripe error message, allow retry

3. Webhook Handler (Stripe Events):
   - payment_intent.succeeded
   - customer.subscription.created
   - invoice.payment_succeeded
   - customer.subscription.updated
   - customer.subscription.deleted
```

### Webhook Handler Details

**Endpoint:** `/api/webhooks/stripe`

**Events to handle:**
```javascript
// 1. Subscription created/updated
case 'customer.subscription.created':
case 'customer.subscription.updated':
  const subscription = event.data.object;
  const owner = await getOwnerByStripeCustomerId(subscription.customer);
  
  await supabase.from('subscriptions').upsert({
    owner_id: owner.id,
    stripe_subscription_id: subscription.id,
    stripe_customer_id: subscription.customer,
    plan_type: getPlanType(subscription),  // Determine from metadata
    max_active_restaurants: getMaxActiveFromPrice(subscription.items[0].price.unit_amount),
    status: subscription.status,
    current_period_start: new Date(subscription.current_period_start * 1000),
    current_period_end: new Date(subscription.current_period_end * 1000),
    renewal_date: new Date(subscription.current_period_end * 1000),
    updated_at: new Date()
  });
  break;

// 2. Payment succeeded
case 'invoice.payment_succeeded':
  const invoice = event.data.object;
  await updateSubscriptionStatus(invoice.subscription, 'active');
  break;

// 3. Payment failed
case 'invoice.payment_failed':
  const invoice = event.data.object;
  await updateSubscriptionStatus(invoice.subscription, 'past_due');
  await sendPaymentFailedEmail(invoice);
  break;

// 4. Subscription canceled
case 'customer.subscription.deleted':
  const sub = event.data.object;
  await updateSubscriptionStatus(sub.id, 'canceled');
  // Deactivate all restaurants for this owner
  await deactivateOwnerRestaurants(sub.customer);
  break;
```

### Upgrade/Downgrade Flow

**In Account Portal:**

1. Owner clicks "Change Plan"
2. Show plan selection (same as Step 5)
3. If upgrading:
   - Call Stripe API: `Update subscription quantity`
   - New price effective immediately
   - Prorated charge for current period
4. If downgrading:
   - Call Stripe API: `Update subscription quantity`
   - New price effective at next renewal date
   - Show: "Your plan will downgrade to X restaurants on [date]"
   - Automatically deactivate extra restaurants (keep first N active)
5. Owner can reorder which restaurants are active via checkboxes

---

## 🌐 Account Portal (Marketing Website)

### Architecture
```
shiftcheck.app/account/sign-in
  ↓
Verify email + login (Supabase auth)
  ↓
shiftcheck.app/account/dashboard
  ├─ User Profile (readonly on website, editable in app)
  ├─ Restaurants (view status, toggle active/inactive)
  ├─ Subscription (view plan, change plan, billing info)
  ├─ Referral Code (show code, track referrals)
  ├─ Download App Link
  └─ Support / Help
```

### Account Portal UI

**Navigation:**
```
User Menu: [Profile Icon] John Doe ▼
├─ View Profile
├─ Manage Subscription
├─ Restaurants
├─ Referral Program
├─ Settings
└─ Sign Out
```

**Profile Page:**
- View-only display of name, email, phone
- "Edit in App" link (opens app in same window)
- Billing address (for Stripe invoicing)
- Referral code (with copy button)

**Restaurants Page:**
```
My Restaurants (2 of 3 active)

Active:
☑ Main Location
  123 Main St, Salt Lake City, UT
  Manager: John Doe (+1-801-458-1589)
  [EDIT] [DEACTIVATE]

☑ Branch 2
  456 Oak Ave, Provo, UT
  Manager: Sarah Smith (+1-801-555-0123)
  [EDIT] [DEACTIVATE]

Inactive:
☐ Future Location
  789 Park Ln, Lehi, UT (not yet opened)
  Manager: TBD
  [EDIT] [ACTIVATE]

[+ ADD RESTAURANT]
```

**Subscription Page:**
```
Current Plan: GROW
├─ 3 Restaurants Active
├─ $198/month (2 restaurants × $99)
├─ Renewal Date: [Date]
└─ Payment Method: Visa ending in 4242

[UPGRADE PLAN] [MANAGE PAYMENT METHOD] [BILLING HISTORY]

Recent Invoices:
├─ December 6, 2025: $198.00 [PDF]
├─ November 6, 2025: $198.00 [PDF]
└─ October 6, 2025: $99.00 [PDF]
```

**Referral Page:**
```
Your Referral Code: OWNER_ABC123XYZ

Share your code with other restaurants:
"Join me on ShiftCheck and get 1 month free! Use code: OWNER_ABC123XYZ"

[COPY LINK]

Referrals:
You've referred: 2 restaurants
You've earned: 1 month free on 2 of your restaurants (expires [date])

Referrals Made:
├─ Restaurant A (Referred July 2024): 1 restaurant → 1 month discount
└─ Restaurant B (Referred August 2024): 2 restaurants → 2 month discount
```

---

## 🤖 AI Help Bot (During Sign-Up)

### Placement
- Bottom-right corner during entire sign-up flow
- Chat icon with "Need help?" tooltip
- Minimizable/expandable

### Capabilities
1. **Answer common questions:**
   - "What's the difference between plans?"
   - "Can I create more restaurants later?"
   - "What's included in the free trial?"
   - "When will I be charged?"

2. **Help with form fields:**
   - Hover over field → Show tooltip with AI explanation
   - Example: "What's my manager phone number?" → "This is the phone number of the person managing this location. They'll receive SMS invites to log in."

3. **Request email follow-up:**
   - "I still have questions" → Email form
   - Subject + message
   - Sent to support@shiftcheck.app
   - Auto-populated with owner info
   - Trigger: Request escalation to human support

### Integration
```javascript
// Use Claude API via backend
POST /api/ai-help
{
  "message": "What's the difference between Grow and Expand?",
  "context": {
    "currentStep": 5,
    "restaurantCount": 2,
    "plan": "grow"
  }
}

// Response:
{
  "reply": "The Grow plan includes up to 3 active restaurants at $99 each..."
}
```

---

## 📊 Analytics & Tracking

### Sign-Up Funnel Tracking

**Events to track:**

| Event | Trigger | Data |
|-------|---------|------|
| `signup_started` | User clicks "Sign Up" | timestamp |
| `email_verification_sent` | Brevo sends verification email | email |
| `email_verified` | User verifies email | timestamp, email |
| `owner_profile_completed` | Owner saves profile | first_name, last_name |
| `restaurant_created` | Each restaurant created | restaurant_id, order |
| `restaurant_count_X` | After restaurant creation | count |
| `plan_selected` | Owner selects plan | plan_type, restaurant_count |
| `payment_started` | Stripe form displayed | plan_type |
| `payment_completed` | Stripe payment succeeded | stripe_subscription_id, amount |
| `payment_failed` | Stripe payment failed | error_code, reason |
| `signup_completed` | Sign-up flow finished | time_to_complete_minutes |
| `signup_abandoned` | User leaves (session expires) | last_step |

### Segment Integration
```javascript
// After each step, track:
analytics.track('signup_step_completed', {
  step: 3,  // 1-7
  stepName: 'owner_profile',
  timestamp: new Date(),
  sessionDuration: millisecondsElapsed,
  restaurantCount: restaurantsCreated,
  planSelected: null,  // null until Step 5
  userId: supabaseUserId
});

// On completion:
analytics.identify(userId, {
  email: ownerEmail,
  firstName: ownerFirstName,
  lastName: ownerLastName,
  plan: selectedPlan,
  restaurantCount: totalRestaurants,
  signupCompletedAt: new Date(),
  referredBy: referralCode || null
});
```

### Dashboard Metrics
- **Sign-up completion rate:** % of users who finish flow
- **Drop-off by step:** Where do users abandon?
- **Plan distribution:** % Free Starter vs. Grow vs. Expand
- **Average restaurants per owner:** Count
- **Referral effectiveness:** % using referral code
- **Payment success rate:** % who complete Stripe
- **Time to complete:** Average minutes from start to finish

---

## 📧 Email Templates (Brevo)

### 1. Email Verification
```
Subject: Verify your ShiftCheck account

Hi [FirstName],

Click below to verify your email and get started with ShiftCheck:
[VERIFICATION LINK]

This link expires in 24 hours.

Questions? Reply to this email.

ShiftCheck Team
```

### 2. Welcome Email
```
Subject: Welcome to ShiftCheck! Your restaurant just leveled up 📱

[See Step 8 above]
```

### 3. Trial Expiring Soon (7 days before)
```
Subject: Your free trial expires in 7 days. Choose your plan.

Hi [FirstName],

Your 30-day free trial for ShiftCheck expires on [Date].

To keep using ShiftCheck after the trial:
1. Choose your plan
2. Add payment method
3. Continue verifying tasks with photos!

No credit card? No problem - you can cancel anytime.

[CHOOSE PLAN LINK]

ShiftCheck Team
```

### 4. Trial Expired
```
Subject: Your ShiftCheck trial has ended. Reactivate now?

Hi [FirstName],

Your free trial ended on [Date]. Your restaurants are now inactive.

To reactivate:
1. Log in to your account
2. Choose a plan and add payment
3. Activate your restaurants

[REACTIVATE LINK]

Questions? Email us at support@shiftcheck.app

ShiftCheck Team
```

### 5. Payment Failed
```
Subject: Payment failed - Update your payment method

Hi [FirstName],

We couldn't charge your card for your ShiftCheck subscription.

Update your payment method:
[MANAGE PAYMENT LINK]

Your restaurants remain active while we resolve this. Please update your payment method within 7 days.

Questions? Email us at support@shiftcheck.app

ShiftCheck Team
```

---

## 🔑 Authentication Flow

### Owner Sign-Up → App Access

```
MARKETING WEBSITE:
1. Email verification (Brevo)
2. Login (Supabase Auth)
3. Profile creation
4. Restaurant(s) creation
5. Plan selection
6. Stripe payment
7. Redirect to /account/dashboard
   └─ Show download link

APP:
1. Owner opens app
2. If iOS: App Store → Download
   If Android: Google Play → Download
   If Web: localhost:3000 → React app
3. Owner logs in with same email/password
4. App loads owner's restaurants from DB
5. Active restaurants displayed prominently
6. Inactive restaurants grayed out
7. Manager dashboard available (if restaurant owner-managed)
```

### Persisting Sign-Up State

**Local Storage Keys:**
```javascript
{
  "signup_progress": {
    "step": 4,  // 1-7
    "ownerData": {
      "firstName": "John",
      "lastName": "Doe",
      "phone": "+18014581589",
      "billingAddress": { ... }
    },
    "restaurants": [
      {
        "id": "uuid-1",
        "name": "Main Location",
        "address": "...",
        "phone": "+1-801-555-0123",
        "managerPhone": "+1-801-458-1589",
        "ownerManaged": true,
        "photoUrl": "..."
      }
    ],
    "selectedPlan": "grow",
    "selectedRestaurantCount": 2,
    "startedAt": "2025-12-06T10:30:00Z",
    "lastSavedAt": "2025-12-06T10:45:00Z"
  }
}
```

**Resume Flow:**
1. User returns to sign-up page
2. Check local storage for `signup_progress`
3. If step < 7: Show "Resume signup?" modal
4. If step ≥ 7: Redirect to app login
5. Auto-populate form fields from local storage
6. Continue from where they left off

---

## 🛡️ Security & Compliance

### PCI Compliance
- **Never handle card data directly** - Use Stripe Payment Element
- All card processing via Stripe (PCI-compliant)
- No card data stored in our database

### Data Protection
- **HTTPS everywhere** - Enforce in production
- **Environment variables** - Never commit credentials
- **RLS policies** - Prevent unauthorized access
- **Phone normalization** - Consistent validation

### Email Security
- **Brevo API key** - Stored in environment variables
- **Verification links** - Expire after 24 hours
- **Rate limiting** - Prevent email spam (Brevo handles)

### Stripe Security
- **Webhook verification** - Verify Stripe signature on all webhooks
- **Idempotency keys** - Prevent duplicate subscriptions
- **Test mode** - Use test keys during development
- **PCI-SAC validation** - Stripe certification

---

## 🚀 Implementation Roadmap

### Phase 1: Foundation (Week 1-2)
- [ ] Create database tables (owners, subscriptions, pricing_tiers, referral_redemptions)
- [ ] Create RLS policies
- [ ] Set up Supabase project with tables
- [ ] Create Stripe account (test mode)
- [ ] Set up Brevo email templates

### Phase 2: Sign-Up Flow (Week 2-3)
- [ ] Email verification page (Steps 1-2)
- [ ] Owner profile form (Step 3)
- [ ] Restaurant creation form (Step 4) - WITH local storage
- [ ] Plan selection UI (Step 5)

### Phase 3: Stripe Integration (Week 3-4)
- [ ] Stripe Payment Element integration (Step 6)
- [ ] Webhook endpoint (/api/webhooks/stripe)
- [ ] Webhook handler for subscription events
- [ ] Test with Stripe test cards

### Phase 4: Account Portal (Week 4-5)
- [ ] Account dashboard page
- [ ] Manage subscription UI
- [ ] Restaurant toggle (activate/deactivate)
- [ ] Billing history display

### Phase 5: AI Bot & Polish (Week 5-6)
- [ ] AI help bot integration
- [ ] Email templates in Brevo
- [ ] Analytics tracking implementation
- [ ] End-to-end testing
- [ ] Referral system

### Phase 6: Launch Prep (Week 6-7)
- [ ] Security audit
- [ ] Load testing
- [ ] Documentation
- [ ] Support articles
- [ ] Go-live planning

---

## 📝 Technical Notes for Implementation

### Service Layer Functions

**authService.js**
```javascript
export async function verifyEmail(token) {
  // Call Supabase function or third-party email verification
  // Set email_verified = true
}

export async function createOwnerProfile(userId, profileData) {
  // Insert into owners table
  // Generate referral_code
}

export async function resumeSignup(userId) {
  // Check if owner has incomplete signup
  // Return current progress
}
```

**restaurantService.js**
```javascript
export async function createRestaurant(ownerId, restaurantData) {
  // Insert restaurant with is_active = false
  // If ownerManaged, create managers record
}

export async function activateRestaurant(restaurantId) {
  // Update is_active = true, activated_at = now()
}

export async function toggleRestaurantActive(restaurantId, active) {
  // Update is_active boolean
}
```

**stripeService.js**
```javascript
export async function createStripeCustomer(ownerData) {
  // POST to Stripe API
  // Return stripe_customer_id
}

export async function createStripeSubscription(customerId, restaurantCount) {
  // Calculate price: restaurantCount * 99
  // Create subscription
  // Return stripe_subscription_id
}

export async function updateSubscriptionQuantity(subscriptionId, newQuantity) {
  // Call Stripe API
  // Update quantity
}
```

**subscriptionService.js**
```javascript
export async function createSubscriptionRecord(webhookData) {
  // Called from webhook handler
  // Create or update subscriptions table
}

export async function activateStarterRestaurants(ownerId) {
  // For Free Starter: activate first restaurant only
  // For Grow: activate first N restaurants
}

export async function handleDowngrade(subscriptionId, newMaxActive) {
  // Get owner's restaurants
  // Deactivate extras, keep first N active
  // Send notification email
}
```

### React Component Structure
```
/src
  /pages
    /auth
      /EmailVerification.jsx
      /Login.jsx
    /signup
      /OwnerProfile.jsx
      /RestaurantForm.jsx
      /RestaurantList.jsx
      /PlanSelection.jsx
      /StripePayment.jsx
      /Complete.jsx
  /components
    /AIHelpBot.jsx
    /ProgressStepper.jsx
  /services
    /authService.js
    /restaurantService.js
    /stripeService.js
    /subscriptionService.js
  /hooks
    /useSignupProgress.js
    /useStripe.js
    /useBrevo.js
```

### Environment Variables
```bash
# Supabase
REACT_APP_SUPABASE_URL=
REACT_APP_SUPABASE_ANON_KEY=

# Stripe (Test)
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...  # Backend only

# Brevo
BREVO_API_KEY=...

# Webhooks
STRIPE_WEBHOOK_SECRET=whsec_...

# App URLs
REACT_APP_APP_URL=http://localhost:3000  # Dev
REACT_APP_MARKETING_URL=http://localhost:3001  # Dev

# AI Help Bot
CLAUDE_API_KEY=...
```

---

## ✅ Testing Checklist

### Functional Testing
- [ ] Email verification flow works end-to-end
- [ ] Form fields validate correctly
- [ ] Local storage persists data correctly
- [ ] Owner can resume interrupted signup
- [ ] Multiple restaurants can be created
- [ ] Plan selection calculates price correctly
- [ ] Stripe payment succeeds with test card
- [ ] Webhook processes subscription correctly
- [ ] Restaurants activate correctly based on plan
- [ ] Account portal displays correct info
- [ ] Can toggle restaurant active/inactive
- [ ] Upgrade/downgrade works
- [ ] Referral code tracking works

### Stripe Testing
- [ ] Test card: 4242 4242 4242 4242 (success)
- [ ] Test card: 4000 0000 0000 0002 (decline)
- [ ] Test card: 4000 0025 0000 3155 (3D Secure)
- [ ] Webhook delivery verified
- [ ] Idempotency key prevents duplicates
- [ ] Failed payments handled gracefully

### Email Testing
- [ ] Verification email arrives
- [ ] Welcome email contains correct info
- [ ] Trial expiring email sends 7 days before
- [ ] Payment failed email triggers correctly
- [ ] Email unsubscribe works

### RLS Testing
- [ ] Owner can only see their own subscriptions
- [ ] Manager can only see active restaurants
- [ ] Store device can only access active restaurants
- [ ] Subscription webhook creates records correctly

### Analytics Testing
- [ ] Events fire at correct steps
- [ ] Segment integration working
- [ ] Funnel metrics tracking
- [ ] Drop-off tracking accurate

---

## 📞 Support & Resources

### Stripe Documentation
- https://docs.stripe.com/billing/subscriptions/build-subscriptions
- https://docs.stripe.com/payments/payment-element
- https://docs.stripe.com/webhooks
- https://stripe.com/docs/testing

### Brevo Documentation
- https://developers.brevo.com/docs/send-a-transactional-email

### Supabase Documentation
- https://supabase.com/docs/guides/auth
- https://supabase.com/docs/guides/database/tables

---

## 🎯 Success Metrics (Post-Launch)

Track these metrics to evaluate success:

| Metric | Target | Method |
|--------|--------|--------|
| Sign-up completion rate | >40% | Segment |
| Time to complete sign-up | <10 min | Analytics |
| Plan distribution | 20% Free, 50% Grow, 30% Expand | Segment |
| Payment success rate | >95% | Stripe + Segment |
| Referral usage | >15% | Database query |
| Account retention (30-day) | >70% | Database query |
| Support requests during signup | <5% | Email/Chat logs |
| Stripe payment failures | <3% | Stripe dashboard |

---

## 📄 Appendix: Quick Reference

### Phone Normalization Function
```javascript
export function normalize_phone(phone) {
  const cleaned = phone.replace(/[^0-9]/g, '');
  
  if (cleaned.length === 10) {
    return '+1' + cleaned;
  } else if (cleaned.length === 11 && cleaned[0] === '1') {
    return '+' + cleaned;
  }
  
  return '+' + cleaned;
}
```

### Referral Code Generation
```javascript
export function generateReferralCode() {
  const prefix = 'OWNER_';
  const random = Math.random().toString(36).substring(2, 10).toUpperCase();
  return prefix + random;
}
```

### Pricing Calculation
```javascript
export function calculateMonthlyPrice(planType, restaurantCount) {
  if (planType === 'free_starter') return 0;
  if (planType === 'grow' || planType === 'expand') {
    return restaurantCount * 99;
  }
  return 0;
}

export function getMaxActiveRestaurants(planType, restaurantCount) {
  if (planType === 'free_starter') return 1;
  if (planType === 'grow') return Math.min(3, restaurantCount);
  if (planType === 'expand') return restaurantCount;
  return 1;
}
```

---

**Document Status:** ✅ COMPLETE & READY FOR CLAUDE CODE IMPLEMENTATION

**Next Steps:**
1. Review this PRD with team
2. Create database migration file
3. Set up Stripe test account
4. Create Brevo email templates
5. Begin Phase 1 implementation

---

**For questions or clarifications, reference:**
- CLAUDE.md - Development standards
- ARCHITECTURE.md - Core database design
- IMPLEMENTATION.md - Phase-by-phase guides
