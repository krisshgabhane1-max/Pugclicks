import { Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { Menu, Moon, Search, Sun } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { NewsletterForm } from "@/components/newsletter-form";
import {
  CATEGORIES,
  CONTACT_EMAIL,
  SITE_NAME,
  SITE_TAGLINE,
  categoryName,
} from "@/lib/site";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const NAV = [
  { slug: "movies", name: "Movies & Series" },
  { slug: "games", name: "Games" },
  { slug: "sports", name: "Sports" },
  { slug: "f1", name: "F1" },
  { slug: "ai", name: "AI & Tech" },
];

function SearchForm({ onSubmit }: { onSubmit?: () => void }) {
  const [value, setValue] = useState("");
  return (
    <form
      action="/search"
      method="get"
      className="flex w-full gap-2"
      onSubmit={() => onSubmit?.()}
      role="search"
    >
      <Input
        name="q"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search guides"
        aria-label="Search articles"
        className="h-10 bg-background"
      />
      <Button type="submit" size="icon" variant="secondary" className="h-10 w-10 shrink-0" aria-label="Search">
        <Search className="h-4 w-4" />
      </Button>
    </form>
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { theme, toggle } = useTheme();
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
      <div className="container-page flex min-h-14 items-center gap-4 py-2.5">
        <Link to="/" className="font-display text-lg font-extrabold tracking-tight">
          Pug<span className="text-primary">clicks</span>
        </Link>

        <nav className="ml-6 hidden flex-1 items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
          <Link to="/" className="transition-colors hover:text-foreground">
            Home
          </Link>
          {NAV.map((c) => (
            <Link
              key={c.slug}
              to="/category/$slug"
              params={{ slug: c.slug }}
              className="transition-colors hover:text-foreground"
              activeProps={{ className: "text-foreground" }}
            >
              {c.name}
            </Link>
          ))}
          <Link to="/tools" className="transition-colors hover:text-foreground">
            Tools
          </Link>
        </nav>

        <div className="ml-auto hidden w-56 md:block">
          <SearchForm />
        </div>

        <Link
          to="/profile"
          className="hidden shrink-0 rounded-full border border-border px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground md:block"
        >
          Account
        </Link>

        <Button
          variant="secondary"
          size="icon"
          className="ml-auto md:ml-0"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {open && (
        <div className="container-page space-y-4 border-t border-border py-4">
          <Button variant="outline" className="w-full justify-start gap-2" onClick={toggle} aria-pressed={theme === "dark"}>
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            {theme === "dark" ? "Light mode" : "Dark mode"}
          </Button>
          <SearchForm onSubmit={() => setOpen(false)} />
          <nav className="grid grid-cols-2 gap-2 text-sm font-medium sm:grid-cols-4">
            {CATEGORIES.map((c) => (
              <Link
                key={c.slug}
                to="/category/$slug"
                params={{ slug: c.slug }}
                onClick={() => setOpen(false)}
                className="rounded-xl border border-border bg-card px-3 py-2"
              >
                {c.name}
              </Link>
            ))}
            <Link
              to="/tools"
              onClick={() => setOpen(false)}
              className="rounded-xl border border-border bg-card px-3 py-2"
            >
              Tools
            </Link>
            <Link
              to="/contact"
              onClick={() => setOpen(false)}
              className="rounded-xl border border-border bg-card px-3 py-2"
            >
              Contact
            </Link>
            <Link
              to="/profile"
              onClick={() => setOpen(false)}
              className="rounded-xl border border-border bg-card px-3 py-2"
            >
              Account
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-border py-12 text-sm text-muted-foreground">
      <div className="container-page grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="font-display text-lg font-extrabold text-foreground">
            Pug<span className="text-primary">clicks</span>
          </div>
          <p className="mt-2 max-w-xs">Making technology easier to understand. {SITE_TAGLINE}.</p>
          <p className="mt-2">{CONTACT_EMAIL}</p>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">Topics</h3>
          <ul className="mt-3 space-y-2">
            {CATEGORIES.map((c) => (
              <li key={c.slug}>
                <Link to="/category/$slug" params={{ slug: c.slug }} className="hover:text-foreground">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">Site</h3>
          <ul className="mt-3 space-y-2">
            <li>
              <Link to="/tools" className="hover:text-foreground">
                Tools
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-foreground">
                About
              </Link>
            </li>
            <li>
              <Link to="/faq" className="hover:text-foreground">
                FAQs
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-foreground">
                Contact
              </Link>
            </li>
            <li>
              <Link to="/credits" className="hover:text-foreground">
                Credits
              </Link>
            </li>
            <li>
              <Link to="/referral" className="hover:text-foreground">
                Recommended tools
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-foreground">
                Editorial policy
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-foreground">
                Corrections
              </Link>
            </li>
            <li>
              <Link to="/credits" className="hover:text-foreground">
                Sources
              </Link>
            </li>
            <li>
              <a href="/sitemap.xml" className="hover:text-foreground">
                Sitemap
              </a>
            </li>
            <li>
              <a href="/rss.xml" className="hover:text-foreground">
                RSS feed
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">Legal</h3>
          <ul className="mt-3 space-y-2">
            <li>
              <Link to="/privacy" className="hover:text-foreground">
                Privacy policy
              </Link>
            </li>
            <li>
              <Link to="/terms" className="hover:text-foreground">
                Terms
              </Link>
            </li>
            <li>
              <Link to="/privacy" className="hover:text-foreground">
                Cookie settings
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="container-page mt-8 border-t border-border pt-6 text-xs">
        © {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
      </div>
    </footer>
  );
}

export function NewsletterCta() {
  return (
    <section className="container-page pt-16">
      <div className="rounded-2xl bg-ink px-6 py-10 text-ink-foreground sm:px-10">
        <h2 className="text-2xl sm:text-3xl">Get smarter with technology.</h2>
        <p className="mt-2 max-w-xl text-sm opacity-80">
          One useful AI or tech discovery every week. No spam.
        </p>
        <NewsletterForm />
      </div>
    </section>
  );
}

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 pb-16">{children}</main>
      <SiteFooter />
    </div>
  );
}

export function Breadcrumbs({ items }: { items: { label: string; to?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground">
      <ol className="flex flex-wrap items-center gap-2">
        <li>
          <Link to="/" className="hover:text-primary">
            Home
          </Link>
        </li>
        {items.map((item) => (
          <li key={item.label} className="flex items-center gap-2">
            <span aria-hidden>/</span>
            {item.to ? (
              <a href={item.to} className="hover:text-primary">
                {item.label}
              </a>
            ) : (
              <span className="text-foreground">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
