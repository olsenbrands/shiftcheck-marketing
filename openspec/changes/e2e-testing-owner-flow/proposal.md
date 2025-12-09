# ShiftCheck Owner E2E Testing - Proposal

**Version:** 1.0
**Date:** December 8, 2025
**Author:** Jordan Olsen
**Status:** ACTIVE

## Executive Overview

Establish comprehensive end-to-end testing of owner onboarding workflow before beta launch with real restaurant operators.

## Business Context

### Current State
ShiftCheck has achieved production-ready status:
- Grade A/A+ security audit
- Grade A/A+ performance audit
- 277 passing automated tests
- 100% service layer coverage
- Feature-complete for beta

### The Gap
**Systematic end-to-end owner onboarding validation has NOT been documented or executed.**

### Problem Statement
- No documented "golden path" for owner setup
- Unknown if all UI elements work correctly
- No baseline for regression testing
- Risk of beta launch day surprises
- No record of data integrity validation

### Solution
Create reproducible E2E test procedures that:
1. Document every step of owner onboarding
2. Validate all UI interactions
3. Verify backend data integrity
4. Establish baseline for regression tests
5. Build confidence before customer launch

## Testing Objectives

### Primary
1. **Verify Functional Completeness**
   - Every step works as designed
   - No blocking bugs
   - All UI interactions respond correctly

2. **Validate Data Integrity**
   - Owner records persist correctly
   - Restaurant relationships established
   - Phone numbers normalized (E.164)
   - RLS policies enforced
   - No orphaned records

3. **Establish Baseline**
   - Document golden path
   - Record performance metrics
   - Create regression checklist
   - Identify known limitations

4. **Discover Issues Early**
   - Find bugs before customers
   - Document UX friction
   - Recommend improvements
   - Prioritize fixes

## Test Scenarios

| Scenario | Duration | Focus |
|----------|----------|-------|
| 1. Landing Page | 5 min | Navigation, load time |
| 2. Owner Signup | 5-8 min | Auth, token creation |
| 3. Dashboard Init | 3-5 min | RLS, session |
| 4. Restaurant Create | 3-5 min | Form, persistence |
| 5. Manager Invite | 5-10 min | SMS, phone norm |
| 6. Settings | 3-4 min | Updates, refresh |
| 7. Owner Mode | 2-3 min | Feature toggle |
| 8. Complete Flow | 15-20 min | Integration test |
| **Data Verify** | 1-2 hrs | Supabase queries |
| **TOTAL** | **7-9 hours** | |

## Success Metrics

### Pass/Fail
- All 8 scenarios pass
- Zero critical bugs
- Data integrity verified
- RLS policies enforced
- 100% navigation working

### Performance
- Landing: < 2s
- Dashboard: < 1.5s
- Forms: < 500ms save

### Quality
- No console errors (critical)
- Clear error messages
- Logical UX flow
- Mobile responsive

## Timeline

| Phase | Time | Deliverable |
|-------|------|-------------|
| Pre-test setup | 1 hour | DevTools config |
| Test execution | 3-4 hours | All 8 scenarios |
| Data validation | 1-2 hours | Supabase queries |
| Documentation | 1-2 hours | Report, issues |
| **TOTAL** | **7-9 hours** | Test baseline |

## Risk Analysis

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Critical bugs found | Medium | High | Fix before launch |
| SMS fails | Low | Medium | Use alternate phone |
| RLS misconfigured | Medium | Critical | Pre-review policies |
| Performance issues | Low | Medium | Monitor DevTools |

## Success Path to Launch
```
E2E Testing Pass
    |
All Critical Bugs = 0
    |
Data Integrity Verified
    |
LAUNCH APPROVED
```

## What Success Looks Like

> "Owner onboarding works smoothly end-to-end. All data persists correctly. Ready to launch with confidence."

**Indicators:**
- All 8 scenarios pass
- < 5 minor issues
- Zero critical bugs
- Team confidence: HIGH
- Launch decision: GO

---

**Status:** ACTIVE - Ready for Testing
