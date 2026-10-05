import { useEffect, useRef } from "react";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

type AdSlotProps = {
  slot?: string;
  /** "display" = responsive banner, "in-article" = fluid ad inside article text */
  layout?: "display" | "in-article";
  label?: string;
};

/** AdSense unit. The adsbygoogle.js script is loaded once in __root. */
export function AdSlot({ slot = "693245892", layout = "display", label = "Advertisement" }: AdSlotProps) {
  const pushed = useRef(false);
  useEffect(() => {
    if (pushed.current) return;
    pushed.current = true;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      /* ad blocked or not ready */
    }
  }, []);

  const isInArticle = layout === "in-article";
  return (
    <section className="container-page pt-14" aria-label={label}>
      <p className="mb-2 text-center text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <div className="mx-auto min-h-[280px] w-full overflow-hidden">
        <ins
          className="adsbygoogle"
          style={isInArticle ? { display: "block", textAlign: "center" } : { display: "block", minHeight: 280 }}
          data-ad-layout={isInArticle ? "in-article" : undefined}
          data-ad-format={isInArticle ? "fluid" : "auto"}
          data-ad-client="ca-pub-8663839591787832"
          data-ad-slot={slot}
          data-full-width-responsive="true"
        />
      </div>
    </section>
  );
}
