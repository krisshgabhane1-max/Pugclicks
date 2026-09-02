CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM anon, authenticated, PUBLIC;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;

CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
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

REVOKE ALL ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated, service_role;

DROP POLICY "Admins can delete articles" ON public.articles;
DROP POLICY "Admins can update articles" ON public.articles;
DROP POLICY "Admins can insert articles" ON public.articles;
DROP POLICY "Admins can view all articles" ON public.articles;

CREATE POLICY "Admins can view all articles" ON public.articles FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert articles" ON public.articles FOR INSERT TO authenticated WITH CHECK (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update articles" ON public.articles FOR UPDATE TO authenticated USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete articles" ON public.articles FOR DELETE TO authenticated USING (private.has_role(auth.uid(), 'admin'));

DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);
DROP FUNCTION IF EXISTS public.claim_admin();