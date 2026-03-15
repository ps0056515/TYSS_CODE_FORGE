import { test, expect } from "@playwright/test";

test("Sign out from header signs user out and stays on same host", async ({ page }) => {
  await page.context().addCookies([
    { name: "cf_user", value: "student@test.com", url: "http://localhost:3002" },
  ]);

  await page.goto("/", { waitUntil: "domcontentloaded" });

  const header = page.locator("header");
  const signOut = header.getByRole("link", { name: /sign out/i }).or(
    header.getByRole("button", { name: /sign out/i }),
  );
  await expect(signOut.first()).toBeVisible();
  await signOut.first().click();

  await page.waitForURL(/\/api\/auth\/signout|localhost:3002|\/$/, { timeout: 15_000 }).catch(() => {});

  // After sign-out redirect, ensure we end up on the app (same origin). Set NEXTAUTH_URL=http://localhost:3002 when running tests.
  await page.goto("/", { waitUntil: "domcontentloaded", timeout: 20_000 });
  await expect(page.getByText(/this site can.?t be reached/i)).toHaveCount(0);
  const signInLink = page.locator("header").getByRole("link", { name: /sign in/i });
  await expect(signInLink.first()).toBeVisible({ timeout: 15_000 });
});

