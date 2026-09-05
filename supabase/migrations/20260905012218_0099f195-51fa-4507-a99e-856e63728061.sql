-- Image library access
CREATE POLICY "Site images are readable"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'site-images');

CREATE POLICY "Admins can upload site images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'site-images' AND private.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can replace site images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'site-images' AND private.has_role(auth.uid(), 'admin'))
  WITH CHECK (bucket_id = 'site-images' AND private.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete site images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'site-images' AND private.has_role(auth.uid(), 'admin'));

-- Editable site content (homepage text, buttons, section order, SEO, referrals, credits)
CREATE TABLE public.site_content (
  key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.site_content TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_content TO authenticated;
GRANT ALL ON public.site_content TO service_role;

ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Site content is public"
  ON public.site_content FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can insert site content"
  ON public.site_content FOR INSERT
  TO authenticated
  WITH CHECK (private.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update site content"
  ON public.site_content FOR UPDATE
  TO authenticated
  USING (private.has_role(auth.uid(), 'admin'))
  WITH CHECK (private.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete site content"
  ON public.site_content FOR DELETE
  TO authenticated
  USING (private.has_role(auth.uid(), 'admin'));

CREATE TRIGGER site_content_set_updated_at
  BEFORE UPDATE ON public.site_content
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.site_content (key, value) VALUES
  ('home', '{
    "heroTitle": "AI & Technology, Made Simple.",
    "heroSubtitle": "Practical guides, useful AI tools, and technology tutorials that actually help you get things done.",
    "heroPrimaryLabel": "Explore Guides →",
    "heroPrimaryHref": "/category/guides",
    "heroSecondaryLabel": "AI Tools →",
    "heroSecondaryHref": "/tools",
    "trustLine": "Practical • Beginner-friendly • No unnecessary hype",
    "heroImage": "",
    "startHereTitle": "New to AI? Start here",
    "topicsTitle": "Explore Topics",
    "latestTitle": "Latest Guides",
    "toolsTitle": "Useful Tools",
    "newsletterTitle": "Get smarter with technology.",
    "newsletterSubtitle": "One useful AI or tech discovery every week. No spam.",
    "newsletterButton": "Subscribe →",
    "footerTagline": "Making technology easier to understand.",
    "sections": ["hero", "featured", "startHere", "topics", "latest", "tools", "newsletter"]
  }'::jsonb),
  ('seo', '{
    "homeTitle": "Pugclicks — AI & Technology, Made Simple",
    "homeDescription": "Practical guides, useful AI tools, and technology tutorials that actually help you get things done.",
    "shareImage": ""
  }'::jsonb),
  ('referral', '{
    "title": "Tools we recommend",
    "intro": "Links on this page may earn Pugclicks a commission. Recommendations do not change because of it.",
    "items": []
  }'::jsonb),
  ('credits', '{
    "title": "Credits & thanks",
    "intro": "Pugclicks is built with help from these tools.",
    "items": [
      { "name": "Google", "note": "Search, AdSense and Android documentation." },
      { "name": "ChatGPT", "note": "Drafting help and explanations, always fact-checked." },
      { "name": "Lovable", "note": "The platform this site is built on." }
    ]
  }'::jsonb);