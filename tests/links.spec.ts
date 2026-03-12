import { test, expect } from "@playwright/test";
import {
  PROGRAMMING_LANGUAGES,
  DATA_STRUCTURES,
  ALGORITHMS,
  COMPANIES,
  PROJECT_CATEGORIES,
} from "../src/lib/practice-categories";

test.describe("Navigation & links", () => {
  test("Landing page loads and key CTAs navigate", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Learn. Practice. Compete." })).toBeVisible();

    await page.getByRole("link", { name: /Start practice/i }).first().click();
    await expect(page).toHaveURL(/\/practice$/);

    await page.goto("/");
    await page.getByRole("link", { name: /Open compiler/i }).click();
    await expect(page).toHaveURL(/\/compiler$/);
  });

  test("Top nav links render and navigate", async ({ page }) => {
    await page.goto("/");
    const navLinks = [
      ["/practice", "Practice"],
      ["/compiler", "Compiler"],
      ["/courses", "Courses"],
      ["/contests", "Contests"],
      ["/submissions", "Submissions"],
      ["/leaderboard", "Leaderboard"],
      ["/profile", "Profile"],
      ["/pricing", "Pricing"],
      ["/admin", "Admin"],
    ] as const;

    for (const [href, label] of navLinks) {
      await page.locator("header").getByRole("link", { name: label, exact: true }).first().click();
      await expect(page).toHaveURL(new RegExp(`${href.replace("/", "\\/")}$`));
      await page.goto("/");
    }
  });

  test("Practice category links work (languages, DS, algos, companies, projects)", async ({ page }) => {
    test.setTimeout(240_000);
    // Languages
    for (const lang of PROGRAMMING_LANGUAGES) {
      await page.goto(`/practice/language/${lang.id}`, { waitUntil: "domcontentloaded" });
      await expect(page).toHaveURL(new RegExp(`/practice/language/${lang.id}$`));
      await expect(page.getByText(lang.name, { exact: false }).first()).toBeVisible();
    }

    // Data Structures
    for (const ds of DATA_STRUCTURES) {
      await page.goto(`/practice/data-structures/${ds.id}`, { waitUntil: "domcontentloaded" });
      await expect(page).toHaveURL(new RegExp(`/practice/data-structures/${ds.id}$`));
      await expect(page.getByText(ds.name, { exact: false }).first()).toBeVisible();
    }

    // Algorithms
    for (const algo of ALGORITHMS) {
      await page.goto(`/practice/algorithms/${algo.id}`, { waitUntil: "domcontentloaded" });
      await expect(page).toHaveURL(new RegExp(`/practice/algorithms/${algo.id}$`));
      await expect(page.getByText(algo.name, { exact: false }).first()).toBeVisible();
    }

    // Companies
    for (const co of COMPANIES) {
      await page.goto(`/practice/company/${co.id}`, { waitUntil: "domcontentloaded" });
      await expect(page).toHaveURL(new RegExp(`/practice/company/${co.id}$`));
      await expect(page.getByText(co.name, { exact: false }).first()).toBeVisible();
    }

    // Projects
    for (const proj of PROJECT_CATEGORIES) {
      await page.goto(`/practice/projects/${proj.id}`, { waitUntil: "domcontentloaded" });
      await expect(page).toHaveURL(new RegExp(`/practice/projects/${proj.id}$`));
      await expect(page.getByText(proj.name, { exact: false }).first()).toBeVisible();
    }
  });
});

