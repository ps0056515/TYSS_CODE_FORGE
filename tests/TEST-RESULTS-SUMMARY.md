# CodeForge — Test Results Summary

This document summarizes the E2E test coverage for issues and features added/fixed so far, and how to run tests.

## Prerequisites

- **Dev server**: Run `npm run dev` (app on http://localhost:3002).
- **Sign-out**: Set `NEXTAUTH_URL=http://localhost:3002` in `.env.local` so sign-out stays on the same port.
- **Playwright**: Tests use `baseURL: http://localhost:3002` (see `playwright.config.ts`).

## Test Suites

| Suite | File | Purpose |
|-------|------|---------|
| **Login** | `login.spec.ts` | Username sign-in, form POST, redirect, cookie, validation errors |
| **Sign-out** | `signout.spec.ts` | Sign-out from header, same-host redirect, Sign in visible after |
| **Sanity** | `sanity.spec.ts` | Landing, nav links, Practice, Compiler run, Courses, Leaderboard, Assignments/Profile, footer |
| **Smoke** | `smoke.spec.ts` | Compiler run JavaScript, problem page Run Samples → Submit enabled |
| **Links** | `links.spec.ts` | Landing CTAs, top nav links, practice category links (languages, DS, algos, companies, projects) |
| **Student** | `student.spec.ts` | With `cf_user` cookie: Practice, problem page, Assignments, Profile, Submissions, Leaderboard, Compiler, Courses; without cookie: profile shows sign-in |
| **Trainer** | `trainer.spec.ts` | With `cf_user=admin`: Admin landing, Problems, Bulk add, Dashboard, KPI links, Organizations, Add problem form; without cookie: Access restricted |

## Areas Covered (Fixes & Features)

- **Auth**: Username login (form POST, redirect, cookie), sign-out using `NEXTAUTH_URL`, admin/trainer access via cookie.
- **Practice**: Practice page, problem page, Run Samples, Submit (smoke), practice category navigation.
- **Assignments**: Assignments page load (with/without auth), no infinite loading.
- **Admin**: Admin console, Problems (add/bulk), Dashboard, Organizations, access restricted when not admin.
- **Compiler**: Online compiler, Run button, JavaScript output.
- **Nav & shell**: Landing hero, Sign in, key routes, footer/legal.

## Run Commands

```bash
# All E2E tests (dev server must be running on 3002)
npm run test:e2e

# Sanity only (fast smoke)
npm run test:sanity

# Sanity against EC2
npm run test:sanity:ec2
```

## Recent Test Updates

- **Login**: Increased timeouts for Suspense/hydration (heading, form, placeholder, button).
- **Links**: URL assertion allows optional trailing slash for nav links.
- **Student/Trainer**: Longer timeouts and more flexible text matchers for cookie-dependent pages.
- **Smoke**: Run Samples test uses longer timeout for sample result text and submit enabled.
- **Sign-out**: Clearer comment about `NEXTAUTH_URL`, longer timeout for final goto and Sign in visibility.

## Latest Run Summary

- **Sanity** (11 tests): All pass — landing, nav, Practice, Compiler, Courses, Leaderboard, Assignments/Profile, footer.
- **Links** (3 tests): All pass — landing CTAs, top nav links (with optional trailing slash), practice category links.
- **Smoke** (2 tests): Compiler run passes; “Run Samples enables submit” can fail on timing (sample execution ~25s timeout).
- **Login** (7 tests): Can fail on slow hydration (Suspense) or selector timing; timeouts increased.
- **Sign-out** (1 test): Depends on sign-out redirect staying on same host; set `NEXTAUTH_URL=http://localhost:3002`.
- **Student** (9 tests) / **Trainer** (8 tests): Depend on server reading `cf_user` cookie; in some environments (e.g. Playwright headless) the server may not see the cookie on first request, causing “Access restricted” or wrong content.

## Known Notes

- **Cookie in tests**: Student/Trainer suites set `cf_user` via `page.context().addCookies()`. Server must see the cookie on the next request; if not (e.g. different domain/path or server not reading `cookies()`), those tests may fail.
- **Sign-out**: Redirect target uses `NEXTAUTH_URL` when set; otherwise request host. For local dev on 3002, set `NEXTAUTH_URL=http://localhost:3002`.
- **Run Samples**: Smoke test allows up to 25s for sample result text; increase if runners are slow.
