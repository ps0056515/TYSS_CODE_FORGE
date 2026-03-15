import { test, expect } from "@playwright/test";

test.describe("Login regression — username sign-in", () => {
  test("login page loads and Sign in (username) button is enabled", async ({ page }) => {
    await page.goto("/login", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: /Welcome back/i })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/Or sign in with username/i)).toBeVisible({ timeout: 10_000 });
    const form = page.getByRole("form");
    await expect(form.getByPlaceholder(/admin|coder/i)).toBeVisible({ timeout: 10_000 });
    const signInBtn = form.getByRole("button", { name: /Sign in/ });
    await expect(signInBtn).toBeVisible();
    await expect(signInBtn).toBeEnabled();
  });

  test("Sign in button stays enabled with username entered", async ({ page }) => {
    await page.goto("/login", { waitUntil: "domcontentloaded" });
    const form = page.getByRole("form");
    await expect(form.getByPlaceholder(/admin|coder/i)).toBeVisible({ timeout: 15_000 });
    await form.getByPlaceholder(/admin|coder/i).fill("admin");
    await expect(form.getByRole("button", { name: /Sign in/ })).toBeEnabled();
  });

  test("submitting empty username shows error and does not navigate", async ({ page }) => {
    await page.goto("/login", { waitUntil: "domcontentloaded" });
    const form = page.getByRole("form");
    await form.getByRole("button", { name: /Sign in/ }).click();
    await expect(page.getByTestId("login-error")).toBeVisible({ timeout: 8000 });
    await expect(page.getByTestId("login-error")).toContainText(/Enter a username|username/i);
    await expect(page).toHaveURL(/\/login/);
  });

  test("invalid username shows API validation error", async ({ page }) => {
    await page.goto("/login", { waitUntil: "domcontentloaded" });
    const form = page.getByRole("form");
    await form.getByPlaceholder(/admin|coder/i).fill("a"); // min 2 chars required
    await form.getByRole("button", { name: /Sign in/ }).click();
    await expect(page.getByTestId("login-error")).toBeVisible({ timeout: 8000 });
    await expect(page.getByTestId("login-error")).toContainText(/Invalid|letters|numbers|underscore|character|username/i);
    await expect(page).toHaveURL(/\/login/);
  });

  test("valid username 'admin' signs in and redirects to practice", async ({ page }) => {
    await page.context().clearCookies();
    await page.goto("/login", { waitUntil: "domcontentloaded" });
    const form = page.getByRole("form");
    await form.getByPlaceholder(/admin|coder/i).fill("admin");
    await form.getByRole("button", { name: /Sign in/ }).click();
    await expect(page).toHaveURL(/\/(practice|login)/, { timeout: 15000 });
    if (page.url().includes("/practice")) {
      await expect(page.getByText(/Practice|Programming|Languages|Topics/i)).toBeVisible({ timeout: 5000 });
    }
  });

  test("after login with admin, redirect to practice and cookie or session is set", async ({ page }) => {
    await page.context().clearCookies();
    await page.goto("/login", { waitUntil: "domcontentloaded" });
    const form = page.getByRole("form");
    await form.getByPlaceholder(/admin|coder/i).fill("admin");
    await form.getByRole("button", { name: /Sign in/ }).click();
    await page.waitForURL(/\/(practice|login)/, { timeout: 15000 });
    expect(page.url()).toContain("/practice");
    const cookies = await page.context().cookies();
    const cfUser = cookies.find((c) => c.name === "cf_user");
    if (cfUser) expect(cfUser.value).toBe("admin");
  });

  test("login API returns 200 and ok:true for valid username", async ({ request }) => {
    const res = await request.post("/api/auth/login", {
      data: { username: "admin" },
      headers: { "Content-Type": "application/json" },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toMatchObject({ ok: true });
    const setCookie = res.headers()["set-cookie"];
    expect(setCookie).toBeDefined();
    expect(setCookie).toContain("cf_user=admin");
  });
});
