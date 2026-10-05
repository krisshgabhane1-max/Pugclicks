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
      { title: "Pugclicks" },
      
      
      
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex, nofollow, noarchive" },
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

  if (!user || !isAdmin) {
    // Hidden: anyone without an admin role sees a plain "not found" page.
    return (
      <SiteLayout>
        <div className="container-page max-w-md py-20 text-center">
          <h1 className="text-3xl">Page not found</h1>
          <p className="mt-2 text-muted-foreground">The page you are looking for does not exist.</p>
          <Button asChild className="mt-6">
            <Link to="/">Back to home</Link>
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
