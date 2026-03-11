import { cookies } from "next/headers";

export const USER_COOKIE = "cf_user";

export function getUser() {
  return cookies().get(USER_COOKIE)?.value ?? null;
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

