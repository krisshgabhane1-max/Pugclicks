DROP POLICY IF EXISTS "Site images are readable" ON storage.objects;
CREATE POLICY "Admins can read site images" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'site-images' AND private.has_role(auth.uid(), 'admin'::app_role));