import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, ShieldAlert, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { analyzeSecurityReport, listSecurityReports, type SecurityReport } from "@/lib/security.functions";
import { formatDate } from "@/lib/site";

export const Route = createFileRoute("/admin/security")({
  head: () => ({
    meta: [
      { title: "Pugclicks" },
      { name: "robots", content: "noindex, nofollow, noarchive" },
    ],
  }),
  component: AdminSecurity,
});

const EXAMPLES = [
  "I got an email saying someone tried to sign in to my account from another country, but I did not try to sign in.",
  "I received a password reset email that I never requested.",
  "My login worked yesterday but today the password does not work, and I did not change it.",
  "A reader emailed me a link claiming my account will be deleted unless I confirm my password on another website.",
];

function Analysis({ text }: { text: string }) {
  const lines = text.split("\n");
  const blocks: React.ReactNode[] = [];
  let bullets: string[] = [];
  let numbers: string[] = [];

  function flush() {
    if (bullets.length) {
      blocks.push(
        <ul key={`ul-${blocks.length}`} className="my-2 list-disc space-y-1 pl-5">
          {bullets.map((b, i) => (
            <li key={i}>{b}</li>
          ))}
        </ul>,
      );
      bullets = [];
    }
    if (numbers.length) {
      blocks.push(
        <ol key={`ol-${blocks.length}`} className="my-2 list-decimal space-y-1 pl-5">
          {numbers.map((b, i) => (
            <li key={i}>{b}</li>
          ))}
        </ol>,
      );
      numbers = [];
    }
  }

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      flush();
      continue;
    }
    if (/^#{2,3}\s/.test(line)) {
      flush();
      blocks.push(
        <h3 key={`h-${blocks.length}`} className="mt-4 text-base font-semibold">
          {line.replace(/^#{2,3}\s/, "")}
        </h3>,
      );
    } else if (/^[-*]\s/.test(line)) {
      numbers.length && flush();
      bullets.push(line.replace(/^[-*]\s/, ""));
    } else if (/^\d+[.)]\s/.test(line)) {
      bullets.length && flush();
      numbers.push(line.replace(/^\d+[.)]\s/, ""));
    } else {
      flush();
      blocks.push(<p key={`p-${blocks.length}`} className="mt-2">{line}</p>);
    }
  }
  flush();
  return <div className="text-sm leading-relaxed">{blocks}</div>;
}

function AdminSecurity() {
  const analyze = useServerFn(analyzeSecurityReport);
  const loadReports = useServerFn(listSecurityReports);

  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reports, setReports] = useState<SecurityReport[] | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setAnalysis(null);
    const result = await analyze({ data: { description } });
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setAnalysis(result.analysis);
    setDescription("");
    loadReports().then(setReports).catch(() => {});
  }

  if (reports === null) {
    loadReports().then(setReports).catch(() => setReports([]));
  }

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-primary" aria-hidden />
          <h2 className="text-lg font-semibold">Suspicious activity advisor</h2>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Describe what happened — a strange login alert, a password reset you did not ask for, a
          phishing email, a session you do not recognise. The AI analyzes your description and gives
          you concrete steps to protect the account.
        </p>

        <form className="mt-4 space-y-3" onSubmit={submit}>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            maxLength={4000}
            required
            aria-label="Describe the suspicious activity"
            placeholder="Example: I got an alert about a sign-in from a device I don't recognise…"
            className="min-h-28 bg-background"
          />
          <div className="flex flex-wrap gap-2">
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                type="button"
                onClick={() => setDescription(ex)}
                className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
              >
                {ex.length > 44 ? `${ex.slice(0, 44)}…` : ex}
              </button>
            ))}
          </div>
          <Button type="submit" disabled={busy} className="gap-2">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Sparkles className="h-4 w-4" aria-hidden />}
            {busy ? "Analyzing…" : "Analyze with AI"}
          </Button>
        </form>

        {error && <p className="mt-4 text-sm font-medium text-destructive">{error}</p>}
        {analysis && (
          <div className="mt-6 rounded-xl border border-border bg-background p-4 sm:p-5">
            <Analysis text={analysis} />
            <p className="mt-4 border-t border-border pt-3 text-xs text-muted-foreground">
              Automated guidance, not a substitute for professional incident response. Never share
              your password with anyone, including sites claiming to be Pugclicks.
            </p>
          </div>
        )}
      </section>

      {reports && reports.length > 0 && (
        <section aria-labelledby="past-reports">
          <h2 id="past-reports" className="text-lg font-semibold">
            Past reports
          </h2>
          <div className="mt-3 grid gap-3">
            {reports.map((r) => (
              <details key={r.id} className="rounded-xl border border-border bg-card p-4">
                <summary className="cursor-pointer text-sm font-medium">
                  {r.description.length > 90 ? `${r.description.slice(0, 90)}…` : r.description}
                  <span className="ml-2 text-xs font-normal text-muted-foreground">{formatDate(r.created_at)}</span>
                </summary>
                <div className="mt-3 border-t border-border pt-3">
                  <Analysis text={r.analysis} />
                </div>
              </details>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
