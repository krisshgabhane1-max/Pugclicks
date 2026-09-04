import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { SiteLayout } from "@/components/site-layout";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { formatDate } from "@/lib/site";

export const Route = createFileRoute("/notifications")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Your Notifications — Pugclicks" },
      { name: "description", content: "New posts, comment replies and follows on your Pugclicks account." },
      { property: "og:title", content: "Your Notifications — Pugclicks" },
      { property: "og:description", content: "Your Pugclicks activity feed." },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: NotificationsPage,
});

function NotificationsPage() {
  const { user, loading } = useAuth();
  const queryClient = useQueryClient();

  const { data: items = [] } = useQuery({
    queryKey: ["notifications", user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("id, type, message, read_at, created_at")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw new Error(error.message);
      return data ?? [];
    },
  });

  const markAllRead = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("notifications")
        .update({ read_at: new Date().toISOString() })
        .is("read_at", null);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success("All caught up");
      queryClient.invalidateQueries({ queryKey: ["notifications", user?.id] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  if (loading) {
    return (
      <SiteLayout>
        <div className="container-page py-20 text-sm text-muted-foreground">Loading…</div>
      </SiteLayout>
    );
  }

  if (!user) {
    return (
      <SiteLayout>
        <div className="container-page max-w-md py-20">
          <h1 className="text-3xl">Notifications</h1>
          <p className="mt-2 text-muted-foreground">Sign in to see your notifications.</p>
          <Button asChild className="mt-6">
            <Link to="/login">Sign in</Link>
          </Button>
        </div>
      </SiteLayout>
    );
  }

  const unread = items.filter((i) => !i.read_at).length;

  return (
    <SiteLayout>
      <div className="container-page max-w-2xl py-12">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-3xl">Notifications</h1>
          {unread > 0 && (
            <Button variant="secondary" onClick={() => markAllRead.mutate()}>
              Mark all read ({unread})
            </Button>
          )}
        </div>

        {items.length === 0 ? (
          <p className="mt-6 rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground">
            Nothing yet. Follow Pugclicks and you'll be notified when a new guide goes live.
          </p>
        ) : (
          <ul className="mt-6 grid gap-3">
            {items.map((item) => (
              <li
                key={item.id}
                className={`rounded-xl border p-5 ${
                  item.read_at ? "border-border bg-card" : "border-primary/40 bg-primary/5"
                }`}
              >
                <p className="text-sm font-medium">{item.message || item.type}</p>
                <span className="mt-1 block text-xs text-muted-foreground">
                  {formatDate(item.created_at)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </SiteLayout>
  );
}
