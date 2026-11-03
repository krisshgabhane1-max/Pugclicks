import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { assertAdmin } from "@/lib/roles.functions";

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

/** Record one page visit. Public, fire-and-forget, no personal data. */
export const trackVisit = createServerFn({ method: "POST" })
  .inputValidator((input: { path: string; referrer?: string }) => input)
  .handler(async ({ data }) => {
    const path = data.path.slice(0, 300);
    if (!path.startsWith("/")) return { ok: true };
    const referrer = (data.referrer ?? "").slice(0, 300);
    await publicClient().from("site_visits").insert({ path, referrer: referrer || null });
    return { ok: true };
  });

export type TrafficStats = {
  visitsToday: number;
  visits7d: number;
  visits30d: number;
  articleViews7d: number;
  topPages: { path: string; visits: number }[];
  topReferrers: { source: string; visits: number }[];
  daily: { date: string; visits: number }[];
  topArticles: { title: string; slug: string; views: number }[];
};

const DAY = 24 * 60 * 60 * 1000;

function hostnameOf(referrer: string): string {
  try {
    return new URL(referrer).hostname.replace(/^www\./, "");
  } catch {
    return referrer.slice(0, 60) || "Direct / other";
  }
}

export const getTrafficStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<TrafficStats> => {
    await assertAdmin(context as never);
    const client = context.supabase;
    const now = Date.now();

    const [today, week, month, views7, visits7, visits14] = await Promise.all([
      client.from("site_visits").select("id", { count: "exact", head: true }).gte("created_at", new Date(now - DAY).toISOString()),
      client.from("site_visits").select("id", { count: "exact", head: true }).gte("created_at", new Date(now - 7 * DAY).toISOString()),
      client.from("site_visits").select("id", { count: "exact", head: true }).gte("created_at", new Date(now - 30 * DAY).toISOString()),
      client.from("article_views").select("article_id").gte("viewed_at", new Date(now - 7 * DAY).toISOString()).limit(10000),
      client.from("site_visits").select("path, referrer").gte("created_at", new Date(now - 7 * DAY).toISOString()).limit(10000),
      client.from("site_visits").select("created_at").gte("created_at", new Date(now - 14 * DAY).toISOString()).limit(10000),
    ]);

    const articleViews7 = (views7.data ?? []) as { article_id: string }[];
    const visitRows7 = (visits7.data ?? []) as { path: string; referrer: string | null }[];
    const visitRows14 = (visits14.data ?? []) as { created_at: string }[];

    const pageCounts = new Map<string, number>();
    const refCounts = new Map<string, number>();
    for (const row of visitRows7) {
      if (row.path.startsWith("/admin")) continue;
      pageCounts.set(row.path, (pageCounts.get(row.path) ?? 0) + 1);
      const source = row.referrer ? hostnameOf(row.referrer) : "Direct / other";
      refCounts.set(source, (refCounts.get(source) ?? 0) + 1);
    }
    const top = (m: Map<string, number>, n: number) =>
      [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, n);

    // Daily buckets for the last 14 days.
    const daily: { date: string; visits: number }[] = [];
    const dayKeys = new Map<string, number>();
    for (let i = 13; i >= 0; i--) {
      const key = new Date(now - i * DAY).toISOString().slice(0, 10);
      dayKeys.set(key, 0);
      daily.push({ date: key, visits: 0 });
    }
    for (const row of visitRows14) {
      const key = row.created_at.slice(0, 10);
      if (dayKeys.has(key)) dayKeys.set(key, (dayKeys.get(key) ?? 0) + 1);
    }
    for (const d of daily) d.visits = dayKeys.get(d.date) ?? 0;

    // Top articles by real views over 7 days.
    const viewCounts = new Map<string, number>();
    for (const v of articleViews7) viewCounts.set(v.article_id, (viewCounts.get(v.article_id) ?? 0) + 1);
    const topIds = top(viewCounts, 5).map(([id]) => id);
    let topArticles: { title: string; slug: string; views: number }[] = [];
    if (topIds.length > 0) {
      const { data: arts } = await client.from("articles").select("id, title, slug").in("id", topIds);
      const byId = new Map(((arts ?? []) as { id: string; title: string; slug: string }[]).map((a) => [a.id, a]));
      topArticles = top(viewCounts, 5)
        .map(([id, views]) => {
          const a = byId.get(id);
          return a ? { title: a.title, slug: a.slug, views } : null;
        })
        .filter((x): x is { title: string; slug: string; views: number } => Boolean(x));
    }

    return {
      visitsToday: today.count ?? 0,
      visits7d: week.count ?? 0,
      visits30d: month.count ?? 0,
      articleViews7d: articleViews7.length,
      topPages: top(pageCounts, 8).map(([path, visits]) => ({ path, visits })),
      topReferrers: top(refCounts, 6).map(([source, visits]) => ({ source, visits })),
      daily,
      topArticles,
    };
  });
