import { test, expect } from "@playwright/test";

test.describe("Student flows", () => {
  test.beforeEach(async ({ page }) => {
    await page.context().addCookies([
      { name: "cf_user", value: "student@test.com", path: "/", domain: "localhost", url: "http://localhost:3002" },
    ]);
  });

  test("Student can open Practice and see problems", async ({ page }) => {
    await page.goto("/practice", { waitUntil: "domcontentloaded" });
    await expect(page.getByText(/Practice|Programming|Languages|Topics/i)).toBeVisible();
  });

  test("Student can open a problem and see editor", async ({ page }) => {
    await page.goto("/practice/sum-of-two", { waitUntil: "domcontentloaded" });
    await expect(page.getByText(/Sum of Two|statement|sample/i).first()).toBeVisible();
    await expect(page.getByRole("button", { name: /Run/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Run Samples/i })).toBeVisible();
  });

  test("Student can open Assignments page", async ({ page }) => {
    await page.goto("/assignments", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: /My assignments/i })).toBeVisible();
    await expect(
      page.getByText(/joined|invitation|Sign in|No assignments|Loading/i)
    ).toBeVisible();
  });

  test("Student can open Profile", async ({ page }) => {
    await page.goto("/profile", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: /Your progress|PROFILE/i })).toBeVisible();
    await expect(
      page.getByText(/student@test.com|Solved|Submissions|signed in/i)
    ).toBeVisible();
  });

  test("Student can open Submissions page", async ({ page }) => {
    await page.goto("/submissions", { waitUntil: "domcontentloaded" });
    await expect(page.getByText(/Submissions|Recent|Time|User|Problem|Verdict/i)).toBeVisible();
  });

  test("Student can open Leaderboard", async ({ page }) => {
    await page.goto("/leaderboard", { waitUntil: "domcontentloaded" });
    await expect(page.getByText(/Leaderboard|Top coders|Score|Solved/i)).toBeVisible();
  });

  test("Student can open Compiler", async ({ page }) => {
    await page.goto("/compiler", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: /Online Compiler|Compiler/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Run/i })).toBeVisible();
  });

  test("Student can open Courses", async ({ page }) => {
    await page.goto("/courses", { waitUntil: "domcontentloaded" });
    await expect(page.getByText(/Courses|Learn|modules/i)).toBeVisible();
  });

  test("Student sees Sign in when not logged in (profile)", async ({ page }) => {
    await page.context().clearCookies();
    await page.goto("/profile", { waitUntil: "domcontentloaded" });
    await expect(page.getByText(/not signed in|Sign in|login/i)).toBeVisible();
  });
});
