import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { SiteLayout } from "@/components/site-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { CATEGORIES, categoryName, formatDate } from "@/lib/site";
import type { Article } from "@/lib/articles.functions";
import { claimAdmin } from "@/lib/admin.functions";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Editor Dashboard — Pugclicks" },
      { name: "description", content: "Create, edit, publish and delete Pugclicks articles." },
      { property: "og:title", content: "Editor Dashboard — Pugclicks" },
      { property: "og:description", content: "Pugclicks publishing dashboard for editors." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/admin" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "/admin" }],
  }),
  component: AdminPage,
});

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

const EMPTY = {
  id: "",
  title: "",
  slug: "",
  category: "ai",
  excerpt: "",
  body: "",
  author: "Pugclicks Staff",
  image_alt: "",
};

function AdminPage() {
  const { user, isAdmin, loading } = useAuth();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ ...EMPTY });
  const [claiming, setClaiming] = useState(false);

  const { data: articles = [], isLoading } = useQuery({
    queryKey: ["admin", "articles"],
    enabled: Boolean(user && isAdmin),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("articles")
        .select("id, slug, title, category, excerpt, body, author, image_alt, status, published_at")
        .order("created_at", { ascending: false });
      if (error) throw new Error(error.message);
      return (data ?? []) as Article[];
    },
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin", "articles"] });
    queryClient.invalidateQueries({ queryKey: ["articles"] });
  };

  const save = useMutation({
    mutationFn: async (status: "draft" | "published") => {
      const payload = {
        title: form.title,
        slug: form.slug || slugify(form.title),
        category: form.category,
        excerpt: form.excerpt,
        body: form.body,
        author: form.author,
        image_alt: form.image_alt,
        status,
        published_at: status === "published" ? new Date().toISOString() : null,
      };
      if (form.id) {
        const { error } = await supabase.from("articles").update(payload).eq("id", form.id);
        if (error) throw new Error(error.message);
      } else {
        const { error } = await supabase.from("articles").insert(payload);
        if (error) throw new Error(error.message);
      }
    },
    onSuccess: (_d, status) => {
      toast.success(status === "published" ? "Article published" : "Draft saved");
      setForm({ ...EMPTY });
      invalidate();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const setStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "draft" | "published" }) => {
      const { error } = await supabase
        .from("articles")
        .update({ status, published_at: status === "published" ? new Date().toISOString() : null })
        .eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success("Status updated");
      invalidate();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("articles").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success("Article deleted");
      invalidate();
    },
    onError: (error: Error) => toast.error(error.message),
  });

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
          <Button className="mt-6" onClick={claimAdmin} disabled={claiming}>
            Claim admin access
          </Button>
          <Button
            variant="secondary"
            className="mt-3 w-full"
            onClick={async () => {
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

  const drafts = articles.filter((a) => a.status === "draft");
  const published = articles.filter((a) => a.status === "published");

  return (
    <SiteLayout>
      <div className="container-page py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl">Editor dashboard</h1>
            <p className="mt-1 text-sm text-muted-foreground">Signed in as {user.email}</p>
          </div>
          <Button
            variant="secondary"
            onClick={async () => {
              await supabase.auth.signOut();
              window.location.href = "/";
            }}
          >
            Sign out
          </Button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {[
            { label: "Total articles", value: articles.length },
            { label: "Published", value: published.length },
            { label: "Drafts", value: drafts.length },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl border border-border bg-card p-5">
              <span className="text-xs uppercase tracking-wide text-muted-foreground">{stat.label}</span>
              <b className="mt-1 block font-display text-3xl">{stat.value}</b>
            </div>
          ))}
        </div>

        <section className="mt-10 rounded-xl border border-border bg-card p-6">
          <h2 className="text-2xl">{form.id ? "Edit article" : "New article"}</h2>
          <div className="mt-5 grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    title: e.target.value,
                    slug: f.id ? f.slug : slugify(e.target.value),
                  }))
                }
                className="bg-secondary"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="grid gap-2 sm:col-span-2">
                <Label htmlFor="slug">URL slug</Label>
                <Input
                  id="slug"
                  value={form.slug}
                  onChange={(e) => setForm((f) => ({ ...f, slug: slugify(e.target.value) }))}
                  className="bg-secondary"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  className="h-10 rounded-md border border-input bg-secondary px-3 text-sm"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="author">Author</Label>
                <Input
                  id="author"
                  value={form.author}
                  onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))}
                  className="bg-secondary"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="image_alt">Image alt text</Label>
                <Input
                  id="image_alt"
                  value={form.image_alt}
                  onChange={(e) => setForm((f) => ({ ...f, image_alt: e.target.value }))}
                  className="bg-secondary"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="excerpt">Excerpt / meta description</Label>
              <Textarea
                id="excerpt"
                rows={2}
                value={form.excerpt}
                onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
                className="bg-secondary"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="body">Body (blank line between paragraphs)</Label>
              <Textarea
                id="body"
                rows={12}
                value={form.body}
                onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
                className="bg-secondary"
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => save.mutate("published")}
                disabled={!form.title || save.isPending}
              >
                Publish
              </Button>
              <Button
                variant="secondary"
                onClick={() => save.mutate("draft")}
                disabled={!form.title || save.isPending}
              >
                Save as draft
              </Button>
              {form.id && (
                <Button variant="ghost" onClick={() => setForm({ ...EMPTY })}>
                  Cancel edit
                </Button>
              )}
            </div>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl">All articles</h2>
          {isLoading ? (
            <p className="mt-4 text-sm text-muted-foreground">Loading articles…</p>
          ) : (
            <div className="mt-4 overflow-x-auto rounded-xl border border-border bg-card">
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="p-4">Title</th>
                    <th className="p-4">Section</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Date</th>
                    <th className="p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {articles.map((a) => (
                    <tr key={a.id} className="border-t border-border align-top">
                      <td className="p-4 font-semibold">{a.title}</td>
                      <td className="p-4 text-muted-foreground">{categoryName(a.category)}</td>
                      <td className="p-4">
                        <span
                          className={
                            a.status === "published"
                              ? "rounded-full bg-primary px-2 py-1 text-xs font-bold text-primary-foreground"
                              : "rounded-full bg-secondary px-2 py-1 text-xs font-bold text-secondary-foreground"
                          }
                        >
                          {a.status}
                        </span>
                      </td>
                      <td className="p-4 text-muted-foreground">{formatDate(a.published_at)}</td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() =>
                              setForm({
                                id: a.id,
                                title: a.title,
                                slug: a.slug,
                                category: a.category,
                                excerpt: a.excerpt,
                                body: a.body,
                                author: a.author,
                                image_alt: a.image_alt,
                              })
                            }
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() =>
                              setStatus.mutate({
                                id: a.id,
                                status: a.status === "published" ? "draft" : "published",
                              })
                            }
                          >
                            {a.status === "published" ? "Unpublish" : "Publish"}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            aria-label={`Delete ${a.title}`}
                            onClick={() => {
                              if (window.confirm(`Delete “${a.title}”? This cannot be undone.`)) {
                                remove.mutate(a.id);
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </SiteLayout>
  );
}
