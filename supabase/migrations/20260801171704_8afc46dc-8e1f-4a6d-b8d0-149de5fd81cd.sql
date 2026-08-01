CREATE POLICY "Admins can upload project screenshots"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'project-screenshots' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update project screenshots"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'project-screenshots' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete project screenshots"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'project-screenshots' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can read project screenshots"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'project-screenshots' AND public.has_role(auth.uid(), 'admin'));