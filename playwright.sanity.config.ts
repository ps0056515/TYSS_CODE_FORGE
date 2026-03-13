/**
 * Playwright config for sanity tests against deployed CodeForge (e.g. EC2).
 * Run: npx playwright test tests/sanity.spec.ts --config=playwright.sanity.config.ts
 */
import { defineConfig, devices } from "@playwright/test";

const EC2_BASE = "http://ec2-13-205-143-119.ap-south-1.compute.amazonaws.com:3002";

export default defineConfig({
  testDir: "./tests",
  testMatch: "sanity.spec.ts",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  retries: 1,
  use: {
    baseURL: process.env.BASE_URL || EC2_BASE,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
