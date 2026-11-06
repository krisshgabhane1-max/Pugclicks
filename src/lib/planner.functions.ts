import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { runLovableStructured } from "./ai.server";
import { CATEGORIES, SITE_NAME } from "./site";

export type PlannerSuggestion = {
  title: string;
  keyword: string;
  category: string;
  angle: string;
  why: string;
};

export type PlannerResult = {
  topArticles: { title: string; category: string; views: number }[];
  searchQueries: { query: string; clicks: number; impressions: number }[] | null;
  searchNote: string;
  suggestions: PlannerSuggestion[];
  plannerNote: string;
  generatedAt: string;
};

const GSC_GATEWAY = "https://connector-gateway.lovable.dev/google_search_console";
const SITE_URL = "https://pugclicks.lovable.app/";

async function fetchSearchQueries(): Promise<{
  queries: { query: string; clicks: number; impressions: number }[] | null;
  note: string;
}> {
  const lovableKey = process.env["LOVABLE_API_KEY"];
  const gscKey = process.env["GOOGLE_SEARCH_CONSOLE_API_KEY"];
  if (!lovableKey || !gscKey) {
    return { queries: null, note: "Search Console is not linked to this project yet." };
  }
  const headers = {
    Authorization: `Bearer ${lovableKey}`,
    "X-Connection-Api-Key": gscKey,
    "Content-Type": "application/json",
  };
  const listRes = await fetch(`${GSC_GATEWAY}/webmasters/v3/sites`, { headers });
  if (!listRes.ok) {
    return { queries: null, note: `Search Console returned ${listRes.status} — could not read your properties.` };
  }
  const { siteEntry = [] } = (await listRes.json()) as { siteEntry?: { siteUrl: string; permissionLevel?: string }[] };
  const verified = siteEntry.filter(
    (s) => s.permissionLevel !== "siteUnverifiedUser" && SITE_URL.startsWith(s.siteUrl),
  );
  if (verified.length !== 1) {
    return {
      queries: null,
      note:
        verified.length === 0
          ? "Your site is not verified in the connected Search Console account yet — planner uses article views only."
          : "Several Search Console properties match this site — connect the one you want data from.",
    };
  }
  const siteUrl = verified[0].siteUrl;
  const end = new Date();
  const start = new Date(end.getTime() - 28 * 24 * 60 * 60 * 1000);
  const queryRes = await fetch(`${GSC_GATEWAY}/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      startDate: start.toISOString().slice(0, 10),
      endDate: end.toISOString().slice(0, 10),
      dimensions: ["query"],
      rowLimit: 20,
    }),
  });
  if (!queryRes.ok) {
    return { queries: null, note: `Search Console data unavailable (${queryRes.status}).` };
  }
  const body = (await queryRes.json()) as {
    rows?: { keys: string[]; clicks: number; impressions: number }[];
  };
  const queries = (body.rows ?? []).map((r) => ({
    query: r.keys[0],
    clicks: r.clicks,
    impressions: r.impressions,
  }));
  return { queries: queries.length ? queries : null, note: queries.length ? "" : "No search queries recorded in the last 28 days yet." };
}

/**
 * Admin-only SEO content planner: real top-performing articles + Search
 * Console queries (when verified) + AI suggestions for what to write next.
 */
export const buildContentPlan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: role } = await context.supabase
      .from("user_roles")
      .select("id")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();
    if (!role) throw new Error("Only admins can open the content planner.");

    // Top-performing articles from real view counts.
    const { data: viewRows, error: viewsError } = await context.supabase
      .from("article_views")
      .select("article_id");
    if (viewsError) throw new Error(viewsError.message);
    const counts = new Map<string, number>();
    for (const row of viewRows ?? []) {
      counts.set(row.article_id, (counts.get(row.article_id) ?? 0) + 1);
    }
    const topIds = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);
    let topArticles: { title: string; category: string; views: number }[] = [];
    if (topIds.length > 0) {
      const { data: arts, error: artsError } = await context.supabase
        .from("articles")
        .select("id, title, category")
        .in("id", topIds.map(([id]) => id));
      if (artsError) throw new Error(artsError.message);
      topArticles = topIds
        .map(([id, views]) => {
          const art = (arts ?? []).find((a) => a.id === id);
          return art ? { title: art.title, category: art.category, views } : null;
        })
        .filter((x): x is { title: string; category: string; views: number } => x !== null);
    }

    let searchQueries: PlannerResult["searchQueries"] = null;
    let searchNote = "";
    try {
      const gsc = await fetchSearchQueries();
      searchQueries = gsc.queries;
      searchNote = gsc.note;
    } catch (error) {
      searchNote = error instanceof Error ? error.message : "Search data unavailable.";
    }

    if (topArticles.length === 0 && !searchQueries) {
      return {
        topArticles,
        searchQueries,
        searchNote,
        suggestions: [],
        plannerNote: "No article views or search queries yet — publish and promote a few articles, then refresh the planner.",
        generatedAt: new Date().toISOString(),
      } satisfies PlannerResult;
    }

    const result = await runLovableStructured<{ suggestions: PlannerSuggestion[]; note: string }>({
      system: `You are the SEO content planner for ${SITE_NAME}, a tech and pop-culture publication for students and everyday readers. Categories available: ${CATEGORIES.map((c) => c.slug).join(", ")}. Suggest timely, realistic topics the site can actually cover. No hype, no invented statistics.`,
      prompt: `Today is ${new Date().toISOString().slice(0, 10)}.\n\nTop-performing articles (real page views):\n${
        topArticles.map((a) => `- ${a.title} [${a.category}] (${a.views} views)`).join("\n") || "(none yet)"
      }\n\nGoogle searches that showed this site in the last 28 days:\n${
        searchQueries
          ? searchQueries.map((q) => `- "${q.query}" — ${q.clicks} clicks, ${q.impressions} impressions`).join("\n")
          : `(${searchNote})`
      }\n\nSuggest 6 article ideas that build on what already works: same audiences, adjacent keywords, timely angles. For each: a working title, one target keyword, a category slug from the list, a one-line angle, and one line on why now. Also include a one-sentence overall note.`,
      schema: z.object({
        suggestions: z
          .array(
            z.object({
              title: z.string(),
              keyword: z.string(),
              category: z.string(),
              angle: z.string(),
              why: z.string(),
            }),
          )
          .length(6),
        note: z.string(),
      }),
    });

    return {
      topArticles,
      searchQueries,
      searchNote,
      suggestions: result.suggestions,
      plannerNote: result.note,
      generatedAt: new Date().toISOString(),
    } satisfies PlannerResult;
  });
