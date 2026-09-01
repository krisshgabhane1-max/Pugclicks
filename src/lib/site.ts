export const SITE_NAME = "Pugclicks";
export const SITE_TAGLINE = "Movies, TV, Gaming & Sports";
export const CONTACT_EMAIL = "hello@example.com"; // TODO: replace before launch
export const RESPONSE_PROMISE = "We reply to every message within 2–3 business days.";

export type Category = {
  slug: string;
  name: string;
  blurb: string;
};

export const CATEGORIES: Category[] = [
  { slug: "movies", name: "Movies", blurb: "Reviews, explainers and release breakdowns." },
  { slug: "tv", name: "TV & Series", blurb: "Episode analysis, season pacing and returning shows." },
  { slug: "gaming", name: "Gaming", blurb: "Playthrough notes, indie picks and platform news." },
  { slug: "sports", name: "Sports", blurb: "Schedules, form and long-season storylines." },
  { slug: "news", name: "News", blurb: "Entertainment industry updates and standards notes." },
];

export function categoryName(slug: string) {
  return CATEGORIES.find((c) => c.slug === slug)?.name ?? slug;
}

export function formatDate(value: string | null | undefined) {
  if (!value) return "Unpublished";
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export const FAQS = [
  {
    q: "What does Pugclicks cover?",
    a: "Pugclicks is an entertainment publication covering movies, TV and series, gaming, sports and industry news. Every article is written for readers, not for search engines.",
  },
  {
    q: "How quickly do you reply to messages?",
    a: "We answer reader questions, corrections and press enquiries within 2–3 business days. Urgent corrections are prioritised.",
  },
  {
    q: "Can I pitch an article or a correction?",
    a: "Yes. Use the contact page and include links to any published sources. Corrections are appended to the article with a timestamp rather than edited in silently.",
  },
  {
    q: "Do you accept paid or sponsored posts?",
    a: "Anything paid is labelled clearly at the top of the article. Editorial coverage is never sold, and sponsorship never changes a verdict.",
  },
  {
    q: "Where do your images come from?",
    a: "Article images use image slots with descriptive alt text. Before launch, replace each slot with imagery you hold the rights to use.",
  },
];
