CREATE TYPE public.app_role AS ENUM ('admin', 'editor', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.claim_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN
    RETURN false;
  END IF;
  IF EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    RETURN EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin' AND user_id = uid);
  END IF;
  INSERT INTO public.user_roles (user_id, role) VALUES (uid, 'admin')
  ON CONFLICT DO NOTHING;
  RETURN true;
END;
$$;

CREATE TABLE public.articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  category text NOT NULL,
  excerpt text NOT NULL DEFAULT '',
  body text NOT NULL DEFAULT '',
  author text NOT NULL DEFAULT 'Pugclicks Staff',
  image_alt text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'draft',
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX articles_category_idx ON public.articles (category);
CREATE INDEX articles_status_idx ON public.articles (status);

GRANT SELECT ON public.articles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.articles TO authenticated;
GRANT ALL ON public.articles TO service_role;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published articles are public"
ON public.articles FOR SELECT TO anon, authenticated
USING (status = 'published');

CREATE POLICY "Admins can view all articles"
ON public.articles FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert articles"
ON public.articles FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update articles"
ON public.articles FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete articles"
ON public.articles FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER articles_set_updated_at
BEFORE UPDATE ON public.articles
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.articles (slug, title, category, excerpt, body, author, image_alt, status, published_at) VALUES
('sample-what-makes-a-great-blockbuster-opening', 'SAMPLE: What Makes A Great Blockbuster Opening Scene', 'movies', 'A sample article exploring how the first five minutes of a blockbuster set audience expectations.', 'This is a clearly labelled sample article. Replace it with your own original reporting before launch.

A strong opening scene does three things at once: it establishes tone, it introduces stakes, and it teaches the audience how to watch the rest of the film. When any one of those is missing, the rest of the runtime has to work harder.

Tone is usually set by sound and pacing rather than dialogue. Editors often cut the first sequence tighter than the rest of the movie so viewers settle into the rhythm quickly.

Stakes do not need to be world-ending. A small, specific problem introduced early often lands harder than a vague global threat, because the audience can measure progress against it.

Replace this placeholder text with your own analysis, and always credit the sources and images you use.', 'Pugclicks Staff', 'Placeholder image slot for a cinema screen article', 'published', now() - interval '1 day'),
('sample-how-streaming-changed-season-pacing', 'SAMPLE: How Streaming Changed Season Pacing On TV', 'tv', 'A sample piece on why weekly releases and binge drops produce different kinds of storytelling.', 'This is a clearly labelled sample article. Replace it with your own original reporting before launch.

Weekly releases reward cliffhangers and discussion. Binge drops reward momentum. Writers rooms now plan for both, sometimes on the same show.

A weekly schedule gives each episode room to be talked about, which favours self-contained mysteries and clear episode-level questions.

A full-season drop favours continuous escalation, because viewers rarely stop at a natural break point.

Swap this text for your own reporting and interviews.', 'Pugclicks Staff', 'Placeholder image slot for a television series article', 'published', now() - interval '2 days'),
('sample-indie-games-worth-your-weekend', 'SAMPLE: Indie Games Worth A Weekend', 'gaming', 'A sample roundup format you can reuse for genuine indie game recommendations.', 'This is a clearly labelled sample article. Replace it with your own original reporting before launch.

Roundups work best when every entry answers one question: who is this for? A short, honest framing beats a long list of features.

Give each pick a sentence on what it does differently, a sentence on who will bounce off it, and an approximate time to finish.

Never copy store descriptions. Play the game, or clearly label the piece as a preview based on published material.', 'Pugclicks Staff', 'Placeholder image slot for an indie game article', 'published', now() - interval '3 days'),
('sample-reading-a-season-from-the-schedule', 'SAMPLE: Reading A Season From The Schedule', 'sports', 'A sample explainer on how fixture congestion shapes results across a long season.', 'This is a clearly labelled sample article. Replace it with your own original reporting before launch.

Schedules decide more than fans assume. Travel distance, rest days, and back-to-back away trips all show up in late-season form.

When you write this kind of piece, use published fixture data and be explicit about what you are and are not claiming.

Avoid predicting outcomes with false confidence. Describe pressure points instead.', 'Pugclicks Staff', 'Placeholder image slot for a sports schedule article', 'published', now() - interval '4 days'),
('sample-how-we-cover-entertainment-news', 'SAMPLE: How We Cover Entertainment News', 'news', 'A sample standards note describing sourcing, corrections and response times.', 'This is a clearly labelled sample article. Replace it with your own original reporting before launch.

Every news post should say where the information came from and when it was published. If a claim is single-sourced, say so.

Corrections belong at the bottom of the article with a timestamp, not quietly edited into the text.

We answer reader and press enquiries within two to three business days.', 'Pugclicks Staff', 'Placeholder image slot for a newsroom article', 'published', now() - interval '5 days'),
('sample-draft-upcoming-release-preview', 'SAMPLE DRAFT: Upcoming Release Preview', 'movies', 'An unpublished sample so you can see the draft workflow in the dashboard.', 'This draft exists to demonstrate the draft and publish workflow. It is not visible on the public site until published.

Write your preview here, then hit Publish in the dashboard.', 'Pugclicks Staff', 'Placeholder image slot for a draft article', 'draft', NULL);