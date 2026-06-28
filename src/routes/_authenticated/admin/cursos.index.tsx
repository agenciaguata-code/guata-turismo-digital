import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Pencil, Eye, EyeOff, Trash2, Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { Database } from "@/integrations/supabase/types";

type Course = Database["public"]["Tables"]["courses"]["Row"];

export const Route = createFileRoute("/_authenticated/admin/cursos/")({
  head: () => ({ meta: [{ title: "Admin · Cursos" }, { name: "robots", content: "noindex" }] }),
  component: CoursesAdmin,
});

function CoursesAdmin() {
  const [list, setList] = useState<Course[] | null>(null);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "published" | "draft">("all");

  async function reload() {
    const { data } = await supabase.from("courses").select("*").order("created_at", { ascending: false });
    setList(data ?? []);
  }
  useEffect(() => {
    reload();
  }, []);

  const filtered = (list ?? []).filter((c) => {
    if (filter === "published" && !c.is_published) return false;
    if (filter === "draft" && c.is_published) return false;
    if (!q.trim()) return true;
    const t = q.toLowerCase();
    return c.title.toLowerCase().includes(t) || c.slug.toLowerCase().includes(t);
  });

  async function togglePublish(c: Course) {
    const { error } = await supabase
      .from("courses")
      .update({ is_published: !c.is_published })
      .eq("id", c.id);
    if (error) return toast.error(error.message);
    toast.success(c.is_published ? "Curso despublicado" : "Curso publicado");
    reload();
  }

  async function remove(id: string) {
    const { error } = await supabase.from("courses").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Curso excluído");
    reload();
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl">Cursos</h1>
          <p className="text-sm text-muted-foreground">Gerencie o catálogo da plataforma.</p>
        </div>
        <Button asChild>
          <Link to="/admin/cursos/novo">
            <Plus className="mr-1.5 h-4 w-4" /> Novo curso
          </Link>
        </Button>
      </div>

      <div className="surface-card mb-4 flex flex-wrap items-center gap-3 p-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar por título ou slug..." value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as typeof filter)}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="all">Todos</option>
          <option value="published">Publicados</option>
          <option value="draft">Rascunhos</option>
        </select>
      </div>

      {list === null ? (
        <div className="grid place-items-center py-24 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="surface-card p-10 text-center text-muted-foreground">Nenhum curso encontrado.</div>
      ) : (
        <div className="surface-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/30 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Curso</th>
                <th className="px-4 py-3">Nível</th>
                <th className="px-4 py-3">Duração</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">
                    <div className="font-medium">{c.title}</div>
                    <div className="text-xs text-muted-foreground">/{c.slug}</div>
                  </td>
                  <td className="px-4 py-3 capitalize">{c.level}</td>
                  <td className="px-4 py-3">{c.duration_hours}h</td>
                  <td className="px-4 py-3">
                    <Badge variant={c.is_published ? "default" : "secondary"}>
                      {c.is_published ? "Publicado" : "Rascunho"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Button asChild variant="ghost" size="sm">
                        <Link to="/admin/cursos/$id" params={{ id: c.id }}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => togglePublish(c)} title={c.is_published ? "Despublicar" : "Publicar"}>
                        {c.is_published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Excluir "{c.title}"?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta ação remove o curso e todo o conteúdo associado (módulos, aulas, matrículas). Não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => remove(c.id)}>Excluir</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
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
