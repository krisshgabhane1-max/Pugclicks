import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArticleCard } from "@/components/article-card";
import { Breadcrumbs, SiteLayout } from "@/components/site-layout";
import { listPublishedArticles } from "@/lib/articles.functions";

type SearchParams = { q?: string };

export const Route = createFileRoute("/search")({
  validateSearch: (search: Record<string, unknown>): SearchParams => ({
    q: typeof search.q === "string" ? search.q : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Search Pugclicks Articles" },
      { name: "description", content: "Search Pugclicks coverage of movies, TV, gaming, sports and news." },
      { property: "og:title", content: "Search Pugclicks Articles" },
      { property: "og:description", content: "Find Pugclicks articles by title, topic or keyword." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/search" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "/search" }],
  }),
  component: SearchPage,
});

function SearchPage() {
  const { q } = Route.useSearch();
  const { data: articles = [], isLoading } = useQuery({
    queryKey: ["articles", "search", q ?? ""],
    queryFn: () => listPublishedArticles({ data: { search: q } }),
    enabled: Boolean(q),
  });

  return (
    <SiteLayout>
      <div className="container-page pt-8">
        <Breadcrumbs items={[{ label: "Search" }]} />
        <h1 className="mt-4 text-4xl">Search</h1>
        <p className="mt-2 text-muted-foreground">
          {q ? `Results for “${q}”` : "Use the search box in the header to find an article."}
        </p>

        {isLoading && <p className="mt-8 text-sm text-muted-foreground">Searching…</p>}

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((a) => (
            <ArticleCard key={a.id} article={a} />
          ))}
        </div>

        {q && !isLoading && articles.length === 0 && (
          <p className="mt-8 text-sm text-muted-foreground">No articles matched that search.</p>
        )}
      </div>
    </SiteLayout>
  );
}
