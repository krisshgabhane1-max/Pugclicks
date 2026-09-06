import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { ExternalLink } from "lucide-react";
import { Breadcrumbs, SiteLayout } from "@/components/site-layout";
import { getSiteContent } from "@/lib/site-content.functions";

const contentQuery = queryOptions({
  queryKey: ["site-content", "public"],
  queryFn: () => getSiteContent(),
});

const OFFICIAL_LINKS: Record<string, string> = {
  google: "https://www.google.com",
  "google adsense": "https://adsense.google.com",
  adsense: "https://adsense.google.com",
  chatgpt: "https://chat.openai.com",
  openai: "https://openai.com",
  gemini: "https://gemini.google.com",
  lovable: "https://lovable.dev",
  supabase: "https://supabase.com",
};

function officialLink(name: string) {
  return OFFICIAL_LINKS[name.trim().toLowerCase()] ?? null;
}

export const Route = createFileRoute("/credits")({
  loader: ({ context }) => context.queryClient.ensureQueryData(contentQuery),
  head: () => ({
    meta: [
      { title: "Credits & Thanks — Pugclicks" },
      {
        name: "description",
        content: "The tools and services that help build Pugclicks, with links to their official pages.",
      },
      { property: "og:title", content: "Credits & Thanks — Pugclicks" },
      { property: "og:description", content: "Tools and services behind Pugclicks." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://pugclicks.lovable.app/credits" },
    ],
    links: [{ rel: "canonical", href: "https://pugclicks.lovable.app/credits" }],
  }),
  component: CreditsPage,
});

function CreditsPage() {
  const { data } = useSuspenseQuery(contentQuery);
  const credits = data.credits;

  return (
    <SiteLayout>
      <div className="container-page max-w-2xl py-10">
        <Breadcrumbs items={[{ label: "Credits" }]} />
        <h1 className="mt-6 text-4xl">{credits.title}</h1>
        <p className="mt-3 text-muted-foreground">{credits.intro}</p>

        <ul className="mt-8 grid gap-3">
          {credits.items.map((item) => {
            const url = officialLink(item.name);
            return (
              <li key={item.name} className="rounded-xl border border-border bg-card p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <b className="font-display text-lg">{item.name}</b>
                  {url && (
                    <a
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-sm font-medium text-primary"
                    >
                      Official page <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{item.note}</p>
              </li>
            );
          })}
          {credits.items.length === 0 && (
            <li className="text-sm text-muted-foreground">No credits added yet.</li>
          )}
        </ul>
      </div>
    </SiteLayout>
  );
}
