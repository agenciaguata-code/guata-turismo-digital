import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BookOpen, Clock, Compass, Loader2, PlayCircle } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Course = Database["public"]["Tables"]["courses"]["Row"];
type Enrollment = Database["public"]["Tables"]["enrollments"]["Row"] & {
  courses: Course | null;
};

export const Route = createFileRoute("/_authenticated/meus-cursos")({
  head: () => ({
    meta: [
      { title: "Meus cursos — Guatá Capacita" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: MyCoursesPage,
});

function MyCoursesPage() {
  const [items, setItems] = useState<Enrollment[] | null>(null);

  useEffect(() => {
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;
      const { data } = await supabase
        .from("enrollments")
        .select("*, courses(*)")
        .eq("user_id", userData.user.id)
        .order("enrolled_at", { ascending: false });
      setItems((data as Enrollment[]) ?? []);
    })();
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="container-narrow flex-1 py-8 sm:py-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl sm:text-4xl">Meus cursos</h1>
            <p className="text-sm text-muted-foreground">
              Continue de onde parou — a trilha está te esperando.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link to="/cursos">
              <Compass className="mr-2 h-4 w-4" /> Explorar catálogo
            </Link>
          </Button>
        </div>

        <div className="mt-8">
          {items === null ? (
            <div className="grid place-items-center py-24 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : items.length === 0 ? (
            <div className="surface-card mx-auto max-w-md p-8 text-center">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary">
                <BookOpen className="h-6 w-6" />
              </div>
              <h2 className="mt-4 font-display text-xl">Você ainda não tem cursos</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Explore o catálogo e inscreva-se no primeiro curso.
              </p>
              <Button asChild className="mt-5">
                <Link to="/cursos">Ver cursos</Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((e) =>
                e.courses ? (
                  <EnrollmentCard key={e.id} enrollment={e} course={e.courses} />
                ) : null,
              )}
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function EnrollmentCard({
  enrollment,
  course,
}: {
  enrollment: Enrollment;
  course: Course;
}) {
  return (
    <div className="surface-card flex flex-col overflow-hidden">
      <Link
        to="/cursos/$slug"
        params={{ slug: course.slug }}
        className="aspect-[16/10] w-full overflow-hidden bg-primary/10"
      >
        {course.cover_url ? (
          <img src={course.cover_url} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="grid h-full w-full place-items-center text-primary/40">
            <Compass className="h-12 w-12" />
          </div>
        )}
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-lg leading-snug">{course.title}</h3>
        <div className="mt-1 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="h-3.5 w-3.5" /> {course.duration_hours}h
        </div>
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Progresso</span>
            <span>{enrollment.progress_pct}%</span>
          </div>
          <Progress value={enrollment.progress_pct} className="mt-1.5 h-2" />
        </div>
        <Button asChild className="mt-5">
          <Link to="/cursos/$slug" params={{ slug: course.slug }}>
            <PlayCircle className="mr-2 h-4 w-4" /> Continuar
          </Link>
        </Button>
      </div>
    </div>
  );
}
