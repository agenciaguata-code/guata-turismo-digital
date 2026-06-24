import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import {
  ArrowLeft,
  Loader2,
  Upload,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Pencil,
  Save,
  X,
  FileText,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { uploadAndSignUrl } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
type Module = Database["public"]["Tables"]["modules"]["Row"];
type Lesson = Database["public"]["Tables"]["lessons"]["Row"];
type Material = Database["public"]["Tables"]["materials"]["Row"];

export const Route = createFileRoute("/_authenticated/admin/cursos/$id")({
  head: () => ({ meta: [{ title: "Editar curso" }, { name: "robots", content: "noindex" }] }),
  component: CourseEditPage,
});

function CourseEditPage() {
  const { id } = Route.useParams();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    const { data } = await supabase.from("courses").select("*").eq("id", id).maybeSingle();
    setCourse(data);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    reload();
  }, [reload]);

  if (loading)
    return (
      <div className="grid place-items-center py-24 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  if (!course)
    return <div className="surface-card p-10 text-center text-muted-foreground">Curso não encontrado.</div>;

  return (
    <div>
      <Button asChild variant="ghost" size="sm" className="mb-3">
        <Link to="/admin/cursos">
          <ArrowLeft className="mr-1.5 h-4 w-4" /> Voltar
        </Link>
      </Button>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl">{course.title}</h1>
          <p className="text-sm text-muted-foreground">/{course.slug}</p>
        </div>
        <Badge variant={course.is_published ? "default" : "secondary"}>
          {course.is_published ? "Publicado" : "Rascunho"}
        </Badge>
      </div>

      <Tabs defaultValue="detalhes" className="w-full">
        <TabsList className="grid w-full grid-cols-3 sm:w-auto sm:grid-cols-3">
          <TabsTrigger value="detalhes">Detalhes</TabsTrigger>
          <TabsTrigger value="modulos">Módulos & aulas</TabsTrigger>
          <TabsTrigger value="materiais">Materiais</TabsTrigger>
        </TabsList>
        <TabsContent value="detalhes" className="mt-4">
          <DetailsForm course={course} onSaved={reload} />
        </TabsContent>
        <TabsContent value="modulos" className="mt-4">
          <ModulesPanel courseId={course.id} />
        </TabsContent>
        <TabsContent value="materiais" className="mt-4">
          <MaterialsPanel courseId={course.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ────────────────────────────────────────────────────────────── DETALHES

function DetailsForm({ course, onSaved }: { course: Course; onSaved: () => void }) {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [coverUrl, setCoverUrl] = useState<string | null>(course.cover_url);

  async function onCoverChange(file: File) {
    if (file.size > 5 * 1024 * 1024) return toast.error("Imagem maior que 5MB");
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${course.id}/cover-${Date.now()}.${ext}`;
      const { url } = await uploadAndSignUrl("course-covers", path, file);
      const { error } = await supabase.from("courses").update({ cover_url: url }).eq("id", course.id);
      if (error) throw error;
      setCoverUrl(url);
      toast.success("Capa atualizada!");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha no upload");
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setSaving(true);
    const { error } = await supabase
      .from("courses")
      .update({
        title: String(fd.get("title") || "").trim(),
        slug: String(fd.get("slug") || "").trim(),
        short_description: String(fd.get("short_description") || "").trim() || null,
        description: String(fd.get("description") || "").trim() || null,
        category: String(fd.get("category") || "").trim() || null,
        level: fd.get("level") as Course["level"],
        duration_hours: Number(fd.get("duration_hours") || 0),
        price: Number(fd.get("price") || 0),
        is_published: fd.get("is_published") === "on",
      })
      .eq("id", course.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Curso atualizado!");
    onSaved();
  }

  async function remove() {
    const { error } = await supabase.from("courses").delete().eq("id", course.id);
    if (error) return toast.error(error.message);
    toast.success("Curso excluído");
    navigate({ to: "/admin/cursos" });
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4 lg:grid-cols-[300px_1fr]">
      {/* Capa */}
      <div className="surface-card p-5">
        <Label>Capa do curso</Label>
        <div className="mt-2 aspect-[16/10] w-full overflow-hidden rounded-lg bg-muted">
          {coverUrl ? (
            <img src={coverUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="grid h-full place-items-center text-muted-foreground">Sem capa</div>
          )}
        </div>
        <label className="mt-3 block">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onCoverChange(f);
              e.currentTarget.value = "";
            }}
          />
          <span className="inline-flex w-full cursor-pointer items-center justify-center rounded-md border border-input bg-background px-3 py-2 text-sm font-medium hover:bg-muted">
            {uploading ? (
              <>
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> Enviando...
              </>
            ) : (
              <>
                <Upload className="mr-1.5 h-4 w-4" /> Trocar capa
              </>
            )}
          </span>
        </label>
        <p className="mt-2 text-xs text-muted-foreground">JPG/PNG até 5MB. Recomendado 16:10.</p>
      </div>

      {/* Form */}
      <div className="surface-card space-y-4 p-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Título" name="title" defaultValue={course.title} required />
          <Field label="Slug (URL)" name="slug" defaultValue={course.slug} required />
        </div>
        <Field label="Descrição curta" name="short_description" defaultValue={course.short_description ?? ""} />
        <div className="space-y-1.5">
          <Label htmlFor="description">Descrição completa</Label>
          <Textarea id="description" name="description" rows={6} defaultValue={course.description ?? ""} />
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Categoria" name="category" defaultValue={course.category ?? ""} />
          <div className="space-y-1.5">
            <Label htmlFor="level">Nível</Label>
            <select
              id="level"
              name="level"
              defaultValue={course.level}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="iniciante">Iniciante</option>
              <option value="intermediario">Intermediário</option>
              <option value="avancado">Avançado</option>
            </select>
          </div>
          <Field label="Duração (h)" name="duration_hours" type="number" defaultValue={String(course.duration_hours)} />
          <Field label="Preço (R$)" name="price" type="number" defaultValue={String(course.price)} />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="is_published" defaultChecked={course.is_published} className="h-4 w-4" />
          Publicado (visível no catálogo)
        </label>
        <div className="flex flex-wrap justify-between gap-2 pt-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button type="button" variant="outline" className="text-destructive">
                <Trash2 className="mr-1.5 h-4 w-4" /> Excluir curso
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir este curso?</AlertDialogTitle>
                <AlertDialogDescription>
                  Remove o curso e todo o conteúdo associado. Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={remove}>Excluir</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button type="submit" disabled={saving} size="lg">
            <Save className="mr-1.5 h-4 w-4" /> {saving ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  defaultValue,
  required,
  type = "text",
}: {
  label: string;
  name: string;
  defaultValue?: string;
  required?: boolean;
  type?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} defaultValue={defaultValue} required={required} type={type} />
    </div>
  );
}

// ────────────────────────────────────────────────── MÓDULOS & AULAS

function ModulesPanel({ courseId }: { courseId: string }) {
  const [modules, setModules] = useState<Module[] | null>(null);
  const [newTitle, setNewTitle] = useState("");

  const reload = useCallback(async () => {
    const { data } = await supabase
      .from("modules")
      .select("*")
      .eq("course_id", courseId)
      .order("order_index", { ascending: true });
    setModules(data ?? []);
  }, [courseId]);

  useEffect(() => {
    reload();
  }, [reload]);

  async function addModule() {
    if (!newTitle.trim()) return;
    const order = (modules?.length ?? 0) + 1;
    const { error } = await supabase
      .from("modules")
      .insert({ course_id: courseId, title: newTitle.trim(), order_index: order });
    if (error) return toast.error(error.message);
    setNewTitle("");
    reload();
  }

  async function moveModule(m: Module, dir: -1 | 1) {
    if (!modules) return;
    const idx = modules.findIndex((x) => x.id === m.id);
    const other = modules[idx + dir];
    if (!other) return;
    await Promise.all([
      supabase.from("modules").update({ order_index: other.order_index }).eq("id", m.id),
      supabase.from("modules").update({ order_index: m.order_index }).eq("id", other.id),
    ]);
    reload();
  }

  async function deleteModule(id: string) {
    const { error } = await supabase.from("modules").delete().eq("id", id);
    if (error) return toast.error(error.message);
    reload();
  }

  async function renameModule(id: string, title: string) {
    const { error } = await supabase.from("modules").update({ title }).eq("id", id);
    if (error) return toast.error(error.message);
    reload();
  }

  if (modules === null)
    return (
      <div className="grid place-items-center py-12 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );

  return (
    <div className="space-y-4">
      <div className="surface-card flex flex-wrap gap-2 p-3">
        <Input
          placeholder="Nome do novo módulo..."
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addModule())}
        />
        <Button onClick={addModule}>
          <Plus className="mr-1.5 h-4 w-4" /> Adicionar módulo
        </Button>
      </div>

      {modules.length === 0 ? (
        <div className="surface-card p-8 text-center text-muted-foreground">
          Nenhum módulo ainda. Crie o primeiro acima.
        </div>
      ) : (
        modules.map((m, i) => (
          <ModuleCard
            key={m.id}
            module={m}
            onMoveUp={i > 0 ? () => moveModule(m, -1) : undefined}
            onMoveDown={i < modules.length - 1 ? () => moveModule(m, 1) : undefined}
            onDelete={() => deleteModule(m.id)}
            onRename={(t) => renameModule(m.id, t)}
          />
        ))
      )}
    </div>
  );
}

function ModuleCard({
  module: m,
  onMoveUp,
  onMoveDown,
  onDelete,
  onRename,
}: {
  module: Module;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onDelete: () => void;
  onRename: (t: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(m.title);

  return (
    <div className="surface-card p-4">
      <div className="flex items-center gap-2">
        <div className="flex flex-col">
          <button onClick={onMoveUp} disabled={!onMoveUp} className="p-0.5 text-muted-foreground disabled:opacity-30">
            <ChevronUp className="h-4 w-4" />
          </button>
          <button onClick={onMoveDown} disabled={!onMoveDown} className="p-0.5 text-muted-foreground disabled:opacity-30">
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>
        {editing ? (
          <>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} className="flex-1" />
            <Button
              size="sm"
              onClick={() => {
                onRename(title.trim() || m.title);
                setEditing(false);
              }}
            >
              <Save className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
              <X className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <>
            <div className="flex-1 font-display text-base">{m.title}</div>
            <Button size="sm" variant="ghost" onClick={() => setEditing(true)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="sm" variant="ghost" className="text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Excluir módulo?</AlertDialogTitle>
                  <AlertDialogDescription>Todas as aulas dentro dele também serão removidas.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={onDelete}>Excluir</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        )}
      </div>
      <div className="mt-3 border-t border-border pt-3">
        <LessonsList moduleId={m.id} />
      </div>
    </div>
  );
}

function LessonsList({ moduleId }: { moduleId: string }) {
  const [lessons, setLessons] = useState<Lesson[] | null>(null);
  const [adding, setAdding] = useState(false);

  const reload = useCallback(async () => {
    const { data } = await supabase
      .from("lessons")
      .select("*")
      .eq("module_id", moduleId)
      .order("order_index", { ascending: true });
    setLessons(data ?? []);
  }, [moduleId]);

  useEffect(() => {
    reload();
  }, [reload]);

  async function addLesson(form: HTMLFormElement) {
    const fd = new FormData(form);
    const title = String(fd.get("title") || "").trim();
    if (!title) return;
    const order = (lessons?.length ?? 0) + 1;
    const { error } = await supabase.from("lessons").insert({
      module_id: moduleId,
      title,
      description: String(fd.get("description") || "").trim() || null,
      video_url: String(fd.get("video_url") || "").trim() || null,
      video_provider: String(fd.get("video_provider") || "").trim() || null,
      duration_minutes: Number(fd.get("duration_minutes") || 0),
      is_free_preview: fd.get("is_free_preview") === "on",
      order_index: order,
    });
    if (error) return toast.error(error.message);
    form.reset();
    setAdding(false);
    reload();
  }

  async function moveLesson(l: Lesson, dir: -1 | 1) {
    if (!lessons) return;
    const idx = lessons.findIndex((x) => x.id === l.id);
    const other = lessons[idx + dir];
    if (!other) return;
    await Promise.all([
      supabase.from("lessons").update({ order_index: other.order_index }).eq("id", l.id),
      supabase.from("lessons").update({ order_index: l.order_index }).eq("id", other.id),
    ]);
    reload();
  }

  async function deleteLesson(id: string) {
    const { error } = await supabase.from("lessons").delete().eq("id", id);
    if (error) return toast.error(error.message);
    reload();
  }

  if (lessons === null)
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Carregando aulas...
      </div>
    );

  return (
    <div className="space-y-2 pl-6">
      {lessons.map((l, i) => (
        <LessonRow
          key={l.id}
          lesson={l}
          onMoveUp={i > 0 ? () => moveLesson(l, -1) : undefined}
          onMoveDown={i < lessons.length - 1 ? () => moveLesson(l, 1) : undefined}
          onDelete={() => deleteLesson(l.id)}
          onChanged={reload}
        />
      ))}

      {adding ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            addLesson(e.currentTarget);
          }}
          className="surface-card space-y-2 p-3"
        >
          <Input name="title" placeholder="Título da aula *" required />
          <Textarea name="description" placeholder="Descrição (opcional)" rows={2} />
          <div className="grid gap-2 sm:grid-cols-3">
            <select name="video_provider" className="h-9 rounded-md border border-input bg-background px-3 text-sm">
              <option value="">— provedor —</option>
              <option value="youtube">YouTube</option>
              <option value="vimeo">Vimeo</option>
              <option value="mp4">MP4 direto</option>
            </select>
            <Input name="video_url" placeholder="URL do vídeo" />
            <Input name="duration_minutes" type="number" placeholder="Duração (min)" />
          </div>
          <label className="flex items-center gap-2 text-xs">
            <input type="checkbox" name="is_free_preview" className="h-4 w-4" /> Aula grátis (preview)
          </label>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => setAdding(false)}>
              Cancelar
            </Button>
            <Button type="submit" size="sm">
              Adicionar aula
            </Button>
          </div>
        </form>
      ) : (
        <Button variant="ghost" size="sm" onClick={() => setAdding(true)}>
          <Plus className="mr-1.5 h-4 w-4" /> Adicionar aula
        </Button>
      )}
    </div>
  );
}

function LessonRow({
  lesson: l,
  onMoveUp,
  onMoveDown,
  onDelete,
  onChanged,
}: {
  lesson: Lesson;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onDelete: () => void;
  onChanged: () => void;
}) {
  const [editing, setEditing] = useState(false);

  async function save(form: HTMLFormElement) {
    const fd = new FormData(form);
    const { error } = await supabase
      .from("lessons")
      .update({
        title: String(fd.get("title") || "").trim(),
        description: String(fd.get("description") || "").trim() || null,
        video_url: String(fd.get("video_url") || "").trim() || null,
        video_provider: String(fd.get("video_provider") || "").trim() || null,
        duration_minutes: Number(fd.get("duration_minutes") || 0),
        is_free_preview: fd.get("is_free_preview") === "on",
      })
      .eq("id", l.id);
    if (error) return toast.error(error.message);
    setEditing(false);
    onChanged();
  }

  if (editing) {
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          save(e.currentTarget);
        }}
        className="surface-card space-y-2 p-3"
      >
        <Input name="title" defaultValue={l.title} required />
        <Textarea name="description" defaultValue={l.description ?? ""} rows={2} />
        <div className="grid gap-2 sm:grid-cols-3">
          <select
            name="video_provider"
            defaultValue={l.video_provider ?? ""}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">— provedor —</option>
            <option value="youtube">YouTube</option>
            <option value="vimeo">Vimeo</option>
            <option value="mp4">MP4 direto</option>
          </select>
          <Input name="video_url" defaultValue={l.video_url ?? ""} />
          <Input name="duration_minutes" type="number" defaultValue={String(l.duration_minutes)} />
        </div>
        <label className="flex items-center gap-2 text-xs">
          <input type="checkbox" name="is_free_preview" defaultChecked={l.is_free_preview} className="h-4 w-4" /> Aula grátis
        </label>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={() => setEditing(false)}>
            Cancelar
          </Button>
          <Button type="submit" size="sm">
            Salvar
          </Button>
        </div>
      </form>
    );
  }

  return (
    <div className="flex items-center gap-2 rounded-md border border-border bg-card/50 px-2 py-1.5">
      <div className="flex flex-col">
        <button onClick={onMoveUp} disabled={!onMoveUp} className="p-0.5 text-muted-foreground disabled:opacity-30">
          <ChevronUp className="h-3.5 w-3.5" />
        </button>
        <button onClick={onMoveDown} disabled={!onMoveDown} className="p-0.5 text-muted-foreground disabled:opacity-30">
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="flex-1 text-sm">
        {l.title}
        {l.is_free_preview && (
          <Badge variant="secondary" className="ml-2 text-[10px]">
            grátis
          </Badge>
        )}
        <span className="ml-2 text-xs text-muted-foreground">{l.duration_minutes} min</span>
      </div>
      <Button size="sm" variant="ghost" onClick={() => setEditing(true)}>
        <Pencil className="h-3.5 w-3.5" />
      </Button>
      <Button size="sm" variant="ghost" className="text-destructive" onClick={onDelete}>
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}

// ────────────────────────────────────────────────── MATERIAIS

function MaterialsPanel({ courseId }: { courseId: string }) {
  const [items, setItems] = useState<Material[] | null>(null);
  const [uploading, setUploading] = useState(false);

  const reload = useCallback(async () => {
    const { data } = await supabase
      .from("materials")
      .select("*")
      .eq("course_id", courseId)
      .order("created_at", { ascending: false });
    setItems(data ?? []);
  }, [courseId]);

  useEffect(() => {
    reload();
  }, [reload]);

  async function onUpload(file: File, title: string, type: Database["public"]["Enums"]["material_type"]) {
    if (file.size > 50 * 1024 * 1024) return toast.error("Arquivo maior que 50MB");
    setUploading(true);
    try {
      const path = `${courseId}/${Date.now()}-${file.name}`;
      const { url } = await uploadAndSignUrl("lesson-materials", path, file);
      const { error } = await supabase.from("materials").insert({
        course_id: courseId,
        title: title || file.name,
        file_url: url,
        material_type: type,
        size_kb: Math.round(file.size / 1024),
      });
      if (error) throw error;
      toast.success("Material adicionado!");
      reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha no upload");
    } finally {
      setUploading(false);
    }
  }

  async function remove(id: string) {
    const { error } = await supabase.from("materials").delete().eq("id", id);
    if (error) return toast.error(error.message);
    reload();
  }

  return (
    <div className="space-y-4">
      <form
        className="surface-card grid gap-3 p-4 sm:grid-cols-[1fr_auto_auto_auto]"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          const file = (fd.get("file") as File) ?? null;
          if (!file || file.size === 0) return toast.error("Selecione um arquivo");
          onUpload(
            file,
            String(fd.get("title") || ""),
            (fd.get("type") || "pdf") as Database["public"]["Enums"]["material_type"],
          );
          e.currentTarget.reset();
        }}
      >
        <Input name="title" placeholder="Título (opcional, usa nome do arquivo)" />
        <select name="type" className="h-9 rounded-md border border-input bg-background px-3 text-sm">
          <option value="pdf">PDF</option>
          <option value="slide">Slide</option>
          <option value="documento">Documento</option>
          <option value="planilha">Planilha</option>
          <option value="link">Link</option>
          <option value="outro">Outro</option>
        </select>
        <Input type="file" name="file" required />
        <Button type="submit" disabled={uploading}>
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
        </Button>
      </form>

      {items === null ? (
        <div className="grid place-items-center py-12 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="surface-card p-8 text-center text-muted-foreground">Nenhum material ainda.</div>
      ) : (
        <div className="surface-card divide-y divide-border">
          {items.map((m) => (
            <div key={m.id} className="flex items-center gap-3 p-3">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1">
                <a href={m.file_url} target="_blank" rel="noopener noreferrer" className="font-medium hover:underline">
                  {m.title}
                </a>
                <div className="text-xs text-muted-foreground">
                  {m.material_type} {m.size_kb ? `· ${(m.size_kb / 1024).toFixed(1)} MB` : ""}
                </div>
              </div>
              <Button size="sm" variant="ghost" className="text-destructive" onClick={() => remove(m.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
