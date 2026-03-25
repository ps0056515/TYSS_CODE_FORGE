const path = require("path");
const fs = require("fs");
const { chromium } = require("@playwright/test");

async function main() {
  const baseURL = "http://localhost:3002";
  const email = "pradeep.srinivasan@gmail.com";
  const outDir = path.resolve(__dirname, "..", "artifacts");
  const screenshotPath = path.join(outDir, "assignments.png");

  fs.mkdirSync(outDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  await context.addCookies([
    {
      name: "cf_user",
      value: email,
      url: baseURL,
    },
  ]);

  const page = await context.newPage();
  await page.goto(`${baseURL}/assignments`, { waitUntil: "networkidle" });
  await page.waitForTimeout(750);

  const bodyText = (await page.locator("body").innerText()).slice(0, 50_000);
  const emptyStateRegex = /\b(no assignments|nothing here|empty state|no data)\b/i;
  const emptyStateDetected = emptyStateRegex.test(bodyText);

  const assignmentLinks = await page.locator('a[href^="/assignments/"]').count();
  const listItems = await page.getByRole("listitem").count().catch(() => 0);
  const tableRows = await page.locator("tbody tr").count();

  const assignmentsListed =
    assignmentLinks > 0 || tableRows > 0 || (listItems > 0 && !emptyStateDetected);

  await page.screenshot({ path: screenshotPath, fullPage: true });
  await browser.close();

  const result = {
    baseURL,
    url: `${baseURL}/assignments`,
    cookie: { cf_user: email },
    counts: { assignmentLinks, tableRows, listItems },
    emptyStateDetected,
    assignmentsListed,
    screenshotPath,
  };

  // Print machine-readable output for the agent to report.
  // eslint-disable-next-line no-console
  console.log(JSON.stringify(result, null, 2));

  if (!assignmentsListed) {
    process.exitCode = 2;
  }
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});

