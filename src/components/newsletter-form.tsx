import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const emailSchema = z.string().trim().email().max(255);

export function NewsletterForm({ source = "newsletter" }: { source?: string }) {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) { toast.error("Please enter a valid email."); return; }
    setBusy(true);
    const { error } = await supabase
      .from("newsletter_subscribers")
      .insert({ email: parsed.data.toLowerCase(), source: source.slice(0, 100) });
    setBusy(false);
    if (error && error.code !== "23505") { toast.error("Couldn't subscribe. Please try again."); return; }
    setDone(true);
    toast.success("You're subscribed. Thanks!");
  }

  if (done) return <p className="mt-6 text-sm font-medium">You're on the list. Watch your inbox.</p>;
  return (
    <form className="mt-6 flex max-w-md flex-col gap-3 sm:flex-row" onSubmit={submit}>
      <Input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Your email"
        aria-label="Your email"
        className="h-11 border-transparent bg-card text-foreground"
      />
      <Button type="submit" className="h-11 shrink-0" disabled={busy}>
        {busy ? "Subscribing…" : "Subscribe →"}
      </Button>
    </form>
  );
}
