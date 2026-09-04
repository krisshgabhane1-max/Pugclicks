import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/site-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Reset Your Password — Pugclicks" },
      { name: "description", content: "Request a password reset link for your Pugclicks account." },
      { property: "og:title", content: "Reset Your Password — Pugclicks" },
      { property: "og:description", content: "Request a Pugclicks password reset link." },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ForgotPassword,
});

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setSent(true);
    toast.success("Reset link sent if that email has an account.");
  }

  return (
    <SiteLayout>
      <div className="container-page max-w-md py-16">
        <h1 className="text-3xl">Forgot your password?</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Enter your email and we'll send a reset link.
        </p>
        {sent ? (
          <p className="mt-8 rounded-xl border border-border bg-card p-5 text-sm">
            Check your inbox for the reset link. It can take a couple of minutes to arrive.
          </p>
        ) : (
          <form onSubmit={onSubmit} className="mt-8 grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-secondary"
              />
            </div>
            <Button type="submit" disabled={busy}>
              Send reset link
            </Button>
          </form>
        )}
        <Link to="/login" className="mt-6 block text-sm text-primary">
          Back to sign in
        </Link>
      </div>
    </SiteLayout>
  );
}
