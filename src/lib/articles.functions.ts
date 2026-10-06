import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export type Article = {
  id: string;
  slug: string;
  title: string;
  category: string;
  categories: string[];
  is_editors_pick: boolean;
  seo_title: string;
  cover_image: string;
  excerpt: string;
  body: string;
  author: string;
  image_alt: string;
  status: string;
  published_at: string | null;
  updated_at: string;
};

const COLUMNS =
  "id, slug, title, seo_title, category, categories, is_editors_pick, excerpt, body, author, cover_image, image_alt, status, published_at, updated_at";

function publicClient() {
  const url = process.env["SUPABASE_URL"]!;
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(url, key, {
    auth: { persistSession: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) {
          h.delete("Authorization");
        }
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

/** All category slugs an article belongs to (primary + extras). */
export function articleCategories(article: Pick<Article, "category" | "categories">) {
  const all = [article.category, ...(article.categories ?? [])];
  return [...new Set(all.filter(Boolean))];
}

export const listPublishedArticles = createServerFn({ method: "GET" })
  .inputValidator((input: { category?: string; search?: string; limit?: number } | undefined) => input ?? {})
  .handler(async ({ data }) => {
    let query = publicClient()
      .from("articles")
      .select(COLUMNS)
      .eq("status", "published")
      .order("published_at", { ascending: false });

    if (data.category) {
      const c = data.category;
      query = query.or(`category.eq.${c},categories.cs.{${c}}`);
    }
    if (data.search) {
      const term = data.search.replace(/[%,()]/g, " ").trim();
      if (term) query = query.or(`title.ilike.%${term}%,excerpt.ilike.%${term}%,body.ilike.%${term}%`);
    }
    if (data.limit) query = query.limit(data.limit);

    const { data: rows, error } = await query;
    if (error) throw new Error(error.message);
    return (rows ?? []) as Article[];
  });

export const getArticleBySlug = createServerFn({ method: "GET" })
  .inputValidator((input: { slug: string }) => input)
  .handler(async ({ data }) => {
    const client = publicClient();
    const { data: row, error } = await client
      .from("articles")
      .select(COLUMNS)
      .eq("slug", data.slug)
      .eq("status", "published")
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) return { article: null, related: [] as Article[] };

    const article = row as Article;
    const cats = articleCategories(article);
    const { data: related } = await client
      .from("articles")
      .select(COLUMNS)
      .eq("status", "published")
      .neq("id", article.id)
      .or(cats.map((c) => `category.eq.${c},categories.cs.{${c}}`).join(","))
      .order("published_at", { ascending: false })
      .limit(3);

    return { article, related: (related ?? []) as Article[] };
  });

/** Record a page view for the trending engine. Public, fire-and-forget. */
export const trackArticleView = createServerFn({ method: "POST" })
  .inputValidator((input: { articleId: string }) => input)
  .handler(async ({ data }) => {
    const { error } = await publicClient()
      .from("article_views")
      .insert({ article_id: data.articleId });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Most-viewed published articles over the last 7 days, from real view data. */
export const listTrendingArticles = createServerFn({ method: "GET" })
  .inputValidator((input: { limit?: number } | undefined) => input ?? {})
  .handler(async ({ data }) => {
    const client = publicClient();
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { data: views, error } = await client
      .from("article_views")
      .select("article_id")
      .gte("viewed_at", since)
      .limit(5000);
    if (error) throw new Error(error.message);

    const counts = new Map<string, number>();
    for (const v of views ?? []) {
      counts.set(v.article_id, (counts.get(v.article_id) ?? 0) + 1);
    }
    const topIds = [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, data.limit ?? 5)
      .map(([id]) => id);
    if (topIds.length === 0) return [] as Article[];

    const { data: rows, error: artError } = await client
      .from("articles")
      .select(COLUMNS)
      .eq("status", "published")
      .in("id", topIds);
    if (artError) throw new Error(artError.message);

    const byId = new Map((rows ?? []).map((r) => [r.id, r as Article]));
    return topIds.map((id) => byId.get(id)).filter((a): a is Article => Boolean(a));
  });
