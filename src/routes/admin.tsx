import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/site-layout";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { claimAdmin } from "@/lib/admin.functions";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Editor Dashboard — Pugclicks" },
      { name: "description", content: "Create, edit, publish and delete Pugclicks articles." },
      { property: "og:title", content: "Editor Dashboard — Pugclicks" },
      { property: "og:description", content: "Pugclicks publishing dashboard for editors." },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminLayout,
});

const TABS = [
  { to: "/admin", label: "Posts", exact: true },
  { to: "/admin/site", label: "Site editor", exact: false },
  { to: "/admin/seo", label: "Search & sharing", exact: false },
  { to: "/admin/users", label: "Users", exact: false },
  { to: "/admin/comments", label: "Comments", exact: false },
] as const;

function AdminLayout() {
  const { user, isAdmin, loading } = useAuth();
  const [claiming, setClaiming] = useState(false);
  const claimAdminFn = useServerFn(claimAdmin);

  async function handleClaimAdmin() {
    setClaiming(true);
    try {
      const result = await claimAdminFn();
      if (result.granted) {
        toast.success("Admin access granted");
        window.location.reload();
      } else {
        toast.error("An admin already exists. Ask them to grant you access.");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not claim admin access");
    } finally {
      setClaiming(false);
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  if (loading) {
    return (
      <SiteLayout>
        <div className="container-page py-20 text-sm text-muted-foreground">Loading dashboard…</div>
      </SiteLayout>
    );
  }

  if (!user) {
    return (
      <SiteLayout>
        <div className="container-page max-w-md py-20">
          <h1 className="text-3xl">Editor dashboard</h1>
          <p className="mt-2 text-muted-foreground">Sign in with an editor account to continue.</p>
          <Button asChild className="mt-6">
            <Link to="/auth">Go to sign in</Link>
          </Button>
        </div>
      </SiteLayout>
    );
  }

  if (!isAdmin) {
    return (
      <SiteLayout>
        <div className="container-page max-w-md py-20">
          <h1 className="text-3xl">Almost there</h1>
          <p className="mt-2 text-muted-foreground">
            Signed in as {user.email}, but this account has no admin role yet. If you are setting up the site,
            claim admin now — this works only while no admin exists.
          </p>
          <Button className="mt-6" onClick={handleClaimAdmin} disabled={claiming}>
            Claim admin access
          </Button>
          <Button variant="secondary" className="mt-3 w-full" onClick={signOut}>
            Sign out
          </Button>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <div className="container-page py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl">Editor dashboard</h1>
            <p className="mt-1 text-sm text-muted-foreground">Signed in as {user.email}</p>
          </div>
          <Button variant="secondary" onClick={signOut}>
            Sign out
          </Button>
        </div>

        <nav className="mt-6 flex flex-wrap gap-2 border-b border-border pb-3">
          {TABS.map((tab) => (
            <Link
              key={tab.to}
              to={tab.to}
              activeOptions={{ exact: tab.exact }}
              className="rounded-full border border-border px-4 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "!bg-primary !text-primary-foreground !border-primary" }}
            >
              {tab.label}
            </Link>
          ))}
        </nav>

        <Outlet />
      </div>
    </SiteLayout>
  );
}
