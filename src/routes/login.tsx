import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { AuthPanel } from "@/components/auth-panel";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign In — Pugclicks" },
      { name: "description", content: "Sign in to your Pugclicks account to follow, like and comment on AI and tech guides." },
      { property: "og:title", content: "Sign In — Pugclicks" },
      { property: "og:description", content: "Sign in to your Pugclicks reader account." },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <SiteLayout>
      <AuthPanel mode="signin" />
    </SiteLayout>
  ),
});
