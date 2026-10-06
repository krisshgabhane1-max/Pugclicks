import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

const BASE = "https://pugclicks.lovable.app";

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export const Route = createFileRoute("/rss.xml")({
  server: {
    handlers: {
      GET: async () => {
        const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
        const client = createClient<Database>(process.env["SUPABASE_URL"]!, key, {
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

        const { data: articles } = await client
          .from("articles")
          .select("slug, title, excerpt, author, category, published_at, updated_at")
          .eq("status", "published")
          .order("published_at", { ascending: false })
          .limit(50);

        const items = (articles ?? [])
          .map(
            (a) => `    <item>
      <title>${escapeXml(a.title)}</title>
      <link>${BASE}/article/${a.slug}</link>
      <guid isPermaLink="true">${BASE}/article/${a.slug}</guid>
      <description>${escapeXml(a.excerpt)}</description>
      <author>${escapeXml(a.author)}</author>
      <category>${escapeXml(a.category)}</category>
      <pubDate>${new Date(a.published_at ?? a.updated_at).toUTCString()}</pubDate>
    </item>`,
          )
          .join("\n");

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Pugclicks</title>
    <link>${BASE}</link>
    <description>Practical AI and technology guides, movies, games and sports stories from Pugclicks.</description>
    <language>en</language>
    <atom:link href="${BASE}/rss.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

        return new Response(xml, {
          headers: {
            "Content-Type": "application/rss+xml; charset=utf-8",
            "Cache-Control": "public, max-age=1800",
          },
        });
      },
    },
  },
});
