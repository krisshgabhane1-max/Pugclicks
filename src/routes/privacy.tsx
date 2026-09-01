import { createFileRoute } from "@tanstack/react-router";
import { Breadcrumbs, SiteLayout } from "@/components/site-layout";
import { CONTACT_EMAIL, RESPONSE_PROMISE } from "@/lib/site";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Pugclicks" },
      {
        name: "description",
        content:
          "How Pugclicks handles reader data, contact messages, analytics and cookies, and how to request deletion.",
      },
      { property: "og:title", content: "Privacy Policy — Pugclicks" },
      { property: "og:description", content: "Data, analytics and cookie practices at Pugclicks." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/privacy" },
    ],
    links: [{ rel: "canonical", href: "/privacy" }],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <SiteLayout>
      <div className="container-page max-w-3xl pt-8">
        <Breadcrumbs items={[{ label: "Privacy policy" }]} />
        <h1 className="mt-4 text-4xl">Privacy policy</h1>
        <div className="article-prose mt-6 space-y-5">
          <p>
            This policy describes how Pugclicks handles information from readers. Review and adjust it to match
            your actual setup before launch.
          </p>
          <h2 className="text-2xl text-foreground">Information we collect</h2>
          <p>
            Reading Pugclicks does not require an account. If you send us a message, we keep the name, email
            address and message content you provide so we can reply.
          </p>
          <h2 className="text-2xl text-foreground">Analytics</h2>
          <p>
            The site is structured so an analytics provider can be added later. No analytics or advertising
            tracker is loaded today. If one is added, this page will name the provider and describe the data it
            receives before that change ships.
          </p>
          <h2 className="text-2xl text-foreground">Cookies</h2>
          <p>
            Editors who sign in to the dashboard receive a session cookie so they stay signed in. No advertising
            cookies are set.
          </p>
          <h2 className="text-2xl text-foreground">Your choices</h2>
          <p>
            You can ask us to delete any message you sent, or to correct information about you in an article.
            Write to {CONTACT_EMAIL}. {RESPONSE_PROMISE}
          </p>
        </div>
      </div>
    </SiteLayout>
  );
}
