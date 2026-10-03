import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { ArticleCard, ArticleMedia } from "@/components/article-card";
import { Breadcrumbs, SiteLayout } from "@/components/site-layout";
import { Button } from "@/components/ui/button";
import { getArticleBySlug } from "@/lib/articles.functions";
import { categoryName, formatDate, RESPONSE_PROMISE } from "@/lib/site";
import { ArticleEngagement } from "@/components/article-engagement";
import { ArticleBody, AuthorBox, KeyInsights, ReadAloud, ShareRow, TableOfContents, keyPoints, parseBody } from "@/components/article-extras";

const BASE = "https://pugclicks.lovable.app";

const articleQuery = (slug: string) =>
  queryOptions({
    queryKey: ["article", slug],
    queryFn: () => getArticleBySlug({ data: { slug } }),
  });

export const Route = createFileRoute("/article/$slug")({
  loader: async ({ context, params }) => {
    const result = await context.queryClient.ensureQueryData(articleQuery(params.slug));
    if (!result.article) throw notFound();
    return result;
  },
  head: ({ params, loaderData }) => {
    const article = loaderData?.article;
    const title = article ? `${article.title} — Pugclicks` : "Article — Pugclicks";
    const description = article?.excerpt ?? "Practical AI and technology guides from Pugclicks.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { property: "og:url", content: `${BASE}/article/${params.slug}` },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        ...(article?.cover_image?.startsWith("https://")
          ? [
              { property: "og:image", content: article.cover_image },
              { name: "twitter:image", content: article.cover_image },
            ]
          : []),
      ],
      links: [{ rel: "canonical", href: `${BASE}/article/${params.slug}` }],
      scripts: article
        ? [
            {
              type: "application/ld+json",
              children: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Article",
                headline: article.title,
                description: article.excerpt,
                author: { "@type": "Organization", name: article.author },
                datePublished: article.published_at,
                mainEntityOfPage: `${BASE}/article/${article.slug}`,
                publisher: { "@type": "Organization", name: "Pugclicks", url: BASE },
                ...(article.cover_image?.startsWith("https://") ? { image: [article.cover_image] } : {}),
                articleSection: categoryName(article.category),
              }),
            },
          ]
        : [],
    };
  },
  component: ArticlePage,
});

function ArticlePage() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(articleQuery(slug));
  const article = data.article!;
  const blocks = parseBody(article.body);
  const url = `${BASE}/article/${article.slug}`;

  return (
    <SiteLayout>
      <div className="container-page pt-8">
        <div className="mx-auto max-w-3xl">
          <Breadcrumbs
            items={[
              { label: categoryName(article.category), to: `/category/${article.category}` },
              { label: article.title },
            ]}
          />
          <span className="kicker mt-6 block">{categoryName(article.category)}</span>
          <h1 className="mt-2 text-4xl leading-[1.05] sm:text-5xl">{article.title}</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            By {article.author} · {formatDate(article.published_at)}
          </p>

          <div className="mt-6 overflow-hidden rounded-xl border border-border bg-muted">
            <ArticleMedia
              alt={article.image_alt || article.title}
              src={article.cover_image}
              full
              className="h-64"
            />
          </div>

          <p className="mt-6 text-lg text-foreground">{article.excerpt}</p>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <ReadAloud text={`${article.title}. ${article.excerpt}. ${article.body.replace(/[#|*-]/g, " ")}`} />
            <ShareRow url={url} text={article.title} />
          </div>
          <KeyInsights points={keyPoints(blocks)} url={url} />
          <TableOfContents blocks={blocks} />
          <ArticleBody blocks={blocks} />
          <AuthorBox name={article.author || "Pugclicks Staff"} />

          <ArticleEngagement articleId={article.id} title={article.title} slug={article.slug} />

          <div className="mt-10 rounded-xl border border-border bg-card p-6">
            <h2 className="text-xl">Spotted something wrong?</h2>
            <p className="mt-2 text-sm text-muted-foreground">{RESPONSE_PROMISE}</p>
            <Button asChild className="mt-4">
              <Link to="/contact">Send a correction</Link>
            </Button>
          </div>
        </div>

        {data.related.length > 0 && (
          <section className="mt-14">
            <h2 className="text-2xl">Related reading</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {data.related.map((a) => (
                <ArticleCard key={a.id} article={a} />
              ))}
            </div>
          </section>
        )}
      </div>
    </SiteLayout>
  );
}
