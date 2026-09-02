import { createFileRoute, Link } from "@tanstack/react-router";
import { Breadcrumbs, NewsletterCta, SiteLayout } from "@/components/site-layout";
import { Button } from "@/components/ui/button";
import { TOOLS } from "@/lib/site";

const TITLE = "Tools We Recommend — AI, Automation & Productivity | Pugclicks";
const DESCRIPTION =
  "A short, honest list of AI, automation, productivity and developer tools worth your time, with what each one is actually good for.";

export const Route = createFileRoute("/tools")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: "Tools We Recommend" },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/tools" },
    ],
    links: [{ rel: "canonical", href: "/tools" }],
  }),
  component: ToolsPage,
});

function ToolsPage() {
  return (
    <SiteLayout>
      <div className="container-page pt-8">
        <Breadcrumbs items={[{ label: "Tools" }]} />
        <h1 className="mt-4 text-3xl sm:text-4xl">Useful Tools</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          A deliberately short list. Each entry is a category we cover in guides — replace the placeholders
          with the specific products you use and recommend. Any link that earns a commission is disclosed.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {TOOLS.map((t) => (
            <div key={t.name} className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
              <span className="kicker">{t.does}</span>
              <h2 className="mt-2 text-lg">{t.name}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{t.note}</p>
            </div>
          ))}
        </div>

        <Button asChild className="mt-8">
          <Link to="/category/$slug" params={{ slug: "guides" }}>
            Read the guides
          </Link>
        </Button>
      </div>
      <NewsletterCta />
    </SiteLayout>
  );
}
