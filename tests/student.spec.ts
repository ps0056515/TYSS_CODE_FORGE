import { test, expect } from "@playwright/test";

test.describe("Student flows", () => {
  test.beforeEach(async ({ page }) => {
    await page.context().addCookies([
      { name: "cf_user", value: "student@test.com", url: "http://localhost:3002" },
    ]);
  });

  test("Student can open Practice and see problems", async ({ page }) => {
    await page.goto("/practice", { waitUntil: "domcontentloaded" });
    await expect(page.getByText(/Practice|Programming|Languages|Topics/i).first()).toBeVisible({ timeout: 15_000 });
  });

  test("Student can open a problem and see editor", async ({ page }) => {
    await page.goto("/practice/sum-of-two", { waitUntil: "domcontentloaded" });
    await expect(page.getByText(/Sum of Two|statement|sample/i).first()).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole("button", { name: /Run/i }).first()).toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole("button", { name: /Run Samples/i })).toBeVisible({ timeout: 10_000 });
  });

  test("Student can open Assignments page", async ({ page }) => {
    await page.goto("/assignments", { waitUntil: "domcontentloaded" });
    await expect(
      page.getByRole("heading", { name: /My assignments/i })
    ).toBeVisible({ timeout: 15_000 });
  });

  test("Student can open Profile", async ({ page }) => {
    await page.goto("/profile", { waitUntil: "domcontentloaded" });
    await expect(
      page.getByRole("heading", { name: /Your progress|PROFILE|Profile/i })
    ).toBeVisible({ timeout: 15_000 });
  });

  test("Student can open Submissions page", async ({ page }) => {
    await page.goto("/submissions", { waitUntil: "domcontentloaded" });
    await expect(page.getByText(/Submissions|Recent|Time|User|Problem|Verdict/i).first()).toBeVisible({ timeout: 15_000 });
  });

  test("Student can open Leaderboard", async ({ page }) => {
    await page.goto("/leaderboard", { waitUntil: "domcontentloaded" });
    await expect(page.getByText(/Leaderboard|Top coders|Score|Solved/i).first()).toBeVisible({ timeout: 15_000 });
  });

  test("Student can open Compiler", async ({ page }) => {
    await page.goto("/compiler", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: /Online Compiler|Compiler/i })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole("button", { name: /Run/i }).first()).toBeVisible({ timeout: 10_000 });
  });

  test("Student can open Courses", async ({ page }) => {
    await page.goto("/courses", { waitUntil: "domcontentloaded" });
    await expect(page.getByText(/Courses|Learn|modules/i).first()).toBeVisible({ timeout: 15_000 });
  });

  test("Student sees Sign in when not logged in (profile)", async ({ page }) => {
    await page.context().clearCookies();
    await page.goto("/profile", { waitUntil: "domcontentloaded" });
    await expect(page.getByText(/not signed in|Sign in|login/i).first()).toBeVisible({ timeout: 15_000 });
  });

  test("Student sees Sign out in header when signed in", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.locator("header").getByRole("link", { name: /sign out/i }).first()).toBeVisible({ timeout: 10_000 });
  });

  test("Student can open join page with invalid id (shows error or join form)", async ({ page }) => {
    await page.goto("/join/invalid-assignment-id-123", { waitUntil: "domcontentloaded" });
    await expect(
      page.getByText(/join|assignment|not found|invalid|invitation/i).first()
    ).toBeVisible({ timeout: 15_000 });
  });

  test("Student can open Pricing page", async ({ page }) => {
    await page.goto("/pricing", { waitUntil: "domcontentloaded" });
    await expect(page.getByText(/pricing|plan|subscribe/i).first()).toBeVisible({ timeout: 15_000 });
  });
});
