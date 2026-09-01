import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { ArticleCard } from "@/components/article-card";
import { SiteLayout } from "@/components/site-layout";
import { Button } from "@/components/ui/button";
import { listPublishedArticles } from "@/lib/articles.functions";
import { CATEGORIES, FAQS, RESPONSE_PROMISE } from "@/lib/site";

const homeQuery = queryOptions({
  queryKey: ["articles", "home"],
  queryFn: () => listPublishedArticles({ data: { limit: 24 } }),
});

export const Route = createFileRoute("/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(homeQuery),
  head: () => ({
    meta: [
      { title: "Pugclicks — Movies, TV, Gaming & Sports Coverage" },
      {
        name: "description",
        content:
          "Pugclicks is an independent entertainment publication covering movies, TV and series, gaming, sports and industry news.",
      },
      { property: "og:title", content: "Pugclicks — Movies, TV, Gaming & Sports Coverage" },
      {
        property: "og:description",
        content: "Independent coverage of movies, TV, gaming and sports. Clear writing, sourced reporting.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
      { property: "og:image", content: "/og-default.svg" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Home,
});

function Home() {
  const { data: articles } = useSuspenseQuery(homeQuery);
  const [lead, ...rest] = articles;

  return (
    <SiteLayout>
      <section className="container-page pt-10">
        <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <div className="rounded-2xl border border-border bg-card p-8 shadow-[var(--shadow-glow)]">
            <span className="kicker">Independent entertainment publication</span>
            <h1 className="mt-3 text-4xl leading-[1.03] sm:text-5xl">
              Everything worth watching, playing and arguing about.
            </h1>
            <p className="mt-4 max-w-xl text-muted-foreground">
              Pugclicks covers movies, TV, gaming and sports with sourced reporting and no filler.
              {" "}
              {RESPONSE_PROMISE}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/contact">Pitch a story</Link>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <Link to="/category/$slug" params={{ slug: "movies" }}>
                  Start reading
                </Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-4">
            {lead ? (
              <ArticleCard article={lead} featured />
            ) : (
              <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
                No published articles yet. Sign in to the editor dashboard to publish your first story.
              </div>
            )}
          </div>
        </div>
      </section>

      {CATEGORIES.map((cat) => {
        const items = rest.filter((a) => a.category === cat.slug).slice(0, 3);
        if (items.length === 0) return null;
        return (
          <section key={cat.slug} className="container-page pt-12">
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl">{cat.name}</h2>
                <p className="text-sm text-muted-foreground">{cat.blurb}</p>
              </div>
              <Link
                to="/category/$slug"
                params={{ slug: cat.slug }}
                className="text-sm font-semibold text-primary"
              >
                View all
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((a) => (
                <ArticleCard key={a.id} article={a} />
              ))}
            </div>
          </section>
        );
      })}

      <section className="container-page pt-14">
        <h2 className="text-2xl">Frequently asked questions</h2>
        <div className="mt-4 grid gap-3">
          {FAQS.map((f) => (
            <details key={f.q} className="rounded-xl border border-border bg-card p-4">
              <summary className="cursor-pointer font-semibold">{f.q}</summary>
              <p className="mt-2 text-sm text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}
