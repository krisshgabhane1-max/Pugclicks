import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Breadcrumbs, SiteLayout } from "@/components/site-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CONTACT_EMAIL, RESPONSE_PROMISE } from "@/lib/site";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Pugclicks — Pitches, Corrections & Press" },
      {
        name: "description",
        content:
          "Send Pugclicks a pitch, correction or press enquiry. We reply to every message within 2–3 business days.",
      },
      { property: "og:title", content: "Contact Pugclicks" },
      { property: "og:description", content: "Pitches, corrections and press enquiries — replies in 2–3 business days." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/contact" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: ContactPage,
});

function ContactPage() {
  const navigate = useNavigate();
  const [subject, setSubject] = useState("Pitch");

  return (
    <SiteLayout>
      <div className="container-page max-w-2xl pt-8">
        <Breadcrumbs items={[{ label: "Contact" }]} />
        <h1 className="mt-4 text-4xl">Contact the newsroom</h1>
        <p className="mt-2 text-muted-foreground">{RESPONSE_PROMISE}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Prefer email? Write to <span className="text-primary">{CONTACT_EMAIL}</span>.
        </p>

        <form
          className="mt-8 grid gap-5"
          onSubmit={(e) => {
            e.preventDefault();
            navigate({ to: "/thank-you" });
          }}
        >
          <div className="grid gap-2">
            <Label htmlFor="name">Your name</Label>
            <Input id="name" name="name" required className="bg-secondary" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required className="bg-secondary" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="subject">Subject</Label>
            <select
              id="subject"
              name="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="h-10 rounded-md border border-input bg-secondary px-3 text-sm"
            >
              <option>Pitch</option>
              <option>Correction</option>
              <option>Press enquiry</option>
              <option>Something else</option>
            </select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="message">Message</Label>
            <Textarea id="message" name="message" required rows={7} className="bg-secondary" />
          </div>
          <Button type="submit" size="lg">
            Send message
          </Button>
          <p className="text-xs text-muted-foreground">
            This form currently confirms in the browser and does not deliver email yet. Ask to wire it up to a
            mailbox when you are ready.
          </p>
        </form>
      </div>
    </SiteLayout>
  );
}
