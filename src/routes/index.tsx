import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { ArticleCard, ArticleMedia } from "@/components/article-card";
import { NewsletterCta, SiteLayout } from "@/components/site-layout";
import { Button } from "@/components/ui/button";
import { listPublishedArticles } from "@/lib/articles.functions";
import {
  categoryName,
  formatDate,
  readingTime,
  START_HERE,
  TOOLS,
  TOPIC_CARDS,
  TRUST_LINE,
} from "@/lib/site";

const homeQuery = queryOptions({
  queryKey: ["articles", "home"],
  queryFn: () => listPublishedArticles({ data: { limit: 24 } }),
});

const TITLE = "Pugclicks — AI & Technology, Made Simple";
const DESCRIPTION =
  "Practical guides, useful AI tools, and technology tutorials that actually help you get things done.";

export const Route = createFileRoute("/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(homeQuery),
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
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
      {/* Hero — compact on mobile by design */}
      <section className="container-page pt-10 sm:pt-16">
        <div className="max-w-2xl">
          <h1 className="text-3xl leading-[1.08] sm:text-5xl">AI &amp; Technology, Made Simple.</h1>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">{DESCRIPTION}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link to="/category/$slug" params={{ slug: "guides" }}>
                Explore Guides <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link to="/tools">AI Tools</Link>
            </Button>
          </div>
          <p className="mt-5 text-xs font-medium tracking-wide text-muted-foreground">{TRUST_LINE}</p>
        </div>
      </section>

      {/* Featured article */}
      {lead && (
        <section className="container-page pt-12 sm:pt-16">
          <div className="grid overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)] lg:grid-cols-2">
            <div className="p-6 sm:p-9">
              <span className="kicker">Featured guide</span>
              <h2 className="mt-3 text-2xl leading-tight sm:text-3xl">{lead.title}</h2>
              <p className="mt-3 line-clamp-3 text-muted-foreground">{lead.excerpt}</p>
              <p className="mt-4 text-xs text-muted-foreground">
                {categoryName(lead.category)} · {readingTime(lead.body)} · {formatDate(lead.published_at)}
              </p>
              <Button asChild variant="link" className="mt-4 px-0">
                <Link to="/article/$slug" params={{ slug: lead.slug }}>
                  Read guide <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <ArticleMedia
              alt={lead.image_alt || lead.title}
              className="order-first h-40 lg:order-last lg:h-full lg:min-h-64"
            />
          </div>
        </section>
      )}

      {/* Start here */}
      <section className="container-page pt-14 sm:pt-20">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)] sm:p-8">
          <span className="kicker">New to AI?</span>
          <h2 className="mt-2 text-2xl">Start with these 5 guides</h2>
          <ol className="mt-4 grid gap-2 sm:grid-cols-2">
            {START_HERE.map((item, i) => (
              <li key={item.slug}>
                <Link
                  to="/search"
                  search={{ q: item.title }}
                  className="flex items-center gap-3 rounded-xl border border-border px-3 py-2.5 text-sm font-medium transition-colors hover:border-primary hover:text-primary"
                >
                  <span className="font-mono text-xs text-muted-foreground">{i + 1}</span>
                  {item.title}
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Browse by category */}
      <section className="container-page pt-14 sm:pt-20">
        <h2 className="text-2xl">Explore Topics</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TOPIC_CARDS.map((cat) => (
            <Link
              key={cat.slug}
              to="/category/$slug"
              params={{ slug: cat.slug }}
              className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)] transition-colors hover:border-primary"
            >
              <span aria-hidden className="text-2xl">
                {cat.emoji}
              </span>
              <h3 className="mt-3 text-lg">{cat.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{cat.blurb}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Latest articles */}
      <section className="container-page pt-14 sm:pt-20">
        <div className="mb-5 flex items-end justify-between gap-4">
          <h2 className="text-2xl">Latest Guides</h2>
          <Link to="/category/$slug" params={{ slug: "guides" }} className="text-sm font-semibold text-primary">
            View all
          </Link>
        </div>
        {rest.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {rest.slice(0, 9).map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No published articles yet. Sign in to the editor dashboard to publish your first guide.
          </p>
        )}
      </section>

      {/* Tools */}
      <section className="container-page pt-14 sm:pt-20">
        <div className="mb-5 flex items-end justify-between gap-4">
          <h2 className="text-2xl">Useful Tools</h2>
          <Link to="/tools" className="text-sm font-semibold text-primary">
            All tools
          </Link>
        </div>
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)]">
          {TOOLS.map((t, i) => (
            <div
              key={t.name}
              className={`flex flex-col gap-1 px-5 py-4 sm:flex-row sm:items-center sm:justify-between ${
                i > 0 ? "border-t border-border" : ""
              }`}
            >
              <span className="font-semibold">{t.name}</span>
              <span className="text-sm text-muted-foreground">{t.does}</span>
            </div>
          ))}
        </div>
      </section>

      <NewsletterCta />
    </SiteLayout>
  );
}
