# ShiftCheck Owner E2E Testing - Design Specification

**Version:** 1.0
**Last Updated:** December 8, 2025
**Purpose:** Technical architecture and design of owner onboarding E2E testing

## Testing Framework Architecture

ShiftCheck owner E2E testing uses a manual testing approach with Chrome DevTools for inspection and validation. This provides real-world user testing without automation overhead.

### Test Stack
- **Browser:** Google Chrome with DevTools
- **Environment:** Production (shiftcheck.app)
- **Backend:** Supabase PostgreSQL
- **Validation:** Manual + Database queries
- **Documentation:** Screenshots + Metrics

### Pre-Test Requirements
- Test account: jordan@olsenbrands.com / 801-458-1589
- Chrome DevTools: Network, Application, Console tabs open
- Supabase dashboard: Access for data verification
- Twilio console: Optional (verify SMS logs)

## Chrome DevTools Configuration

### Network Tab
1. Open DevTools -> Network tab
2. Check: "Preserve log"
3. Filter: "Fetch/XHR"
4. Throttling: No throttling
5. Record: Click red record button

**Monitor:**
- POST /auth/v1/signup (Status 200)
- POST /rest/v1/restaurants (Status 201)
- POST /twilio/* SMS endpoints

### Application Tab
Monitor localStorage keys:
- `auth.token` - JWT token
- `auth.refresh_token` - Refresh token
- `user` - User object with email/id

### Console Tab
Filter to show errors only:
- No "Uncaught" errors
- No "401 Unauthorized"
- No "Failed to fetch"

## Data Validation Strategy

### Frontend Validation
Inspect form fields, auth tokens, and localStorage in browser console

### Network Validation
Monitor HTTP status codes and response payloads in DevTools Network tab

### Database Validation
Run SQL queries in Supabase dashboard to verify:
1. User created in auth.users
2. Restaurant created with correct owner_id
3. Manager invitation recorded
4. Phone numbers normalized to E.164
5. RLS policies enforced
6. No orphaned records

## Success Criteria

### Critical (Must Pass)
- Owner completes full signup
- Auth token generated
- Dashboard loads
- Restaurant created
- Manager invitation sent
- Data persists after refresh
- No console errors
- Phone normalization works

### Performance Targets
- Landing page: < 2 seconds
- Dashboard: < 1.5 seconds
- Form save: < 500ms
- Page refresh: < 1.5 seconds

## Known Limitations

1. **Manual Testing Only** - No automation, requires human interaction
2. **Single User** - Only owner tested, not concurrent users
3. **Production Only** - Requires live shiftcheck.app
4. **SMS Delivery** - Depends on external Twilio service
5. **Test Data** - Not automatically deleted, must manually clean up

## Database Verification Queries

### Owner Creation
```sql
SELECT id, email, created_at
FROM auth.users
WHERE email = 'jordan@olsenbrands.com';
```

### Restaurant Creation
```sql
SELECT id, owner_id, name, timezone, is_owner_managed
FROM restaurants
WHERE owner_id = '[OWNER_ID]';
```

### Phone Normalization
```sql
SELECT normalize_phone('+1-801-458-1589') AS normalized;
-- Expected: +18014581589 or +1-801-458-1589
```

### RLS Policy Test
```sql
SELECT * FROM restaurants
WHERE owner_id = auth.uid();
-- Should return: 1 restaurant (just created)
```

## Timing Expectations

| Action | Time |
|--------|------|
| Landing page load | 1-2 sec |
| Signup form validation | 2-3 sec |
| Dashboard render | 1-2 sec |
| Restaurant create | 1-2 sec |
| SMS send | 5-10 sec |
| Settings save | 1-2 sec |
| Complete flow | 15-20 min |

---

**Framework ready for testing. See tasks.md for step-by-step procedures.**
