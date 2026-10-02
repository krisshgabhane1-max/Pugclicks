import { useMemo, useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function PromptOptimizer() {
  const [task, setTask] = useState("");
  const [role, setRole] = useState("");
  const [audience, setAudience] = useState("");
  const [format, setFormat] = useState("Bullet points");
  const [copied, setCopied] = useState(false);

  const prompt = useMemo(() => {
    if (!task.trim()) return "";
    return [
      role.trim() && `You are ${role.trim()}.`,
      `Task: ${task.trim()}`,
      audience.trim() && `Audience: ${audience.trim()}.`,
      `Format: ${format}.`,
      "Be specific and accurate. If you are unsure about a fact, say so instead of guessing.",
      "Before answering, ask me up to 2 clarifying questions if anything important is missing.",
    ]
      .filter(Boolean)
      .join("\n");
  }, [task, role, audience, format]);

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
      <h2 className="text-lg">AI Prompt Optimizer</h2>
      <p className="mt-1 text-sm text-muted-foreground">Turn a rough idea into a clear, structured prompt for ChatGPT, Claude or Gemini.</p>
      <div className="mt-4 grid gap-3">
        <Textarea value={task} onChange={(e) => setTask(e.target.value.slice(0, 2000))} placeholder="What do you want the AI to do?" aria-label="Task" />
        <div className="grid gap-3 sm:grid-cols-3">
          <Input value={role} onChange={(e) => setRole(e.target.value.slice(0, 120))} placeholder="Role (e.g. a math tutor)" aria-label="Role" />
          <Input value={audience} onChange={(e) => setAudience(e.target.value.slice(0, 120))} placeholder="Audience (e.g. beginners)" aria-label="Audience" />
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            aria-label="Output format"
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            {["Bullet points", "Step-by-step list", "Short paragraph", "Table", "Email draft"].map((f) => (
              <option key={f}>{f}</option>
            ))}
          </select>
        </div>
      </div>
      {prompt && (
        <div className="mt-4">
          <pre className="whitespace-pre-wrap rounded-xl bg-secondary p-4 font-mono text-xs">{prompt}</pre>
          <Button
            size="sm"
            className="mt-3"
            onClick={async () => {
              await navigator.clipboard.writeText(prompt);
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            }}
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} {copied ? "Copied" : "Copy prompt"}
          </Button>
        </div>
      )}
    </div>
  );
}

export function CostCalculator() {
  const [price, setPrice] = useState("20");
  const [seats, setSeats] = useState("1");
  const [hours, setHours] = useState("2");
  const [rate, setRate] = useState("10");
  const n = (v: string) => Math.max(0, Number(v) || 0);
  const monthly = n(price) * n(seats);
  const yearly = monthly * 12;
  const saved = n(hours) * 4.33 * n(rate) * n(seats);
  const fmt = (v: number) => v.toLocaleString(undefined, { maximumFractionDigits: 0 });

  const field = (label: string, v: string, set: (s: string) => void) => (
    <label className="grid gap-1 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <Input type="number" min={0} inputMode="decimal" value={v} onChange={(e) => set(e.target.value)} />
    </label>
  );

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
      <h2 className="text-lg">AI Tool Cost Calculator</h2>
      <p className="mt-1 text-sm text-muted-foreground">Enter the plan price from the tool's official pricing page to see if it pays for itself.</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {field("Price per user / month", price, setPrice)}
        {field("Number of users", seats, setSeats)}
        {field("Hours saved per user / week", hours, setHours)}
        {field("Value of one hour of your time", rate, setRate)}
      </div>
      <dl className="mt-5 grid gap-3 text-center sm:grid-cols-3">
        <div className="rounded-xl bg-secondary p-3"><dt className="text-xs text-muted-foreground">Monthly cost</dt><dd className="text-xl font-bold">{fmt(monthly)}</dd></div>
        <div className="rounded-xl bg-secondary p-3"><dt className="text-xs text-muted-foreground">Yearly cost</dt><dd className="text-xl font-bold">{fmt(yearly)}</dd></div>
        <div className="rounded-xl bg-secondary p-3"><dt className="text-xs text-muted-foreground">Monthly value saved</dt><dd className={`text-xl font-bold ${saved >= monthly ? "text-primary" : "text-destructive"}`}>{fmt(saved)}</dd></div>
      </dl>
      <p className="mt-3 text-xs text-muted-foreground">
        {monthly === 0 ? "Free plan — any time saved is a win." : saved >= monthly ? `Worth it: about ${(saved / monthly).toFixed(1)}× its cost.` : "Costs more than the time it saves at these numbers."}
      </p>
    </div>
  );
}
