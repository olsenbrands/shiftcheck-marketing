# Subscriptions

Handles plan selection, Stripe payment processing, and subscription management.

## ADDED Requirements

### Requirement: Plan Selection

The system SHALL display available subscription plans during sign-up Step 5.

#### Scenario: Display pricing tiers
- **WHEN** owner reaches plan selection step
- **THEN** system fetches plans from `pricing_tiers` table
- **AND** displays Free Starter, Grow, and Expand options
- **AND** shows restaurant count and calculated price

#### Scenario: Select Free Starter plan
- **WHEN** owner selects Free Starter
- **THEN** system stores plan selection in local storage
- **AND** skips payment step (Step 6)
- **AND** proceeds directly to completion (Step 7)
- **AND** sets 30-day trial period

#### Scenario: Select Grow plan
- **WHEN** owner selects Grow plan
- **AND** chooses restaurant quantity (1-3)
- **THEN** system calculates price (quantity x $99)
- **AND** stores selection in local storage
- **AND** proceeds to payment step (Step 6)

#### Scenario: Select Expand plan
- **WHEN** owner selects Expand plan
- **AND** chooses restaurant quantity (4+)
- **THEN** system calculates price (quantity x $99)
- **AND** stores selection in local storage
- **AND** proceeds to payment step (Step 6)

---

### Requirement: Stripe Payment Processing

The system SHALL process payments via Stripe Payment Element during sign-up Step 6.

#### Scenario: Display payment form
- **WHEN** owner reaches payment step
- **THEN** system displays order summary (plan, restaurant count, price)
- **AND** displays billing info from profile
- **AND** renders Stripe Payment Element

#### Scenario: Successful payment
- **WHEN** owner submits valid payment details
- **AND** Stripe confirms payment
- **THEN** system receives `customer.subscription.created` webhook
- **AND** creates `subscriptions` record in database
- **AND** activates appropriate number of restaurants
- **AND** redirects to completion step (Step 7)

#### Scenario: Payment declined
- **WHEN** Stripe declines payment
- **THEN** system displays Stripe error message
- **AND** allows owner to retry with different card

#### Scenario: 3D Secure required
- **WHEN** card requires 3D Secure authentication
- **THEN** system displays Stripe 3D Secure modal
- **AND** processes authentication
- **AND** completes payment on success

---

### Requirement: Stripe Customer Creation

The system SHALL create Stripe customers for all paying owners.

#### Scenario: Create Stripe customer
- **WHEN** owner submits payment for first time
- **THEN** system creates Stripe customer with:
  - Email
  - Name
  - Phone
  - Billing address
  - Metadata: owner_id

#### Scenario: Reuse existing Stripe customer
- **WHEN** owner already has Stripe customer ID
- **THEN** system uses existing customer for subscription

---

### Requirement: Webhook Processing

The system SHALL process Stripe webhooks to maintain subscription state.

#### Scenario: Subscription created webhook
- **WHEN** system receives `customer.subscription.created` event
- **THEN** creates `subscriptions` record with:
  - stripe_subscription_id
  - stripe_customer_id
  - plan_type
  - max_active_restaurants
  - status = 'active'
  - period dates

#### Scenario: Payment succeeded webhook
- **WHEN** system receives `invoice.payment_succeeded` event
- **THEN** updates subscription status to 'active'

#### Scenario: Payment failed webhook
- **WHEN** system receives `invoice.payment_failed` event
- **THEN** updates subscription status to 'past_due'
- **AND** sends payment failed email via Brevo

#### Scenario: Subscription deleted webhook
- **WHEN** system receives `customer.subscription.deleted` event
- **THEN** updates subscription status to 'canceled'
- **AND** deactivates all owner's restaurants

---

### Requirement: Restaurant Activation on Subscription

The system SHALL activate restaurants based on subscription plan.

#### Scenario: Activate Free Starter restaurants
- **WHEN** Free Starter subscription is created
- **THEN** system activates first restaurant only
- **AND** sets `is_active = true` and `activated_at`

#### Scenario: Activate Grow restaurants
- **WHEN** Grow subscription is created with X restaurants
- **THEN** system activates first X restaurants (up to 3)
- **AND** sets `is_active = true` and `activated_at` for each

#### Scenario: Activate Expand restaurants
- **WHEN** Expand subscription is created with X restaurants
- **THEN** system activates first X restaurants
- **AND** sets `is_active = true` and `activated_at` for each

---

### Requirement: Trial Period Management

The system SHALL manage 30-day trial periods for Free Starter plan.

#### Scenario: Start trial
- **WHEN** Free Starter plan is selected
- **THEN** system sets `trial_ends_at` to 30 days from now

#### Scenario: Trial expiring notification
- **WHEN** trial_ends_at is 7 days away
- **THEN** system sends "Trial Expiring" email via Brevo

#### Scenario: Trial expired
- **WHEN** trial_ends_at has passed
- **AND** no paid subscription exists
- **THEN** system sets all restaurants to `is_active = false`
- **AND** sends "Trial Expired" email via Brevo
