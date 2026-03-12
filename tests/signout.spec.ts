import { test, expect } from "@playwright/test";
import path from "path";

test("Sign out from header signs user out and stays reachable", async ({ page }) => {
  await page.context().addCookies([
    {
      name: "cf_user",
      value: "pradeep.srinivasan@gmail.com",
      url: "http://localhost:3002",
    },
  ]);

  await page.goto("/", { waitUntil: "domcontentloaded" });

  const header = page.locator("header");
  const signOut = header.getByRole("button", { name: /sign out/i }).or(
    header.getByRole("link", { name: /sign out/i }),
  );

  await expect(signOut).toBeVisible();

  // Click sign out in header, then confirm in the prompt.
  await signOut.click();

  const confirmPrompt = page.getByText(/are you sure you want to sign out/i);
  await expect(confirmPrompt).toBeVisible();

  await page.getByRole("button", { name: /^sign out$/i }).last().click();

  await page.waitForLoadState("domcontentloaded");

  // Verify the app is still reachable and user is signed out.
  // After sign-out, NextAuth flows can land on a minimal/blank intermediate page; reloading "/" verifies real navigation + header state.
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.getByText(/this site can.?t be reached/i)).toHaveCount(0);

  const headerSignIn = header.getByRole("link", { name: /sign in/i }).or(
    header.getByRole("button", { name: /sign in/i }),
  );
  await expect(headerSignIn).toBeVisible({ timeout: 15_000 });

  const screenshotPath = path.resolve(process.cwd(), "artifacts", "after-signout.png");
  await page.screenshot({ path: screenshotPath, fullPage: true });

  // Print a single-line marker so the agent can reliably capture it.
  // eslint-disable-next-line no-console
  console.log(`SCREENSHOT_PATH=${screenshotPath}`);
});

