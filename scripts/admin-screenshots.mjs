import { chromium } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";

const BASE = "http://localhost:3002";
const OUT_DIR = path.resolve(process.cwd(), "artifacts", "screenshots");

const targets = [
  {
    name: "admin-dashboard",
    url: `${BASE}/admin/dashboard`,
  },
  {
    name: "admin-batch-command",
    url: `${BASE}/admin/batches/mmn25xmx-pc8rydtq/command`,
  },
  {
    name: "admin-assignment-dashboard",
    url: `${BASE}/admin/assignments/mmn27hy9-zpwsitb9/dashboard`,
  },
  {
    name: "admin-student-pradeep",
    url: `${BASE}/admin/students/pradeep.srinivasan%40gmail.com`,
  },
];

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function gotoWithAuthCookie(page, url) {
  await page.goto(url, { waitUntil: "domcontentloaded" });
  const status = page.request ? null : null;
  const current = page.url();

  const restrictedTextCount = await page
    .locator("text=/access restricted|access denied|forbidden|unauthorized/i")
    .count();

  const looksRestricted =
    current.includes("/login") ||
    current.includes("/auth") ||
    restrictedTextCount > 0 ||
    (await page.getByRole("button", { name: /sign in/i }).count()) > 0;

  if (!looksRestricted) {
    return { cookieSet: false, finalUrl: current, status };
  }

  // Try admin cookie first, then trainer1.
  for (const user of ["admin", "trainer1"]) {
    const context = page.context();
    await context.addCookies([
      {
        name: "cf_user",
        value: user,
        domain: "localhost",
        path: "/",
        httpOnly: false,
        secure: false,
        sameSite: "Lax",
      },
    ]);

    await page.goto(url, { waitUntil: "networkidle" });
    const newUrl = page.url();
    const restrictedAfterCount = await page
      .locator("text=/access restricted|access denied|forbidden|unauthorized/i")
      .count();
    const stillRestricted =
      newUrl.includes("/login") ||
      restrictedAfterCount > 0 ||
      (await page.getByRole("button", { name: /sign in/i }).count()) > 0;
    if (!stillRestricted) {
      return { cookieSet: true, cookieValue: user, finalUrl: newUrl, status };
    }
  }

  return {
    cookieSet: true,
    cookieValueTried: ["admin", "trainer1"],
    finalUrl: page.url(),
    status,
  };
}

function normalizeHeader(s) {
  return String(s || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

async function extractCountsAndProgress(page) {
  const tables = page.locator("table");
  const tableCount = await tables.count();
  if (tableCount === 0) {
    return { tableFound: false };
  }

  // Heuristic: use the first visible table.
  let table = tables.first();
  for (let i = 0; i < tableCount; i++) {
    const t = tables.nth(i);
    const box = await t.boundingBox();
    if (box && box.width > 50 && box.height > 50) {
      table = t;
      break;
    }
  }

  const headerCells = table.locator("thead tr").first().locator("th,td");
  const headerCount = await headerCells.count();
  const headers = [];
  for (let i = 0; i < headerCount; i++) {
    headers.push(normalizeHeader(await headerCells.nth(i).innerText()));
  }

  const countsIdx = headers.findIndex((h) => /count/.test(h));
  const progressIdx = headers.findIndex((h) => /progress/.test(h));

  const rows = table.locator("tbody tr");
  const rowCount = await rows.count();

  const extracted = [];
  const take = Math.min(rowCount, 20);
  for (let r = 0; r < take; r++) {
    const row = rows.nth(r);
    const cells = row.locator("td,th");
    const cellCount = await cells.count();

    const getCell = async (idx) => {
      if (idx < 0 || idx >= cellCount) return null;
      return normalizeHeader(await cells.nth(idx).innerText());
    };

    extracted.push({
      row: r + 1,
      counts: await getCell(countsIdx),
      progress: await getCell(progressIdx),
    });
  }

  return {
    tableFound: true,
    headers,
    countsIdx,
    progressIdx,
    visibleRows: take,
    rows: extracted,
  };
}

async function main() {
  await ensureDir(OUT_DIR);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1400, height: 900 },
  });
  const page = await context.newPage();

  const results = [];
  for (const t of targets) {
    const nav = await gotoWithAuthCookie(page, t.url);
    // Give Next a moment to paint dynamic content.
    await page.waitForTimeout(750);

    const screenshotPath = path.join(
      OUT_DIR,
      `${t.name}-${Date.now()}.png`,
    );
    await page.screenshot({ path: screenshotPath, fullPage: true });

    const cols = await extractCountsAndProgress(page);

    results.push({
      name: t.name,
      url: t.url,
      finalUrl: nav.finalUrl,
      cookie: nav.cookieSet
        ? nav.cookieValue
          ? `cf_user=${nav.cookieValue}`
          : "cf_user tried"
        : "none",
      screenshotPath,
      columns: cols,
    });
  }

  await browser.close();
  console.log(JSON.stringify(results, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});

