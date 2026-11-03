import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { BarChart3, Eye, Users } from "lucide-react";
import type { TrafficStats } from "@/lib/analytics.functions";
import { getTrafficStats } from "@/lib/analytics.functions";

export const Route = createFileRoute("/admin/traffic")({
  head: () => ({
    meta: [
      { title: "Pugclicks" },
      { name: "robots", content: "noindex, nofollow, noarchive" },
    ],
  }),
  component: AdminTraffic,
});

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}

function AdminTraffic() {
  const load = useServerFn(getTrafficStats);
  const [stats, setStats] = useState<TrafficStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    load().then((s) => active && setStats(s)).catch((e) => active && setError(e.message));
    return () => {
      active = false;
    };
  }, [load]);

  if (error) return <p className="text-sm font-medium text-destructive">{error}</p>;
  if (!stats) return <p className="text-sm text-muted-foreground">Loading traffic…</p>;

  const maxDaily = Math.max(1, ...stats.daily.map((d) => d.visits));

  return (
    <div className="space-y-8">
      <section>
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <Users className="h-5 w-5 text-primary" aria-hidden /> Visitors
        </h2>
        <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Stat label="Today" value={stats.visitsToday} />
          <Stat label="Last 7 days" value={stats.visits7d} />
          <Stat label="Last 30 days" value={stats.visits30d} />
          <Stat label="Article reads (7 days)" value={stats.articleViews7d} />
        </div>
      </section>

      <section>
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <BarChart3 className="h-5 w-5 text-primary" aria-hidden /> Visits per day (14 days)
        </h2>
        <div className="mt-3 flex h-32 items-end gap-1 rounded-xl border border-border bg-card p-3">
          {stats.daily.map((d) => (
            <div
              key={d.date}
              title={`${d.date}: ${d.visits} visits`}
              className="flex-1 rounded-t bg-primary/80"
              style={{ height: `${Math.max(4, (d.visits / maxDaily) * 100)}%` }}
            />
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Eye className="h-5 w-5 text-primary" aria-hidden /> Most viewed articles (7 days)
          </h2>
          {stats.topArticles.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">No article views recorded yet.</p>
          ) : (
            <ol className="mt-3 grid gap-2">
              {stats.topArticles.map((a, i) => (
                <li key={a.slug} className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-2.5">
                  <span className="font-mono text-sm text-muted-foreground">{i + 1}</span>
                  <Link to="/article/$slug" params={{ slug: a.slug }} className="min-w-0 flex-1 truncate text-sm font-medium hover:text-primary">
                    {a.title}
                  </Link>
                  <span className="text-sm text-muted-foreground">{a.views}</span>
                </li>
              ))}
            </ol>
          )}
        </div>

        <div>
          <h2 className="text-lg font-semibold">Most visited pages (7 days)</h2>
          {stats.topPages.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">No page visits recorded yet.</p>
          ) : (
            <ul className="mt-3 grid gap-2">
              {stats.topPages.map((p) => (
                <li key={p.path} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-2.5">
                  <span className="min-w-0 truncate text-sm">{p.path}</span>
                  <span className="text-sm text-muted-foreground">{p.visits}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Where visitors come from (7 days)</h2>
        {stats.topReferrers.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">No data yet.</p>
        ) : (
          <ul className="mt-3 grid gap-2">
            {stats.topReferrers.map((r) => (
              <li key={r.source} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-2.5">
                <span className="min-w-0 truncate text-sm">{r.source}</span>
                <span className="text-sm text-muted-foreground">{r.visits}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
