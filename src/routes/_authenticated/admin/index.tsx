import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BookOpen, Users, GraduationCap, Award, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/")({
  head: () => ({ meta: [{ title: "Admin — Guatá Capacita" }, { name: "robots", content: "noindex" }] }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const [stats, setStats] = useState<null | {
    courses: number;
    published: number;
    students: number;
    enrollments: number;
    certificates: number;
  }>(null);

  useEffect(() => {
    (async () => {
      const [c, p, s, e, ce] = await Promise.all([
        supabase.from("courses").select("*", { count: "exact", head: true }),
        supabase.from("courses").select("*", { count: "exact", head: true }).eq("is_published", true),
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("enrollments").select("*", { count: "exact", head: true }),
        supabase.from("certificates").select("*", { count: "exact", head: true }),
      ]);
      setStats({
        courses: c.count ?? 0,
        published: p.count ?? 0,
        students: s.count ?? 0,
        enrollments: e.count ?? 0,
        certificates: ce.count ?? 0,
      });
    })();
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-3xl">Painel administrativo</h1>
        <p className="text-sm text-muted-foreground">Visão geral da plataforma.</p>
      </div>
      {!stats ? (
        <div className="grid place-items-center py-24 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={BookOpen} label="Cursos" value={stats.courses} hint={`${stats.published} publicados`} />
          <StatCard icon={Users} label="Alunos" value={stats.students} />
          <StatCard icon={GraduationCap} label="Matrículas" value={stats.enrollments} />
          <StatCard icon={Award} label="Certificados" value={stats.certificates} />
        </div>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Link to="/admin/cursos" className="surface-card p-5 transition hover:-translate-y-0.5 hover:shadow-elevated">
          <BookOpen className="h-6 w-6 text-primary" />
          <div className="mt-3 font-display text-lg">Gerenciar cursos</div>
          <p className="text-sm text-muted-foreground">Criar, editar, publicar/despublicar, gerenciar módulos e aulas.</p>
        </Link>
        <Link to="/admin/alunos" className="surface-card p-5 transition hover:-translate-y-0.5 hover:shadow-elevated">
          <Users className="h-6 w-6 text-primary" />
          <div className="mt-3 font-display text-lg">Alunos & papéis</div>
          <p className="text-sm text-muted-foreground">Promover usuários a professor/admin e revisar perfis.</p>
        </Link>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  hint?: string;
}) {
  return (
    <div className="surface-card p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div className="mt-2 font-display text-3xl">{value}</div>
      {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}
