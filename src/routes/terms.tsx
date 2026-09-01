import { createFileRoute } from "@tanstack/react-router";
import { Breadcrumbs, SiteLayout } from "@/components/site-layout";
import { CONTACT_EMAIL } from "@/lib/site";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Use — Pugclicks" },
      {
        name: "description",
        content:
          "The rules for using Pugclicks: content ownership, quoting and republishing, accuracy, and third-party links.",
      },
      { property: "og:title", content: "Terms of Use — Pugclicks" },
      { property: "og:description", content: "Content ownership, republishing rules and accuracy at Pugclicks." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/terms" },
    ],
    links: [{ rel: "canonical", href: "/terms" }],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <SiteLayout>
      <div className="container-page max-w-3xl pt-8">
        <Breadcrumbs items={[{ label: "Terms" }]} />
        <h1 className="mt-4 text-4xl">Terms of use</h1>
        <div className="article-prose mt-6 space-y-5">
          <p>
            By using Pugclicks you accept these terms. Review them against your actual operation before launch.
          </p>
          <h2 className="text-2xl text-foreground">Content ownership</h2>
          <p>
            Articles published on Pugclicks belong to Pugclicks or the credited contributor. You may quote short
            extracts with a visible link back to the original article.
          </p>
          <h2 className="text-2xl text-foreground">Republishing</h2>
          <p>
            Full-article republishing, translation or AI-generated derivatives require written permission. Write
            to {CONTACT_EMAIL}.
          </p>
          <h2 className="text-2xl text-foreground">Accuracy</h2>
          <p>
            We aim for accuracy and correct mistakes promptly, but articles are provided as-is and reflect the
            information available at publication.
          </p>
          <h2 className="text-2xl text-foreground">Third-party links</h2>
          <p>
            Pugclicks links to external sites for sourcing. We are not responsible for their content or their
            privacy practices.
          </p>
        </div>
      </div>
    </SiteLayout>
  );
}
