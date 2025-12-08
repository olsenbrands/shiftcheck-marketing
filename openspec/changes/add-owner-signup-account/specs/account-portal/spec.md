# Account Portal

Handles the owner account dashboard for subscription and restaurant management.

## ADDED Requirements

### Requirement: Account Dashboard

The system SHALL provide an account dashboard at /account/dashboard.

#### Scenario: View dashboard authenticated
- **WHEN** authenticated owner visits /account/dashboard
- **THEN** system displays:
  - Owner name and email
  - Current plan and active restaurant count
  - Renewal date
  - Quick actions: Manage Restaurants, Manage Subscription

#### Scenario: Redirect unauthenticated users
- **WHEN** unauthenticated user visits /account/*
- **THEN** system redirects to /auth/login
- **AND** stores intended destination for redirect after login

#### Scenario: Dashboard navigation
- **WHEN** owner is on dashboard
- **THEN** system displays navigation:
  - Profile
  - Restaurants
  - Subscription
  - Referrals
  - Sign Out

---

### Requirement: Restaurant Management

The system SHALL allow owners to manage restaurants at /account/restaurants.

#### Scenario: View all restaurants
- **WHEN** owner visits /account/restaurants
- **THEN** system displays all restaurants with:
  - Name, address, manager info
  - Active/Inactive status badge
  - Activate/Deactivate buttons

#### Scenario: Activate restaurant
- **WHEN** owner clicks "Activate" on inactive restaurant
- **AND** active count is below subscription limit
- **THEN** system sets `is_active = true` and `activated_at`
- **AND** updates UI immediately

#### Scenario: Attempt activation at limit
- **WHEN** owner clicks "Activate"
- **AND** active count equals subscription limit
- **THEN** system displays error: "Upgrade your plan to activate more restaurants"
- **AND** shows upgrade CTA

#### Scenario: Deactivate restaurant
- **WHEN** owner clicks "Deactivate" on active restaurant
- **THEN** system sets `is_active = false`
- **AND** updates UI immediately

#### Scenario: Edit restaurant details
- **WHEN** owner clicks "Edit" on a restaurant
- **THEN** system displays edit modal with:
  - Restaurant name
  - Address
  - Phone
  - Manager name and phone
  - Save/Cancel buttons

#### Scenario: Add new restaurant
- **WHEN** owner clicks "+ Add Restaurant"
- **THEN** system displays restaurant creation form
- **AND** creates restaurant with `is_active = false`

---

### Requirement: Subscription Management

The system SHALL allow owners to manage subscriptions at /account/subscription.

#### Scenario: View subscription details
- **WHEN** owner visits /account/subscription
- **THEN** system displays:
  - Current plan name
  - Active restaurant count / limit
  - Monthly price
  - Renewal date
  - Payment method (last 4 digits)

#### Scenario: Upgrade plan
- **WHEN** owner clicks "Upgrade Plan"
- **THEN** system displays plan selection modal
- **AND** calculates new price with proration
- **AND** processes upgrade via Stripe API

#### Scenario: Manage payment method
- **WHEN** owner clicks "Manage Payment Method"
- **THEN** system redirects to Stripe Customer Portal
- **AND** owner can update card or billing address

#### Scenario: View billing history
- **WHEN** owner expands "Billing History" section
- **THEN** system displays list of invoices from Stripe
- **AND** each invoice has PDF download link

#### Scenario: Downgrade plan
- **WHEN** owner selects lower plan tier
- **THEN** system displays: "Your plan will downgrade on [renewal date]"
- **AND** schedules downgrade for next billing cycle
- **AND** warns about restaurant deactivation if needed

---

### Requirement: Profile View

The system SHALL display owner profile at /account/profile.

#### Scenario: View profile
- **WHEN** owner visits /account/profile
- **THEN** system displays:
  - Name (read-only)
  - Email (read-only)
  - Phone (read-only)
  - Billing address
  - Referral code with copy button

#### Scenario: Edit in app CTA
- **WHEN** owner wants to edit profile
- **THEN** system displays "Edit in App" link
- **AND** links to ShiftCheck app profile page

---

### Requirement: Sign Out

The system SHALL allow owners to sign out from account portal.

#### Scenario: Sign out
- **WHEN** owner clicks "Sign Out"
- **THEN** system clears Supabase session
- **AND** redirects to marketing homepage
- **AND** clears any sensitive local storage
