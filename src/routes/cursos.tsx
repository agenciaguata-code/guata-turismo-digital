import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Clock, Compass, GraduationCap, Search, Filter } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Course = Database["public"]["Tables"]["courses"]["Row"];

export const Route = createFileRoute("/cursos")({
  head: () => ({
    meta: [
      { title: "Catálogo de cursos — Guatá Capacita" },
      {
        name: "description",
        content:
          "Explore cursos de capacitação em turismo: atendimento, guias, hotelaria, gastronomia e mais.",
      },
      { property: "og:title", content: "Catálogo de cursos — Guatá Capacita" },
    ],
  }),
  component: CoursesCatalog,
});

const LEVELS: { value: Course["level"] | "all"; label: string }[] = [
  { value: "all", label: "Todos os níveis" },
  { value: "iniciante", label: "Iniciante" },
  { value: "intermediario", label: "Intermediário" },
  { value: "avancado", label: "Avançado" },
];

function CoursesCatalog() {
  const [courses, setCourses] = useState<Course[] | null>(null);
  const [q, setQ] = useState("");
  const [level, setLevel] = useState<Course["level"] | "all">("all");
  const [category, setCategory] = useState<string>("all");

  useEffect(() => {
    supabase
      .from("courses")
      .select("*")
      .eq("is_published", true)
      .order("created_at", { ascending: false })
      .then(({ data }) => setCourses(data ?? []));
  }, []);

  const categories = useMemo(() => {
    const set = new Set<string>();
    (courses ?? []).forEach((c) => c.category && set.add(c.category));
    return ["all", ...Array.from(set)];
  }, [courses]);

  const filtered = useMemo(() => {
    if (!courses) return null;
    const term = q.trim().toLowerCase();
    return courses.filter((c) => {
      if (level !== "all" && c.level !== level) return false;
      if (category !== "all" && c.category !== category) return false;
      if (!term) return true;
      return (
        c.title.toLowerCase().includes(term) ||
        (c.short_description ?? "").toLowerCase().includes(term) ||
        (c.category ?? "").toLowerCase().includes(term)
      );
    });
  }, [courses, q, level, category]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        {/* Hero */}
        <section className="border-b border-border bg-secondary/30">
          <div className="container-narrow py-10 sm:py-14">
            <span className="text-xs font-semibold uppercase tracking-wider text-accent">
              Catálogo
            </span>
            <h1 className="mt-2 font-display text-3xl sm:text-4xl">
              Cursos de capacitação em turismo
            </h1>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              Escolha sua trilha — do primeiro contato com o setor à especialização avançada.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto_auto]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar por título, categoria..."
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  className="pl-9"
                />
              </div>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value as Course["level"] | "all")}
                className="h-9 rounded-md border border-input bg-background px-3 text-sm"
              >
                {LEVELS.map((l) => (
                  <option key={l.value} value={l.value}>
                    {l.label}
                  </option>
                ))}
              </select>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="h-9 rounded-md border border-input bg-background px-3 text-sm"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c === "all" ? "Todas categorias" : c}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Grid */}
        <section className="container-narrow py-10 sm:py-14">
          {filtered === null ? (
            <SkeletonGrid />
          ) : filtered.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
                <Filter className="h-4 w-4" />
                {filtered.length} curso{filtered.length === 1 ? "" : "s"} encontrado
                {filtered.length === 1 ? "" : "s"}
              </div>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((c) => (
                  <CourseCard key={c.id} course={c} />
                ))}
              </div>
            </>
          )}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function CourseCard({ course }: { course: Course }) {
  const levelLabel =
    course.level === "iniciante"
      ? "Iniciante"
      : course.level === "intermediario"
        ? "Intermediário"
        : "Avançado";
  return (
    <Link
      to="/cursos/$slug"
      params={{ slug: course.slug }}
      className="surface-card group flex flex-col overflow-hidden transition hover:-translate-y-0.5 hover:shadow-elevated"
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-primary/10">
        {course.cover_url ? (
          <img
            src={course.cover_url}
            alt=""
            className="h-full w-full object-cover transition group-hover:scale-[1.03]"
          />
        ) : (
          <div className="grid h-full w-full place-items-center text-primary/40">
            <Compass className="h-12 w-12" />
          </div>
        )}
        <Badge className="absolute left-3 top-3 capitalize" variant="secondary">
          {levelLabel}
        </Badge>
      </div>
      <div className="flex flex-1 flex-col p-5">
        {course.category && (
          <div className="text-xs font-semibold uppercase tracking-wider text-accent">
            {course.category}
          </div>
        )}
        <h3 className="mt-1 font-display text-lg leading-snug">{course.title}</h3>
        {course.short_description && (
          <p className="mt-1.5 line-clamp-3 text-sm text-muted-foreground">
            {course.short_description}
          </p>
        )}
        <div className="mt-auto flex items-center justify-between pt-4 text-sm">
          <div className="inline-flex items-center gap-1.5 text-muted-foreground">
            <Clock className="h-4 w-4" /> {course.duration_hours}h
          </div>
          <div className="font-display text-base font-semibold text-primary">
            {course.price > 0
              ? course.price.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })
              : "Grátis"}
          </div>
        </div>
      </div>
    </Link>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="surface-card animate-pulse overflow-hidden">
          <div className="aspect-[16/10] w-full bg-muted" />
          <div className="space-y-3 p-5">
            <div className="h-3 w-20 rounded bg-muted" />
            <div className="h-5 w-3/4 rounded bg-muted" />
            <div className="h-3 w-full rounded bg-muted" />
            <div className="h-3 w-2/3 rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="mx-auto max-w-md text-center">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary">
        <GraduationCap className="h-7 w-7" />
      </div>
      <h2 className="mt-5 font-display text-2xl">Nenhum curso encontrado</h2>
      <p className="mt-2 text-muted-foreground">
        Tente ajustar os filtros ou volte mais tarde — novos cursos chegam toda semana.
      </p>
      <Button asChild className="mt-5">
        <Link to="/">Voltar ao início</Link>
      </Button>
    </div>
  );
}
