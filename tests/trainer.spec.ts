import { test, expect } from "@playwright/test";

test.describe("Trainer (admin) flows", () => {
  test.beforeEach(async ({ page }) => {
    await page.context().addCookies([
      { name: "cf_user", value: "admin", url: "http://localhost:3002" },
    ]);
  });

  test("Admin landing shows admin options", async ({ page }) => {
    await page.goto("/admin", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: /admin|Admin/i })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/Problems|Practice|Organizations|Dashboard|Admin console/i).first()).toBeVisible({ timeout: 10_000 });
  });

  test("Admin can open Problems and see add links", async ({ page }) => {
    await page.goto("/admin/problems", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("link", { name: /Add single problem/i }).or(page.getByText(/Add single|Bulk add/i).first())).toBeVisible({ timeout: 15_000 });
  });

  test("Admin can open Bulk add problems page", async ({ page }) => {
    await page.goto("/admin/problems/bulk", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: /Bulk add problems/i })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/Shared settings|Topic tags|one per line/i).first()).toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole("button", { name: /Add .* problem/i })).toBeVisible({ timeout: 10_000 });
  });

  test("Admin can open Dashboard", async ({ page }) => {
    await page.goto("/admin/dashboard", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: /Overview|Executive/i })).toBeVisible({ timeout: 15_000 });
  });

  test("Admin dashboard KPI links go to list pages", async ({ page }) => {
    await page.goto("/admin/dashboard", { waitUntil: "domcontentloaded" });
    await page.getByRole("link", { name: /Active learners/i }).first().click();
    await expect(page).toHaveURL(/\/admin\/dashboard\/active-learners/, { timeout: 10_000 });
    await expect(page.getByRole("heading", { name: /Last 7 days|Active learners/i })).toBeVisible({ timeout: 10_000 });
  });

  test("Admin can open Organizations", async ({ page }) => {
    await page.goto("/admin/organizations", { waitUntil: "domcontentloaded" });
    await expect(page.getByText(/Organization|Add organization|Create/i).first()).toBeVisible({ timeout: 15_000 });
  });

  test("Admin Add single problem page loads and has form", async ({ page }) => {
    await page.goto("/admin/problems/new", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: /Add practice problem/i })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByLabel(/Title/i)).toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole("button", { name: /Create problem/i })).toBeVisible({ timeout: 10_000 });
  });

  test("Admin without cookie sees access restricted on admin", async ({ page }) => {
    await page.context().clearCookies();
    await page.goto("/admin", { waitUntil: "domcontentloaded" });
    await expect(page.getByText(/Access restricted|admins only/i).first()).toBeVisible({ timeout: 15_000 });
  });

  test("Trainer (cf_user=trainer) sees admin options", async ({ page }) => {
    await page.context().clearCookies();
    await page.context().addCookies([
      { name: "cf_user", value: "trainer", url: "http://localhost:3002" },
    ]);
    await page.goto("/admin", { waitUntil: "domcontentloaded" });
    await expect(page.getByText(/Problems|Organizations|Dashboard|Admin console/i).first()).toBeVisible({ timeout: 15_000 });
  });

  test("Admin dashboard shows overview sections", async ({ page }) => {
    await page.goto("/admin/dashboard", { waitUntil: "domcontentloaded" });
    await expect(
      page.getByText(/Active learners|Organizations|Batches|Assignments|Overview|Executive/i).first()
    ).toBeVisible({ timeout: 15_000 });
  });

  test("Admin can open Contests admin stub", async ({ page }) => {
    await page.goto("/admin/contests", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/admin\/contests/);
    await expect(page.getByText(/contest|admin/i).first()).toBeVisible({ timeout: 10_000 });
  });

  test("Admin can open Courses admin stub", async ({ page }) => {
    await page.goto("/admin/courses", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/admin\/courses/);
    await expect(page.getByText(/course|admin/i).first()).toBeVisible({ timeout: 10_000 });
  });
});
