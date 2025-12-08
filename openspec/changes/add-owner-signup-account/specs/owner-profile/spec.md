# Owner Profile

Handles owner personal information and billing address collection during sign-up.

## ADDED Requirements

### Requirement: Personal Information Collection

The system SHALL collect owner personal information during sign-up Step 3A.

#### Scenario: Complete personal info form
- **WHEN** owner fills in first name, last name, and phone number
- **AND** all fields pass validation
- **THEN** system saves to `owners` table
- **AND** proceeds to billing address step

#### Scenario: Invalid phone number
- **WHEN** owner enters phone number in invalid format
- **THEN** system displays validation error
- **AND** does not allow proceeding until corrected

#### Scenario: Phone normalization
- **WHEN** owner enters phone number in any valid format (xxx-xxx-xxxx, (xxx) xxx-xxxx, etc.)
- **THEN** system normalizes to E.164 format (+1XXXXXXXXXX)
- **AND** stores normalized version in database

---

### Requirement: Billing Address Collection

The system SHALL collect billing address for Stripe invoicing during sign-up Step 3B.

#### Scenario: Complete billing address form
- **WHEN** owner fills in street address, city, state, ZIP code
- **AND** all required fields are valid
- **THEN** system saves billing address to `owners` table
- **AND** proceeds to restaurant creation step

#### Scenario: Missing required field
- **WHEN** owner attempts to proceed with empty required field
- **THEN** system highlights missing field
- **AND** displays validation message

---

### Requirement: Referral Code Tracking

The system SHALL track referral codes used during sign-up.

#### Scenario: Sign-up with referral code
- **WHEN** owner arrives at sign-up page with `?ref=OWNER_ABC123XYZ` URL parameter
- **THEN** system stores referral code in `referred_by_code` field
- **AND** links to referring owner via `referred_by_owner_id`

#### Scenario: Generate unique referral code
- **WHEN** owner completes profile creation
- **THEN** system generates unique `referral_code` (format: OWNER_XXXXXXXX)
- **AND** stores in `owners.referral_code`

---

### Requirement: Progress Persistence

The system SHALL persist form data to local storage for resume capability.

#### Scenario: Save progress on field blur
- **WHEN** owner fills in any form field and moves to next field
- **THEN** system saves all form data to local storage

#### Scenario: Resume incomplete profile
- **WHEN** owner returns to profile page with saved progress
- **THEN** system auto-populates form fields from local storage
- **AND** displays "Resume signup?" option
