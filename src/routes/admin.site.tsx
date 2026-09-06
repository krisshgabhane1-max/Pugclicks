import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, Eye, EyeOff, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImagePicker } from "@/components/image-picker";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  CREDITS_DEFAULTS,
  HOME_DEFAULTS,
  REFERRAL_DEFAULTS,
  type CreditsContent,
  type HomeContent,
  type ReferralContent,
} from "@/lib/site-content.functions";

export const Route = createFileRoute("/admin/site")({
  head: () => ({
    meta: [
      { title: "Site Editor — Pugclicks Admin" },
      { name: "description", content: "Edit Pugclicks homepage text, buttons, photos and section order." },
      { property: "og:title", content: "Site Editor — Pugclicks Admin" },
      { property: "og:description", content: "Edit the Pugclicks homepage without code." },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminSite,
});

const SECTION_LABELS: Record<string, string> = {
  hero: "Big headline at the top",
  featured: "Featured guide",
  startHere: "Start here list",
  topics: "Explore topics",
  latest: "Latest guides",
  tools: "Useful tools",
  newsletter: "Newsletter box",
};

const ALL_SECTIONS = Object.keys(SECTION_LABELS);

function useContentRow<T>(key: string, defaults: T) {
  const { user, isAdmin } = useAuth();
  return useQuery({
    queryKey: ["site-content", key],
    enabled: Boolean(user && isAdmin),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_content")
        .select("value")
        .eq("key", key)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return { ...defaults, ...((data?.value as object) ?? {}) } as T;
    },
  });
}

function AdminSite() {
  const queryClient = useQueryClient();
  const homeRow = useContentRow<HomeContent>("home", HOME_DEFAULTS);
  const referralRow = useContentRow<ReferralContent>("referral", REFERRAL_DEFAULTS);
  const creditsRow = useContentRow<CreditsContent>("credits", CREDITS_DEFAULTS);

  const [home, setHome] = useState<HomeContent>(HOME_DEFAULTS);
  const [referral, setReferral] = useState<ReferralContent>(REFERRAL_DEFAULTS);
  const [credits, setCredits] = useState<CreditsContent>(CREDITS_DEFAULTS);

  useEffect(() => {
    if (homeRow.data) setHome(homeRow.data);
  }, [homeRow.data]);
  useEffect(() => {
    if (referralRow.data) setReferral(referralRow.data);
  }, [referralRow.data]);
  useEffect(() => {
    if (creditsRow.data) setCredits(creditsRow.data);
  }, [creditsRow.data]);

  const save = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: unknown }) => {
      const { error } = await supabase
        .from("site_content")
        .upsert({ key, value: value as never }, { onConflict: "key" });
      if (error) throw new Error(error.message);
    },
    onSuccess: (_d, vars) => {
      toast.success("Saved — your site is updated");
      queryClient.invalidateQueries({ queryKey: ["site-content", vars.key] });
      queryClient.invalidateQueries({ queryKey: ["site-content"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const sections = home.sections?.length ? home.sections : HOME_DEFAULTS.sections;

  function moveSection(index: number, direction: -1 | 1) {
    const next = [...sections];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target]!, next[index]!];
    setHome((h) => ({ ...h, sections: next }));
  }

  function toggleSection(name: string) {
    const next = sections.includes(name)
      ? sections.filter((s) => s !== name)
      : [...sections, name];
    setHome((h) => ({ ...h, sections: next }));
  }

  const textField = (
    id: keyof HomeContent,
    label: string,
    multiline = false,
  ) => (
    <div className="grid gap-2" key={id as string}>
      <Label htmlFor={id as string}>{label}</Label>
      {multiline ? (
        <Textarea
          id={id as string}
          rows={2}
          value={String(home[id] ?? "")}
          onChange={(e) => setHome((h) => ({ ...h, [id]: e.target.value }))}
          className="bg-secondary"
        />
      ) : (
        <Input
          id={id as string}
          value={String(home[id] ?? "")}
          onChange={(e) => setHome((h) => ({ ...h, [id]: e.target.value }))}
          className="bg-secondary"
        />
      )}
    </div>
  );

  return (
    <div className="mt-8 grid gap-10">
      <section className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-2xl">Homepage words & buttons</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Change any headline, button label or link. Buttons can point anywhere, e.g. /tools or
          https://example.com.
        </p>
        <div className="mt-5 grid gap-4">
          {textField("heroTitle", "Big headline")}
          {textField("heroSubtitle", "Sentence under the headline", true)}
          <div className="grid gap-4 sm:grid-cols-2">
            {textField("heroPrimaryLabel", "First button text")}
            {textField("heroPrimaryHref", "First button link")}
            {textField("heroSecondaryLabel", "Second button text")}
            {textField("heroSecondaryHref", "Second button link")}
          </div>
          {textField("trustLine", "Small trust line")}
          <div className="grid gap-4 sm:grid-cols-2">
            {textField("startHereTitle", "\"Start here\" heading")}
            {textField("topicsTitle", "Topics heading")}
            {textField("latestTitle", "Latest guides heading")}
            {textField("toolsTitle", "Tools heading")}
            {textField("newsletterTitle", "Newsletter heading")}
            {textField("newsletterButton", "Newsletter button text")}
          </div>
          {textField("newsletterSubtitle", "Newsletter sentence", true)}
          {textField("footerTagline", "Footer line")}

          <ImagePicker
            label="Top photo (optional)"
            value={home.heroImage ?? ""}
            onChange={(url) => setHome((h) => ({ ...h, heroImage: url }))}
          />

          <div>
            <Button onClick={() => save.mutate({ key: "home", value: home })} disabled={save.isPending}>
              Save homepage
            </Button>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-2xl">Section order</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Move sections up or down, or hide the ones you don't want.
        </p>
        <ul className="mt-4 grid gap-2">
          {sections.map((name, index) => (
            <li
              key={name}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-background p-3"
            >
              <span className="text-sm font-medium">{SECTION_LABELS[name] ?? name}</span>
              <div className="flex gap-2">
                <Button size="icon" variant="secondary" aria-label="Move up" onClick={() => moveSection(index, -1)}>
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="secondary" aria-label="Move down" onClick={() => moveSection(index, 1)}>
                  <ArrowDown className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" aria-label="Hide section" onClick={() => toggleSection(name)}>
                  <EyeOff className="h-4 w-4" />
                </Button>
              </div>
            </li>
          ))}
        </ul>

        {ALL_SECTIONS.filter((s) => !sections.includes(s)).length > 0 && (
          <div className="mt-4">
            <span className="text-xs uppercase tracking-wide text-muted-foreground">Hidden</span>
            <ul className="mt-2 grid gap-2">
              {ALL_SECTIONS.filter((s) => !sections.includes(s)).map((name) => (
                <li
                  key={name}
                  className="flex items-center justify-between gap-2 rounded-lg border border-dashed border-border p-3"
                >
                  <span className="text-sm text-muted-foreground">{SECTION_LABELS[name] ?? name}</span>
                  <Button size="sm" variant="secondary" onClick={() => toggleSection(name)}>
                    <Eye className="mr-2 h-4 w-4" /> Show
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <Button
          className="mt-5"
          onClick={() => save.mutate({ key: "home", value: home })}
          disabled={save.isPending}
        >
          Save order
        </Button>
      </section>

      <section className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-2xl">Recommended tool links</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Shown on the Recommended tools page. Each link opens the tool's official page in a new tab.
        </p>
        <div className="mt-4 grid gap-3">
          <div className="grid gap-2">
            <Label htmlFor="ref-title">Page heading</Label>
            <Input
              id="ref-title"
              value={referral.title}
              onChange={(e) => setReferral((r) => ({ ...r, title: e.target.value }))}
              className="bg-secondary"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="ref-intro">Intro sentence</Label>
            <Textarea
              id="ref-intro"
              rows={2}
              value={referral.intro}
              onChange={(e) => setReferral((r) => ({ ...r, intro: e.target.value }))}
              className="bg-secondary"
            />
          </div>

          {referral.items.map((item, index) => (
            <div key={index} className="grid gap-2 rounded-lg border border-border p-3 sm:grid-cols-[1fr_1fr_2fr_auto]">
              <Input
                placeholder="Tool name"
                value={item.name}
                onChange={(e) =>
                  setReferral((r) => {
                    const items = [...r.items];
                    items[index] = { ...items[index]!, name: e.target.value };
                    return { ...r, items };
                  })
                }
                className="bg-secondary"
              />
              <Input
                placeholder="What it does"
                value={item.what}
                onChange={(e) =>
                  setReferral((r) => {
                    const items = [...r.items];
                    items[index] = { ...items[index]!, what: e.target.value };
                    return { ...r, items };
                  })
                }
                className="bg-secondary"
              />
              <Input
                placeholder="https://official-page.com"
                value={item.url}
                onChange={(e) =>
                  setReferral((r) => {
                    const items = [...r.items];
                    items[index] = { ...items[index]!, url: e.target.value };
                    return { ...r, items };
                  })
                }
                className="bg-secondary"
              />
              <Button
                size="icon"
                variant="destructive"
                aria-label="Remove tool"
                onClick={() =>
                  setReferral((r) => ({ ...r, items: r.items.filter((_, i) => i !== index) }))
                }
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}

          <div className="flex flex-wrap gap-3">
            <Button
              variant="secondary"
              onClick={() =>
                setReferral((r) => ({ ...r, items: [...r.items, { name: "", what: "", url: "" }] }))
              }
            >
              <Plus className="mr-2 h-4 w-4" /> Add tool
            </Button>
            <Button onClick={() => save.mutate({ key: "referral", value: referral })} disabled={save.isPending}>
              Save tools
            </Button>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-2xl">Credits & thanks</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Thank the tools you use — Google, ChatGPT and anything else. Add a link to open their
          official page.
        </p>
        <div className="mt-4 grid gap-3">
          <div className="grid gap-2">
            <Label htmlFor="cr-title">Page heading</Label>
            <Input
              id="cr-title"
              value={credits.title}
              onChange={(e) => setCredits((c) => ({ ...c, title: e.target.value }))}
              className="bg-secondary"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="cr-intro">Intro sentence</Label>
            <Textarea
              id="cr-intro"
              rows={2}
              value={credits.intro}
              onChange={(e) => setCredits((c) => ({ ...c, intro: e.target.value }))}
              className="bg-secondary"
            />
          </div>

          {credits.items.map((item, index) => (
            <div key={index} className="grid gap-2 rounded-lg border border-border p-3 sm:grid-cols-[1fr_2fr_auto]">
              <Input
                placeholder="Name (e.g. Google)"
                value={item.name}
                onChange={(e) =>
                  setCredits((c) => {
                    const items = [...c.items];
                    items[index] = { ...items[index]!, name: e.target.value };
                    return { ...c, items };
                  })
                }
                className="bg-secondary"
              />
              <Input
                placeholder="What you're thanking them for"
                value={item.note}
                onChange={(e) =>
                  setCredits((c) => {
                    const items = [...c.items];
                    items[index] = { ...items[index]!, note: e.target.value };
                    return { ...c, items };
                  })
                }
                className="bg-secondary"
              />
              <Button
                size="icon"
                variant="destructive"
                aria-label="Remove credit"
                onClick={() => setCredits((c) => ({ ...c, items: c.items.filter((_, i) => i !== index) }))}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}

          <div className="flex flex-wrap gap-3">
            <Button
              variant="secondary"
              onClick={() => setCredits((c) => ({ ...c, items: [...c.items, { name: "", note: "" }] }))}
            >
              <Plus className="mr-2 h-4 w-4" /> Add credit
            </Button>
            <Button onClick={() => save.mutate({ key: "credits", value: credits })} disabled={save.isPending}>
              Save credits
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
