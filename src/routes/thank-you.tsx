import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { SiteLayout } from "@/components/site-layout";
import { Button } from "@/components/ui/button";
import { RESPONSE_PROMISE } from "@/lib/site";

export const Route = createFileRoute("/thank-you")({
  head: () => ({
    meta: [
      { title: "Thank You — Pugclicks" },
      {
        name: "description",
        content: "Your message reached Pugclicks. We reply to every enquiry within 2–3 business days.",
      },
      { property: "og:title", content: "Thank You — Pugclicks" },
      { property: "og:description", content: "Message received. Expect a reply within 2–3 business days." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/thank-you" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "/thank-you" }],
  }),
  component: ThankYouPage,
});

function ThankYouPage() {
  return (
    <SiteLayout>
      <div className="container-page max-w-xl py-20 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-primary" aria-hidden />
        <h1 className="mt-6 text-4xl">Thanks — message received</h1>
        <p className="mt-3 text-muted-foreground">{RESPONSE_PROMISE}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild>
            <Link to="/">Back to the homepage</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link to="/faq">Read the FAQs</Link>
          </Button>
        </div>
      </div>
    </SiteLayout>
  );
}
