import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles } from "lucide-react";
import type { Article } from "@/lib/articles.functions";
import { categoryName, formatDate, readingTime } from "@/lib/site";

export function ArticleMedia({
  alt,
  src,
  className = "h-40",
}: {
  alt: string;
  src?: string | null;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  if (src && !failed) {
    return (
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onError={() => setFailed(true)}
        className={`w-full ${className} object-cover bg-accent`}
      />
    );
  }
  return (
    <div
      role="img"
      aria-label={alt}
      className={`flex ${className} items-center justify-center bg-accent text-accent-foreground`}
    >
      <Sparkles className="h-7 w-7" aria-hidden />
    </div>
  );
}

export function ArticleCard({ article, featured = false }: { article: Article; featured?: boolean }) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-glow)]">
      <Link to="/article/$slug" params={{ slug: article.slug }} className="block">
        <ArticleMedia
          alt={article.image_alt || article.title}
          src={article.cover_image}
          className={featured ? "h-48" : "h-40"}
        />
        <div className="p-5">
          <span className="kicker">{categoryName(article.category)}</span>
          <h3
            className={`mt-2 leading-snug group-hover:text-primary ${featured ? "text-xl sm:text-2xl" : "text-lg"}`}
          >
            {article.title}
          </h3>
          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{article.excerpt}</p>
          <p className="mt-3 text-xs text-muted-foreground">
            {readingTime(article.body)} · {formatDate(article.published_at)}
          </p>
        </div>
      </Link>
    </article>
  );
}
