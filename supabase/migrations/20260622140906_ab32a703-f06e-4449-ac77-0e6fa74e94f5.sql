
DROP POLICY IF EXISTS "Lessons visible by access" ON public.lessons;
CREATE POLICY "Lessons visible if course visible" ON public.lessons FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.modules m
      JOIN public.courses c ON c.id = m.course_id
      WHERE m.id = lessons.module_id AND c.is_published = true
    )
  );

-- Strip sensitive columns from anon; authenticated keeps full access (gated by enrollment in app for paid courses later)
REVOKE SELECT ON public.lessons FROM anon;
GRANT SELECT (id, module_id, title, description, order_index, duration_minutes, is_free_preview, created_at, updated_at) ON public.lessons TO anon;
