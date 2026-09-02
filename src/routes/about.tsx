import { createFileRoute, Link } from "@tanstack/react-router";
import { UserRound } from "lucide-react";
import { Breadcrumbs, SiteLayout } from "@/components/site-layout";
import { Button } from "@/components/ui/button";
import { RESPONSE_PROMISE } from "@/lib/site";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Pugclicks — Editorial Standards & Team" },
      {
        name: "description",
        content:
          "Who runs Pugclicks, how we test AI and tech tools, how corrections work, and how quickly we reply to readers.",
      },
      { property: "og:title", content: "About Pugclicks" },
      { property: "og:description", content: "Editorial standards and team information for Pugclicks." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/about" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: AboutPage,
});

const TEAM = [
  { role: "Editor", note: "Commissioning, standards and corrections." },
  { role: "Staff writer", note: "AI tools and automation guides." },
  { role: "Contributor", note: "Android, apps and student tech." },
];

function AboutPage() {
  return (
    <SiteLayout>
      <div className="container-page max-w-3xl pt-8">
        <Breadcrumbs items={[{ label: "About" }]} />
        <h1 className="mt-4 text-4xl">About Pugclicks</h1>
        <p className="mt-4 text-muted-foreground">
          Pugclicks publishes practical AI and technology guides: AI tools, automation workflows, everyday tech
          and study tools. We write for readers first: short where short is enough, long where the subject
          earns it.
        </p>

        <h2 className="mt-10 text-2xl">Editorial standards</h2>
        <ul className="mt-3 space-y-2 text-muted-foreground">
          <li>Every claim is attributed to a named or clearly described source.</li>
          <li>Corrections are appended with a timestamp, never edited in silently.</li>
          <li>Sponsored or gifted coverage is labelled at the top of the article.</li>
          <li>{RESPONSE_PROMISE}</li>
        </ul>

        <h2 className="mt-10 text-2xl">Team</h2>
        <div className="mt-2 rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
          Placeholder: real names, photos and bios have deliberately not been invented. Replace each card
          below with genuine team details before launch.
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {TEAM.map((member) => (
            <div key={member.role} className="rounded-xl border border-border bg-card p-5">
              <div
                role="img"
                aria-label={`Photo placeholder for the ${member.role.toLowerCase()}`}
                className="flex h-16 w-16 items-center justify-center rounded-full bg-accent text-muted-foreground"
              >
                <UserRound className="h-7 w-7" aria-hidden />
              </div>
              <h3 className="mt-3 text-lg">{member.role}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{member.note}</p>
              <p className="mt-2 text-xs text-primary">Name & photo placeholder</p>
            </div>
          ))}
        </div>

        <Button asChild className="mt-10">
          <Link to="/contact">Contact the newsroom</Link>
        </Button>
      </div>
    </SiteLayout>
  );
}
