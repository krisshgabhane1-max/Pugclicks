import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { runLovableStructured } from "./ai.server";
import { SITE_NAME } from "./site";

export type SocialCaptions = {
  instagram: string;
  x: string;
  reddit: string;
  generated_at?: string;
};

const inputSchema = z.object({ articleId: z.string().min(8) });

/**
 * Admin-only: generates ready-to-post captions for Instagram, X and Reddit
 * from the article's own title/excerpt and saves them on the article.
 */
export const generateSocialCaptions = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => inputSchema.parse(input))
  .handler(async ({ data, context }) => {
    // Verify the caller really is an admin (RLS limits this read to own rows).
    const { data: role } = await context.supabase
      .from("user_roles")
      .select("id")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();
    if (!role) throw new Error("Only admins can generate captions.");

    const { data: article, error } = await context.supabase
      .from("articles")
      .select("id, title, excerpt, category, slug")
      .eq("id", data.articleId)
      .single();
    if (error || !article) throw new Error("Article not found.");

    const captions = await runLovableStructured<Record<string, string>>({
      system: `You write social media captions for ${SITE_NAME}, a calm, practical tech and pop-culture publication. Voice: plain, useful, no hype, no invented facts. Return only what the schema asks for.`,
      prompt: `Write three ready-to-post captions for this article:\nTitle: ${article.title}\nSummary: ${article.excerpt}\nSection: ${article.category}\nLink: https://pugclicks.lovable.app/article/${article.slug}\n\nRules:\n- instagram: 1-2 short friendly lines plus 3-5 relevant hashtags.\n- x: one punchy line, max 240 characters, at most 1-2 hashtags.\n- reddit: conversational 2-3 sentences, no hashtags, written like a genuine post intro.\n- Keep every claim true to the title and summary. Do not invent numbers or quotes.`,
      schema: z.object({
        instagram: z.string(),
        x: z.string(),
        reddit: z.string(),
      }),
    });

    const payload: SocialCaptions = {
      instagram: captions.instagram,
      x: captions.x,
      reddit: captions.reddit,
      generated_at: new Date().toISOString(),
    };

    const { error: updateError } = await context.supabase
      .from("articles")
      .update({ social_captions: payload })
      .eq("id", article.id);
    if (updateError) throw new Error(updateError.message);

    return payload;
  });

/** Admin-only: fetch the captions already stored for an article. */
export const getSocialCaptions = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => inputSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { data: article, error } = await context.supabase
      .from("articles")
      .select("social_captions")
      .eq("id", data.articleId)
      .single();
    if (error) throw new Error(error.message);
    return (article?.social_captions ?? null) as SocialCaptions | null;
  });
