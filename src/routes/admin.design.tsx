import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Palette, RotateCcw, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { THEME_DEFAULTS, themeCss, type ThemeContent } from "@/lib/site-content.functions";

export const Route = createFileRoute("/admin/design")({
  head: () => ({
    meta: [
      { title: "Pugclicks" },
      { name: "robots", content: "noindex, nofollow, noarchive" },
    ],
  }),
  component: AdminDesign,
});

const ACCENT_PRESETS = [
  { hex: "#4F46E5", name: "Indigo" },
  { hex: "#2563EB", name: "Blue" },
  { hex: "#059669", name: "Green" },
  { hex: "#DB2777", name: "Pink" },
  { hex: "#EA580C", name: "Orange" },
  { hex: "#7C3AED", name: "Purple" },
];

const FONT_OPTIONS: { id: ThemeContent["font"]; name: string; sample: string }[] = [
  { id: "classic", name: "Classic", sample: "Inter everywhere — clean and neutral" },
  { id: "modern", name: "Modern", sample: "Space Grotesk headlines, Inter text" },
  { id: "editorial", name: "Editorial", sample: "Lora serif headlines, Inter text" },
];

const RADIUS_OPTIONS: { id: ThemeContent["radius"]; name: string }[] = [
  { id: "soft", name: "Gentle" },
  { id: "round", name: "Rounded (current)" },
  { id: "sharp", name: "Crisp" },
];

function AdminDesign() {
  const { user, isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const [theme, setTheme] = useState<ThemeContent>(THEME_DEFAULTS);
  const [loaded, setLoaded] = useState(false);

  const row = useQuery({
    queryKey: ["site-content", "theme"],
    enabled: Boolean(user && isAdmin),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_content")
        .select("value")
        .eq("key", "theme")
        .maybeSingle();
      if (error) throw new Error(error.message);
      return { ...THEME_DEFAULTS, ...((data?.value as object) ?? {}) } as ThemeContent;
    },
  });

  useEffect(() => {
    if (row.data) {
      setTheme(row.data);
      setLoaded(true);
    }
  }, [row.data]);

  async function save() {
    const { error } = await supabase
      .from("site_content")
      .upsert({ key: "theme", value: theme as never }, { onConflict: "key" });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Design saved — the whole site now uses it");
    queryClient.invalidateQueries({ queryKey: ["site-content", "theme"] });
  }

  function setAccent(hex: string) {
    setTheme((t) => ({ ...t, accent: hex.toUpperCase() }));
  }

  return (
    <div className="space-y-8">
      {/* Live preview of the chosen design */}
      <style>{loaded ? themeCss(theme) : ""}</style>

      <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
        <div className="flex items-center gap-2">
          <Palette className="h-5 w-5 text-primary" aria-hidden />
          <h2 className="text-lg font-semibold">Design your blog</h2>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Pick colors, fonts and corner style — like Blogger's theme designer. Every page updates
          live below as you choose, and visitors see it everywhere once you save.
        </p>

        <div className="mt-6 grid gap-6">
          <div>
            <Label>Accent color (buttons, links, highlights)</Label>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {ACCENT_PRESETS.map((p) => (
                <button
                  key={p.hex}
                  type="button"
                  aria-label={`Accent ${p.name}`}
                  onClick={() => setAccent(p.hex)}
                  className={`h-9 w-9 rounded-full border-2 transition-transform hover:scale-110 ${
                    theme.accent.toLowerCase() === p.hex.toLowerCase() ? "border-foreground" : "border-transparent"
                  }`}
                  style={{ backgroundColor: p.hex }}
                />
              ))}
              <Input
                type="color"
                value={/^#[0-9a-fA-F]{6}$/.test(theme.accent) ? theme.accent : "#4F46E5"}
                onChange={(e) => setAccent(e.target.value)}
                aria-label="Custom accent color"
                className="h-9 w-12 cursor-pointer p-0.5"
              />
              <Input
                value={theme.accent}
                onChange={(e) => setAccent(e.target.value)}
                aria-label="Accent hex code"
                className="w-28 font-mono text-sm"
              />
            </div>
          </div>

          <div>
            <Label>Font style</Label>
            <div className="mt-2 grid gap-2 sm:grid-cols-3">
              {FONT_OPTIONS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setTheme((t) => ({ ...t, font: f.id }))}
                  className={`rounded-xl border p-3 text-left transition-colors ${
                    theme.font === f.id ? "border-primary bg-accent/40" : "border-border hover:border-primary/50"
                  }`}
                >
                  <span className="block font-semibold" style={{ fontFamily: f.id === "editorial" ? "Lora, serif" : f.id === "modern" ? "Space Grotesk, sans-serif" : undefined }}>
                    {f.name}
                  </span>
                  <span className="mt-1 block text-xs text-muted-foreground">{f.sample}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label>Corner style</Label>
            <div className="mt-2 grid gap-2 sm:grid-cols-3">
              {RADIUS_OPTIONS.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setTheme((t) => ({ ...t, radius: r.id }))}
                  className={`rounded-xl border p-3 text-left transition-colors ${
                    theme.radius === r.id ? "border-primary bg-accent/40" : "border-border hover:border-primary/50"
                  }`}
                >
                  <span
                    className="mb-2 block h-8 w-14 bg-primary"
                    style={{ borderRadius: { soft: 10, round: 14, sharp: 6 }[r.id] }}
                  />
                  <span className="text-sm font-medium">{r.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-3 border-t border-border pt-5">
            <Button onClick={save} className="gap-2" disabled={row.isLoading}>
              <Save className="h-4 w-4" /> Save design
            </Button>
            <Button
              variant="secondary"
              className="gap-2"
              onClick={() => {
                setTheme(THEME_DEFAULTS);
                toast.info("Preview reset. Press Save design to keep it.");
              }}
            >
              <RotateCcw className="h-4 w-4" /> Reset to original
            </Button>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-5">
        <h3 className="text-sm font-semibold">Preview</h3>
        <p className="mt-1 text-xs text-muted-foreground">This is how buttons, cards and links look with your current choices.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
            <span className="kicker">Category</span>
            <h4 className="mt-1 font-semibold">Sample article card</h4>
            <p className="mt-1 text-xs text-muted-foreground">A short line of description.</p>
            <Button size="sm" className="mt-3">Read more</Button>
          </div>
          <div className="rounded-xl bg-ink p-4 text-ink-foreground">
            <h4 className="font-semibold">Dark box</h4>
            <p className="mt-1 text-xs opacity-80">Like the newsletter box.</p>
            <Button size="sm" variant="secondary" className="mt-3">Subscribe</Button>
          </div>
          <div className="rounded-xl border border-border p-4">
            <h4 className="font-semibold text-primary">A link headline</h4>
            <p className="mt-1 text-xs text-muted-foreground">Links and highlights use your accent.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
