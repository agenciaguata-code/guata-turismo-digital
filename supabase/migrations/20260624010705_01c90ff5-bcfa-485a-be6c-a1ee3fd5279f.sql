
-- course-covers: read = any authenticated user; write = admin only
CREATE POLICY "course_covers_read_auth"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'course-covers');

CREATE POLICY "course_covers_admin_write"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'course-covers' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "course_covers_admin_update"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'course-covers' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "course_covers_admin_delete"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'course-covers' AND public.has_role(auth.uid(), 'admin'));

-- avatars: read = any authenticated; write = owner (path starts with user id)
CREATE POLICY "avatars_read_auth"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'avatars');

CREATE POLICY "avatars_owner_write"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "avatars_owner_update"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "avatars_owner_delete"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- lesson-materials: read = admin OR user enrolled in the course; write = admin
CREATE POLICY "lesson_materials_admin_read"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'lesson-materials' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "lesson_materials_enrolled_read"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'lesson-materials'
    AND EXISTS (
      SELECT 1 FROM public.enrollments e
      WHERE e.user_id = auth.uid()
        AND e.course_id::text = (storage.foldername(name))[1]
    )
  );

CREATE POLICY "lesson_materials_admin_write"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'lesson-materials' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "lesson_materials_admin_update"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'lesson-materials' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "lesson_materials_admin_delete"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'lesson-materials' AND public.has_role(auth.uid(), 'admin'));
