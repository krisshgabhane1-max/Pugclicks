import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Flame, RefreshCw, Search, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { buildContentPlan, type PlannerResult } from "@/lib/planner.functions";
import { categoryName } from "@/lib/site";

export const Route = createFileRoute("/admin/planner")({
  head: () => ({
    meta: [{ title: "Pugclicks" }, { name: "robots", content: "noindex, nofollow, noarchive" }],
  }),
  component: PlannerPage,
});

function PlannerPage() {
  const planFn = useServerFn(buildContentPlan);
  const [plan, setPlan] = useState<PlannerResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function refresh() {
    setLoading(true);
    try {
      setPlan(await planFn());
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not build the plan.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl">Content planner</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Builds on your most-read articles and Google search data to suggest what to write next.
          </p>
        </div>
        <Button onClick={refresh} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Building plan…" : plan ? "Refresh plan" : "Build my plan"}
        </Button>
      </div>

      {!plan && !loading && (
        <p className="mt-6 rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground">
          Click "Build my plan" to get topic suggestions based on your real traffic.
        </p>
      )}

      {plan && (
        <div className="mt-6 space-y-8">
          <div className="grid gap-4 sm:grid-cols-2">
            <section className="rounded-xl border border-border bg-card p-5">
              <h3 className="flex items-center gap-2 text-lg">
                <Flame className="h-5 w-5 text-primary" aria-hidden /> Your top articles (real views)
              </h3>
              {plan.topArticles.length > 0 ? (
                <ul className="mt-3 space-y-2 text-sm">
                  {plan.topArticles.slice(0, 5).map((a) => (
                    <li key={a.title} className="flex items-center justify-between gap-3">
                      <span className="truncate">{a.title}</span>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {a.views} views · {categoryName(a.category)}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-muted-foreground">No article views recorded yet.</p>
              )}
            </section>

            <section className="rounded-xl border border-border bg-card p-5">
              <h3 className="flex items-center gap-2 text-lg">
                <Search className="h-5 w-5 text-primary" aria-hidden /> Google searches (28 days)
              </h3>
              {plan.searchQueries && plan.searchQueries.length > 0 ? (
                <ul className="mt-3 space-y-2 text-sm">
                  {plan.searchQueries.slice(0, 8).map((q) => (
                    <li key={q.query} className="flex items-center justify-between gap-3">
                      <span className="truncate">{q.query}</span>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {q.clicks} clicks · {q.impressions} impressions
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-muted-foreground">{plan.searchNote}</p>
              )}
            </section>
          </div>

          <section>
            <h3 className="flex items-center gap-2 text-xl">
              <Sparkles className="h-5 w-5 text-primary" aria-hidden /> What to write next
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">{plan.plannerNote}</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {plan.suggestions.map((s, i) => (
                <article key={`${s.title}-${i}`} className="rounded-xl border border-border bg-card p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-semibold text-secondary-foreground">
                      {categoryName(s.category) || s.category}
                    </span>
                    <span className="rounded-full border border-border px-2 py-0.5 text-[11px] text-muted-foreground">
                      {s.keyword}
                    </span>
                  </div>
                  <h4 className="mt-2 text-lg leading-snug">{s.title}</h4>
                  <p className="mt-2 text-sm text-muted-foreground">{s.angle}</p>
                  <p className="mt-2 text-xs text-primary">{s.why}</p>
                </article>
              ))}
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Suggestions are AI-generated ideas from your real traffic data — check the facts before publishing, as always.
            </p>
          </section>
        </div>
      )}
    </div>
  );
}
