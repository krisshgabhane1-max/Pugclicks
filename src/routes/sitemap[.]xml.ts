import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { CATEGORIES } from "@/lib/site";

const BASE_URL = "https://pugclicks.lovable.app";
const STATIC_PATHS = [
  "/", "/tools", "/about", "/faq", "/contact", "/privacy", "/terms", "/credits", "/referral", "/search",
];

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
        const client = createClient<Database>(process.env["SUPABASE_URL"]!, key, {
          auth: { persistSession: false },
          global: {
            fetch: (input, init) => {
              const h = new Headers(init?.headers);
              if (h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
              h.set("apikey", key);
              return fetch(input, { ...init, headers: h });
            },
          },
        });
        const articles: { slug: string; updated_at: string | null }[] = [];
        for (let from = 0; ; from += 1000) {
          const { data, error } = await client
            .from("articles")
            .select("slug, updated_at")
            .eq("status", "published")
            .order("published_at", { ascending: false })
            .range(from, from + 999);
          if (error) return new Response(`Sitemap error: ${error.message}`, { status: 500 });
          articles.push(...((data ?? []) as typeof articles));
          if (!data || data.length < 1000) break;
        }
        const urls = [
          ...STATIC_PATHS.map((p) => `<url><loc>${BASE_URL}${p}</loc></url>`),
          ...CATEGORIES.map((c) => `<url><loc>${BASE_URL}/category/${esc(c.slug)}</loc></url>`),
          ...articles.map(
            (a) =>
              `<url><loc>${BASE_URL}/article/${esc(a.slug)}</loc>${
                a.updated_at ? `<lastmod>${new Date(a.updated_at).toISOString()}</lastmod>` : ""
              }</url>`,
          ),
        ];
        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join("")}</urlset>`;
        return new Response(xml, {
          headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=3600" },
        });
      },
    },
  },
});
