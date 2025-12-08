# ShiftCheck Marketing Website - Complete Session Handoff

**Last Updated:** December 7, 2025
**Project:** `marketing-website` (shiftcheck.app)
**Working Directory:** `/Users/jordanolsen/ShiftCheck/marketing-website`

---

## Copy This Entire Block to Start New Session:

```
I'm continuing work on the ShiftCheck marketing-website project. This is a handoff from a previous session. Please read the context below carefully before proceeding.

## What is ShiftCheck?

ShiftCheck is a **photo-based employee accountability system for restaurants**. The tagline is "Proof, not promises."

**How it works:**
- Restaurant owners create daily checklists (opening tasks, closing tasks, cleaning duties)
- Managers complete tasks and must submit photo proof
- Owners can verify tasks were actually done via photo evidence
- Uses **phone-as-key architecture** - managers are identified by phone number (E.164 format: +1XXXXXXXXXX)

**Business Model:**
- Free Starter: $0/month, 1 restaurant, 30-day trial
- Grow: $99/month per restaurant (1-3 restaurants)
- Expand: $99/month per restaurant (4+ restaurants)

## What is the Marketing Website?

The marketing website (shiftcheck.app) is SEPARATE from the main ShiftCheck React app. It handles:
1. Marketing pages (home, pricing, features)
2. **Owner sign-up flow** (7-step process we're building)
3. **Account portal** (dashboard, subscriptions, restaurants)
4. Email verification and authentication

**Tech Stack:**
- React + Vite + TypeScript
- Tailwind CSS
- Supabase Auth + Database
- Stripe Payments
- Brevo Email (transactional)
- Vercel Hosting
- Groq API for AI chatbot (Llama 3.3 70B)

## The OpenSpec System

This project uses **OpenSpec** for spec-driven development. Key concepts:

- `openspec/project.md` - Project conventions and standards
- `openspec/specs/` - Current truth (what IS built)
- `openspec/changes/` - Proposals (what SHOULD change)
- `openspec/AGENTS.md` - Instructions for AI assistants

**Current Change:** `add-owner-signup-account`
- Location: `openspec/changes/add-owner-signup-account/`
- PRD: `OWNER-SIGNUP-ACCOUNT-PRD.md` (1500+ lines, comprehensive spec)
- Tasks: `openspec/changes/add-owner-signup-account/tasks.md` (184 total tasks)

## What We're Building

A complete **Owner Sign-Up & Account Management** system:

**7-Step Sign-Up Flow:**
1. Email Verification (Brevo magic link)
2. Owner Login (Supabase Auth)
3. Owner Profile (name, phone, billing address)
4. Restaurant Creation (1+, with manager assignment)
5. Plan Selection (Free/Grow/Expand)
6. Stripe Payment (for paid plans)
7. Complete + Download App link

**Account Portal:**
- Dashboard with quick stats
- Restaurant management (activate/deactivate)
- Subscription management (upgrade/downgrade)
- Referral program
- Billing history

## Current Progress: Phase 6.3 COMPLETE

### All Completed Phases:

| Phase | Description | Status | Tasks |
|-------|-------------|--------|-------|
| 1 | Foundation (DB, RLS, Services) | ✅ COMPLETE | 36/36 |
| 2 | Sign-Up Flow UI (7 pages) | ✅ COMPLETE | 44/44 |
| 3 | Stripe Integration | ✅ COMPLETE | 22/22 |
| 4 | Account Portal | ✅ COMPLETE | 32/32 |
| 5.1 | Email Templates (Brevo) | ✅ COMPLETE | 7/7 |
| 5.2 | Email Triggers (cron, webhooks) | ✅ COMPLETE | 5/5 |
| 5.3 | AI Help Bot (Groq) | ✅ COMPLETE | 9/9 |
| 5.4 | Analytics Tracking | ✅ COMPLETE | 13/13 |
| 6.1 | Sign-Up Resume Flow | ✅ COMPLETE | 5/5 |
| 6.2 | Error Handling & Edge Cases | ✅ COMPLETE | 6/6 |
| 6.3 | Security Audit | ✅ COMPLETE | 6/6 |
| 6.4 | Testing | ⏳ NEXT | 0/6 |
| 6.5 | Documentation | ⏳ PENDING | 0/5 |
| 6.6 | Launch Prep | ⏳ PENDING | 0/6 |

**Total: 179/184 tasks complete (97%)**

### Just Completed: Phase 6.3 Security Audit

**Report Created:**
- `docs/SECURITY-AUDIT-REPORT.md` - Comprehensive security audit report

**Security Issues Found & Fixed:**

1. **CRITICAL: Cron Job Authorization Bypass**
   - Files: `api/cron/trial-expiring.ts`, `api/cron/trial-expired.ts`
   - Issue: If CRON_SECRET not set, auth was bypassed
   - Fix: Now requires CRON_SECRET, returns 500 if not configured

2. **MEDIUM: Overly Permissive CORS**
   - Files: `api/auth/send-verification.ts`, `api/auth/verify-token.ts`
   - Issue: `Access-Control-Allow-Origin: *` allowed any domain
   - Fix: Now restricted to `shiftcheck.app` and Vercel preview URLs

3. **LOW: Missing Input Validation**
   - File: `api/stripe/create-payment-intent.ts`
   - Issue: No validation on restaurantCount
   - Fix: Validates as positive integer between 1-100

4. **LOW: Missing Message Length Limit**
   - File: `api/ai-help.ts`
   - Issue: No max length on user messages
   - Fix: Limited to 1000 characters, 20 message history

**Security Strengths Verified:**
- ✅ All RLS policies properly configured
- ✅ Stripe webhook signature verification working
- ✅ No exposed credentials in frontend
- ✅ HTTPS enforced by Vercel
- ✅ No XSS vulnerabilities
- ✅ SQL injection blocked by Supabase SDK

## Key Files to Read

1. **Tasks:** `openspec/changes/add-owner-signup-account/tasks.md` (READ FIRST - shows all task checkboxes)
2. **PRD:** `OWNER-SIGNUP-ACCOUNT-PRD.md`
3. **Security Audit:** `docs/SECURITY-AUDIT-REPORT.md`
4. **Error Messages:** `src/utils/errorMessages.ts`
5. **Retry Logic:** `src/utils/retry.ts`
6. **Routes:** `src/App.tsx`

## Next Phase: 6.4 Testing

**IMPORTANT:** The user explicitly said:
> "Do not continue to 6.4 until I say so."

**6.4 Tasks (waiting for user authorization):**
- 6.4.1 Write unit tests for service layer functions
- 6.4.2 Write integration tests for sign-up flow
- 6.4.3 Write E2E tests with Playwright
- 6.4.4 Test mobile responsiveness
- 6.4.5 Test on multiple browsers (Chrome, Safari, Firefox)
- 6.4.6 Perform load testing on webhook endpoint

## Build Status

The project builds successfully:
```
✓ 1855 modules transformed
✓ built in 1.89s
```

## Dev Server Setup

```bash
# Terminal 1: API server (MUST run first)
npx tsx api-dev-server.ts
# Runs on port 3005

# Terminal 2: Vite frontend
npm run dev
# Runs on port 3001-3003 (check with lsof)
```

## Environment Variables (.env.local)

```
# Supabase
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID=price_1SKqo9L3MQGdPWpHJArtHpf8

# Brevo
BREVO_API_KEY=xkeysib-...
BREVO_TEMPLATE_EMAIL_VERIFICATION=8
BREVO_TEMPLATE_WELCOME=1

# Groq (AI Help Bot)
GROQ_API_KEY=gsk_...

# Analytics
VITE_ANALYTICS_PROVIDER=console

# Cron
CRON_SECRET=...
```

## MCP Tools Available

Invoke skill `shiftcheck-mcp` for:
- **Supabase MCP** - Database queries, RLS testing
- **Vercel MCP** - Deployments, env vars
- **Twilio MCP** - SMS testing
- **GitHub MCP** - Git operations
- **Chrome DevTools MCP** - Browser automation

## User Preferences

- Uses **Groq API** (Llama 3.3 70B) for AI chatbot, NOT Claude
- Prefers automated solutions over manual work
- Task tracker (`tasks.md`) must stay updated after each change
- Follow OpenSpec workflow for major changes
- Explicit instruction: **Do not move to next phase without permission**

## Database Tables (Created in Phase 1)

| Table | Purpose |
|-------|---------|
| `owners` | Owner profiles (name, email, phone, billing address, referral code) |
| `subscriptions` | Stripe subscription records |
| `pricing_tiers` | Plan definitions (Free, Grow, Expand) |
| `referral_redemptions` | Referral tracking |
| `restaurants` | Extended with `owner_id`, `is_active`, address, phone |

## Service Layer Files

| File | Purpose |
|------|---------|
| `src/services/authService.ts` | Auth, owner profiles |
| `src/services/restaurantService.ts` | Restaurant CRUD |
| `src/services/stripeService.ts` | Stripe integration |
| `src/services/subscriptionService.ts` | Subscription management |
| `src/services/emailService.ts` | Brevo email sending |
| `src/services/referralService.ts` | Referral tracking |
| `src/services/ownerService.ts` | Owner data |
| `src/services/analyticsService.ts` | Analytics tracking |

## Resume Instructions

Ask the user:
> "I've restored context for the ShiftCheck marketing-website project. Phase 6.2 (Error Handling & Edge Cases) is complete. Build verified successfully.
>
> Ready to continue with Phase 6.3 Security Audit, or is there something else you'd like to address first?"
```

---

## Quick Reference

| Resource | Location |
|----------|----------|
| Task List | `openspec/changes/add-owner-signup-account/tasks.md` |
| Full PRD | `OWNER-SIGNUP-ACCOUNT-PRD.md` |
| OpenSpec Guide | `openspec/AGENTS.md` |
| Error Messages | `src/utils/errorMessages.ts` |
| Retry Utility | `src/utils/retry.ts` |
| Analytics Service | `src/services/analyticsService.ts` |
| Project Standards | `openspec/project.md` |

---

## Session History

**December 7, 2025 (Session 3):**
- Completed Phase 6.3 Security Audit (all 6 tasks)
- Created comprehensive security audit report: `docs/SECURITY-AUDIT-REPORT.md`
- Fixed CRITICAL cron job authorization bypass vulnerability
- Fixed MEDIUM overly permissive CORS headers
- Fixed LOW input validation issues (restaurant count, message length)
- Verified RLS policies, webhook signature, credential exposure, HTTPS, XSS, SQL injection
- Build verified successfully

**December 7, 2025 (Session 2):**
- Completed Phase 6.2 Error Handling & Edge Cases (all 6 tasks)
- Created errorMessages.ts (570 lines) and retry.ts (277 lines)
- Updated SignUpPage, LoginPage, VerifyEmailPage, AuthCallbackPage, PaymentPage
- Added fetchWithRetry to authService and stripeService

**December 7, 2025 (Session 1):**
- Completed Phase 5.4 Analytics Tracking
- Completed Phase 6.1 Sign-Up Resume Flow

**Previous Sessions:**
- Phases 1-5.3 implemented
- Full sign-up flow working
- Stripe payments integrated
- Email system complete
- AI chatbot with Groq working
