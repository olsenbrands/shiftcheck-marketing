# ShiftCheck Launch Checklist

## Pre-Launch Checklist

Complete all items before going live.

---

## 6.6.1 Stripe Live Mode Configuration

### Stripe Dashboard Setup

- [ ] **Activate Live Mode**
  1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
  2. Toggle from "Test mode" to "Live mode" (top-right)
  3. Complete Stripe account activation if needed

- [ ] **Create Live Products**
  1. Go to Products > Add Product
  2. Create "ShiftCheck Grow" product
     - Price: $99.00/month recurring
     - Metadata: `plan_id: grow`, `restaurant_count: 1`
  3. Create "ShiftCheck Expand" product
     - Price: $349.00/month recurring
     - Metadata: `plan_id: expand`, `restaurant_count: 5`

- [ ] **Configure Live Webhook**
  1. Go to Developers > Webhooks
  2. Add endpoint: `https://shiftcheck.app/api/webhooks/stripe`
  3. Select events:
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
     - `customer.subscription.trial_will_end`
  4. Copy webhook signing secret

- [ ] **Get Live API Keys**
  1. Go to Developers > API keys
  2. Copy Publishable key (`pk_live_...`)
  3. Copy Secret key (`sk_live_...`)

- [ ] **Configure Customer Portal**
  1. Go to Settings > Billing > Customer portal
  2. Enable portal
  3. Configure allowed actions
  4. Add branding (logo, colors)

### Credentials to Collect

```
STRIPE_SECRET_KEY=sk_live_xxxxx
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

---

## 6.6.2 Vercel Environment Variables

### Production Environment Setup

Go to Vercel Dashboard > Project > Settings > Environment Variables

- [ ] **Supabase Variables**
  ```
  VITE_SUPABASE_URL=https://[project-id].supabase.co
  VITE_SUPABASE_ANON_KEY=[anon-key]
  SUPABASE_SERVICE_ROLE_KEY=[service-role-key]
  SUPABASE_URL=https://[project-id].supabase.co
  ```

- [ ] **Stripe Variables (Live)**
  ```
  VITE_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
  STRIPE_SECRET_KEY=sk_live_xxxxx
  STRIPE_WEBHOOK_SECRET=whsec_xxxxx
  ```

- [ ] **Brevo Variables**
  ```
  BREVO_API_KEY=[production-api-key]
  ```

- [ ] **Groq Variables**
  ```
  GROQ_API_KEY=[api-key]
  ```

- [ ] **Security Variables**
  ```
  CRON_SECRET=[generate-secure-random-string]
  ```

### Generate CRON_SECRET

```bash
openssl rand -hex 32
```

### Verify All Variables Set

In Vercel dashboard, ensure each variable:
- Has a value (no empty strings)
- Is set for "Production" environment
- Matches expected format

---

## 6.6.3 Brevo Production Configuration

### Brevo Dashboard Setup

- [ ] **Verify Sender Domain**
  1. Go to [Brevo Dashboard](https://app.brevo.com)
  2. Settings > Senders & IP > Domains
  3. Add and verify `shiftcheck.app` domain
  4. Configure DNS records (SPF, DKIM, DMARC)

- [ ] **Configure Sender Email**
  1. Settings > Senders & IP > Senders
  2. Add sender: `noreply@shiftcheck.app`
  3. Verify email address

- [ ] **Create Email Templates** (Optional)
  1. Campaigns > Email Templates
  2. Create templates for:
     - Email Verification
     - Subscription Confirmed
     - Payment Failed
     - Trial Ending
     - Subscription Cancelled

- [ ] **Test Email Deliverability**
  1. Send test email to Gmail, Outlook, Yahoo
  2. Check spam score
  3. Verify emails arrive in inbox

### DNS Records for Email

Add these to your DNS provider:

```
# SPF Record
TXT @ "v=spf1 include:spf.brevo.com ~all"

# DKIM Record (get from Brevo dashboard)
TXT brevo._domainkey "k=rsa; p=xxxxx..."

# DMARC Record
TXT _dmarc "v=DMARC1; p=quarantine; rua=mailto:dmarc@shiftcheck.app"
```

---

## 6.6.4 Monitoring & Alerting Setup

### Vercel Monitoring

- [ ] **Enable Monitoring**
  1. Vercel Dashboard > Project > Analytics
  2. Enable Web Analytics
  3. Enable Speed Insights

- [ ] **Configure Alerts**
  1. Vercel Dashboard > Project > Settings > Notifications
  2. Add Slack/Email notifications for:
     - Deployment failures
     - Function errors
     - Build failures

### Stripe Monitoring

- [ ] **Configure Stripe Alerts**
  1. Stripe Dashboard > Settings > Team & Security
  2. Add email alerts for:
     - Failed payments
     - Disputes
     - Subscription cancellations

- [ ] **Monitor Webhook Health**
  1. Stripe Dashboard > Developers > Webhooks
  2. Check webhook endpoint health
  3. Set up alert for failed deliveries

### Supabase Monitoring

- [ ] **Enable Database Alerts**
  1. Supabase Dashboard > Project > Settings > Database
  2. Configure connection pool alerts
  3. Monitor storage usage

### External Monitoring (Recommended)

- [ ] **Uptime Monitoring**
  - Use: UptimeRobot, Pingdom, or Better Uptime
  - Monitor: `https://shiftcheck.app` (homepage)
  - Monitor: `https://shiftcheck.app/api/webhooks/stripe` (webhook - POST)
  - Alert: Email + Slack

- [ ] **Error Tracking**
  - Consider: Sentry, LogRocket, or Vercel's built-in
  - Track: JavaScript errors
  - Track: API errors

### Monitoring Checklist Summary

| Service | Monitor | Alert Method |
|---------|---------|--------------|
| Vercel | Deployments, Functions | Email/Slack |
| Stripe | Payments, Webhooks | Email |
| Supabase | Database, Auth | Email |
| External | Uptime, Errors | Email/Slack/PagerDuty |

---

## 6.6.5 Rollback Plan

### Vercel Rollback

**Instant Rollback (< 1 minute):**
1. Go to Vercel Dashboard > Project > Deployments
2. Find last working deployment
3. Click "..." > "Promote to Production"

**Automatic Rollback Trigger:**
- If error rate > 5% for 5 minutes
- If response time > 5s average

### Database Rollback

**Point-in-Time Recovery:**
1. Supabase Dashboard > Project > Settings > Database
2. Select restore point (up to 7 days back)
3. Restore to new project or overwrite

**Manual Rollback Script:**
```sql
-- Revert specific changes if needed
-- Keep backup queries ready
```

### Stripe Rollback

**Cancel All New Subscriptions:**
```typescript
// Emergency: Cancel subscriptions created after launch
const subscriptions = await stripe.subscriptions.list({
  created: { gte: LAUNCH_TIMESTAMP },
  limit: 100,
});

for (const sub of subscriptions.data) {
  await stripe.subscriptions.cancel(sub.id, {
    prorate: true,
  });
}
```

### Rollback Procedure

1. **Identify Issue**
   - Check Vercel logs
   - Check Stripe webhook logs
   - Check Supabase logs

2. **Communicate**
   - Post to status page
   - Notify affected users if needed

3. **Execute Rollback**
   - Vercel: Promote previous deployment
   - Database: Only if data corruption
   - Stripe: Only if billing issues

4. **Verify**
   - Test critical flows
   - Monitor error rates
   - Confirm issue resolved

5. **Post-Mortem**
   - Document what happened
   - Identify root cause
   - Create fix in separate branch
   - Test thoroughly before re-deploy

### Emergency Contacts

| Role | Contact | When to Escalate |
|------|---------|------------------|
| Developer | [Your contact] | Any technical issue |
| Stripe Support | support@stripe.com | Payment issues |
| Supabase Support | support@supabase.io | Database issues |
| Vercel Support | support@vercel.com | Deployment issues |

---

## 6.6.6 Launch Schedule

### Pre-Launch (T-7 days)

- [ ] Complete all code development
- [ ] Run full test suite (121 tests passing)
- [ ] Complete security audit
- [ ] Set up all production credentials
- [ ] Test production environment

### Pre-Launch (T-1 day)

- [ ] Final code review
- [ ] Verify all environment variables
- [ ] Test end-to-end flow in production
- [ ] Prepare launch announcement
- [ ] Brief support team

### Launch Day (T-0)

- [ ] Deploy to production
- [ ] Verify deployment successful
- [ ] Test sign-up flow end-to-end
- [ ] Test payment processing
- [ ] Monitor error rates
- [ ] Send launch announcement

### Post-Launch (T+1 day)

- [ ] Monitor metrics
- [ ] Check for support tickets
- [ ] Review webhook success rates
- [ ] Verify emails delivering

### Post-Launch (T+7 days)

- [ ] Analyze sign-up funnel
- [ ] Review customer feedback
- [ ] Plan iteration improvements
- [ ] Schedule retrospective

---

## Quick Reference

### Critical URLs

| Service | URL |
|---------|-----|
| Production Site | https://shiftcheck.app |
| Vercel Dashboard | https://vercel.com/[team]/marketing-website |
| Stripe Dashboard | https://dashboard.stripe.com |
| Supabase Dashboard | https://app.supabase.com/project/[id] |
| Brevo Dashboard | https://app.brevo.com |

### Emergency Commands

```bash
# Rollback Vercel deployment (CLI)
vercel rollback

# Check production logs
vercel logs --prod

# Run tests
npm test

# Build check
npm run build
```

### Launch Criteria

**GO if:**
- [ ] All tests passing (121/121)
- [ ] Build succeeds with no errors
- [ ] All environment variables configured
- [ ] Webhook endpoint responding
- [ ] Email deliverability verified
- [ ] Payment flow tested with live card
- [ ] Rollback plan documented
- [ ] Monitoring alerts configured

**NO-GO if:**
- Any critical tests failing
- Missing environment variables
- Webhook signature validation failing
- Email domain not verified
- No rollback plan
