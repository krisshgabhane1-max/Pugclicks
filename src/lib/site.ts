export const SITE_NAME = "Pugclicks";
export const SITE_TAGLINE = "AI & Technology, Made Simple";
export const CONTACT_EMAIL = "pugclicks@gmail.com";
export const RESPONSE_PROMISE = "We reply to every message within 2–3 business days.";
export const TRUST_LINE = "Practical • Beginner-friendly • No unnecessary hype";

export type Category = {
  slug: string;
  name: string;
  blurb: string;
  emoji: string;
};

export const CATEGORIES: Category[] = [
  { slug: "ai", name: "AI", blurb: "AI tools, automation & tutorials.", emoji: "🤖" },
  { slug: "tech", name: "Tech", blurb: "Android, apps & useful technology.", emoji: "📱" },
  { slug: "automation", name: "Automation", blurb: "Workflows, agents & productivity.", emoji: "⚡" },
  { slug: "guides", name: "Guides", blurb: "Step-by-step walkthroughs you can follow today.", emoji: "📘" },
  { slug: "student-tech", name: "Student Tech", blurb: "Tools that make studying easier.", emoji: "🎓" },
  { slug: "sports", name: "Sports", blurb: "Sports news, fan tech and match-day apps.", emoji: "⚽" },
  { slug: "action", name: "Action", blurb: "Action films, shows and games worth your time.", emoji: "💥" },
  { slug: "movies", name: "Movies", blurb: "Movie guides, reviews and where to stream them.", emoji: "🎬" },
  { slug: "series", name: "Series", blurb: "TV and web series explained, ranked and reviewed.", emoji: "📺" },
  { slug: "games", name: "Games", blurb: "Gaming guides, tips and the tech behind games.", emoji: "🎮" },
];

/** Categories shown in the top-left menu. */
export const MENU_CATEGORIES = ["sports", "action", "movies", "series", "games", "tech", "ai"];

/** Cards shown in the homepage "Explore Topics" grid. */
export const TOPIC_CARDS = CATEGORIES.filter((c) =>
  ["ai", "tech", "automation", "student-tech"].includes(c.slug),
);

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

export function readingTime(body: string | null | undefined) {
  const words = (body ?? "").trim().split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.round(words / 200))} min read`;
}

export const START_HERE = [
  { title: "What is AI, really?", slug: "what-is-ai-really" },
  { title: "Best free AI tools right now", slug: "best-free-ai-tools" },
  { title: "How to write better AI prompts", slug: "how-to-write-better-ai-prompts" },
  { title: "Automate repetitive tasks in an afternoon", slug: "automate-repetitive-tasks" },
  { title: "Build your first AI workflow", slug: "build-your-first-ai-workflow" },
];

export const TOOLS = [
  { name: "AI assistant", does: "Writing & research", note: "Drafting, summarising and explaining sources." },
  { name: "Automation platform", does: "Workflows", note: "Connect apps and remove repeated clicks." },
  { name: "Productivity app", does: "Organisation", note: "Notes, tasks and study planning in one place." },
  { name: "Developer tool", does: "Coding", note: "Faster local dev, testing and deployment." },
];

export const FAQS = [
  {
    q: "What does Pugclicks cover?",
    a: "Pugclicks publishes practical AI and technology guides: AI tools, automation workflows, Android and app tips, and tech that makes studying easier. Every article is written for readers, not for search engines.",
  },
  {
    q: "Are the guides beginner-friendly?",
    a: "Yes. Guides assume no prior AI experience, explain the why before the how, and only use jargon when it is defined first.",
  },
  {
    q: "How quickly do you reply to messages?",
    a: "We answer reader questions, corrections and press enquiries within 2–3 business days. Urgent corrections are prioritised.",
  },
  {
    q: "Do you accept paid or sponsored posts?",
    a: "Anything paid is labelled clearly at the top of the article. Tool recommendations are based on real use, and sponsorship never changes a verdict.",
  },
  {
    q: "Are the recommended tools affiliate links?",
    a: "Where a tool link earns a commission it is disclosed on the page. The recommendation list stays the same either way.",
  },
];
