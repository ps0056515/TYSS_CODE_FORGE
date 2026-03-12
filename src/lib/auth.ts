import { cookies } from "next/headers";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import { USER_COOKIE } from "@/lib/auth-constants";

export { USER_COOKIE } from "@/lib/auth-constants";

export function getUser() {
  return cookies().get(USER_COOKIE)?.value ?? null;
}

/**
 * Prefer `cf_user` cookie for backwards compatibility, but fall back to NextAuth session
 * (OAuth) so API routes can correctly identify signed-in users even if middleware
 * cookie sync is not active.
 */
export async function getUserAsync(): Promise<string | null> {
  const cookieUser = getUser();
  if (cookieUser) return cookieUser;
  try {
    const session = await getServerSession(authOptions);
    const cf = (session?.user as { cf_user?: string } | undefined)?.cf_user;
    const email = (session?.user as { email?: string } | undefined)?.email;
    return cf ?? email ?? null;
  } catch {
    return null;
  }
}

export function isAdminUser(user: string | null) {
  if (!user) return false;
  const env = process.env.CODEFORGE_ADMINS || "";
  const admins = env
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (admins.length === 0) {
    // Fallback: usernames starting with 'admin' or 'trainer' are treated as admins
    return /^admin/i.test(user) || /^trainer/i.test(user);
  }
  return admins.includes(user);
}

