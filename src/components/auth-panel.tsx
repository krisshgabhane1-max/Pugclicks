import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/hooks/useAuth";

export function AuthPanel({ mode }: { mode: "signin" | "signup" }) {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (session) navigate({ to: "/profile" });
  }, [session, navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/profile` },
        });
        if (error) throw error;
        toast.success("Account created. If confirmation is required, check your inbox.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  async function onGoogle() {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error("Google sign-in failed");
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/profile" });
  }

  return (
    <div className="container-page max-w-md py-16">
      <h1 className="text-3xl">{mode === "signin" ? "Sign in" : "Create your account"}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {mode === "signin"
          ? "Sign in to follow Pugclicks, like articles and join the comments."
          : "Free account. Follow Pugclicks, like articles and comment — publishing stays with the editors."}
      </p>

      <form onSubmit={onSubmit} className="mt-8 grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-secondary"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            required
            minLength={6}
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-secondary"
          />
        </div>
        <Button type="submit" disabled={busy}>
          {mode === "signin" ? "Sign in" : "Create account"}
        </Button>
      </form>

      <Button variant="secondary" className="mt-3 w-full" onClick={onGoogle}>
        Continue with Google
      </Button>

      <div className="mt-6 grid gap-2 text-sm">
        {mode === "signin" ? (
          <>
            <Link to="/signup" className="text-primary">
              Need an account? Sign up
            </Link>
            <Link to="/forgot-password" className="text-muted-foreground hover:text-foreground">
              Forgot your password?
            </Link>
          </>
        ) : (
          <Link to="/login" className="text-primary">
            Already have an account? Sign in
          </Link>
        )}
      </div>
    </div>
  );
}
