# ShiftCheck Marketing Website - Project Conventions

## Overview

This project is the ShiftCheck marketing website (shiftcheck.app), built with:
- **Framework:** React + Vite + TypeScript
- **Styling:** Tailwind CSS
- **Auth:** Supabase Auth
- **Payments:** Stripe
- **Email:** Brevo (transactional)
- **Hosting:** Vercel

## Architecture Principles

### Phone-as-Key
ShiftCheck uses phone numbers as primary identifiers for managers. All phone numbers MUST be normalized to E.164 format (+1XXXXXXXXXX).

### RLS-First Security
All database access goes through Supabase Row Level Security policies. No direct SQL access from frontend.

### Service Layer Pattern
All database operations use service layer functions (e.g., `authService.js`, `restaurantService.js`).

## Coding Standards

### TypeScript
- Strict mode enabled
- Explicit return types on all functions
- No `any` types unless absolutely necessary

### React
- Functional components only
- Custom hooks for shared logic
- Context API for global state

### Database
- All tables use UUID primary keys
- Created/updated timestamps on all tables
- Snake_case for column names

## Key Integrations

| Service | Purpose | Credentials Location |
|---------|---------|---------------------|
| Supabase | Auth + Database | `.env.local` |
| Stripe | Payments | `.env.local` + Vercel |
| Brevo | Transactional email | `.env.local` |
| Vercel | Hosting + Serverless | Vercel Dashboard |

## File Naming

- Components: `PascalCase.tsx`
- Services: `camelCase.ts`
- Hooks: `useCamelCase.ts`
- Types: `camelCase.types.ts`
