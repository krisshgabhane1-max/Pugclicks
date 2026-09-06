import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImagePicker } from "@/components/image-picker";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { SEO_DEFAULTS, type SeoContent } from "@/lib/site-content.functions";

export const Route = createFileRoute("/admin/seo")({
  head: () => ({
    meta: [
      { title: "Search & Sharing — Pugclicks Admin" },
      { name: "description", content: "Edit the Pugclicks homepage title, description and share image." },
      { property: "og:title", content: "Search & Sharing — Pugclicks Admin" },
      { property: "og:description", content: "Search and social settings for Pugclicks." },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminSeo,
});

function AdminSeo() {
  const { user, isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const [seo, setSeo] = useState<SeoContent>(SEO_DEFAULTS);

  const { data } = useQuery({
    queryKey: ["site-content", "seo"],
    enabled: Boolean(user && isAdmin),
    queryFn: async () => {
      const { data: row, error } = await supabase
        .from("site_content")
        .select("value")
        .eq("key", "seo")
        .maybeSingle();
      if (error) throw new Error(error.message);
      return { ...SEO_DEFAULTS, ...((row?.value as object) ?? {}) } as SeoContent;
    },
  });

  useEffect(() => {
    if (data) setSeo(data);
  }, [data]);

  const save = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("site_content")
        .upsert({ key: "seo", value: seo as never }, { onConflict: "key" });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success("Saved");
      queryClient.invalidateQueries({ queryKey: ["site-content", "seo"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <section className="mt-8 max-w-2xl rounded-xl border border-border bg-card p-6">
      <h2 className="text-2xl">Search & sharing</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        This is the title and description people see in Google and when your homepage link is shared.
      </p>

      <div className="mt-5 grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="homeTitle">Homepage title</Label>
          <Input
            id="homeTitle"
            value={seo.homeTitle}
            onChange={(e) => setSeo((s) => ({ ...s, homeTitle: e.target.value }))}
            className="bg-secondary"
          />
          <span className="text-xs text-muted-foreground">{seo.homeTitle.length}/60 characters</span>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="homeDescription">Homepage description</Label>
          <Textarea
            id="homeDescription"
            rows={3}
            value={seo.homeDescription}
            onChange={(e) => setSeo((s) => ({ ...s, homeDescription: e.target.value }))}
            className="bg-secondary"
          />
          <span className="text-xs text-muted-foreground">
            {seo.homeDescription.length}/160 characters
          </span>
        </div>

        <ImagePicker
          label="Share image (shown when the homepage link is shared)"
          value={seo.shareImage ?? ""}
          onChange={(url) => setSeo((s) => ({ ...s, shareImage: url }))}
        />

        <div>
          <Button onClick={() => save.mutate()} disabled={save.isPending}>
            Save
          </Button>
        </div>
      </div>
    </section>
  );
}
