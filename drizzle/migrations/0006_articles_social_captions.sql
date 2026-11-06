ALTER TABLE public.articles ADD COLUMN social_captions jsonb NOT NULL DEFAULT '{}'::jsonb;
COMMENT ON COLUMN public.articles.social_captions IS 'Ready-to-post social captions (Instagram/X/Reddit) generated on publish.';
GRANT SELECT, INSERT, UPDATE, DELETE ON public.articles TO authenticated;
GRANT ALL ON public.articles TO service_role;