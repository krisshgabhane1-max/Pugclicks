import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/site-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/profile")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Your Profile — Pugclicks" },
      { name: "description", content: "Manage your Pugclicks profile, username and bio." },
      { property: "og:title", content: "Your Profile — Pugclicks" },
      { property: "og:description", content: "Manage your Pugclicks reader profile." },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user, loading, isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ username: "", display_name: "", bio: "" });

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, display_name, bio")
        .eq("id", user!.id)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return data;
    },
  });

  const { data: counts } = useQuery({
    queryKey: ["profile-counts", user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const [followers, following, likes] = await Promise.all([
        supabase.from("follows").select("id", { count: "exact", head: true }).eq("following_id", user!.id),
        supabase.from("follows").select("id", { count: "exact", head: true }).eq("follower_id", user!.id),
        supabase.from("article_likes").select("id", { count: "exact", head: true }).eq("user_id", user!.id),
      ]);
      return {
        followers: followers.count ?? 0,
        following: following.count ?? 0,
        likes: likes.count ?? 0,
      };
    },
  });

  useEffect(() => {
    if (profile) {
      setForm({
        username: profile.username ?? "",
        display_name: profile.display_name ?? "",
        bio: profile.bio ?? "",
      });
    } else if (user && profile === null) {
      setForm((f) => ({ ...f, username: (user.email ?? "reader").split("@")[0]! }));
    }
  }, [profile, user]);

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        id: user!.id,
        username: form.username.trim().toLowerCase().replace(/[^a-z0-9_]/g, ""),
        display_name: form.display_name.trim(),
        bio: form.bio.trim(),
      };
      const { error } = await supabase.from("profiles").upsert(payload);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success("Profile saved");
      queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  if (loading) {
    return (
      <SiteLayout>
        <div className="container-page py-20 text-sm text-muted-foreground">Loading profile…</div>
      </SiteLayout>
    );
  }

  if (!user) {
    return (
      <SiteLayout>
        <div className="container-page max-w-md py-20">
          <h1 className="text-3xl">Your profile</h1>
          <p className="mt-2 text-muted-foreground">Sign in to manage your Pugclicks profile.</p>
          <Button asChild className="mt-6">
            <Link to="/login">Sign in</Link>
          </Button>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <div className="container-page max-w-2xl py-12">
        <h1 className="text-3xl">Your profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {[
            { label: "Followers", value: counts?.followers ?? 0 },
            { label: "Following", value: counts?.following ?? 0 },
            { label: "Liked articles", value: counts?.likes ?? 0 },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl border border-border bg-card p-5">
              <span className="text-xs uppercase tracking-wide text-muted-foreground">{stat.label}</span>
              <b className="mt-1 block font-display text-2xl">{stat.value}</b>
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-4 rounded-xl border border-border bg-card p-6">
          <div className="grid gap-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={form.username}
              onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
              className="bg-secondary"
            />
            <span className="text-xs text-muted-foreground">
              Lowercase letters, numbers and underscores only.
            </span>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="display_name">Display name</Label>
            <Input
              id="display_name"
              value={form.display_name}
              onChange={(e) => setForm((f) => ({ ...f, display_name: e.target.value }))}
              className="bg-secondary"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              rows={3}
              value={form.bio}
              onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
              className="bg-secondary"
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => save.mutate()} disabled={!form.username || save.isPending}>
              Save profile
            </Button>
            <Button asChild variant="secondary">
              <Link to="/notifications">Notifications</Link>
            </Button>
            {isAdmin && (
              <Button asChild variant="ghost">
                <Link to="/admin">Editor dashboard</Link>
              </Button>
            )}
          </div>
        </div>

        <Button
          variant="secondary"
          className="mt-6"
          onClick={async () => {
            await queryClient.cancelQueries();
            queryClient.clear();
            await supabase.auth.signOut();
            window.location.href = "/";
          }}
        >
          Sign out
        </Button>
      </div>
    </SiteLayout>
  );
}
