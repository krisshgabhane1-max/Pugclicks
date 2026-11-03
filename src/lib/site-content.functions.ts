import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export type HomeContent = {
  heroTitle: string;
  heroSubtitle: string;
  heroPrimaryLabel: string;
  heroPrimaryHref: string;
  heroSecondaryLabel: string;
  heroSecondaryHref: string;
  trustLine: string;
  heroImage: string;
  startHereTitle: string;
  topicsTitle: string;
  latestTitle: string;
  toolsTitle: string;
  newsletterTitle: string;
  newsletterSubtitle: string;
  newsletterButton: string;
  footerTagline: string;
  sections: string[];
};

export type ReferralContent = {
  title: string;
  intro: string;
  items: { name: string; what: string; url: string }[];
};

export type CreditsContent = {
  title: string;
  intro: string;
  items: { name: string; note: string }[];
};

export type ThemeContent = {
  accent: string;
  font: "classic" | "modern" | "editorial";
  radius: "soft" | "round" | "sharp";
};

export const THEME_DEFAULTS: ThemeContent = {
  accent: "#4F46E5",
  font: "classic",
  radius: "round",
};

/** Builds the CSS that applies the saved theme over the built-in design tokens. */
export function themeCss(theme: ThemeContent): string {
  const accent = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(theme.accent) ? theme.accent : THEME_DEFAULTS.accent;
  const radius = { soft: "0.625rem", round: "0.875rem", sharp: "0.375rem" }[theme.radius] ?? "0.875rem";
  const display =
    {
      classic: '"Inter", system-ui, sans-serif',
      modern: '"Space Grotesk", "Inter", system-ui, sans-serif',
      editorial: '"Lora", Georgia, serif',
    }[theme.font] ?? '"Inter", system-ui, sans-serif';
  return [
    ":root{",
    `--primary:${accent};`,
    `--ring:${accent};`,
    `--chart-1:${accent};`,
    `--accent:color-mix(in oklab,${accent} 10%,var(--background));`,
    `--accent-foreground:${accent};`,
    `--radius:${radius};`,
    `--font-display:${display};`,
    "}",
    ".dark{",
    `--primary:color-mix(in oklab,${accent} 78%,white);`,
    `--ring:color-mix(in oklab,${accent} 78%,white);`,
    "}",
  ].join("");
}

export type SeoContent = {
  homeTitle: string;
  homeDescription: string;
  shareImage: string;
};

export const HOME_DEFAULTS: HomeContent = {
  heroTitle: "AI & Technology, Made Simple.",
  heroSubtitle:
    "Practical guides, useful AI tools, and technology tutorials that actually help you get things done.",
  heroPrimaryLabel: "Explore Guides →",
  heroPrimaryHref: "/category/guides",
  heroSecondaryLabel: "AI Tools →",
  heroSecondaryHref: "/tools",
  trustLine: "Practical • Beginner-friendly • No unnecessary hype",
  heroImage: "",
  startHereTitle: "New to AI? Start here",
  topicsTitle: "Explore Topics",
  latestTitle: "Latest Guides",
  toolsTitle: "Useful Tools",
  newsletterTitle: "Get smarter with technology.",
  newsletterSubtitle: "One useful AI or tech discovery every week. No spam.",
  newsletterButton: "Subscribe →",
  footerTagline: "Making technology easier to understand.",
  sections: ["hero", "featured", "startHere", "topics", "latest", "tools", "newsletter"],
};

export const REFERRAL_DEFAULTS: ReferralContent = {
  title: "Tools we recommend",
  intro:
    "Links on this page may earn Pugclicks a commission. Recommendations do not change because of it.",
  items: [],
};

export const CREDITS_DEFAULTS: CreditsContent = {
  title: "Credits & thanks",
  intro: "Pugclicks is built with help from these tools.",
  items: [],
};

export const SEO_DEFAULTS: SeoContent = {
  homeTitle: "Pugclicks — AI & Technology, Made Simple",
  homeDescription:
    "Practical guides, useful AI tools, and technology tutorials that actually help you get things done.",
  shareImage: "",
};

function publicClient() {
  const url = process.env["SUPABASE_URL"]!;
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(url, key, {
    auth: { persistSession: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) {
          h.delete("Authorization");
        }
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

/** Public read of every editable content block, with code defaults as a fallback. */
export const getSiteContent = createServerFn({ method: "GET" }).handler(async () => {
  const { data } = await publicClient().from("site_content").select("key, value");
  const rows = new Map((data ?? []).map((r) => [r.key, r.value as Record<string, unknown>]));

  return {
    home: { ...HOME_DEFAULTS, ...(rows.get("home") ?? {}) } as HomeContent,
    seo: { ...SEO_DEFAULTS, ...(rows.get("seo") ?? {}) } as SeoContent,
    theme: { ...THEME_DEFAULTS, ...(rows.get("theme") ?? {}) } as ThemeContent,
    referral: { ...REFERRAL_DEFAULTS, ...(rows.get("referral") ?? {}) } as ReferralContent,
    credits: { ...CREDITS_DEFAULTS, ...(rows.get("credits") ?? {}) } as CreditsContent,
  };
});
