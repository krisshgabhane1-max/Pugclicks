import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { AuthPanel } from "@/components/auth-panel";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create Account — Pugclicks" },
      { name: "description", content: "Create a free Pugclicks account to follow new AI and technology guides, like articles and comment." },
      { property: "og:title", content: "Create Account — Pugclicks" },
      { property: "og:description", content: "Join Pugclicks — follow, like and comment on practical AI and tech guides." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: () => (
    <SiteLayout>
      <AuthPanel mode="signup" />
    </SiteLayout>
  ),
});
