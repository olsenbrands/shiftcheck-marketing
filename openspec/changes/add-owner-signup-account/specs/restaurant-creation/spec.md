# Restaurant Creation

Handles multi-restaurant creation with manager assignment during sign-up Step 4.

## ADDED Requirements

### Requirement: Create First Restaurant

The system SHALL require at least one restaurant during sign-up.

#### Scenario: Create restaurant with all fields
- **WHEN** owner fills in restaurant name, address, phone, manager name, manager phone
- **AND** all required fields are valid
- **THEN** system creates `restaurants` record with `is_active = false`
- **AND** displays success message
- **AND** enables "Continue" button

#### Scenario: Upload restaurant photo
- **WHEN** owner uploads restaurant photo
- **THEN** system stores photo in Supabase Storage
- **AND** saves URL to `restaurant_photo_url`

#### Scenario: Restaurant phone normalization
- **WHEN** owner enters restaurant phone number
- **THEN** system normalizes to E.164 format
- **AND** stores in `restaurant_phone`

---

### Requirement: Owner-Managed Restaurant

The system SHALL support owner-as-manager for self-managed restaurants.

#### Scenario: Enable owner-managed mode
- **WHEN** owner checks "Owner Managed" checkbox
- **THEN** system auto-populates manager name from owner's first_name + last_name
- **AND** auto-populates manager phone from owner's phone
- **AND** grays out manager fields (read-only)

#### Scenario: Create manager record for owner
- **WHEN** restaurant is created with "Owner Managed" checked
- **THEN** system creates `managers` record with owner's phone
- **AND** owner can immediately access manager dashboard

#### Scenario: Disable owner-managed mode
- **WHEN** owner unchecks "Owner Managed" checkbox
- **THEN** system clears manager fields
- **AND** enables manual input for manager name and phone

---

### Requirement: Multiple Restaurant Creation

The system SHALL allow owners to create unlimited restaurants during sign-up.

#### Scenario: Add another restaurant
- **WHEN** owner clicks "+ Add Another Restaurant"
- **THEN** system displays new restaurant form
- **AND** maintains list of previously created restaurants

#### Scenario: Edit existing restaurant
- **WHEN** owner clicks "Edit" on a restaurant card
- **THEN** system displays restaurant form with current values
- **AND** allows updating any field

#### Scenario: Delete restaurant before subscription
- **WHEN** owner clicks "Delete" on a restaurant card
- **AND** confirms deletion
- **THEN** system removes restaurant from database
- **AND** removes from local storage
- **AND** updates restaurant count display

---

### Requirement: Restaurant List Display

The system SHALL display all created restaurants during sign-up.

#### Scenario: Show restaurant count
- **WHEN** owner has created one or more restaurants
- **THEN** system displays "You've created X restaurant(s)"

#### Scenario: Restaurant card display
- **WHEN** restaurant is created
- **THEN** system shows card with:
  - Restaurant name
  - Address
  - Manager name and phone
  - Edit/Delete buttons

---

### Requirement: Proceed to Plan Selection

The system SHALL require at least one restaurant before plan selection.

#### Scenario: Continue with restaurants
- **WHEN** owner has created at least one restaurant
- **AND** clicks "Continue"
- **THEN** system saves all restaurants to local storage
- **AND** proceeds to plan selection (Step 5)

#### Scenario: Attempt to continue without restaurants
- **WHEN** owner clicks "Continue" with zero restaurants
- **THEN** system displays error: "Please create at least one restaurant"
- **AND** does not proceed
