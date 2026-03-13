import { NextResponse } from "next/server";
import { z } from "zod";
import { addProblemsBulk } from "@/lib/problems_store";
import { getUserAsync, isAdminUser, USER_COOKIE } from "@/lib/auth";

export const runtime = "nodejs";

const BulkSchema = z.object({
  shared: z.object({
    difficulty: z.enum(["Easy", "Medium", "Hard"]),
    tags: z.array(z.string().min(1).max(30)).default([]),
    languages: z.array(z.enum(["javascript", "python", "java", "cpp"])).min(1),
  }),
  /** One entry per line: "Title" or "Title,optional-slug" */
  titles: z.array(z.string().trim()).min(1).max(200),
});

export async function POST(req: Request) {
  const user = await getUserAsync();
  if (!user) return NextResponse.json({ ok: false, stderr: "Not signed in" }, { status: 401 });
  if (!isAdminUser(user)) return NextResponse.json({ ok: false, stderr: "Admins only" }, { status: 403 });

  try {
    const json = await req.json();
    const parsed = BulkSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, stderr: "Invalid payload" }, { status: 400 });
    }

    const { shared, titles } = parsed.data;
    const inputs = titles.map((line) => {
      const [title, slug] = line.includes(",") ? line.split(",").map((s) => s.trim()) : [line.trim(), undefined];
      return {
        title: title || "",
        slug: slug || undefined,
        difficulty: shared.difficulty,
        tags: shared.tags,
        languages: shared.languages,
      };
    });

    const { created, errors } = await addProblemsBulk(inputs);
    const res = NextResponse.json({
      ok: true,
      created: created.length,
      slugs: created.map((p) => p.slug),
      errors: errors.length ? errors : undefined,
    });
    res.cookies.set(USER_COOKIE, user, { path: "/", sameSite: "lax", maxAge: 30 * 24 * 60 * 60 });
    return res;
  } catch {
    return NextResponse.json({ ok: false, stderr: "Server error" }, { status: 500 });
  }
}
