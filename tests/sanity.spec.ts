/**
 * Sanity test pack for CodeForge (deployed or local).
 * Run against EC2: npx playwright test tests/sanity.spec.ts --config=playwright.sanity.config.ts
 * Or: BASE_URL=http://ec2-...:3002 npx playwright test tests/sanity.spec.ts
 */
import { test, expect } from "@playwright/test";

test.describe("Sanity — Landing & shell", () => {
  test("homepage loads and shows hero", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /Learn\.\s*Practice\.\s*Compete\.?/i })).toBeVisible();
    await expect(page.getByText(/CodeForge/i).first()).toBeVisible();
  });

  test("Sign in / Auth entry is visible", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: /Sign in/i }).first()).toBeVisible();
  });

  test("key nav links are present and reachable", async ({ page }) => {
    await page.goto("/");
    const routes = ["/practice", "/assignments", "/compiler", "/courses", "/leaderboard", "/profile"];
    for (const path of routes) {
      await page.goto(path);
      await expect(page).toHaveURL(new RegExp(`${path.replace("/", "\\/")}(\\/|$)`));
      const body = page.locator("body");
      await expect(body).toBeVisible();
      await expect(body).not.toContainText(/404|Page Not Found|Error/i);
    }
    await page.goto("/");
    const nav = page.locator("header nav, header [aria-label*='navigation']").first();
    await expect(nav.getByRole("link", { name: /Practice/i }).first()).toBeVisible();
    await expect(nav.getByRole("link", { name: /Compiler/i }).first()).toBeVisible();
  });
});

test.describe("Sanity — Practice", () => {
  test("practice page loads and shows sections", async ({ page }) => {
    await page.goto("/practice");
    await expect(page).toHaveURL(/\/practice/);
    await expect(page.getByText(/Practice|Programming|Languages|Data Structures/i).first()).toBeVisible();
  });

  test("a known problem page loads", async ({ page }) => {
    await page.goto("/practice/sum-of-two");
    await expect(page).toHaveURL(/\/practice\/sum-of-two/);
    await expect(page.getByText("Sum of Two Numbers", { exact: false }).first()).toBeVisible();
  });
});

test.describe("Sanity — Compiler", () => {
  test("compiler page loads and run works", async ({ page }) => {
    await page.goto("/compiler");
    await expect(page.getByRole("heading", { name: /Online Compiler/i })).toBeVisible();
    await page.getByRole("button", { name: "JavaScript" }).click();
    await page.getByRole("button", { name: /^Run$/ }).click();
    await expect(page.getByText(/Hello from JavaScript/i)).toBeVisible();
  });
});

test.describe("Sanity — Courses", () => {
  test("courses page loads", async ({ page }) => {
    await page.goto("/courses");
    await expect(page).toHaveURL(/\/courses/);
    await expect(page.getByText(/Course|Learn|Catalog/i).first()).toBeVisible();
  });
});

test.describe("Sanity — Leaderboard", () => {
  test("leaderboard page loads", async ({ page }) => {
    await page.goto("/leaderboard");
    await expect(page).toHaveURL(/\/leaderboard/);
    await expect(page.getByText(/Leaderboard|Top|Coders/i).first()).toBeVisible();
  });
});

test.describe("Sanity — Assignments & Profile (unauthenticated)", () => {
  test("assignments page loads (may show empty or login)", async ({ page }) => {
    await page.goto("/assignments");
    await expect(page).toHaveURL(/\/assignments/);
    await expect(
      page.getByText(/My assignments|Assignments|Sign in|No assignments/i).first()
    ).toBeVisible();
  });

  test("profile page loads (may show sign in or progress)", async ({ page }) => {
    await page.goto("/profile");
    await expect(page).toHaveURL(/\/profile/);
    await expect(
      page.getByText(/Profile|progress|Sign in|You're not signed in/i).first()
    ).toBeVisible();
  });
});

test.describe("Sanity — Footer & static", () => {
  test("footer and legal links exist", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("contentinfo").or(page.getByText(/©|CodeForge|rights reserved/i)).first()).toBeVisible();
    const privacy = page.getByRole("link", { name: /Privacy/i }).first();
    const terms = page.getByRole("link", { name: /Terms/i }).first();
    await expect(privacy).toBeVisible();
    await expect(terms).toBeVisible();
  });
});
