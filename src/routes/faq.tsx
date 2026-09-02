import { createFileRoute, Link } from "@tanstack/react-router";
import { Breadcrumbs, SiteLayout } from "@/components/site-layout";
import { Button } from "@/components/ui/button";
import { FAQS, RESPONSE_PROMISE } from "@/lib/site";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "Pugclicks FAQs — Coverage, Tools & Corrections" },
      {
        name: "description",
        content:
          "Answers about what Pugclicks covers, how beginner-friendly the guides are, our 2–3 business-day reply promise and how tool recommendations work.",
      },
      { property: "og:title", content: "Pugclicks FAQs" },
      { property: "og:description", content: "How Pugclicks handles guides, tool recommendations and corrections." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/faq" },
    ],
    links: [{ rel: "canonical", href: "/faq" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQS.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }),
      },
    ],
  }),
  component: FaqPage,
});

function FaqPage() {
  return (
    <SiteLayout>
      <div className="container-page max-w-3xl pt-8">
        <Breadcrumbs items={[{ label: "FAQs" }]} />
        <h1 className="mt-4 text-4xl">Frequently asked questions</h1>
        <p className="mt-2 text-muted-foreground">{RESPONSE_PROMISE}</p>

        <div className="mt-8 grid gap-3">
          {FAQS.map((f) => (
            <details key={f.q} className="rounded-xl border border-border bg-card p-4">
              <summary className="cursor-pointer font-semibold">{f.q}</summary>
              <p className="mt-2 text-sm text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>

        <Button asChild className="mt-8">
          <Link to="/contact">Ask something else</Link>
        </Button>
      </div>
    </SiteLayout>
  );
}
