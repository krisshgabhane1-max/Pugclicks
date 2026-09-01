import { createFileRoute, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { ArticleCard } from "@/components/article-card";
import { Breadcrumbs, SiteLayout } from "@/components/site-layout";
import { listPublishedArticles } from "@/lib/articles.functions";
import { CATEGORIES } from "@/lib/site";

const categoryQuery = (slug: string) =>
  queryOptions({
    queryKey: ["articles", "category", slug],
    queryFn: () => listPublishedArticles({ data: { category: slug } }),
  });

export const Route = createFileRoute("/category/$slug")({
  loader: ({ context, params }) => {
    const category = CATEGORIES.find((c) => c.slug === params.slug);
    if (!category) throw notFound();
    return context.queryClient.ensureQueryData(categoryQuery(params.slug));
  },
  head: ({ params }) => {
    const category = CATEGORIES.find((c) => c.slug === params.slug);
    const name = category?.name ?? "Articles";
    const title = `${name} — Pugclicks`;
    const description = category?.blurb ?? `${name} coverage from Pugclicks.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:url", content: `/category/${params.slug}` },
      ],
      links: [{ rel: "canonical", href: `/category/${params.slug}` }],
    };
  },
  component: CategoryPage,
});

function CategoryPage() {
  const { slug } = Route.useParams();
  const { data: articles } = useSuspenseQuery(categoryQuery(slug));
  const category = CATEGORIES.find((c) => c.slug === slug);

  return (
    <SiteLayout>
      <div className="container-page pt-8">
        <Breadcrumbs items={[{ label: category?.name ?? slug }]} />
        <h1 className="mt-4 text-4xl">{category?.name}</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">{category?.blurb}</p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((a) => (
            <ArticleCard key={a.id} article={a} />
          ))}
        </div>
        {articles.length === 0 && (
          <p className="mt-8 text-sm text-muted-foreground">No published articles in this section yet.</p>
        )}
      </div>
    </SiteLayout>
  );
}
