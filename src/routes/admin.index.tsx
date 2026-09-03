import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { CATEGORIES, categoryName, formatDate, readingTime } from "@/lib/site";
import type { Article } from "@/lib/articles.functions";

export const Route = createFileRoute("/admin/")({
  component: AdminPosts,
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
  seo_title: "",
  slug: "",
  category: "ai",
  excerpt: "",
  body: "",
  author: "Pugclicks Staff",
  cover_image: "",
  image_alt: "",
};

const SELECT =
  "id, slug, title, seo_title, category, excerpt, body, author, cover_image, image_alt, status, published_at";

function AdminPosts() {
  const { user, isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ ...EMPTY });
  const [showPreview, setShowPreview] = useState(true);

  const { data: articles = [], isLoading } = useQuery({
    queryKey: ["admin", "articles"],
    enabled: Boolean(user && isAdmin),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("articles")
        .select(SELECT)
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
        seo_title: form.seo_title,
        slug: form.slug || slugify(form.title),
        category: form.category,
        excerpt: form.excerpt,
        body: form.body,
        author: form.author,
        cover_image: form.cover_image,
        image_alt: form.image_alt,
        status,
        published_at: status === "published" ? new Date().toISOString() : null,
        author_id: user?.id ?? null,
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

  const drafts = articles.filter((a) => a.status === "draft");
  const published = articles.filter((a) => a.status === "published");
  const previewParagraphs = form.body.split(/\n{2,}/).filter(Boolean);

  return (
    <>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
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
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl">{form.id ? "Edit article" : "New article"}</h2>
          <Button variant="ghost" size="sm" onClick={() => setShowPreview((v) => !v)}>
            {showPreview ? "Hide preview" : "Show preview"}
          </Button>
        </div>

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
          <div className="grid gap-2">
            <Label htmlFor="seo_title">SEO title (optional, under 60 characters)</Label>
            <Input
              id="seo_title"
              value={form.seo_title}
              onChange={(e) => setForm((f) => ({ ...f, seo_title: e.target.value }))}
              className="bg-secondary"
            />
            <span className="text-xs text-muted-foreground">{form.seo_title.length}/60</span>
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
              <span className="text-xs text-muted-foreground">/article/{form.slug || "your-slug"}</span>
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
              <Label htmlFor="cover_image">Cover image URL</Label>
              <Input
                id="cover_image"
                placeholder="https://…"
                value={form.cover_image}
                onChange={(e) => setForm((f) => ({ ...f, cover_image: e.target.value }))}
                className="bg-secondary"
              />
            </div>
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
          <div className="grid gap-2">
            <Label htmlFor="excerpt">Excerpt / meta description</Label>
            <Textarea
              id="excerpt"
              rows={2}
              value={form.excerpt}
              onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
              className="bg-secondary"
            />
            <span className="text-xs text-muted-foreground">{form.excerpt.length}/160</span>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="body">Body (blank line between paragraphs, "## " for headings)</Label>
            <Textarea
              id="body"
              rows={14}
              value={form.body}
              onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
              className="bg-secondary font-mono text-sm"
            />
            <span className="text-xs text-muted-foreground">{readingTime(form.body)}</span>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => save.mutate("published")} disabled={!form.title || save.isPending}>
              {form.id ? "Save & publish" : "Publish"}
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

        {showPreview && (
          <div className="mt-8 border-t border-border pt-6">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Live preview
            </span>
            <article className="mt-4 rounded-xl border border-border bg-background p-5">
              {form.cover_image ? (
                <img
                  src={form.cover_image}
                  alt={form.image_alt || form.title}
                  className="mb-5 aspect-video w-full rounded-lg object-cover"
                  loading="lazy"
                />
              ) : null}
              <span className="text-xs font-bold uppercase tracking-wide text-primary">
                {categoryName(form.category)}
              </span>
              <h3 className="mt-2 font-display text-2xl font-extrabold">
                {form.title || "Your headline appears here"}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {form.author} · {readingTime(form.body)}
              </p>
              {form.excerpt && <p className="mt-4 text-base">{form.excerpt}</p>}
              <div className="mt-4 grid gap-3">
                {previewParagraphs.map((p, i) =>
                  p.startsWith("## ") ? (
                    <h4 key={i} className="font-display text-lg font-bold">
                      {p.replace(/^##\s+/, "")}
                    </h4>
                  ) : (
                    <p key={i} className="text-sm leading-relaxed text-muted-foreground">
                      {p}
                    </p>
                  ),
                )}
              </div>
            </article>
          </div>
        )}
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
                          onClick={() => {
                            setForm({
                              id: a.id,
                              title: a.title,
                              seo_title: a.seo_title ?? "",
                              slug: a.slug,
                              category: a.category,
                              excerpt: a.excerpt,
                              body: a.body,
                              author: a.author,
                              cover_image: a.cover_image ?? "",
                              image_alt: a.image_alt,
                            });
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
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
    </>
  );
}
