# How practice sections work

The **Practice** page shows problems in sections: **All**, **Topic-wise**, **Company Prep**, **Beginner**, **Projects**. Problems are assigned to sections automatically based on their fields.

## Section rules

| Section        | How problems are included |
|----------------|----------------------------|
| **All**        | Every problem. |
| **Topic-wise** | Every problem (same list, grouped by **tags** on the page). |
| **Company Prep** | Problem has tag `company-prep` or any tag starting with `company-` (e.g. `company-amazon`). |
| **Beginner**   | Problem **difficulty** is **Easy**. |
| **Projects**   | Problem **type** is **project** (use-case / codebase submission). |

So:

- **Tags** → Topic-wise (grouping) and optionally Company Prep.
- **Difficulty** → Beginner when Easy.
- **Type** → Projects when `project`.

## Adding questions to each section

### 1. Via Admin UI (recommended)

1. Go to **Admin → Problems → Add practice problem**.
2. Fill **Title**, **Difficulty**, **Tags**, **Statement**, etc.
3. **Sections**:
   - **Algorithm** vs **Project**: choose **Project** only for use-case/codebase problems (they appear in **Projects**).
   - Check **Company Prep** to add the `company-prep` tag (problem appears in **Company Prep**).
4. **Difficulty = Easy** → problem also appears in **Beginner**.
5. **Tags** (e.g. `arrays`, `strings`) → problem appears under those topics in **Topic-wise**.

Save; the problem will show up in the right sections automatically.

### 2. Via code (built-in problems)

In `src/lib/data.ts`, each problem has:

- `difficulty`: `"Easy"` | `"Medium"` | `"Hard"` → **Beginner** when Easy.
- `tags`: e.g. `["arrays", "company-prep"]` → **Topic-wise** by tag, **Company Prep** if `company-prep` or `company-*`.
- `type`: `"algorithm"` | `"project"` → **Projects** when `"project"`.

Example — Company Prep + Topic-wise:

```ts
{
  slug: "my-problem",
  title: "My Problem",
  difficulty: "Medium",
  tags: ["arrays", "company-prep"],
  // ...
}
```

Example — Projects section:

```ts
{
  slug: "my-project",
  type: "project",
  useCases: [...],
  runConfig: {...},
  // ...
}
```

### 3. Custom problems (JSON)

Problems in `data/custom-problems.json` use the same fields: `difficulty`, `tags`, `type`. Add `"company-prep"` (or `company-*`) to `tags` for Company Prep; set `"type": "project"` for Projects.

## Summary

- **All**: no extra field.
- **Topic-wise**: add **tags** (e.g. `arrays`, `strings`).
- **Company Prep**: add tag **`company-prep`** (or `company-<name>`).
- **Beginner**: set **difficulty** to **Easy**.
- **Projects**: set **type** to **`project`** and configure `useCases` and `runConfig`.
