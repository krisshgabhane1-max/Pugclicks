import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { ExternalLink } from "lucide-react";
import { Breadcrumbs, SiteLayout } from "@/components/site-layout";
import { getSiteContent } from "@/lib/site-content.functions";

const contentQuery = queryOptions({
  queryKey: ["site-content", "public"],
  queryFn: () => getSiteContent(),
});

export const Route = createFileRoute("/referral")({
  loader: ({ context }) => context.queryClient.ensureQueryData(contentQuery),
  head: () => ({
    meta: [
      { title: "Recommended Tools — Pugclicks" },
      {
        name: "description",
        content: "AI, automation and productivity tools Pugclicks recommends, each linking to its official page.",
      },
      { property: "og:title", content: "Recommended Tools — Pugclicks" },
      { property: "og:description", content: "Tools Pugclicks recommends for AI, automation and study." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://pugclicks.lovable.app/referral" },
    ],
    links: [{ rel: "canonical", href: "https://pugclicks.lovable.app/referral" }],
  }),
  component: ReferralPage,
});

function ReferralPage() {
  const { data } = useSuspenseQuery(contentQuery);
  const referral = data.referral;

  return (
    <SiteLayout>
      <div className="container-page max-w-2xl py-10">
        <Breadcrumbs items={[{ label: "Recommended tools" }]} />
        <h1 className="mt-6 text-4xl">{referral.title}</h1>
        <p className="mt-3 text-muted-foreground">{referral.intro}</p>

        <ul className="mt-8 grid gap-3">
          {referral.items.map((item, index) => (
            <li key={`${item.name}-${index}`} className="rounded-xl border border-border bg-card p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <b className="font-display text-lg">{item.name}</b>
                  <p className="mt-1 text-sm text-muted-foreground">{item.what}</p>
                </div>
                {item.url && (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer sponsored"
                    className="inline-flex items-center gap-1 text-sm font-medium text-primary"
                  >
                    Visit <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>
            </li>
          ))}
          {referral.items.length === 0 && (
            <li className="text-sm text-muted-foreground">
              No tools listed yet — add them from the admin area.
            </li>
          )}
        </ul>
      </div>
    </SiteLayout>
  );
}
