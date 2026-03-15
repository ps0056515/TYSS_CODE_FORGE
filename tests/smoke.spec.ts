import { test, expect } from "@playwright/test";

test.describe("Smoke tests", () => {
  test("Compiler page can run JavaScript code", async ({ page }) => {
    await page.goto("/compiler");
    await expect(page.getByRole("heading", { name: "Online Compiler" })).toBeVisible();

    // Choose JavaScript and run
    await page.getByRole("button", { name: "JavaScript" }).click();
    await page.getByRole("button", { name: /^Run$/ }).click();

    // Output should show something (hello)
    await expect(page.getByText(/Hello from JavaScript/i)).toBeVisible();
  });

  test("Problem page: run samples enables submit button", async ({ page }) => {
    await page.goto("/practice/sum-of-two", { waitUntil: "domcontentloaded" });
    await expect(page.getByText("Sum of Two Numbers", { exact: false }).first()).toBeVisible({ timeout: 15_000 });

    const submit = page.getByRole("button", { name: /^Submit$/ }).first();
    await expect(submit).toBeDisabled();

    await page.getByRole("button", { name: /Run Samples/i }).click();
    await expect(page.getByText(/sample tests|All sample|Some sample/i).first()).toBeVisible({ timeout: 25_000 });
    await expect(submit).toBeEnabled({ timeout: 5_000 });
  });
});

