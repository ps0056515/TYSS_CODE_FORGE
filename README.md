## CodeForge (new workspace)

CodeForge is a **CodeChef-style coder platform MVP**: landing page, courses, practice library, problem page with editor, and a stub runner.

### Run locally

```bash
cd apps/codeforge
npm install
npm run dev OR nohup npm run dev > web.log 2>&1 & disown
```

Then open `http://localhost:3001`.

### What’s implemented

- `/` landing page
- `/courses` catalogue (mock data)
- `/practice` problem list (mock data)
- `/practice/[slug]` problem detail + editor + **Run** (stubbed)
- `/contests` contest shell
- `/login` placeholder
- `POST /api/run` stub endpoint

### Next upgrades (to become “real”)

- Auth + profiles + progress tracking
- Real judge service (sandboxed execution) + submissions
- Leaderboards + ratings + contest live scoring
- Admin CMS for problems/courses + moderation
- Payments for Pro plan

