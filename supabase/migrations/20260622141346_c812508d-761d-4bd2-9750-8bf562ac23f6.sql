
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS must_change_password boolean NOT NULL DEFAULT false;
GRANT SELECT (must_change_password), UPDATE (must_change_password) ON public.profiles TO authenticated;
