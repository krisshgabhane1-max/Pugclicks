import { useEffect, useState } from "react";
import { Check, Copy, Linkedin, MessageCircle, Pause, Play, Square, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SITE_NAME } from "@/lib/site";

export type Block =
  | { type: "h2" | "h3"; text: string; id: string }
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "table"; rows: string[][] };

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 60);

/** Parses a light markdown subset: ## / ### headings, - bullets, | tables |, paragraphs. */
export function parseBody(body: string): Block[] {
  return body
    .split(/\n\s*\n/)
    .map((c) => c.trim())
    .filter(Boolean)
    .map((chunk): Block => {
      const lines = chunk.split("\n").map((l) => l.trim());
      if (chunk.startsWith("### ")) return { type: "h3", text: chunk.slice(4), id: slugify(chunk.slice(4)) };
      if (chunk.startsWith("## ")) return { type: "h2", text: chunk.slice(3), id: slugify(chunk.slice(3)) };
      if (lines.every((l) => /^[-*] /.test(l))) return { type: "ul", items: lines.map((l) => l.slice(2)) };
      if (lines.every((l) => l.startsWith("|"))) {
        const rows = lines
          .filter((l) => !/^\|[\s:|-]+\|$/.test(l))
          .map((l) => l.replace(/^\||\|$/g, "").split("|").map((c) => c.trim()));
        return { type: "table", rows };
      }
      return { type: "p", text: chunk };
    });
}

export function ArticleBody({ blocks }: { blocks: Block[] }) {
  return (
    <div className="article-prose mt-4 space-y-5">
      {blocks.map((b, i) => {
        if (b.type === "h2") return <h2 key={i} id={b.id} className="scroll-mt-24 pt-4 text-2xl">{b.text}</h2>;
        if (b.type === "h3") return <h3 key={i} id={b.id} className="scroll-mt-24 pt-2 text-xl">{b.text}</h3>;
        if (b.type === "ul")
          return (
            <ul key={i} className="list-disc space-y-1 pl-6">
              {b.items.map((it, j) => <li key={j}>{it}</li>)}
            </ul>
          );
        if (b.type === "table")
          return (
            <div key={i} className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-left text-sm">
                <thead className="bg-secondary">
                  <tr>{b.rows[0]?.map((c, j) => <th key={j} className="px-3 py-2 font-semibold">{c}</th>)}</tr>
                </thead>
                <tbody>
                  {b.rows.slice(1).map((r, j) => (
                    <tr key={j} className="border-t border-border">
                      {r.map((c, k) => <td key={k} className="px-3 py-2">{c}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        return <p key={i}>{b.text}</p>;
      })}
    </div>
  );
}

export function TableOfContents({ blocks }: { blocks: Block[] }) {
  const heads = blocks.filter((b): b is Extract<Block, { type: "h2" | "h3" }> => b.type === "h2" || b.type === "h3");
  if (heads.length < 2) return null;
  return (
    <nav aria-label="Table of contents" className="mt-6 rounded-xl border border-border bg-card p-5">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">In this article</h2>
      <ol className="mt-3 space-y-1.5 text-sm">
        {heads.map((h) => (
          <li key={h.id} className={h.type === "h3" ? "pl-4" : ""}>
            <a href={`#${h.id}`} className="hover:text-primary">{h.text}</a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

/** Key points pulled from the article's own text (first sentence of the opening paragraphs). */
export function keyPoints(blocks: Block[]): string[] {
  return blocks
    .filter((b): b is Extract<Block, { type: "p" }> => b.type === "p")
    .map((b) => b.text.split(/(?<=[.!?])\s/)[0] ?? "")
    .filter((s) => s.length > 30 && s.length < 240)
    .slice(0, 3);
}

function shareLinks(url: string, text: string) {
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(text);
  return {
    whatsapp: `https://wa.me/?text=${t}%20${u}`,
    x: `https://twitter.com/intent/tweet?text=${t}&url=${u}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${u}`,
  };
}

export function ShareRow({ url, text }: { url: string; text: string }) {
  const [copied, setCopied] = useState(false);
  const l = shareLinks(url, text);
  const cls = "inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-card px-3 text-xs font-medium hover:text-primary";
  return (
    <div className="flex flex-wrap gap-2">
      <a className={cls} href={l.whatsapp} target="_blank" rel="noopener noreferrer"><MessageCircle className="h-3.5 w-3.5" />WhatsApp</a>
      <a className={cls} href={l.x} target="_blank" rel="noopener noreferrer"><Twitter className="h-3.5 w-3.5" />X</a>
      <a className={cls} href={l.linkedin} target="_blank" rel="noopener noreferrer"><Linkedin className="h-3.5 w-3.5" />LinkedIn</a>
      <button
        type="button"
        className={cls}
        onClick={async () => {
          await navigator.clipboard.writeText(`${text} ${url}`);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }}
      >
        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}

export function KeyInsights({ points, url }: { points: string[]; url: string }) {
  if (!points.length) return null;
  return (
    <section className="mt-6 rounded-xl border border-border bg-accent/40 p-5">
      <h2 className="text-lg">Key points</h2>
      <ul className="mt-3 space-y-3">
        {points.map((p, i) => (
          <li key={i} className="text-sm">
            <p>{p}</p>
            <div className="mt-2"><ShareRow url={url} text={`"${p}" — via ${SITE_NAME}`} /></div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function ReadAloud({ text }: { text: string }) {
  const [supported, setSupported] = useState(false);
  const [state, setState] = useState<"idle" | "playing" | "paused">("idle");
  useEffect(() => {
    setSupported(typeof window !== "undefined" && "speechSynthesis" in window);
    return () => {
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    };
  }, []);
  if (!supported) return null;
  const synth = window.speechSynthesis;
  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        variant="secondary"
        onClick={() => {
          if (state === "playing") { synth.pause(); setState("paused"); return; }
          if (state === "paused") { synth.resume(); setState("playing"); return; }
          synth.cancel();
          const u = new SpeechSynthesisUtterance(text);
          u.onend = () => setState("idle");
          synth.speak(u);
          setState("playing");
        }}
      >
        {state === "playing" ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        {state === "playing" ? "Pause" : state === "paused" ? "Resume" : "Listen"}
      </Button>
      {state !== "idle" && (
        <Button size="sm" variant="ghost" onClick={() => { synth.cancel(); setState("idle"); }} aria-label="Stop reading">
          <Square className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

export function AuthorBox({ name }: { name: string }) {
  return (
    <section className="mt-10 flex gap-4 rounded-xl border border-border bg-card p-5" aria-label="About the author">
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
        {name.slice(0, 1).toUpperCase()}
      </div>
      <div>
        <p className="text-xs uppercase tracking-wider text-muted-foreground">Written by</p>
        <p className="font-semibold">{name}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          The {SITE_NAME} editorial team writes practical, tested guides on AI and technology. Found a mistake? Contact
          pugclicks@gmail.com and we'll correct it.
        </p>
      </div>
    </section>
  );
}
