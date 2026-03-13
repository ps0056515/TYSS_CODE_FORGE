import { test, expect } from "@playwright/test";

test.describe("Trainer (admin) flows", () => {
  test.beforeEach(async ({ page }) => {
    await page.context().addCookies([
      { name: "cf_user", value: "admin", path: "/", domain: "localhost", url: "http://localhost:3002" },
    ]);
  });

  test("Admin landing shows admin options", async ({ page }) => {
    await page.goto("/admin", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: /admin/i })).toBeVisible();
    await expect(page.getByText(/Problems|Practice|Organizations|Dashboard/i)).toBeVisible();
  });

  test("Admin can open Problems and see add links", async ({ page }) => {
    await page.goto("/admin/problems", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("link", { name: /Add single problem/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Bulk add/i })).toBeVisible();
  });

  test("Admin can open Bulk add problems page", async ({ page }) => {
    await page.goto("/admin/problems/bulk", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: /Bulk add problems/i })).toBeVisible();
    await expect(page.getByText(/Shared settings|Topic tags|one per line/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /Add .* problem/i })).toBeVisible();
  });

  test("Admin can open Dashboard", async ({ page }) => {
    await page.goto("/admin/dashboard", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: /Overview|Executive/i })).toBeVisible();
    await expect(page.getByText(/Active learners|Organizations|Overdue|At-risk/i)).toBeVisible();
  });

  test("Admin dashboard KPI links go to list pages", async ({ page }) => {
    await page.goto("/admin/dashboard", { waitUntil: "domcontentloaded" });
    await page.getByRole("link", { name: /Active learners/i }).first().click();
    await expect(page).toHaveURL(/\/admin\/dashboard\/active-learners/);
    await expect(page.getByRole("heading", { name: /Last 7 days|Active learners/i })).toBeVisible();
  });

  test("Admin can open Organizations", async ({ page }) => {
    await page.goto("/admin/organizations", { waitUntil: "domcontentloaded" });
    await expect(page.getByText(/Organization|Add organization|Create/i)).toBeVisible();
  });

  test("Admin Add single problem page loads and has form", async ({ page }) => {
    await page.goto("/admin/problems/new", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: /Add practice problem/i })).toBeVisible();
    await expect(page.getByLabel(/Title/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /Create problem/i })).toBeVisible();
  });

  test("Admin without cookie sees access restricted on admin", async ({ page }) => {
    await page.context().clearCookies();
    await page.goto("/admin", { waitUntil: "domcontentloaded" });
    await expect(page.getByText(/Access restricted|admins only/i)).toBeVisible();
  });
});
