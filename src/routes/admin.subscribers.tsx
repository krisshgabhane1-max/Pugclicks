import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Mail, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  listNewsletterSubscribers,
  removeNewsletterSubscriber,
  type Subscriber,
} from "@/lib/newsletter.functions";
import { formatDate } from "@/lib/site";

export const Route = createFileRoute("/admin/subscribers")({
  head: () => ({
    meta: [
      { title: "Pugclicks" },
      { name: "robots", content: "noindex, nofollow, noarchive" },
    ],
  }),
  component: AdminSubscribers,
});

function AdminSubscribers() {
  const list = useServerFn(listNewsletterSubscribers);
  const remove = useServerFn(removeNewsletterSubscriber);

  const [query, setQuery] = useState("");
  const [subscribers, setSubscribers] = useState<Subscriber[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    list().then((rows) => active && setSubscribers(rows)).catch((e) => active && setError(e.message));
    return () => {
      active = false;
    };
  }, [list]);

  async function onDelete(id: string, email: string) {
    if (!window.confirm(`Remove ${email} from the newsletter list?`)) return;
    try {
      await remove({ data: { id } });
      setSubscribers((rows) => rows?.filter((r) => r.id !== id) ?? null);
      toast.success("Subscriber removed.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not remove subscriber.");
    }
  }

  const filtered = (subscribers ?? []).filter((s) =>
    query ? s.email.toLowerCase().includes(query.toLowerCase()) : true,
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Mail className="h-5 w-5 text-primary" aria-hidden /> Newsletter subscribers
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {subscribers ? `${subscribers.length} subscriber${subscribers.length === 1 ? "" : "s"}` : "Loading…"}
          </p>
        </div>
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search email"
          aria-label="Search subscribers"
          className="w-full sm:w-64"
        />
      </div>

      {error && <p className="text-sm font-medium text-destructive">{error}</p>}

      {subscribers && filtered.length === 0 && (
        <p className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
          No subscribers yet. Signups from the homepage newsletter box appear here automatically.
        </p>
      )}

      <div className="grid gap-2">
        {filtered.map((s) => (
          <div
            key={s.id}
            className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{s.email}</p>
              <p className="text-xs text-muted-foreground">
                {formatDate(s.created_at)}
                {s.source ? ` · via ${s.source}` : ""}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 text-muted-foreground hover:text-destructive"
              aria-label={`Remove ${s.email}`}
              onClick={() => onDelete(s.id, s.email)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
