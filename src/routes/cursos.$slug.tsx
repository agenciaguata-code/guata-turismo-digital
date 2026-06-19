import { createFileRoute, Link, useNavigate, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Clock,
  Compass,
  GraduationCap,
  Loader2,
  Lock,
  PlayCircle,
} from "lucide-react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Course = Database["public"]["Tables"]["courses"]["Row"];
type Module = Database["public"]["Tables"]["modules"]["Row"];
type Lesson = Database["public"]["Tables"]["lessons"]["Row"];

export const Route = createFileRoute("/cursos/$slug")({
  loader: async ({ params }) => {
    const { data: course, error } = await supabase
      .from("courses")
      .select("*")
      .eq("slug", params.slug)
      .eq("is_published", true)
      .maybeSingle();
    if (error) throw error;
    if (!course) throw notFound();
    return { course };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.course.title} — Guatá Capacita` },
          {
            name: "description",
            content: loaderData.course.short_description ?? loaderData.course.title,
          },
          { property: "og:title", content: loaderData.course.title },
          ...(loaderData.course.cover_url
            ? [{ property: "og:image", content: loaderData.course.cover_url }]
            : []),
        ]
      : [],
  }),
  notFoundComponent: () => (
    <div className="grid min-h-screen place-items-center bg-background p-6 text-center">
      <div>
        <h1 className="font-display text-3xl">Curso não encontrado</h1>
        <p className="mt-2 text-muted-foreground">Ele pode ter sido removido ou despublicado.</p>
        <Button asChild className="mt-5">
          <Link to="/cursos">Ver catálogo</Link>
        </Button>
      </div>
    </div>
  ),
  errorComponent: ({ reset }) => (
    <div className="grid min-h-screen place-items-center bg-background p-6 text-center">
      <div>
        <h1 className="font-display text-3xl">Algo deu errado</h1>
        <Button onClick={reset} className="mt-5">Tentar novamente</Button>
      </div>
    </div>
  ),
  component: CourseDetail,
});

function CourseDetail() {
  const { course } = Route.useLoaderData();
  const navigate = useNavigate();
  const [modules, setModules] = useState<(Module & { lessons: Lesson[] })[] | null>(null);
  const [enrolled, setEnrolled] = useState<boolean | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    (async () => {
      const [{ data: mods }, { data: lessons }, { data: userData }] = await Promise.all([
        supabase
          .from("modules")
          .select("*")
          .eq("course_id", course.id)
          .order("order_index"),
        supabase
          .from("lessons")
          .select("*")
          .in(
            "module_id",
            (
              await supabase.from("modules").select("id").eq("course_id", course.id)
            ).data?.map((m) => m.id) ?? [],
          )
          .order("order_index"),
        supabase.auth.getUser(),
      ]);
      const grouped: (Module & { lessons: Lesson[] })[] = (mods ?? []).map((m) => ({
        ...m,
        lessons: (lessons ?? []).filter((l) => l.module_id === m.id),
      }));
      setModules(grouped);

      const uid = userData.user?.id ?? null;
      setUserId(uid);
      if (uid) {
        const { data: en } = await supabase
          .from("enrollments")
          .select("id")
          .eq("user_id", uid)
          .eq("course_id", course.id)
          .maybeSingle();
        setEnrolled(!!en);
      } else {
        setEnrolled(false);
      }
    })();
  }, [course.id]);

  const totalLessons = modules?.reduce((acc, m) => acc + m.lessons.length, 0) ?? 0;
  const totalMinutes =
    modules?.reduce(
      (acc, m) => acc + m.lessons.reduce((a, l) => a + (l.duration_minutes ?? 0), 0),
      0,
    ) ?? 0;

  async function handleEnroll() {
    if (!userId) {
      navigate({ to: "/auth", search: { tab: "signup" } });
      return;
    }
    setEnrolling(true);
    const { error } = await supabase
      .from("enrollments")
      .insert({ user_id: userId, course_id: course.id });
    setEnrolling(false);
    if (error && !error.message.includes("duplicate")) {
      return toast.error(error.message);
    }
    setEnrolled(true);
    toast.success("Inscrição confirmada! Boa trilha 🌿");
    const firstLesson = modules?.flatMap((m) => m.lessons)[0];
    if (firstLesson) {
      navigate({
        to: "/aprender/$slug/$lessonId",
        params: { slug: course.slug, lessonId: firstLesson.id },
      });
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        {/* Hero */}
        <section className="border-b border-border bg-secondary/30">
          <div className="container-narrow py-8 sm:py-12">
            <Link
              to="/cursos"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary"
            >
              <ArrowLeft className="h-4 w-4" /> Catálogo
            </Link>
            <div className="mt-4 grid gap-8 lg:grid-cols-[1fr_360px]">
              <div>
                {course.category && (
                  <span className="text-xs font-semibold uppercase tracking-wider text-accent">
                    {course.category}
                  </span>
                )}
                <h1 className="mt-1 font-display text-3xl sm:text-4xl md:text-5xl">
                  {course.title}
                </h1>
                {course.short_description && (
                  <p className="mt-3 max-w-2xl text-base text-muted-foreground sm:text-lg">
                    {course.short_description}
                  </p>
                )}
                <div className="mt-5 flex flex-wrap gap-2">
                  <Badge variant="secondary" className="capitalize">
                    <GraduationCap className="mr-1 h-3.5 w-3.5" />
                    {course.level === "iniciante"
                      ? "Iniciante"
                      : course.level === "intermediario"
                        ? "Intermediário"
                        : "Avançado"}
                  </Badge>
                  <Badge variant="secondary">
                    <Clock className="mr-1 h-3.5 w-3.5" />
                    {course.duration_hours}h de conteúdo
                  </Badge>
                  <Badge variant="secondary">
                    <BookOpen className="mr-1 h-3.5 w-3.5" />
                    {totalLessons} aulas
                  </Badge>
                </div>
              </div>

              {/* Card de inscrição */}
              <aside className="surface-card overflow-hidden">
                <div className="aspect-[16/10] w-full overflow-hidden bg-primary/10">
                  {course.cover_url ? (
                    <img src={course.cover_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="grid h-full w-full place-items-center text-primary/40">
                      <Compass className="h-14 w-14" />
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <div className="font-display text-2xl font-semibold text-primary">
                    {course.price > 0
                      ? course.price.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })
                      : "Grátis"}
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <Info icon={Clock} label={`${course.duration_hours}h totais`} />
                    <Info icon={BookOpen} label={`${totalLessons} aulas`} />
                    <Info icon={GraduationCap} label="Certificado digital" />
                    <Info icon={CheckCircle2} label="Acesso vitalício" />
                  </div>
                  {enrolled === null ? (
                    <Button disabled className="mt-5 w-full" size="lg">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Carregando...
                    </Button>
                  ) : enrolled ? (
                    <Button asChild className="mt-5 w-full" size="lg">
                      <Link
                        to="/aprender/$slug/$lessonId"
                        params={{
                          slug: course.slug,
                          lessonId: modules?.flatMap((m) => m.lessons)[0]?.id ?? "",
                        }}
                      >
                        <PlayCircle className="mr-2 h-5 w-5" /> Continuar curso
                      </Link>
                    </Button>
                  ) : (
                    <Button
                      onClick={handleEnroll}
                      disabled={enrolling}
                      className="mt-5 w-full"
                      size="lg"
                    >
                      {enrolling ? "Inscrevendo..." : userId ? "Inscrever-se grátis" : "Entrar para inscrever-se"}
                    </Button>
                  )}
                  <p className="mt-2 text-center text-xs text-muted-foreground">
                    {totalMinutes > 0
                      ? `${Math.round(totalMinutes / 60)}h ${totalMinutes % 60}min de vídeo`
                      : "Conteúdo em vídeo e prático"}
                  </p>
                </div>
              </aside>
            </div>
          </div>
        </section>

        {/* Descrição + currículo */}
        <section className="container-narrow grid gap-10 py-10 sm:py-14 lg:grid-cols-[1fr_360px]">
          <div>
            <h2 className="font-display text-2xl">Sobre o curso</h2>
            <div className="prose prose-sm mt-3 max-w-none whitespace-pre-line text-muted-foreground">
              {course.description ?? "Sem descrição."}
            </div>

            <h2 className="mt-10 font-display text-2xl">Conteúdo programático</h2>
            <div className="mt-4 space-y-3">
              {modules === null ? (
                <div className="grid place-items-center py-10 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
              ) : modules.length === 0 ? (
                <div className="surface-card p-6 text-sm text-muted-foreground">
                  O instrutor ainda está preparando o conteúdo desse curso.
                </div>
              ) : (
                modules.map((m, idx) => (
                  <details
                    key={m.id}
                    className="surface-card group overflow-hidden"
                    open={idx === 0}
                  >
                    <summary className="flex cursor-pointer items-center justify-between gap-3 p-4 hover:bg-muted/40">
                      <div>
                        <div className="text-xs font-semibold uppercase text-accent">
                          Módulo {idx + 1}
                        </div>
                        <div className="font-display text-lg">{m.title}</div>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {m.lessons.length} aulas
                      </span>
                    </summary>
                    <ul className="divide-y divide-border border-t border-border">
                      {m.lessons.map((l, i) => {
                        const canPreview = enrolled || l.is_free_preview;
                        return (
                          <li
                            key={l.id}
                            className="flex items-center gap-3 px-4 py-3 text-sm"
                          >
                            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                              {i + 1}
                            </span>
                            <div className="min-w-0 flex-1">
                              <div className="truncate">{l.title}</div>
                              <div className="text-xs text-muted-foreground">
                                {l.duration_minutes} min
                                {l.is_free_preview && " · Prévia grátis"}
                              </div>
                            </div>
                            {canPreview ? (
                              <Link
                                to="/aprender/$slug/$lessonId"
                                params={{ slug: course.slug, lessonId: l.id }}
                                className="inline-flex items-center gap-1 text-primary hover:underline"
                              >
                                <PlayCircle className="h-4 w-4" /> Assistir
                              </Link>
                            ) : (
                              <Lock className="h-4 w-4 text-muted-foreground" />
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </details>
                ))
              )}
            </div>
          </div>

          <aside className="space-y-4">
            <div className="surface-card p-5">
              <h3 className="font-display text-lg">O que você vai aprender</h3>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                  Conceitos essenciais aplicados ao turismo brasileiro
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                  Boas práticas de atendimento e operação
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                  Atividades práticas e materiais para download
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                  Certificado digital com código de validação
                </li>
              </ul>
            </div>
          </aside>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function Info({
  icon: Icon,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <Icon className="h-3.5 w-3.5 text-primary" />
      <span>{label}</span>
    </div>
  );
}
