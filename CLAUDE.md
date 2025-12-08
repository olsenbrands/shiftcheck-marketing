<!-- OPENSPEC:START -->
# OpenSpec Instructions

These instructions are for AI assistants working in this project.

Always open `@/openspec/AGENTS.md` when the request:
- Mentions planning or proposals (words like proposal, spec, change, plan)
- Introduces new capabilities, breaking changes, architecture shifts, or big performance/security work
- Sounds ambiguous and you need the authoritative spec before coding

Use `@/openspec/AGENTS.md` to learn:
- How to create and apply change proposals
- Spec format and conventions
- Project structure and guidelines

Keep this managed block so 'openspec update' can refresh the instructions.

<!-- OPENSPEC:END -->

# ShiftCheck Marketing Website

## Overview

This is the marketing website and owner sign-up system for ShiftCheck. It handles:
- Marketing pages (homepage, pricing, features, etc.)
- Owner account creation and authentication
- Email verification flow
- Stripe subscription management
- Restaurant setup wizard

## Tech Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS, Vite
- **Backend:** Vercel Serverless Functions (API routes)
- **Database:** Supabase (PostgreSQL with Row Level Security)
- **Payments:** Stripe (subscriptions, webhooks)
- **Email:** Brevo (transactional emails)
- **AI Help:** Groq (AI chatbot assistance)

## Architecture

### Phone-as-Primary-Key Pattern

ShiftCheck uses phone numbers (E.164 format) as the primary identifier:
- All phone numbers stored as `+1XXXXXXXXXX`
- Use `normalizePhone()` from `src/utils/phone.ts` before any DB operations
- This enables SMS-based features and unique identification

### Sign-Up Flow

```
1. Email Verification (/auth/signup)
   └── User enters email → Brevo sends verification email

2. Email Confirmed (/signup/verify)
   └── Token validated → User creates password

3. Owner Profile (/signup/profile)
   └── Name, phone, business info collected

4. Restaurant Setup (/signup/restaurant)
   └── First restaurant created

5. Plan Selection (/signup/plan)
   └── Choose Free Trial, Grow ($99), or Expand ($349)

6. Payment (/signup/payment)
   └── Stripe checkout for paid plans

7. Completion (/signup/complete)
   └── Redirect to ShiftCheck app
```

## Project Structure

```
marketing-website/
├── api/                    # Vercel serverless functions
│   ├── auth/              # Authentication endpoints
│   │   ├── send-verification.ts
│   │   └── verify-token.ts
│   ├── stripe/            # Stripe integration
│   │   ├── create-customer.ts
│   │   ├── create-payment-intent.ts
│   │   ├── create-subscription.ts
│   │   └── ...
│   ├── webhooks/          # Webhook handlers
│   │   └── stripe.ts      # Stripe webhook processor
│   ├── cron/              # Scheduled tasks
│   │   ├── trial-expiring.ts
│   │   └── trial-expired.ts
│   ├── email/send.ts      # Brevo email sending
│   └── ai-help.ts         # Groq AI assistant
├── src/
│   ├── components/        # React components
│   ├── pages/             # Route pages
│   │   ├── auth/          # Login, signup, forgot password
│   │   ├── signup/        # Multi-step signup wizard
│   │   └── account/       # Account management
│   ├── services/          # Business logic layer
│   │   ├── authService.ts
│   │   ├── ownerService.ts
│   │   ├── restaurantService.ts
│   │   ├── subscriptionService.ts
│   │   ├── stripeService.ts
│   │   └── ...
│   ├── utils/             # Utility functions
│   │   ├── phone.ts       # Phone normalization
│   │   ├── referral.ts    # Referral code generation
│   │   ├── retry.ts       # Retry logic with backoff
│   │   └── errorMessages.ts
│   ├── hooks/             # React hooks
│   └── lib/               # External integrations
│       └── supabase.ts    # Supabase client
├── database/              # Database schemas
│   └── 001_owner_signup_schema.sql
├── docs/                  # Documentation
│   ├── SECURITY-AUDIT-REPORT.md
│   └── TESTING-REPORT.md
└── scripts/               # Utility scripts
    └── load-test-webhook.ts
```

## API Endpoints

### Authentication
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/send-verification` | POST | Send email verification code |
| `/api/auth/verify-token` | POST | Validate verification token |

### Stripe
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/stripe/create-customer` | POST | Create Stripe customer |
| `/api/stripe/create-payment-intent` | POST | Create payment intent |
| `/api/stripe/create-subscription` | POST | Create subscription |
| `/api/stripe/create-portal-session` | POST | Open billing portal |
| `/api/stripe/update-subscription` | POST | Update plan |
| `/api/stripe/get-invoices` | GET | Get invoice history |

### Webhooks
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/webhooks/stripe` | POST | Handle Stripe events |

### Other
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/email/send` | POST | Send transactional email |
| `/api/ai-help` | POST | AI chatbot responses |
| `/api/cron/trial-expiring` | GET | Send trial expiring reminders |
| `/api/cron/trial-expired` | GET | Handle expired trials |

## Database Schema

### Key Tables (in Supabase)

- **owners** - Owner accounts (phone as primary key)
- **restaurants** - Restaurant locations
- **subscriptions** - Subscription records
- **verification_tokens** - Email verification tokens
- **referrals** - Referral tracking

### Row Level Security (RLS)

All tables have RLS policies ensuring:
- Owners can only access their own data
- Service role bypasses RLS for backend operations
- Phone normalization enforced via triggers

## Environment Variables

### Required for Development
```env
# Supabase
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Brevo
BREVO_API_KEY=

# Groq (AI Help)
GROQ_API_KEY=

# Cron Security
CRON_SECRET=
```

## Development Commands

```bash
# Install dependencies
npm install

# Start Vite dev server (frontend)
npm run dev

# Start API dev server (backend)
npm run dev:api

# Run both (separate terminals recommended)
# Terminal 1: npm run dev
# Terminal 2: npm run dev:api

# Run tests
npm test
npm run test:watch
npm run test:coverage

# Build for production
npm run build

# Load test webhook
npx tsx scripts/load-test-webhook.ts
```

## Testing

- **Unit Tests:** 110+ tests for utilities (phone, referral, retry, errorMessages)
- **Integration Tests:** Sign-up flow component tests
- **E2E Tests:** Chrome DevTools MCP automation
- **Load Tests:** Webhook handles 2,700+ req/s

Run all tests: `npm test`

## Security Considerations

1. **Stripe Webhooks:** Always verify signatures before processing
2. **CORS:** Restricted to allowed origins in production
3. **Cron Jobs:** Protected by CRON_SECRET header validation
4. **Input Validation:** All inputs validated and sanitized
5. **RLS:** Database-level access control via Supabase

See `docs/SECURITY-AUDIT-REPORT.md` for full audit details.

## Deployment

Deployed on Vercel with:
- Automatic deployments from `main` branch
- Preview deployments for PRs
- Environment variables configured in Vercel dashboard

## Related Documentation

- `docs/TESTING-REPORT.md` - Testing coverage and results
- `docs/SECURITY-AUDIT-REPORT.md` - Security audit findings
- `openspec/changes/add-owner-signup-account/` - Feature specification