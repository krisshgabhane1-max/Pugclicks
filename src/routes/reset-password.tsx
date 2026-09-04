import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/site-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Choose a New Password — Pugclicks" },
      { name: "description", content: "Set a new password for your Pugclicks account." },
      { property: "og:title", content: "Choose a New Password — Pugclicks" },
      { property: "og:description", content: "Set a new Pugclicks account password." },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Password updated");
    navigate({ to: "/profile" });
  }

  return (
    <SiteLayout>
      <div className="container-page max-w-md py-16">
        <h1 className="text-3xl">Choose a new password</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Open this page from the reset link in your email, then set a new password.
        </p>
        <form onSubmit={onSubmit} className="mt-8 grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="password">New password</Label>
            <Input
              id="password"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-secondary"
            />
          </div>
          <Button type="submit" disabled={busy}>
            Update password
          </Button>
        </form>
      </div>
    </SiteLayout>
  );
}
