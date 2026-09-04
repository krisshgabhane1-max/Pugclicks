import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export type Article = {
  id: string;
  slug: string;
  title: string;
  category: string;
  seo_title: string;
  cover_image: string;
  excerpt: string;
  body: string;
  author: string;
  image_alt: string;
  status: string;
  published_at: string | null;
};

const COLUMNS =
  "id, slug, title, seo_title, category, excerpt, body, author, cover_image, image_alt, status, published_at";

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

export const listPublishedArticles = createServerFn({ method: "GET" })
  .inputValidator((input: { category?: string; search?: string; limit?: number } | undefined) => input ?? {})
  .handler(async ({ data }) => {
    let query = publicClient()
      .from("articles")
      .select(COLUMNS)
      .eq("status", "published")
      .order("published_at", { ascending: false });

    if (data.category) query = query.eq("category", data.category);
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
    const { data: related } = await client
      .from("articles")
      .select(COLUMNS)
      .eq("status", "published")
      .eq("category", article.category)
      .neq("id", article.id)
      .order("published_at", { ascending: false })
      .limit(3);

    return { article, related: (related ?? []) as Article[] };
  });
