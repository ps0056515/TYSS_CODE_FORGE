# CodeForge vs CodeChef — Feature Verification

Comparison of CodeChef.com-style features against what is implemented in CodeForge (MVP).

---

## Implemented in CodeForge

| CodeChef-style feature | CodeForge status | Notes |
|------------------------|------------------|--------|
| **Practice problems** | Done | Problem library with slug, title, difficulty, tags, statement, examples |
| **Run against samples** | Done | `/api/run`, `/api/runSamples` — in-browser run with sample I/O |
| **Submit for grading** | Done | `/api/submit` — full/hidden tests, verdicts AC/WA/RE/TLE, subtask scoring |
| **Multiple languages** | Done | JavaScript, Python, Java, C++ (run via Node/Python/Java/g++) |
| **Difficulty & tags** | Done | Easy/Medium/Hard; filter by difficulty and tags on practice page |
| **Leaderboard** | Done | Global (`/leaderboard`) and per-problem (`/leaderboard/[slug]`) |
| **User authentication** | Done | Username login + OAuth (Google, GitHub) via NextAuth |
| **Profile / progress** | Done | `/profile` — solved count, submission count, list of solved problems |
| **Submissions list** | Done | `/submissions` — recent submissions with verdict, score, user, problem |
| **Courses (catalog)** | Done | `/courses` — list; `/courses/[id]` — syllabus, level, modules (static/placeholder content) |
| **Contests (UI shell)** | Partial | `/contests` — static list “Upcoming”/“Planned”; no registration or live contests |
| **Admin** | Partial | `/admin`, `/admin/problems`, `/admin/problems/new` — RBAC via `CODEFORGE_ADMINS`; add problem form exists; contests/courses admin stubs |
| **Pricing page** | Done | `/pricing` — Free/Pro/Enterprise plans (UI only; no payment or gating) |
| **Code editor** | Done | Monaco Editor on problem page with language selection, run, submit |
| **Dark / light theme** | Done | Theme toggle in nav; preference persisted |

---

## Not implemented (gaps vs CodeChef)

| CodeChef-style feature | Status | Notes |
|------------------------|--------|--------|
| **Live contests** | Missing | No contest registration, start/end time, timed problem set, or in-contest submission flow |
| **Contest ranklist / ratings** | Missing | No rating system, divisions, or contest-specific leaderboard |
| **Discuss / community** | Missing | No forum, Q&A, or comments on problems |
| **Blog / editorials** | Missing | No articles or post-contest editorials/solutions |
| **Course progress & certificates** | Missing | Courses are catalog only; no progress tracking, quizzes, or certificates |
| **User registration (email/signup)** | Partial | OAuth only + username; no email signup, verification, or password reset |
| **Submission code view** | Missing | Submissions table shows verdict/score; no “view code” for past submissions |
| **Problem search & pagination** | Partial | Client-side filter by difficulty/tags/search; no server-side pagination |
| **Payment / plan gating** | Missing | Pricing is UI only; no Stripe/payment or feature gating by plan |
| **Recruit / jobs** | Missing | No job board or hiring integration |
| **Email notifications** | Missing | No alerts for contest reminders, clarifications, etc. |
| **API for third-party** | Missing | No public REST/API for submissions or problems (only internal route handlers) |

---

## Data & infra (MVP vs CodeChef)

| Aspect | CodeForge (current) | CodeChef-style |
|--------|----------------------|----------------|
| **Problems** | File-based: `data/custom-problems.json` + built-in in `src/lib/data.ts` | Typically DB (e.g. PostgreSQL) |
| **Submissions** | `data/submissions.jsonl` (append-only) | DB with indexes, history, code storage |
| **Users** | Cookie + OAuth; no user DB | User table, profiles, ratings |
| **Contests** | Static list only | DB: schedule, problems, registrations, ranklist |

---

## Summary

- **Implemented:** Practice (run, submit, multi-language, difficulty/tags), leaderboards (global + per-problem), auth (username + OAuth), profile, submissions list, courses catalog, contests shell, admin problem CRUD shell, pricing UI, code editor (Monaco), dark/light theme.
- **Partial:** Contests (UI only), admin (problems only), user signup (no email registration).
- **Not implemented:** Live contests & ratings, discuss/blog, course progress/certificates, submission code view, payments, recruit, email, public API.

For an MVP “CodeChef-like” platform, core practice, grading, leaderboard, and auth are in place. The largest gaps for parity are: **live contests with ranklist/ratings**, **discuss/editorials**, **course progress**, and **persistent DB** (e.g. PostgreSQL) for problems/submissions/users.
