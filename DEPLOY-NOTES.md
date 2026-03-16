# Deploy notes — EC2 (http://ec2-13-205-143-119.ap-south-1.compute.amazonaws.com:3002/)

## Will this break production?

**Short answer: No.** The changes are either test-only or improve behavior. One config check is recommended.

### 1. Login redirect (fix: was going to localhost on EC2)

- **Change:** After username login, redirect URL now uses **public origin**: `NEXTAUTH_URL` when set, else `x-forwarded-host` / `host` header (so EC2/proxy works).
- **EC2:** Set `NEXTAUTH_URL=http://ec2-13-205-143-119.ap-south-1.compute.amazonaws.com:3002` (or your actual public URL) so login and sign-out stay on the EC2 host instead of localhost.

### 2. Sign-out (`signout-custom`)

- **Change:** Redirect uses `NEXTAUTH_URL` when set; otherwise request host (e.g. `x-forwarded-host`).
- **EC2:** Same as above — set `NEXTAUTH_URL` to your EC2 URL.

### 3. Login & auth (form/cookie)

- Form POST login, cookie handling, and `getUserAsync` / `isAdminUser` were fixed for local and made consistent. Production behavior is unchanged or improved (admin/trainer access more reliable).

### 4. Assignments & API

- Assignments page: timeouts and cookie fallback so the page doesn’t hang. No breaking change.
- Caches (submissions, enrolments): reduce file I/O; no API contract change.

### 5. Tests (`tests/`)

- All test and doc changes (Playwright, cookie format, new cases, `TEST-RESULTS-SUMMARY.md`) run only in dev/CI. They do **not** affect the running app on EC2.

### Recommendation

- **On EC2, set `NEXTAUTH_URL`** to your public app URL, e.g.  
  `NEXTAUTH_URL=http://ec2-13-205-143-119.ap-south-1.compute.amazonaws.com:3002`  
  so login and sign-out redirects stay on EC2 instead of localhost.
- Then commit, deploy, and test login again.
