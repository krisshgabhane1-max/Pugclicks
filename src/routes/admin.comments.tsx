import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { formatDate } from "@/lib/site";

export const Route = createFileRoute("/admin/comments")({
  head: () => ({
    meta: [
      { title: "Comments — Pugclicks Admin" },
      { name: "description", content: "Moderate reader comments on Pugclicks articles." },
      { property: "og:title", content: "Comments — Pugclicks Admin" },
      { property: "og:description", content: "Comment moderation queue." },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminComments,
});

type CommentRow = {
  id: string;
  body: string;
  created_at: string;
  user_id: string;
  articles: { slug: string; title: string } | null;
  profiles: { username: string; display_name: string } | null;
};

function AdminComments() {
  const { user, isAdmin } = useAuth();
  const queryClient = useQueryClient();

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ["admin", "comments"],
    enabled: Boolean(user && isAdmin),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("comments")
        .select("id, body, created_at, user_id, articles(slug, title)")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw new Error(error.message);
      const rows = (data ?? []) as unknown as CommentRow[];

      const ids = [...new Set(rows.map((r) => r.user_id))];
      if (ids.length) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, username, display_name")
          .in("id", ids);
        const byId = new Map((profiles ?? []).map((p) => [p.id, p]));
        rows.forEach((row) => {
          row.profiles = byId.get(row.user_id) ?? null;
        });
      }
      return rows;
    },
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("comments").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success("Comment removed");
      queryClient.invalidateQueries({ queryKey: ["admin", "comments"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <section className="mt-8">
      <h2 className="text-2xl">Comment moderation</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Newest first. Removing a comment is permanent.
      </p>

      {isLoading ? (
        <p className="mt-4 text-sm text-muted-foreground">Loading comments…</p>
      ) : comments.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">No comments yet.</p>
      ) : (
        <ul className="mt-4 grid gap-3">
          {comments.map((comment) => (
            <li key={comment.id} className="rounded-xl border border-border bg-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">
                    {comment.profiles?.display_name || comment.profiles?.username || "Reader"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(comment.created_at)}
                    {comment.articles && (
                      <>
                        {" · "}
                        <Link
                          to="/article/$slug"
                          params={{ slug: comment.articles.slug }}
                          className="text-primary"
                        >
                          {comment.articles.title}
                        </Link>
                      </>
                    )}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="destructive"
                  aria-label="Delete comment"
                  onClick={() => {
                    if (window.confirm("Delete this comment? This cannot be undone.")) {
                      remove.mutate(comment.id);
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm">{comment.body}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
