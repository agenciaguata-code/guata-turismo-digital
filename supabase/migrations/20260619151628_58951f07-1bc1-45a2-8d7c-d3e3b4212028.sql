
-- Tighten WITH CHECK clauses
DROP POLICY "Update own or instructor grades" ON public.assignment_submissions;
CREATE POLICY "Update own or instructor grades" ON public.assignment_submissions FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin')
    OR EXISTS (SELECT 1 FROM public.assignments a
      JOIN public.lessons l ON l.id = a.lesson_id
      JOIN public.modules m ON m.id = l.module_id
      JOIN public.courses c ON c.id = m.course_id
      WHERE a.id = assignment_id AND c.instructor_id = auth.uid()))
  WITH CHECK (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin')
    OR EXISTS (SELECT 1 FROM public.assignments a
      JOIN public.lessons l ON l.id = a.lesson_id
      JOIN public.modules m ON m.id = l.module_id
      JOIN public.courses c ON c.id = m.course_id
      WHERE a.id = assignment_id AND c.instructor_id = auth.uid()));

DROP POLICY "Author/instructor update thread" ON public.forum_threads;
CREATE POLICY "Author/instructor update thread" ON public.forum_threads FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin')
    OR EXISTS (SELECT 1 FROM public.lessons l JOIN public.modules m ON m.id = l.module_id
      JOIN public.courses c ON c.id = m.course_id
      WHERE l.id = lesson_id AND c.instructor_id = auth.uid()))
  WITH CHECK (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin')
    OR EXISTS (SELECT 1 FROM public.lessons l JOIN public.modules m ON m.id = l.module_id
      JOIN public.courses c ON c.id = m.course_id
      WHERE l.id = lesson_id AND c.instructor_id = auth.uid()));

-- Restrict SECURITY DEFINER function execution
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;
