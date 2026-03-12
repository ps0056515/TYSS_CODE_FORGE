# OAuth (Google/GitHub) on AWS / Production

## Fix: "Error 400: redirect_uri_mismatch"

Google only allows redirects to **exact** URIs you register. Your app on AWS uses a different URL than localhost, so you must add the production callback URL in Google Cloud Console and set `NEXTAUTH_URL` on the server.

### 1. Set NEXTAUTH_URL on the server

On your EC2 instance (or wherever the app runs), set the **full public URL** of your app (no trailing slash):

```bash
# Example for your current AWS URL
export NEXTAUTH_URL=http://ec2-13-205-143-119.ap-south-1.compute.amazonaws.com:3002
```

If you use a process manager or `.env` on the server, add:

```
NEXTAUTH_URL=http://ec2-13-205-143-119.ap-south-1.compute.amazonaws.com:3002
```

Use `https://your-domain.com` when you have a domain and SSL.

### 2. Add the redirect URI in Google Cloud Console

1. Open [Google Cloud Console → APIs & Services → Credentials](https://console.cloud.google.com/apis/credentials).
2. Click your **OAuth 2.0 Client ID** (Web application) used for CodeForge.
3. Under **Authorized redirect URIs**, add:
   - **Production (AWS):**  
     `http://ec2-13-205-143-119.ap-south-1.compute.amazonaws.com:3002/api/auth/callback/google`
   - Keep **local** if you use it:  
     `http://localhost:3002/api/auth/callback/google`
4. Under **Authorized JavaScript origins** (if shown), add:
   - `http://ec2-13-205-143-119.ap-south-1.compute.amazonaws.com:3002`
   - (and `http://localhost:3002` for local)
5. Save.

### 3. Restart the app

Restart your Node/Next.js process on EC2 so it picks up `NEXTAUTH_URL`. Then try signing in again.

---

## When you add a custom domain / HTTPS

- Set `NEXTAUTH_URL=https://your-domain.com` (no port).
- In Google Cloud Console, add:
  - **Redirect URI:** `https://your-domain.com/api/auth/callback/google`
  - **Authorized JavaScript origin:** `https://your-domain.com`

## GitHub OAuth

In [GitHub Developer Settings → OAuth Apps](https://github.com/settings/developers), set the **Authorization callback URL** to:

`http://ec2-13-205-143-119.ap-south-1.compute.amazonaws.com:3002/api/auth/callback/github`

(Or your production URL when you have one.)
