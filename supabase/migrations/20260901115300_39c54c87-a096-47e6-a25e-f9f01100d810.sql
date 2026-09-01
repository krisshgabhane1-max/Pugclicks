REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;
REVOKE ALL ON FUNCTION public.claim_admin() FROM anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.claim_admin() TO authenticated, service_role;
REVOKE ALL ON FUNCTION public.set_updated_at() FROM anon, authenticated, PUBLIC;