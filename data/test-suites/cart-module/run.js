/**
 * Test runner for cart-module (project problem).
 * Expects solution.js to export: createCart() -> { addItem(productId, quantity), getCount(), getTotal() }
 * Prices: A=5, B=3, C=10
 */
const fs = require("fs");
const path = require("path");

const PRICES = { A: 5, B: 3, C: 10 };

function runTests() {
  const results = [];
  let passed = 0;

  try {
    const sol = require("./solution.js");
    if (typeof sol.createCart !== "function") {
      fs.writeFileSync(
        path.join(__dirname, "result.json"),
        JSON.stringify({
          useCaseResults: [
            { id: "setup", title: "Export createCart", passed: false, message: "solution.js must export createCart()" }
          ],
          score: 0
        })
      );
      process.exit(1);
    }

    // UC1: Add item and get count
    try {
      const c1 = sol.createCart();
      c1.addItem("A", 2);
      const count = c1.getCount();
      const ok = count === 2;
      if (ok) passed++;
      results.push({
        id: "uc1",
        title: "Add item and get count",
        passed: ok,
        message: ok ? undefined : `Expected getCount() === 2, got ${count}`
      });
    } catch (e) {
      results.push({
        id: "uc1",
        title: "Add item and get count",
        passed: false,
        message: e.message || String(e)
      });
    }

    // UC2: Multiple products and total
    try {
      const c2 = sol.createCart();
      c2.addItem("A", 10);
      c2.addItem("B", 2);
      const total = c2.getTotal();
      const expected = 10 * PRICES.A + 2 * PRICES.B; // 56
      const ok = total === expected;
      if (ok) passed++;
      results.push({
        id: "uc2",
        title: "Multiple products and total",
        passed: ok,
        message: ok ? undefined : `Expected getTotal() === ${expected}, got ${total}`
      });
    } catch (e) {
      results.push({
        id: "uc2",
        title: "Multiple products and total",
        passed: false,
        message: e.message || String(e)
      });
    }

    // UC3: Update quantity (same productId twice)
    try {
      const c3 = sol.createCart();
      c3.addItem("A", 2);
      c3.addItem("A", 3);
      const count = c3.getCount();
      const ok = count === 5;
      if (ok) passed++;
      results.push({
        id: "uc3",
        title: "Update quantity",
        passed: ok,
        message: ok ? undefined : `Expected getCount() === 5 after add A:2 and A:3, got ${count}`
      });
    } catch (e) {
      results.push({
        id: "uc3",
        title: "Update quantity",
        passed: false,
        message: e.message || String(e)
      });
    }

    const score = results.length > 0 ? Math.round((passed / results.length) * 100) : 0;
    fs.writeFileSync(
      path.join(__dirname, "result.json"),
      JSON.stringify({ useCaseResults: results, score })
    );
    process.exit(0);
  } catch (err) {
    fs.writeFileSync(
      path.join(__dirname, "result.json"),
      JSON.stringify({
        useCaseResults: [
          {
            id: "load",
            title: "Load solution",
            passed: false,
            message: (err && err.message) || String(err)
          }
        ],
        score: 0
      })
    );
    process.exit(1);
  }
}

runTests();
