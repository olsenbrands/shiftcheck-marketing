# Referrals

Handles the referral program for owner acquisition and discount tracking.

## ADDED Requirements

### Requirement: Referral Code Generation

The system SHALL generate unique referral codes for each owner.

#### Scenario: Generate code on profile creation
- **WHEN** owner completes profile during sign-up
- **THEN** system generates unique referral code (OWNER_XXXXXXXX)
- **AND** stores in `owners.referral_code`

#### Scenario: Code uniqueness
- **WHEN** generating referral code
- **THEN** system verifies code is unique in database
- **AND** regenerates if collision detected

---

### Requirement: Referral Code Capture

The system SHALL track referral codes used during sign-up.

#### Scenario: Capture referral from URL
- **WHEN** user visits sign-up with `?ref=OWNER_ABC123XYZ`
- **THEN** system stores code in local storage
- **AND** persists through entire sign-up flow

#### Scenario: Link to referring owner
- **WHEN** sign-up is completed with referral code
- **THEN** system looks up referrer by code
- **AND** stores `referred_by_code` and `referred_by_owner_id`

#### Scenario: Invalid referral code
- **WHEN** referral code does not exist in database
- **THEN** system ignores the code
- **AND** continues sign-up without referral tracking

---

### Requirement: Referral Redemption

The system SHALL create referral redemption records on successful sign-up.

#### Scenario: Create redemption record
- **WHEN** referred owner completes subscription
- **THEN** system creates `referral_redemptions` record with:
  - referrer_owner_id
  - referred_owner_id
  - referred_owner_restaurants_count
  - discount_amount (restaurants x $99)
  - discount_valid_from (now)
  - discount_valid_until (12 months)
  - status = 'pending'

#### Scenario: Apply discount to referrer
- **WHEN** referral redemption is created
- **AND** referrer has active subscription
- **THEN** system applies discount to referrer's next billing cycle
- **AND** updates redemption status to 'applied'

---

### Requirement: Referral Dashboard

The system SHALL display referral information at /account/referrals.

#### Scenario: View referral code
- **WHEN** owner visits /account/referrals
- **THEN** system displays owner's referral code
- **AND** provides copy button
- **AND** shows shareable message template

#### Scenario: View referral stats
- **WHEN** owner has made referrals
- **THEN** system displays:
  - Total referrals count
  - Total discount earned
  - Active discounts and expiration dates

#### Scenario: View referral list
- **WHEN** owner expands referral details
- **THEN** system displays list of:
  - Referred restaurant names
  - Date of referral
  - Restaurant count
  - Discount amount

---

### Requirement: Shareable Referral Link

The system SHALL provide shareable referral links.

#### Scenario: Generate shareable link
- **WHEN** owner views referral page
- **THEN** system displays link: `https://shiftcheck.app/signup?ref=OWNER_ABC123XYZ`

#### Scenario: Copy referral link
- **WHEN** owner clicks "Copy Link"
- **THEN** system copies full URL to clipboard
- **AND** displays "Copied!" confirmation

#### Scenario: Share message template
- **WHEN** owner views referral page
- **THEN** system displays template message:
  "Join me on ShiftCheck and get 1 month free! Use code: [CODE]"

---

### Requirement: Discount Expiration

The system SHALL handle expired referral discounts.

#### Scenario: Discount expiration check
- **WHEN** discount_valid_until date passes
- **THEN** system updates redemption status to 'expired'
- **AND** stops applying discount to referrer's billing

#### Scenario: Multiple active discounts
- **WHEN** referrer has multiple active redemptions
- **THEN** system sums all discount amounts
- **AND** applies total to monthly billing (capped at subscription cost)
