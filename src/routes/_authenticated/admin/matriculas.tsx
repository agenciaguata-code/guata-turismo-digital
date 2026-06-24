import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Trash2, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Row = {
  id: string;
  user_id: string;
  course_id: string;
  progress_pct: number;
  enrolled_at: string;
  completed_at: string | null;
  user_name: string | null;
  course_title: string | null;
};

export const Route = createFileRoute("/_authenticated/admin/matriculas")({
  head: () => ({ meta: [{ title: "Admin · Matrículas" }, { name: "robots", content: "noindex" }] }),
  component: EnrollmentsPage,
});

function EnrollmentsPage() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [courses, setCourses] = useState<{ id: string; title: string }[]>([]);
  const [q, setQ] = useState("");

  async function reload() {
    const [{ data: enr }, { data: profs }, { data: cs }] = await Promise.all([
      supabase.from("enrollments").select("*").order("enrolled_at", { ascending: false }),
      supabase.from("profiles").select("id, full_name"),
      supabase.from("courses").select("id, title"),
    ]);
    const profMap = new Map((profs ?? []).map((p) => [p.id, p.full_name]));
    const courseMap = new Map((cs ?? []).map((c) => [c.id, c.title]));
    setCourses(cs ?? []);
    setRows(
      (enr ?? []).map((e) => ({
        id: e.id,
        user_id: e.user_id,
        course_id: e.course_id,
        progress_pct: e.progress_pct,
        enrolled_at: e.enrolled_at,
        completed_at: e.completed_at,
        user_name: profMap.get(e.user_id) ?? null,
        course_title: courseMap.get(e.course_id) ?? null,
      })),
    );
  }
  useEffect(() => {
    reload();
  }, []);

  async function enroll(form: HTMLFormElement) {
    const fd = new FormData(form);
    const user_id = String(fd.get("user_id") || "").trim();
    const course_id = String(fd.get("course_id") || "").trim();
    if (!user_id || !course_id) return toast.error("Preencha aluno e curso");
    const { error } = await supabase.from("enrollments").insert({ user_id, course_id });
    if (error) return toast.error(error.message);
    toast.success("Matrícula criada");
    form.reset();
    reload();
  }

  async function remove(id: string) {
    const { error } = await supabase.from("enrollments").delete().eq("id", id);
    if (error) return toast.error(error.message);
    reload();
  }

  const filtered = (rows ?? []).filter((r) => {
    if (!q.trim()) return true;
    const t = q.toLowerCase();
    return (
      (r.user_name ?? "").toLowerCase().includes(t) ||
      (r.course_title ?? "").toLowerCase().includes(t) ||
      r.user_id.includes(t)
    );
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-3xl">Matrículas</h1>
        <p className="text-sm text-muted-foreground">Matricule alunos manualmente em cursos.</p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          enroll(e.currentTarget);
        }}
        className="surface-card mb-4 grid gap-2 p-3 sm:grid-cols-[1fr_1fr_auto]"
      >
        <Input name="user_id" placeholder="ID do aluno (UUID) — copie da aba Alunos" required />
        <select name="course_id" className="h-9 rounded-md border border-input bg-background px-3 text-sm" required defaultValue="">
          <option value="" disabled>
            Selecione um curso...
          </option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
        <Button type="submit">
          <Plus className="mr-1.5 h-4 w-4" /> Matricular
        </Button>
      </form>

      <div className="surface-card mb-4 p-3">
        <Input placeholder="Buscar por aluno ou curso..." value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      {rows === null ? (
        <div className="grid place-items-center py-24 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : (
        <div className="surface-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/30 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Aluno</th>
                <th className="px-4 py-3">Curso</th>
                <th className="px-4 py-3">Progresso</th>
                <th className="px-4 py-3">Matriculado em</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">{r.user_name ?? r.user_id.slice(0, 8)}</td>
                  <td className="px-4 py-3">{r.course_title ?? "—"}</td>
                  <td className="px-4 py-3">{r.progress_pct}%</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {new Date(r.enrolled_at).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button size="sm" variant="ghost" className="text-destructive" onClick={() => remove(r.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
