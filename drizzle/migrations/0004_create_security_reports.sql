CREATE TABLE public.security_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  description text NOT NULL,
  analysis text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.security_reports TO authenticated;
GRANT ALL ON public.security_reports TO service_role;
ALTER TABLE public.security_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read security reports" ON public.security_reports FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins create security reports" ON public.security_reports FOR INSERT TO authenticated WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));