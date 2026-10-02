import { useEffect, useRef } from "react";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

/** Responsive AdSense display unit. The adsbygoogle.js script is loaded once in __root. */
export function AdSlot({ slot = "693245892" }: { slot?: string }) {
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
  return (
    <section className="container-page pt-14" aria-label="Advertisement">
      <p className="mb-2 text-center text-[11px] uppercase tracking-wider text-muted-foreground">Advertisement</p>
      <div className="mx-auto min-h-[280px] w-full overflow-hidden">
        <ins
          className="adsbygoogle"
          style={{ display: "block", minHeight: 280 }}
          data-ad-client="ca-pub-8663839591787832"
          data-ad-slot={slot}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    </section>
  );
}
