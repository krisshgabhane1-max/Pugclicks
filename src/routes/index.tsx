import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight, Bot, Flame, GraduationCap, Smartphone, Star, Workflow, type LucideIcon } from "lucide-react";
import { ArticleCard, ArticleMedia } from "@/components/article-card";
import { NewsletterCta, SiteLayout } from "@/components/site-layout";
import { Button } from "@/components/ui/button";
import { AdSlot } from "@/components/ad-slot";
import {
  articleCategories,
  listPublishedArticles,
  listTrendingArticles,
  type Article,
} from "@/lib/articles.functions";
import {
  categoryName,
  readingTime,
  timeAgo,
  START_HERE,
  TOOLS,
  TOPIC_CARDS,
  TRUST_LINE,
} from "@/lib/site";

const homeQuery = queryOptions({
  queryKey: ["articles", "home"],
  queryFn: () => listPublishedArticles({ data: {} }),
});

const trendingQuery = queryOptions({
  queryKey: ["articles", "trending"],
  queryFn: () => listTrendingArticles({ data: { limit: 5 } }),
});

const TITLE = "Pugclicks — AI & Technology, Made Simple";
const DESCRIPTION =
  "Practical guides, useful AI tools, and technology tutorials that actually help you get things done.";

export const Route = createFileRoute("/")({
  loader: async ({ context }) => {
    const [articles] = await Promise.all([
      context.queryClient.ensureQueryData(homeQuery),
      context.queryClient.ensureQueryData(trendingQuery).catch(() => [] as Article[]),
    ]);
    return articles;
  },
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

const TOPIC_ICONS: Record<string, LucideIcon> = {
  ai: Bot,
  tech: Smartphone,
  automation: Workflow,
  "student-tech": GraduationCap,
};

function TopicIcon({ slug }: { slug: string }) {
  const Icon = TOPIC_ICONS[slug] ?? Bot;
  return (
    <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-primary">
      <Icon className="h-5 w-5" aria-hidden />
    </span>
  );
}

/** Homepage category blocks: grouped sections, each 1 large story + smaller cards. */
const SECTION_GROUPS: { name: string; emoji: string; slugs: string[]; viewAll: string }[] = [
  { name: "Movies & Series", emoji: "🎬", slugs: ["movies", "series", "netflix", "action"], viewAll: "movies" },
  { name: "Gaming", emoji: "🎮", slugs: ["games"], viewAll: "games" },
  { name: "F1 & Sports", emoji: "🏎️", slugs: ["f1", "sports"], viewAll: "sports" },
  { name: "AI & Technology", emoji: "🤖", slugs: ["ai", "tech", "automation"], viewAll: "ai" },
];

function inGroup(article: Article, slugs: string[]) {
  return articleCategories(article).some((c) => slugs.includes(c));
}

function isFresh(a: Article) {
  return a.updated_at && a.published_at
    ? new Date(a.updated_at).getTime() - new Date(a.published_at).getTime() > 24 * 60 * 60 * 1000
    : false;
}

function FreshnessBadge({ article }: { article: Article }) {
  if (!isFresh(article)) return null;
  return (
    <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-semibold text-secondary-foreground">
      Updated {timeAgo(article.updated_at)}
    </span>
  );
}

function BreakingStrip({ articles }: { articles: Article[] }) {
  const items = articles.slice(0, 6);
  if (items.length === 0) return null;
  return (
    <div className="border-b border-border bg-card">
      <div className="container-page flex items-center gap-3 overflow-x-auto py-2 text-sm">
        <span className="flex shrink-0 items-center gap-1.5 font-bold text-primary">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
          </span>
          LATEST
        </span>
        {items.map((a) => (
          <Link
            key={a.id}
            to="/article/$slug"
            params={{ slug: a.slug }}
            className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
          >
            {a.title}
          </Link>
        ))}
      </div>
    </div>
  );
}

function HeroStory({ article }: { article: Article }) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)]">
      <Link to="/article/$slug" params={{ slug: article.slug }} className="block">
        <ArticleMedia
          alt={article.image_alt || article.title}
          src={article.cover_image}
          className="aspect-video h-auto w-full"
        />
        <div className="p-5 sm:p-7">
          <div className="flex flex-wrap items-center gap-2">
            <span className="kicker">{articleCategories(article).map(categoryName).join(" · ")}</span>
            <FreshnessBadge article={article} />
          </div>
          <h2 className="mt-2 text-2xl leading-tight group-hover:text-primary sm:text-4xl">
            {article.title}
          </h2>
          <p className="mt-3 line-clamp-2 text-muted-foreground">{article.excerpt}</p>
          <p className="mt-4 text-xs text-muted-foreground">
            {timeAgo(article.published_at)} · {readingTime(article.body)}
          </p>
          <Button asChild className="mt-4">
            <span>
              Read article <ArrowRight className="ml-1 h-4 w-4" />
            </span>
          </Button>
        </div>
      </Link>
    </article>
  );
}

function SecondaryStory({ article }: { article: Article }) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)]">
      <Link to="/article/$slug" params={{ slug: article.slug }} className="block">
        <ArticleMedia
          alt={article.image_alt || article.title}
          src={article.cover_image}
          className="h-36"
        />
        <div className="p-4">
          <span className="kicker">{articleCategories(article).map(categoryName).join(" · ")}</span>
          <h3 className="mt-1.5 line-clamp-2 text-lg leading-snug group-hover:text-primary">
            {article.title}
          </h3>
          <p className="mt-2 text-xs text-muted-foreground">{timeAgo(article.published_at)}</p>
        </div>
      </Link>
    </article>
  );
}

function LatestRow({ article }: { article: Article }) {
  return (
    <article className="group flex gap-4 rounded-2xl border border-border bg-card p-3 shadow-[var(--shadow-card)]">
      <Link to="/article/$slug" params={{ slug: article.slug }} className="flex w-full gap-4">
        <ArticleMedia
          alt={article.image_alt || article.title}
          src={article.cover_image}
          className="h-20 w-28 shrink-0 rounded-xl sm:h-24 sm:w-36"
        />
        <div className="min-w-0 flex-1 py-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="kicker">{articleCategories(article).map(categoryName).join(" · ")}</span>
            <FreshnessBadge article={article} />
          </div>
          <h3 className="mt-1 line-clamp-2 leading-snug group-hover:text-primary">{article.title}</h3>
          <p className="mt-1 hidden line-clamp-1 text-sm text-muted-foreground sm:block">
            {article.excerpt}
          </p>
          <p className="mt-1.5 text-xs text-muted-foreground">
            {timeAgo(article.published_at)} · {readingTime(article.body)}
          </p>
        </div>
      </Link>
    </article>
  );
}

function Home() {
  const { data: articles } = useSuspenseQuery(homeQuery);
  const { data: trending = [] } = useSuspenseQuery(trendingQuery);
  const [lead, second, third, ...rest] = articles;
  const editorsPicks = articles.filter((a) => a.is_editors_pick).slice(0, 4);

  return (
    <SiteLayout>
      <BreakingStrip articles={articles} />

      {/* Hero: one big story + two secondary stories */}
      {lead && (
        <section className="container-page pt-8 sm:pt-10">
          <div className="grid gap-5 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <HeroStory article={lead} />
            </div>
            <div className="grid gap-5">
              {second && <SecondaryStory article={second} />}
              {third && <SecondaryStory article={third} />}
            </div>
          </div>
        </section>
      )}

      {articles.length === 0 && (
        <section className="container-page pt-14">
          <div className="max-w-2xl">
            <h1 className="text-3xl leading-[1.08] sm:text-5xl">AI &amp; Technology, Made Simple.</h1>
            <p className="mt-4 text-base text-muted-foreground sm:text-lg">{DESCRIPTION}</p>
            <p className="mt-5 text-xs font-medium tracking-wide text-muted-foreground">{TRUST_LINE}</p>
          </div>
          <p className="mt-8 text-sm text-muted-foreground">No published articles yet.</p>
        </section>
      )}

      {/* Latest News feed */}
      {rest.length > 0 && (
        <section className="container-page pt-14 sm:pt-16" aria-labelledby="latest-news">
          <h2 id="latest-news" className="text-2xl">
            Latest News
          </h2>
          <div className="mt-5 grid gap-4">
            {rest.slice(0, 12).map((a) => (
              <LatestRow key={a.id} article={a} />
            ))}
          </div>
        </section>
      )}

      {/* Trending Now — from real page views */}
      {trending.length > 0 && (
        <section className="container-page pt-14 sm:pt-16" aria-labelledby="trending">
          <h2 id="trending" className="flex items-center gap-2 text-2xl">
            <Flame className="h-6 w-6 text-primary" aria-hidden /> Trending Now
          </h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {trending.map((a, i) => (
              <Link
                key={a.id}
                to="/article/$slug"
                params={{ slug: a.slug }}
                className="group flex items-start gap-3 rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)]"
              >
                <span className="font-mono text-2xl font-bold text-primary">{i + 1}</span>
                <div className="min-w-0">
                  <span className="kicker">{articleCategories(a).map(categoryName).join(" · ")}</span>
                  <h3 className="mt-1 line-clamp-2 leading-snug group-hover:text-primary">{a.title}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{timeAgo(a.published_at)}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <AdSlot />

      {/* Category sections: one large story + smaller cards */}
      {SECTION_GROUPS.map((group) => {
        const items = articles.filter((a) => inGroup(a, group.slugs));
        if (items.length === 0) return null;
        const [big, ...small] = items;
        return (
          <section
            key={group.name}
            className="container-page pt-14 sm:pt-16"
            aria-labelledby={`group-${group.viewAll}`}
          >
            <div className="mb-5 flex items-end justify-between gap-4">
              <h2 id={`group-${group.viewAll}`} className="text-2xl">
                {group.emoji} {group.name}{" "}
                <span className="text-base font-medium text-muted-foreground">({items.length})</span>
              </h2>
              <Link
                to="/category/$slug"
                params={{ slug: group.viewAll }}
                className="text-sm font-semibold text-primary"
              >
                View all →
              </Link>
            </div>
            <div className="grid gap-5 lg:grid-cols-2">
              <article className="group overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)]">
                <Link to="/article/$slug" params={{ slug: big.slug }} className="block">
                  <ArticleMedia
                    alt={big.image_alt || big.title}
                    src={big.cover_image}
                    className="h-52"
                  />
                  <div className="p-5">
                    <span className="kicker">{articleCategories(big).map(categoryName).join(" · ")}</span>
                    <h3 className="mt-2 text-xl leading-snug group-hover:text-primary">{big.title}</h3>
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{big.excerpt}</p>
                    <p className="mt-3 text-xs text-muted-foreground">
                      {timeAgo(big.published_at)} · {readingTime(big.body)}
                    </p>
                  </div>
                </Link>
              </article>
              <div className="grid gap-4">
                {small.slice(0, 3).map((a) => (
                  <LatestRow key={a.id} article={a} />
                ))}
              </div>
            </div>
          </section>
        );
      })}

      {/* Editor's Picks */}
      {editorsPicks.length > 0 && (
        <section className="container-page pt-14 sm:pt-16" aria-labelledby="editors-picks">
          <div className="rounded-2xl border-2 border-primary/40 bg-accent/40 p-6 sm:p-8">
            <h2 id="editors-picks" className="flex items-center gap-2 text-2xl">
              <Star className="h-6 w-6 text-primary" aria-hidden /> Editor's Picks
            </h2>
            <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {editorsPicks.map((a) => (
                <ArticleCard key={a.id} article={a} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Start here */}
      <section className="container-page pt-14 sm:pt-16">
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
      <section className="container-page pt-14 sm:pt-16">
        <h2 className="text-2xl">Explore Topics</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TOPIC_CARDS.map((cat) => (
            <Link
              key={cat.slug}
              to="/category/$slug"
              params={{ slug: cat.slug }}
              className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)] transition-colors hover:border-primary"
            >
              <TopicIcon slug={cat.slug} />
              <h3 className="mt-3 text-lg">{cat.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{cat.blurb}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Tools */}
      <section className="container-page pt-14 sm:pt-16">
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
