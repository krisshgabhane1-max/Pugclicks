import { Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Heart, Share2, Link2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { formatDate } from "@/lib/site";

type CommentRow = {
  id: string;
  body: string;
  created_at: string;
  user_id: string;
  author?: { username: string; display_name: string } | null;
};

export function ArticleEngagement({
  articleId,
  title,
  slug,
}: {
  articleId: string;
  title: string;
  slug: string;
}) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState("");

  const likesQuery = useQuery({
    queryKey: ["likes", articleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("article_likes")
        .select("user_id")
        .eq("article_id", articleId);
      if (error) throw new Error(error.message);
      return data ?? [];
    },
  });

  const commentsQuery = useQuery({
    queryKey: ["comments", articleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("comments")
        .select("id, body, created_at, user_id")
        .eq("article_id", articleId)
        .order("created_at", { ascending: true });
      if (error) throw new Error(error.message);
      const rows = (data ?? []) as CommentRow[];
      const ids = [...new Set(rows.map((r) => r.user_id))];
      if (ids.length) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, username, display_name")
          .in("id", ids);
        const byId = new Map((profiles ?? []).map((p) => [p.id, p]));
        rows.forEach((r) => {
          r.author = byId.get(r.user_id) ?? null;
        });
      }
      return rows;
    },
  });

  const likes = likesQuery.data ?? [];
  const liked = Boolean(user && likes.some((l) => l.user_id === user.id));

  const toggleLike = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Sign in to like this article");
      if (liked) {
        const { error } = await supabase
          .from("article_likes")
          .delete()
          .eq("article_id", articleId)
          .eq("user_id", user.id);
        if (error) throw new Error(error.message);
      } else {
        const { error } = await supabase
          .from("article_likes")
          .insert({ article_id: articleId, user_id: user.id });
        if (error) throw new Error(error.message);
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["likes", articleId] }),
    onError: (error: Error) => toast.error(error.message),
  });

  const addComment = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Sign in to comment");
      const { error } = await supabase
        .from("comments")
        .insert({ article_id: articleId, user_id: user.id, body: draft.trim() });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      setDraft("");
      toast.success("Comment posted");
      queryClient.invalidateQueries({ queryKey: ["comments", articleId] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const removeComment = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("comments").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["comments", articleId] }),
    onError: (error: Error) => toast.error(error.message),
  });

  const url = typeof window === "undefined" ? `/article/${slug}` : `${window.location.origin}/article/${slug}`;

  async function share() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        // user cancelled — fall through to copy
      }
    }
    await copyLink();
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied");
    } catch {
      toast.error("Could not copy the link");
    }
  }

  const comments = commentsQuery.data ?? [];

  return (
    <section className="mt-10 border-t border-border pt-8">
      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant={liked ? "default" : "secondary"}
          onClick={() => (user ? toggleLike.mutate() : toast.error("Sign in to like this article"))}
          aria-pressed={liked}
        >
          <Heart className={`mr-2 h-4 w-4 ${liked ? "fill-current" : ""}`} />
          {likes.length} {likes.length === 1 ? "like" : "likes"}
        </Button>
        <Button variant="secondary" onClick={share}>
          <Share2 className="mr-2 h-4 w-4" /> Share
        </Button>
        <Button variant="ghost" onClick={copyLink}>
          <Link2 className="mr-2 h-4 w-4" /> Copy link
        </Button>
        <a
          className="text-sm text-muted-foreground hover:text-foreground"
          href={`https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`}
          target="_blank"
          rel="noreferrer"
        >
          WhatsApp
        </a>
      </div>

      <div className="mt-10">
        <h2 className="flex items-center gap-2 text-2xl">
          <MessageCircle className="h-5 w-5 text-primary" />
          Comments ({comments.length})
        </h2>

        {user ? (
          <div className="mt-4 grid gap-3">
            <Textarea
              rows={3}
              value={draft}
              placeholder="Share what worked for you…"
              onChange={(e) => setDraft(e.target.value)}
              className="bg-secondary"
              aria-label="Write a comment"
            />
            <div>
              <Button
                onClick={() => addComment.mutate()}
                disabled={!draft.trim() || addComment.isPending}
              >
                Post comment
              </Button>
            </div>
          </div>
        ) : (
          <p className="mt-4 rounded-xl border border-border bg-card p-5 text-sm">
            <Link to="/login" className="font-semibold text-primary">
              Sign in
            </Link>{" "}
            or{" "}
            <Link to="/signup" className="font-semibold text-primary">
              create a free account
            </Link>{" "}
            to like and comment.
          </p>
        )}

        <ul className="mt-6 grid gap-4">
          {comments.map((comment) => (
            <li key={comment.id} className="rounded-xl border border-border bg-card p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold">
                  {comment.author?.display_name || comment.author?.username || "Reader"}
                </p>
                <span className="text-xs text-muted-foreground">{formatDate(comment.created_at)}</span>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{comment.body}</p>
              {user?.id === comment.user_id && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="mt-2 px-0 text-destructive"
                  onClick={() => removeComment.mutate(comment.id)}
                >
                  Delete
                </Button>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
