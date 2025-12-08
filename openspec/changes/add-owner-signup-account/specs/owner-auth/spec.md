# Owner Authentication

Handles email verification and owner login for the sign-up flow.

## ADDED Requirements

### Requirement: Email Verification

The system SHALL verify owner email addresses before allowing sign-up to proceed.

#### Scenario: Send verification email
- **WHEN** owner enters email and clicks "Send Verification Email"
- **THEN** system sends verification email via Brevo
- **AND** displays "Check your email" message
- **AND** creates `owners` record with `email_verified = false`

#### Scenario: Resend verification email
- **WHEN** owner clicks "Didn't receive an email?" after initial send
- **THEN** system sends another verification email
- **AND** displays confirmation message

#### Scenario: Complete email verification
- **WHEN** owner clicks verification link in email
- **THEN** system sets `email_verified = true` and `email_verified_at`
- **AND** redirects owner to login page

#### Scenario: Expired verification link
- **WHEN** owner clicks verification link after 24 hours
- **THEN** system displays "Link expired" message
- **AND** offers option to resend verification email

---

### Requirement: Owner Login

The system SHALL authenticate owners using Supabase Auth after email verification.

#### Scenario: Successful login
- **WHEN** owner enters valid email and password
- **AND** email has been verified
- **THEN** system authenticates via Supabase `signInWithPassword()`
- **AND** redirects to owner profile page (Step 3)

#### Scenario: Invalid credentials
- **WHEN** owner enters incorrect email or password
- **THEN** system displays "Invalid email or password" error
- **AND** does not redirect

#### Scenario: Unverified email login attempt
- **WHEN** owner attempts login with unverified email
- **THEN** system displays "Please verify your email first"
- **AND** offers option to resend verification email

---

### Requirement: Session Persistence

The system SHALL maintain owner sessions across browser sessions.

#### Scenario: Return visitor with active session
- **WHEN** owner returns to site with valid session
- **THEN** system auto-redirects to last incomplete sign-up step
- **OR** redirects to account dashboard if sign-up complete

#### Scenario: Expired session
- **WHEN** owner session expires
- **THEN** system redirects to login page
- **AND** preserves sign-up progress in local storage
