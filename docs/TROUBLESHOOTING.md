# Troubleshooting Guide

## Development Environment Issues

### Vite Dev Server Won't Start

**Symptom:** `npm run dev` fails or hangs

**Solutions:**
1. Check if port is in use:
   ```bash
   lsof -i:3001  # Default Vite port
   kill -9 <PID>
   ```

2. Clear node_modules and reinstall:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. Check Node version (requires 18+):
   ```bash
   node --version
   ```

---

### API Dev Server Won't Start

**Symptom:** `npm run dev:api` fails

**Solutions:**
1. Check port 3005:
   ```bash
   lsof -i:3005
   kill -9 <PID>
   ```

2. Check `.env.local` exists with required variables

3. Verify TypeScript compiles:
   ```bash
   npx tsc --noEmit
   ```

---

### Environment Variables Not Loading

**Symptom:** API calls fail with undefined keys

**Solutions:**
1. Ensure `.env.local` exists (not `.env`)
2. Restart dev servers after changing env vars
3. Check variable names match exactly (case-sensitive)
4. For frontend vars, prefix with `VITE_`

---

## Authentication Issues

### Email Verification Not Sending

**Symptom:** User doesn't receive verification email

**Debug steps:**
1. Check Brevo API key is valid
2. Check server logs for API response
3. Verify sender email is configured in Brevo
4. Test with Brevo API directly:
   ```bash
   curl -X POST https://api.brevo.com/v3/smtp/email \
     -H "api-key: YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{"sender":{"email":"noreply@shiftcheck.app"},"to":[{"email":"test@example.com"}],"subject":"Test","htmlContent":"<p>Test</p>"}'
   ```

---

### Verification Token Invalid/Expired

**Symptom:** User clicks link but gets error

**Debug steps:**
1. Check token expiration (24 hours default)
2. Query database for token:
   ```sql
   SELECT * FROM verification_tokens
   WHERE email = 'user@example.com';
   ```
3. Check `used_at` is null
4. Generate new token if expired

---

### Supabase Auth Errors

**Symptom:** `AuthError: Invalid login credentials`

**Solutions:**
1. Verify user exists in Supabase Auth dashboard
2. Check password meets requirements
3. Ensure email is confirmed
4. Check RLS policies aren't blocking

---

## Database Issues

### RLS Policy Blocking Queries

**Symptom:** Queries return empty when data exists

**Debug steps:**
1. Test query with service role (bypasses RLS):
   ```typescript
   const supabase = createClient(url, serviceRoleKey);
   ```
2. Check RLS policies in Supabase dashboard
3. Verify auth.uid() matches expected owner_id
4. Check phone normalization in policies

---

### Phone Normalization Issues

**Symptom:** User data not found despite existing

**Debug steps:**
1. Always use `normalizePhone()` before queries:
   ```typescript
   import { normalizePhone } from '@/utils/phone';
   const phone = normalizePhone(userInput);
   ```
2. Check stored format matches E.164 (`+1XXXXXXXXXX`)
3. Query with exact format:
   ```sql
   SELECT * FROM owners WHERE phone = '+18014581589';
   ```

---

### Migration Errors

**Symptom:** Database schema out of sync

**Solutions:**
1. Check migration status in Supabase dashboard
2. Run migrations manually if needed
3. Compare schema with `database/001_owner_signup_schema.sql`

---

## Stripe Issues

### Webhook Signature Invalid

**Symptom:** 400 error on webhook endpoint

**Solutions:**
1. Verify `STRIPE_WEBHOOK_SECRET` matches Stripe dashboard
2. Ensure raw body is used (not parsed JSON)
3. Check webhook endpoint URL is correct
4. For local dev, use Stripe CLI:
   ```bash
   stripe listen --forward-to localhost:3005/api/webhooks/stripe
   ```

---

### Payment Intent Fails

**Symptom:** Payment doesn't complete

**Debug steps:**
1. Check Stripe Dashboard > Payments for error
2. Common errors:
   - `card_declined`: Customer's bank declined
   - `insufficient_funds`: Not enough money
   - `authentication_required`: 3DS needed
3. Test with test card numbers (see STRIPE-CONFIGURATION.md)

---

### Subscription Not Created

**Symptom:** Payment succeeds but no subscription

**Debug steps:**
1. Check webhook events in Stripe Dashboard
2. Verify webhook endpoint is receiving events
3. Check server logs for errors
4. Query database for subscription record

---

## Frontend Issues

### Page Not Loading

**Symptom:** Blank page or loading spinner

**Debug steps:**
1. Open browser DevTools Console
2. Check for JavaScript errors
3. Check Network tab for failed requests
4. Verify API server is running

---

### Form Submission Fails

**Symptom:** Form appears to submit but nothing happens

**Debug steps:**
1. Check browser console for errors
2. Check Network tab for API response
3. Verify form validation passes
4. Check CORS headers if cross-origin

---

### State Not Persisting

**Symptom:** User loses progress on page refresh

**Debug steps:**
1. Check sessionStorage for sign-up state:
   ```javascript
   sessionStorage.getItem('shiftcheck_signup')
   ```
2. Verify state is saved on each step
3. Check for storage quota errors

---

## Deployment Issues

### Build Fails

**Symptom:** `npm run build` errors

**Solutions:**
1. Check TypeScript errors:
   ```bash
   npx tsc --noEmit
   ```
2. Run tests to catch issues:
   ```bash
   npm test
   ```
3. Check for missing dependencies

---

### Vercel Deployment Fails

**Symptom:** Deployment errors in Vercel dashboard

**Solutions:**
1. Check build logs in Vercel
2. Verify all env vars are set in Vercel dashboard
3. Check Node.js version matches (18.x)
4. Ensure all imports resolve correctly

---

### API Routes Return 500

**Symptom:** Serverless functions fail in production

**Debug steps:**
1. Check Vercel function logs
2. Verify environment variables are set
3. Check for runtime errors in logs
4. Test locally with `vercel dev`

---

## Common Error Messages

### "Owner not found"

**Cause:** Phone number mismatch or user doesn't exist

**Solution:** Normalize phone and verify owner exists

### "Invalid session"

**Cause:** Auth token expired or invalid

**Solution:** Re-authenticate user, check Supabase auth

### "Webhook handler failed"

**Cause:** Error processing Stripe event

**Solution:** Check server logs, verify DB connection

### "Rate limit exceeded"

**Cause:** Too many requests to API

**Solution:** Implement backoff, check for loops in code

---

## Getting Help

### Logs to Collect

When reporting issues, include:
1. Browser console errors
2. Network requests (from DevTools)
3. Server logs (from terminal or Vercel)
4. Steps to reproduce
5. Environment (dev/prod)

### Support Channels

- **Internal:** Check `#shiftcheck-dev` Slack channel
- **External:** support@shiftcheck.app
- **Emergency:** Contact on-call engineer

---

## Quick Reference

### Restart Everything

```bash
# Kill all servers
pkill -f "node|vite|tsx"

# Clear caches
rm -rf node_modules/.vite

# Reinstall and start
npm install
npm run dev        # Terminal 1
npm run dev:api    # Terminal 2
```

### Reset Database (Dev Only!)

```sql
-- In Supabase SQL Editor
TRUNCATE owners, restaurants, subscriptions, verification_tokens CASCADE;
```

### Check System Status

```bash
# Node version
node --version

# Dependencies installed
npm ls --depth=0

# TypeScript check
npx tsc --noEmit

# Tests passing
npm test

# Build works
npm run build
```
