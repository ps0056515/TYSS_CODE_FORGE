import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import { USER_COOKIE } from "@/lib/auth-constants";

/**
 * NextAuth options: OAuth providers (Google, GitHub) when env vars are set.
 * Session stores user email; we sync it to cf_user cookie in middleware so existing app code works.
 */
function buildProviders() {
  const providers: NextAuthOptions["providers"] = [];

  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    providers.push(
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      })
    );
  }

  if (process.env.GITHUB_ID && process.env.GITHUB_SECRET) {
    providers.push(
      GitHubProvider({
        clientId: process.env.GITHUB_ID,
        clientSecret: process.env.GITHUB_SECRET,
      })
    );
  }

  return providers;
}

export const authOptions: NextAuthOptions = {
  providers: buildProviders(),
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    jwt({ token, user, account }) {
      if (account && user) {
        const email = (user as { email?: string }).email ?? null;
        const name = (user as { name?: string }).name ?? null;
        (token as { email?: string }).email = email ?? undefined;
        (token as { name?: string }).name = name ?? undefined;
        // Identifier for CodeForge: email (leaderboard, submissions). Fallback to name slug.
        (token as { cf_user?: string }).cf_user =
          email ?? (name ? name.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_]/g, "").slice(0, 32) : undefined);
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.sub ?? undefined;
        (session.user as { cf_user?: string }).cf_user = (token as { cf_user?: string }).cf_user ?? (token as { email?: string }).email ?? undefined;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  events: {
    signOut() {
      // Cookie cleared in middleware on sign-out
    },
  },
};

export const USER_COOKIE_NAME = USER_COOKIE;
