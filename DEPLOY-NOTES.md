# Deploy notes — EC2 (http://ec2-13-205-143-119.ap-south-1.compute.amazonaws.com:3002/)

## Will this break production?

**Short answer: No.** The changes are either test-only or improve behavior. One config check is recommended.

### 1. Sign-out (`signout-custom`)

- **Change:** Redirect now uses `NEXTAUTH_URL` when set; otherwise uses request host (e.g. `x-forwarded-host`).
- **EC2:** If `NEXTAUTH_URL` is set to your EC2 URL (e.g. `http://ec2-13-205-143-119.ap-south-1.compute.amazonaws.com:3002`), sign-out will redirect to that URL. If not set, it uses the request host (same as before).
- **Action:** Set `NEXTAUTH_URL` on EC2 to your public app URL so sign-out always stays on the same host. If you already had sign-out working, this change should not break it.

### 2. Login & auth

- Form POST login, cookie handling, and `getUserAsync` / `isAdminUser` were fixed for local and made consistent. Production behavior is unchanged or improved (admin/trainer access more reliable).

### 3. Assignments & API

- Assignments page: timeouts and cookie fallback so the page doesn’t hang. No breaking change.
- Caches (submissions, enrolments): reduce file I/O; no API contract change.

### 4. Tests (`tests/`)

- All test and doc changes (Playwright, cookie format, new cases, `TEST-RESULTS-SUMMARY.md`) run only in dev/CI. They do **not** affect the running app on EC2.

### Recommendation

- **Commit and deploy.** No breaking changes identified.
- **Optional:** On EC2, set `NEXTAUTH_URL` to your app URL so sign-out and OAuth callbacks are consistent.
