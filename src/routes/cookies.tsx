import { createFileRoute, Link } from "@tanstack/react-router";
import { Breadcrumbs, SiteLayout } from "@/components/site-layout";
import { Button } from "@/components/ui/button";
import { CONTACT_EMAIL } from "@/lib/site";

export const Route = createFileRoute("/cookies")({
  head: () => ({
    meta: [
      { title: "Cookie policy — Pugclicks" },
      {
        name: "description",
        content: "Which cookies Pugclicks and its advertising partners use, and how to change your cookie choice.",
      },
      { property: "og:title", content: "Cookie policy — Pugclicks" },
      { property: "og:description", content: "Cookies used on Pugclicks and how to manage your choice." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/cookies" },
    ],
    links: [{ rel: "canonical", href: "/cookies" }],
  }),
  component: CookiesPage,
});

const COOKIE_TABLE: { who: string; what: string; why: string }[] = [
  {
    who: "Pugclicks (essential)",
    what: "Sign-in session cookie for your account; a short-lived browser storage flag that remembers your cookie choice and prevents duplicate visit counts in one session.",
    why: "Keeping the site working: staying signed in, counting visits accurately, remembering your preferences.",
  },
  {
    who: "Google AdSense",
    what: "Advertising cookies that Google and its certified partners may set to show and measure ads.",
    why: "Funding the site so we can keep publishing free guides. See Google's Ads help centre for details on personalised ads.",
  },
  {
    who: "HilltopAds and Monetag",
    what: "Ad networks that may set cookies or similar identifiers to serve and measure their ad formats.",
    why: "Funding the site. Their own privacy policies describe what they collect.",
  },
];

function CookiesPage() {
  function updateChoice() {
    try {
      localStorage.removeItem("pugclicks-cookie-consent");
    } catch {
      // storage unavailable — the banner already reflects current choice
    }
    window.location.reload();
  }

  return (
    <SiteLayout>
      <div className="container-page max-w-3xl pt-8">
        <Breadcrumbs items={[{ label: "Cookie policy" }]} />
        <h1 className="mt-4 text-4xl">Cookie policy</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Cookies are small files a website stores in your browser. We keep them to a minimum, and we tell you
          exactly who else sets them.
        </p>

        <div className="article-prose mt-8 space-y-5">
          <h2 className="text-2xl text-foreground">What we use and why</h2>
          <div className="overflow-x-auto rounded-xl border border-border bg-card">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="p-4">Who sets it</th>
                  <th className="p-4">What it does</th>
                  <th className="p-4">Why</th>
                </tr>
              </thead>
              <tbody>
                {COOKIE_TABLE.map((row) => (
                  <tr key={row.who} className="border-t border-border align-top">
                    <td className="p-4 font-semibold">{row.who}</td>
                    <td className="p-4 text-muted-foreground">{row.what}</td>
                    <td className="p-4 text-muted-foreground">{row.why}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2 className="text-2xl text-foreground">Your choice</h2>
          <p>
            When you first visit, a small banner asks whether you accept advertising cookies or want essential
            cookies only. We store your answer in your browser — not on our servers — and don't nag you again.
          </p>
          <p>
            You can change your mind at any time by clicking the button below, which shows the banner again. You
            can also block or delete cookies in your browser settings; the site keeps working without them, though
            signing in and personalised ads will be affected.
          </p>
          <Button variant="secondary" onClick={updateChoice}>
            Update my cookie choice
          </Button>

          <h2 className="text-2xl text-foreground">Questions</h2>
          <p>
            Anything about cookies or privacy you want explained, write to {CONTACT_EMAIL}. See also our{" "}
            <Link to="/privacy" className="font-semibold text-primary">
              privacy policy
            </Link>
            .
          </p>
        </div>
      </div>
    </SiteLayout>
  );
}
