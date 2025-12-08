# Security Audit Report - Phase 6.3

**Date:** December 7, 2025
**Auditor:** Claude Code
**Project:** ShiftCheck Marketing Website
**Scope:** Owner Sign-Up & Account Management System

---

## Executive Summary

Comprehensive security audit of the ShiftCheck marketing website covering:
- RLS (Row-Level Security) policies
- Stripe webhook security
- Frontend credential exposure
- HTTPS enforcement
- XSS vulnerabilities
- SQL injection protection

**Overall Security Rating: GOOD** (after fixes applied)

---

## 1. RLS Policy Analysis ✅ PASS

### Tables Audited

| Table | RLS Enabled | Policies | Status |
|-------|-------------|----------|--------|
| `owners` | ✅ | 3 policies | SECURE |
| `subscriptions` | ✅ | 2 policies | SECURE |
| `pricing_tiers` | ✅ | 1 policy | SECURE |
| `referral_redemptions` | ✅ | 2 policies | SECURE |
| `restaurants` | ✅ | 4 policies | SECURE |

### Policy Details

**owners:**
- SELECT: `id = auth.uid()` - Owners can only see their own profile
- UPDATE: `id = auth.uid()` with check - Owners can only update themselves
- INSERT: `id = auth.uid()` - Owners can only insert their own record

**subscriptions:**
- SELECT: `owner_id = auth.uid()` - Owners see only their subscriptions
- ALL (service_role): Full access for webhook processing

**pricing_tiers:**
- SELECT: `is_active = true` for anon/authenticated - Public pricing info

**referral_redemptions:**
- SELECT: `referrer_owner_id = auth.uid()` OR `referred_owner_id = auth.uid()`
- Users can see referrals they made or received

**restaurants:**
- SELECT/INSERT/UPDATE: `owner_id = auth.uid()` - Owner access
- SELECT (managers): `is_active = true AND normalize_phone(manager_phone) = normalize_phone(auth.jwt()->>'phone')`

### Penetration Test Scenarios

1. **Cross-user data access**: Blocked by `auth.uid()` checks
2. **Privilege escalation**: Blocked by WITH CHECK constraints
3. **Subscription manipulation**: Blocked - only service_role can modify
4. **Restaurant deactivation bypass**: Blocked by owner_id check

---

## 2. Stripe Webhook Security ✅ PASS

**File:** `api/webhooks/stripe.ts`

### Security Controls Implemented

```typescript
// Signature verification (line 369-375)
event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
```

- ✅ Webhook signature verification using `stripe.webhooks.constructEvent()`
- ✅ Raw body handling for accurate signature verification
- ✅ Missing signature returns 400 error
- ✅ Invalid signature returns 400 error
- ✅ Idempotency tracking to prevent duplicate processing
- ✅ Event ID logging for audit trail

### Events Handled Securely

| Event | Database Update | Email Sent |
|-------|-----------------|------------|
| subscription.created | ✅ Upsert | ✅ Confirmation |
| subscription.updated | ✅ Upsert | - |
| subscription.deleted | ✅ Status + deactivate | ✅ Cancellation |
| payment_succeeded | ✅ Status = active | - |
| payment_failed | ✅ Status = past_due | ✅ Payment failed |
| trial_will_end | - | ✅ Trial ending |

---

## 3. Frontend Credential Exposure ✅ PASS

### Search Results

**Hardcoded secrets in `src/**/*.ts` or `src/**/*.tsx`:** NONE FOUND

### Environment Variables in Frontend (VITE_*)

| Variable | Purpose | Security Status |
|----------|---------|-----------------|
| `VITE_SUPABASE_URL` | Public API URL | ✅ Safe - designed to be public |
| `VITE_SUPABASE_ANON_KEY` | Anonymous key | ✅ Safe - protected by RLS |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Publishable key | ✅ Safe - designed for frontend |
| `VITE_STRIPE_PRICE_ID` | Price ID | ✅ Safe - public information |
| `VITE_ANALYTICS_PROVIDER` | Config flag | ✅ Safe - no sensitive data |

### Server-side Secrets (process.env)

All sensitive secrets are properly isolated to server-side API routes:
- `STRIPE_SECRET_KEY` - API routes only
- `SUPABASE_SERVICE_ROLE_KEY` - API routes only
- `BREVO_API_KEY` - API routes only
- `GROQ_API_KEY` - API routes only
- `STRIPE_WEBHOOK_SECRET` - Webhook handler only
- `CRON_SECRET` - Cron handlers only

---

## 4. HTTPS Enforcement ✅ PASS

### Vercel Configuration

Vercel enforces HTTPS by default:
- All HTTP requests are automatically redirected to HTTPS
- SSL/TLS certificates are automatically provisioned
- HSTS headers are applied

### Redirect Configuration

No explicit redirect needed in `vercel.json` - Vercel handles HTTPS enforcement automatically.

---

## 5. XSS Vulnerability Analysis ✅ PASS

### Search Results

| Pattern | Files Found | Status |
|---------|-------------|--------|
| `dangerouslySetInnerHTML` | 0 | ✅ SAFE |
| `innerHTML` | 0 | ✅ SAFE |
| `outerHTML` | 0 | ✅ SAFE |
| `insertAdjacentHTML` | 0 | ✅ SAFE |
| `eval()` | 0 | ✅ SAFE |
| `new Function()` | 0 | ✅ SAFE |

### User Input Handling

- All form inputs use React controlled components
- No direct DOM manipulation with user content
- Email addresses validated with regex before processing
- Phone numbers normalized via `normalizePhone()` utility

---

## 6. SQL Injection Protection ✅ PASS

### Query Method Analysis

All database queries use Supabase's query builder:

```typescript
// Example from authService.ts
const { data, error } = await supabase
  .from('owners')
  .insert({
    id: user.id,
    first_name: input.first_name,  // Parameterized
    last_name: input.last_name,    // Parameterized
    email: input.email,            // Parameterized
    phone: normalizePhone(input.phone),
    ...
  })
```

### Search Results

| Pattern | Files Found | Status |
|---------|-------------|--------|
| `.raw()` | 0 | ✅ SAFE |
| `execute()` | 0 | ✅ SAFE |
| Direct `.query()` | 0 | ✅ SAFE |

**Conclusion:** All database operations use parameterized queries through Supabase SDK. No SQL injection vectors exist.

---

## 7. Issues Found & Fixed

### 7.1 CRITICAL: Cron Job Authorization Bypass

**Files:**
- `api/cron/trial-expiring.ts:70`
- `api/cron/trial-expired.ts:107`

**Issue:** If `CRON_SECRET` is not set, authorization is completely bypassed.

**Before (vulnerable):**
```typescript
if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
  return res.status(401).json({ error: 'Unauthorized' });
}
```

**After (fixed):**
```typescript
if (!CRON_SECRET) {
  console.error('CRON_SECRET not configured - rejecting request');
  return res.status(500).json({ error: 'Server configuration error' });
}
if (authHeader !== `Bearer ${CRON_SECRET}`) {
  return res.status(401).json({ error: 'Unauthorized' });
}
```

**Status:** ✅ FIXED

---

### 7.2 MEDIUM: Overly Permissive CORS

**Files:**
- `api/auth/send-verification.ts:120`
- `api/auth/verify-token.ts:61`

**Issue:** `Access-Control-Allow-Origin: *` allows any domain to call these APIs.

**Before (too permissive):**
```typescript
res.setHeader('Access-Control-Allow-Origin', '*');
```

**After (restricted):**
```typescript
const allowedOrigins = [
  'https://shiftcheck.app',
  'https://www.shiftcheck.app',
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:5173',
];
const origin = req.headers.origin || '';
if (allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
  res.setHeader('Access-Control-Allow-Origin', origin || '*');
}
```

**Status:** ✅ FIXED

---

### 7.3 LOW: Input Validation - Restaurant Count

**File:** `api/stripe/create-payment-intent.ts:48`

**Issue:** `restaurantCount` not validated as positive integer.

**Added validation:**
```typescript
const count = parseInt(restaurantCount, 10);
if (isNaN(count) || count < 1 || count > 100) {
  return res.status(400).json({
    error: 'Restaurant count must be between 1 and 100',
  });
}
```

**Status:** ✅ FIXED

---

### 7.4 LOW: AI Help Message Length

**File:** `api/ai-help.ts`

**Issue:** No max length check on user messages.

**Added validation:**
```typescript
const MAX_MESSAGE_LENGTH = 1000;
if (userMessage.length > MAX_MESSAGE_LENGTH) {
  return res.status(400).json({
    error: `Message too long. Maximum ${MAX_MESSAGE_LENGTH} characters allowed.`
  });
}
```

**Status:** ✅ FIXED

---

## 8. Recommendations

### Implemented in This Audit

1. ✅ Fixed cron job authorization bypass
2. ✅ Restricted CORS to allowed origins
3. ✅ Added restaurant count validation
4. ✅ Added message length limit

### Future Recommendations

1. **Rate Limiting:** Add rate limiting to public API endpoints (send-verification, ai-help)
2. **IP Allowlisting:** Consider IP allowlisting for cron endpoints
3. **Audit Logging:** Add comprehensive audit logging for security events
4. **Security Headers:** Add additional security headers (CSP, X-Frame-Options)
5. **Dependency Scanning:** Set up automated dependency vulnerability scanning

---

## 9. Conclusion

The ShiftCheck marketing website has a solid security foundation:

- ✅ Proper RLS policies protecting all tables
- ✅ Stripe webhook signature verification
- ✅ No exposed credentials in frontend
- ✅ HTTPS enforced by Vercel
- ✅ No XSS vulnerabilities
- ✅ SQL injection protection via Supabase SDK

Four issues were identified and fixed during this audit:
1. Cron job authorization bypass (CRITICAL → FIXED)
2. Overly permissive CORS (MEDIUM → FIXED)
3. Missing restaurant count validation (LOW → FIXED)
4. Missing message length limit (LOW → FIXED)

**Final Security Rating: GOOD**

---

*Report generated by Claude Code security audit, Phase 6.3*
