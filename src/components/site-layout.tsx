import { Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { Menu, Search } from "lucide-react";
import { CATEGORIES, CONTACT_EMAIL, SITE_NAME, SITE_TAGLINE } from "@/lib/site";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
        placeholder="Search articles"
        aria-label="Search articles"
        className="h-10 bg-secondary"
      />
      <Button type="submit" size="icon" className="h-10 w-10 shrink-0" aria-label="Search">
        <Search className="h-4 w-4" />
      </Button>
    </form>
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">
      <div className="container-page flex min-h-16 flex-wrap items-center gap-4 py-3">
        <Link to="/" className="font-display text-2xl leading-none">
          Pug<span className="text-primary">clicks</span>
        </Link>

        <nav className="ml-4 hidden flex-1 items-center gap-5 text-sm text-muted-foreground md:flex">
          {CATEGORIES.map((c) => (
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
          <Link to="/about" className="transition-colors hover:text-foreground">
            About
          </Link>
        </nav>

        <div className="ml-auto hidden w-64 md:block">
          <SearchForm />
        </div>

        <Button
          variant="secondary"
          size="icon"
          className="ml-auto md:hidden"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {open && (
        <div className="container-page space-y-4 border-t border-border py-4 md:hidden">
          <SearchForm onSubmit={() => setOpen(false)} />
          <nav className="grid grid-cols-2 gap-2 text-sm">
            {CATEGORIES.map((c) => (
              <Link
                key={c.slug}
                to="/category/$slug"
                params={{ slug: c.slug }}
                onClick={() => setOpen(false)}
                className="rounded-md bg-secondary px-3 py-2"
              >
                {c.name}
              </Link>
            ))}
            <Link to="/about" onClick={() => setOpen(false)} className="rounded-md bg-secondary px-3 py-2">
              About
            </Link>
            <Link to="/contact" onClick={() => setOpen(false)} className="rounded-md bg-secondary px-3 py-2">
              Contact
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border py-10 text-sm text-muted-foreground">
      <div className="container-page grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="font-display text-xl text-foreground">
            Pug<span className="text-primary">clicks</span>
          </div>
          <p className="mt-2 max-w-xs">{SITE_TAGLINE}. An independent entertainment publication.</p>
          <p className="mt-2">{CONTACT_EMAIL}</p>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">Sections</h3>
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
          <h3 className="text-sm font-semibold text-foreground">Publication</h3>
          <ul className="mt-3 space-y-2">
            <li>
              <Link to="/about" className="hover:text-foreground">
                About & team
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
              <Link to="/admin" className="hover:text-foreground">
                Editor dashboard
              </Link>
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
          </ul>
        </div>
      </div>
      <div className="container-page mt-8 border-t border-border pt-6 text-xs">
        © {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
      </div>
    </footer>
  );
}

export function StickyMobileCta() {
  return (
    <div className="fixed inset-x-3 bottom-3 z-40 md:hidden">
      <Link
        to="/contact"
        className="flex items-center justify-center rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground shadow-[var(--shadow-card)]"
      >
        Pitch a story or ask a question
      </Link>
    </div>
  );
}

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 pb-20 md:pb-0">{children}</main>
      <SiteFooter />
      <StickyMobileCta />
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
