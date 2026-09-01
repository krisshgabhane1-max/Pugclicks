import { Link } from "@tanstack/react-router";
import { Film } from "lucide-react";
import type { Article } from "@/lib/articles.functions";
import { categoryName, formatDate } from "@/lib/site";

export function ArticleMedia({ alt, className = "h-40" }: { alt: string; className?: string }) {
  return (
    <div
      role="img"
      aria-label={alt}
      className={`flex ${className} items-center justify-center bg-gradient-to-br from-accent to-surface text-muted-foreground`}
    >
      <Film className="h-8 w-8" aria-hidden />
    </div>
  );
}

export function ArticleCard({ article, featured = false }: { article: Article; featured?: boolean }) {
  return (
    <article className="group overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-card)]">
      <Link to="/article/$slug" params={{ slug: article.slug }} className="block">
        <ArticleMedia alt={article.image_alt || article.title} className={featured ? "h-56" : "h-40"} />
        <div className="p-5">
          <span className="kicker">{categoryName(article.category)}</span>
          <h3
            className={`mt-2 leading-tight group-hover:text-primary ${featured ? "text-2xl" : "text-lg"}`}
          >
            {article.title}
          </h3>
          <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{article.excerpt}</p>
          <p className="mt-3 text-xs text-muted-foreground">
            {article.author} · {formatDate(article.published_at)}
          </p>
        </div>
      </Link>
    </article>
  );
}
