# Student Evaluation Logic: Output & Marks

This document describes how student submissions are evaluated—**output comparison** and **marks/scoring**—for both **algorithm** and **project** problems.

---

## 1. Algorithm problems (single-file, I/O)

### Where it runs

- **Run samples (practice):** `POST /api/runSamples` — runs code against **problem examples** only; result is for feedback only, not stored as a submission.
- **Submit (graded):** `POST /api/submit` — runs code against **hidden tests** (or subtasks); result is stored and returned as verdict + score.

### Output comparison

- User code is executed with each test **input** via `/api/run` (Node/Python/Java/C++).
- **stdout** from the run is compared to the **expected output** for that test.
- **Normalization** (before comparison):
  - Line endings: `\r\n` → `\n`
  - Trim: leading/trailing whitespace removed
- **Pass condition:** `norm(stdout) === norm(expected)` (exact string match after normalization).
- No partial credit for “close” output; it must match exactly.

### Verdicts

| Verdict | Meaning |
|--------|---------|
| **AC**  | All tests passed. |
| **WA**  | Wrong Answer — at least one test failed (output mismatch). |
| **RE**  | Runtime Error — process exited non‑zero or threw. |
| **TLE** | Time Limit Exceeded — run exceeded timeout (e.g. 2s). |
| **PARTIAL** | Used only in subtask mode; some subtasks passed, not all. |

### Marks (score 0–100)

Two modes, controlled by `problem.scoring`:

#### A. Default: single verdict (no subtasks)

- **Hidden tests:** Problem must define `hiddenTests` (array of `{ input, output }`).
- **Logic:** Run code for each hidden test in order. On first failure (wrong output, RE, or TLE), stop and set verdict (WA/RE/TLE). If all pass, verdict = AC.
- **Score:**
  - **AC → 100**
  - **WA / RE / TLE → 0**

#### B. Subtasks

- **Config:** `problem.scoring.mode === "subtasks"` and `problem.scoring.subtasks` is a non‑empty array. Each subtask has `name`, `points`, and `tests: { input, output }[]`.
- **Logic:** For each subtask, run all its tests. The subtask is passed only if every test in it passes (output match, no RE/TLE). If any test in a subtask fails or errors, that subtask gets 0 points and evaluation can stop for that subtask.
- **Score:** Sum of points of all **passed** subtasks. Capped at **100** (if sum &gt; 100, score is set to 100).
- **Verdict:**
  - If any run is RE or TLE → verdict = RE or TLE, score = 0 (or partial sum before the error, depending on implementation).
  - If total score = 100 → **AC**.
  - If total score = 0 → **WA**.
  - Otherwise → **PARTIAL** (score between 0 and 100).

So for algorithm problems, **marks are either 0 or 100 in default mode**, or **0–100 by subtask points** in subtask mode.

---

## 2. Project problems (codebase / use-case)

### Intended design

- Student submits a **codebase** (e.g. ZIP) that implements the required behaviour (e.g. a module with given API).
- Server runs an **instructor-authored test script** (e.g. `run.js`) in a sandbox that:
  - Loads the student’s code (e.g. `solution.js`).
  - Runs one or more **use cases** (e.g. “Add item and get count”, “Multiple products and total”).
  - For each use case: **pass** if behaviour matches the spec, **fail** otherwise.
- Result is stored with `submissionType: "project"` and `projectResult: { useCaseResults, codeQuality? }`.

### Output / behaviour check (per use case)

- The test runner (e.g. `data/test-suites/cart-module/run.js`) is the source of truth.
- For each use case it:
  - Calls the student’s API (e.g. `createCart()`, `addItem`, `getCount`, `getTotal`).
  - Compares **returned values** (or behaviour) to the expected outcome.
  - Writes a **result file** (e.g. `result.json`) with:
    - `useCaseResults`: `{ id, title, passed, message? }[]`
    - `score`: numeric score (see below).

So for projects, “output” is **programmatic**: the test script checks return values/state, not raw stdout text (unless the test runner explicitly compares stdout).

### Marks for projects

- **Use-case score:**  
  `score = (passed use cases / total use cases) * 100`  
  (e.g. in `cart-module/run.js`: `Math.round((passed / results.length) * 100)`).
- **Optional code quality:**  
  If the pipeline supports it, `projectResult.codeQuality` can add a separate `score` and `summary` (e.g. lint/format). How that is combined with use-case score (e.g. 70% behaviour + 30% quality) would be defined in the project-assessment pipeline.
- **Verdict:**  
  Can be derived from project score, e.g. **AC** if score = 100, **PARTIAL** if 0 &lt; score &lt; 100, **WA** if 0.

### Current implementation status

- **Data model:** Submissions support `submissionType: "project"` and `projectResult` (see `src/lib/submissions.ts`). Problems support `type: "project"`, `useCases`, and `runConfig` (see `src/lib/data.ts`).
- **Test runner:** A sample project test runner exists at `data/test-suites/cart-module/run.js`; it writes `useCaseResults` and `score` to `result.json`.
- **Submit API:** **Project submission is implemented.** `POST /api/submit-project` accepts `multipart/form-data` with `problemSlug` and `file` (ZIP, max 5 MB). The server copies the problem’s test suite from `data/test-suites/<problemSlug>/` into a temp dir, extracts the student’s ZIP there, runs `runConfig.testCommand` (e.g. `node run.js`) with `runConfig.timeoutSeconds`, then reads `result.json` for `useCaseResults` and `score`. The submission is stored with `submissionType: "project"` and `projectResult`. The practice UI for project problems shows a ZIP upload and “Submit project”; after submit, verdict, score, and per–use-case results are shown.

---

## 3. Summary table

| Aspect              | Algorithm (current)                    | Project (designed / partial)                    |
|---------------------|----------------------------------------|------------------------------------------------|
| **Output check**    | `norm(stdout) === norm(expected)`      | Test script checks return values/behaviour     |
| **Score**           | 0 or 100 (default); or 0–100 (subtasks)| `(passed / total use cases) * 100` (+ quality?)|
| **Verdict**         | AC / WA / RE / TLE / PARTIAL           | AC / PARTIAL / WA from score                   |
| **Submit API**      | Implemented                            | Implemented (`POST /api/submit-project`, ZIP) |

---

## 4. References in code

- **Algorithm submit & scoring:** `src/app/api/submit/route.ts` (run each test, compare output, set verdict and score).
- **Run one test (execute code):** `src/app/api/run/route.ts` (timeout, stdout/stderr capture).
- **Run samples (examples only):** `src/app/api/runSamples/route.ts`.
- **Submission shape:** `src/lib/submissions.ts` (`Submission`, `UseCaseResult`, `projectResult`).
- **Project test runner example:** `data/test-suites/cart-module/run.js` (use-case pass/fail, score = (passed/total)*100).
