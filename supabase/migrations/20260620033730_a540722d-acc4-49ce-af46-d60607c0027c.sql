
-- PROFILES: remove public read
DROP POLICY IF EXISTS "Profiles public read" ON public.profiles;
CREATE POLICY "Users read own profile" ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = id OR public.has_role(auth.uid(), 'admin'));

-- CERTIFICATES: remove public read, expose only via SECURITY DEFINER fn
DROP POLICY IF EXISTS "Certificates public for validation" ON public.certificates;
CREATE POLICY "Users read own certificates" ON public.certificates FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.validate_certificate(_code text)
RETURNS TABLE(code text, student_name text, course_title text, hours numeric, issued_at timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT c.code, c.student_name, c.course_title, c.hours, c.issued_at
  FROM public.certificates c
  WHERE c.code = _code
  LIMIT 1;
$$;
REVOKE ALL ON FUNCTION public.validate_certificate(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.validate_certificate(text) TO anon, authenticated;

-- LESSONS: restrict to free preview, enrolled users, instructor, admin
DROP POLICY IF EXISTS "Lessons visible if course visible" ON public.lessons;
CREATE POLICY "Lessons visible by access" ON public.lessons FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.modules m
      JOIN public.courses c ON c.id = m.course_id
      WHERE m.id = lessons.module_id
        AND c.is_published = true
        AND (
          lessons.is_free_preview = true
          OR (auth.uid() IS NOT NULL AND (
            c.instructor_id = auth.uid()
            OR public.has_role(auth.uid(), 'admin')
            OR EXISTS (SELECT 1 FROM public.enrollments e WHERE e.course_id = c.id AND e.user_id = auth.uid())
          ))
        )
    )
  );

-- MATERIALS: enrolled / instructor / admin only
DROP POLICY IF EXISTS "Materials visible if course visible" ON public.materials;
CREATE POLICY "Materials visible by access" ON public.materials FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.lessons l
      JOIN public.modules m ON m.id = l.module_id
      JOIN public.courses c ON c.id = m.course_id
      WHERE l.id = materials.lesson_id
        AND (
          c.instructor_id = auth.uid()
          OR public.has_role(auth.uid(), 'admin')
          OR EXISTS (SELECT 1 FROM public.enrollments e WHERE e.course_id = c.id AND e.user_id = auth.uid())
        )
    )
  );

-- QUIZ QUESTIONS: hide correct_answer column from non-staff
DROP POLICY IF EXISTS "Questions readable to authed" ON public.quiz_questions;
CREATE POLICY "Questions readable to enrolled" ON public.quiz_questions FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.quizzes q
      JOIN public.lessons l ON l.id = q.lesson_id
      JOIN public.modules m ON m.id = l.module_id
      JOIN public.courses c ON c.id = m.course_id
      WHERE q.id = quiz_questions.quiz_id
        AND (
          c.instructor_id = auth.uid()
          OR public.has_role(auth.uid(), 'admin')
          OR EXISTS (SELECT 1 FROM public.enrollments e WHERE e.course_id = c.id AND e.user_id = auth.uid())
        )
    )
  );

-- Column-level: revoke correct_answer from authenticated; re-grant other columns
REVOKE SELECT ON public.quiz_questions FROM authenticated;
GRANT SELECT (id, quiz_id, question, options, order_index, created_at) ON public.quiz_questions TO authenticated;
GRANT SELECT ON public.quiz_questions TO service_role;

-- Fix instructors-manage-questions to verify ownership
DROP POLICY IF EXISTS "Instructors manage questions" ON public.quiz_questions;
CREATE POLICY "Instructors manage questions" ON public.quiz_questions FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.quizzes q
      JOIN public.lessons l ON l.id = q.lesson_id
      JOIN public.modules m ON m.id = l.module_id
      JOIN public.courses c ON c.id = m.course_id
      WHERE q.id = quiz_questions.quiz_id
        AND (c.instructor_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.quizzes q
      JOIN public.lessons l ON l.id = q.lesson_id
      JOIN public.modules m ON m.id = l.module_id
      JOIN public.courses c ON c.id = m.course_id
      WHERE q.id = quiz_questions.quiz_id
        AND (c.instructor_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
    )
  );
