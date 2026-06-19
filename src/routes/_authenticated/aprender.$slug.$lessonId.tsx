import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Circle,
  Download,
  FileText,
  Loader2,
  MessageSquare,
  PlayCircle,
  Send,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Database } from "@/integrations/supabase/types";
import logoAsset from "@/assets/guata-capacita-logo.png.asset.json";

type Course = Database["public"]["Tables"]["courses"]["Row"];
type Module = Database["public"]["Tables"]["modules"]["Row"];
type Lesson = Database["public"]["Tables"]["lessons"]["Row"];
type Material = Database["public"]["Tables"]["materials"]["Row"];
type Thread = Database["public"]["Tables"]["forum_threads"]["Row"];
type Reply = Database["public"]["Tables"]["forum_replies"]["Row"];

export const Route = createFileRoute("/_authenticated/aprender/$slug/$lessonId")({
  loader: async ({ params }) => {
    const { data: course } = await supabase
      .from("courses")
      .select("*")
      .eq("slug", params.slug)
      .maybeSingle();
    if (!course) throw notFound();
    return { course };
  },
  notFoundComponent: () => (
    <div className="grid min-h-screen place-items-center bg-background p-6 text-center">
      <div>
        <h1 className="font-display text-3xl">Curso não encontrado</h1>
        <Button asChild className="mt-5">
          <Link to="/cursos">Ver catálogo</Link>
        </Button>
      </div>
    </div>
  ),
  errorComponent: ({ reset }) => (
    <div className="grid min-h-screen place-items-center bg-background p-6 text-center">
      <div>
        <h1 className="font-display text-3xl">Erro ao carregar aula</h1>
        <Button onClick={reset} className="mt-5">Tentar novamente</Button>
      </div>
    </div>
  ),
  component: LessonPlayerPage,
});

type ModuleWithLessons = Module & { lessons: Lesson[] };

function LessonPlayerPage() {
  const { course } = Route.useLoaderData();
  const { lessonId } = Route.useParams();
  const [modules, setModules] = useState<ModuleWithLessons[] | null>(null);
  const [progressIds, setProgressIds] = useState<Set<string>>(new Set());
  const [userId, setUserId] = useState<string | null>(null);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [replies, setReplies] = useState<Record<string, Reply[]>>({});
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id ?? null;
      setUserId(uid);

      const { data: mods } = await supabase
        .from("modules")
        .select("*")
        .eq("course_id", course.id)
        .order("order_index");
      const moduleIds = (mods ?? []).map((m) => m.id);
      const { data: lessons } = await supabase
        .from("lessons")
        .select("*")
        .in("module_id", moduleIds.length ? moduleIds : ["00000000-0000-0000-0000-000000000000"])
        .order("order_index");
      const grouped: ModuleWithLessons[] = (mods ?? []).map((m) => ({
        ...m,
        lessons: (lessons ?? []).filter((l) => l.module_id === m.id),
      }));
      setModules(grouped);

      if (uid) {
        const allLessonIds = (lessons ?? []).map((l) => l.id);
        const { data: prog } = await supabase
          .from("lesson_progress")
          .select("lesson_id, completed_at")
          .eq("user_id", uid)
          .in("lesson_id", allLessonIds.length ? allLessonIds : ["00000000-0000-0000-0000-000000000000"]);
        setProgressIds(
          new Set((prog ?? []).filter((p) => p.completed_at).map((p) => p.lesson_id)),
        );
      }
    })();
  }, [course.id]);

  // Carrega materiais + threads quando muda de aula
  useEffect(() => {
    (async () => {
      const [{ data: mats }, { data: ths }] = await Promise.all([
        supabase.from("materials").select("*").eq("lesson_id", lessonId),
        supabase
          .from("forum_threads")
          .select("*")
          .eq("lesson_id", lessonId)
          .order("created_at", { ascending: false }),
      ]);
      setMaterials(mats ?? []);
      setThreads(ths ?? []);
      const threadIds = (ths ?? []).map((t) => t.id);
      if (threadIds.length) {
        const { data: reps } = await supabase
          .from("forum_replies")
          .select("*")
          .in("thread_id", threadIds)
          .order("created_at");
        const byThread: Record<string, Reply[]> = {};
        (reps ?? []).forEach((r) => {
          (byThread[r.thread_id] = byThread[r.thread_id] || []).push(r);
        });
        setReplies(byThread);
      } else {
        setReplies({});
      }
    })();
  }, [lessonId]);

  const flatLessons = useMemo(
    () => modules?.flatMap((m) => m.lessons) ?? [],
    [modules],
  );
  const currentIdx = flatLessons.findIndex((l) => l.id === lessonId);
  const currentLesson = flatLessons[currentIdx];
  const prevLesson = currentIdx > 0 ? flatLessons[currentIdx - 1] : null;
  const nextLesson = currentIdx >= 0 && currentIdx < flatLessons.length - 1 ? flatLessons[currentIdx + 1] : null;

  const totalLessons = flatLessons.length;
  const completedCount = progressIds.size;
  const progressPct =
    totalLessons === 0 ? 0 : Math.round((completedCount / totalLessons) * 100);

  async function markComplete() {
    if (!userId || !currentLesson) return;
    const isDone = progressIds.has(currentLesson.id);
    if (isDone) {
      await supabase
        .from("lesson_progress")
        .update({ completed_at: null })
        .eq("user_id", userId)
        .eq("lesson_id", currentLesson.id);
      setProgressIds((s) => {
        const n = new Set(s);
        n.delete(currentLesson.id);
        return n;
      });
    } else {
      const payload = {
        user_id: userId,
        lesson_id: currentLesson.id,
        completed_at: new Date().toISOString(),
        watch_seconds: 0,
      };
      const { error } = await supabase
        .from("lesson_progress")
        .upsert(payload, { onConflict: "user_id,lesson_id" });
      if (error) return toast.error(error.message);
      setProgressIds((s) => new Set(s).add(currentLesson.id));
      // Atualiza progress_pct na inscrição
      const newPct = Math.round(((completedCount + 1) / totalLessons) * 100);
      await supabase
        .from("enrollments")
        .update({
          progress_pct: newPct,
          completed_at: newPct === 100 ? new Date().toISOString() : null,
        })
        .eq("user_id", userId)
        .eq("course_id", course.id);
      toast.success("Aula concluída! 🌿");
    }
  }

  async function createThread(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!userId) return;
    const fd = new FormData(e.currentTarget);
    const title = (fd.get("title") as string)?.trim();
    const content = (fd.get("content") as string)?.trim();
    if (!title || !content) return toast.error("Preencha título e mensagem");
    const { data, error } = await supabase
      .from("forum_threads")
      .insert({ user_id: userId, lesson_id: lessonId, title, content })
      .select()
      .single();
    if (error) return toast.error(error.message);
    setThreads((t) => [data, ...t]);
    e.currentTarget.reset();
  }

  async function postReply(threadId: string, content: string) {
    if (!userId || !content.trim()) return;
    const { data, error } = await supabase
      .from("forum_replies")
      .insert({ user_id: userId, thread_id: threadId, content: content.trim() })
      .select()
      .single();
    if (error) return toast.error(error.message);
    setReplies((r) => ({ ...r, [threadId]: [...(r[threadId] ?? []), data] }));
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header simplificado */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
        <div className="container-narrow flex h-14 items-center justify-between gap-3">
          <Link
            to="/cursos/$slug"
            params={{ slug: course.slug }}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Voltar ao curso</span>
          </Link>
          <Link to="/" className="hidden items-center gap-2 sm:flex">
            <img src={logoAsset.url} alt="Guatá Capacita" className="h-8 w-auto object-contain" />
          </Link>
          <button
            className="rounded-md border border-border px-3 py-1.5 text-xs lg:hidden"
            onClick={() => setSidebarOpen((v) => !v)}
          >
            {sidebarOpen ? "Fechar trilha" : "Ver trilha"}
          </button>
          <div className="hidden text-xs text-muted-foreground lg:block">
            Progresso: <span className="font-semibold text-primary">{progressPct}%</span>
          </div>
        </div>
      </header>

      <div className="container-narrow grid flex-1 gap-6 py-6 lg:grid-cols-[1fr_320px]">
        {/* Player + conteúdo */}
        <div>
          <div className="overflow-hidden rounded-2xl border border-border bg-black shadow-soft">
            {currentLesson ? (
              <VideoPlayer lesson={currentLesson} />
            ) : (
              <div className="grid aspect-video place-items-center text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            )}
          </div>

          {currentLesson && (
            <>
              <div className="mt-5 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-accent">
                    {course.title}
                  </div>
                  <h1 className="mt-1 font-display text-2xl sm:text-3xl">
                    {currentLesson.title}
                  </h1>
                </div>
                <Button
                  onClick={markComplete}
                  variant={progressIds.has(currentLesson.id) ? "outline" : "default"}
                >
                  {progressIds.has(currentLesson.id) ? (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" /> Aula concluída
                    </>
                  ) : (
                    <>
                      <Circle className="mr-2 h-4 w-4" /> Marcar como concluída
                    </>
                  )}
                </Button>
              </div>

              <Tabs defaultValue="conteudo" className="mt-6">
                <TabsList>
                  <TabsTrigger value="conteudo">Conteúdo</TabsTrigger>
                  <TabsTrigger value="materiais">
                    Materiais {materials.length > 0 && `(${materials.length})`}
                  </TabsTrigger>
                  <TabsTrigger value="forum">
                    Fórum {threads.length > 0 && `(${threads.length})`}
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="conteudo" className="mt-4">
                  <div className="surface-card p-5">
                    {currentLesson.description && (
                      <p className="text-muted-foreground">{currentLesson.description}</p>
                    )}
                    {currentLesson.content && (
                      <div className="prose prose-sm mt-4 max-w-none whitespace-pre-line text-foreground">
                        {currentLesson.content}
                      </div>
                    )}
                    {!currentLesson.description && !currentLesson.content && (
                      <p className="text-sm text-muted-foreground">
                        O instrutor ainda não adicionou descrição para essa aula.
                      </p>
                    )}
                  </div>
                </TabsContent>
                <TabsContent value="materiais" className="mt-4">
                  {materials.length === 0 ? (
                    <div className="surface-card p-5 text-sm text-muted-foreground">
                      Nenhum material complementar nessa aula.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {materials.map((m) => (
                        <a
                          key={m.id}
                          href={m.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="surface-card flex items-center gap-3 p-4 hover:bg-muted/30"
                        >
                          <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
                            <FileText className="h-5 w-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="truncate font-medium">{m.title}</div>
                            <div className="text-xs uppercase text-muted-foreground">
                              {m.material_type}
                            </div>
                          </div>
                          <Download className="h-4 w-4 text-muted-foreground" />
                        </a>
                      ))}
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="forum" className="mt-4 space-y-4">
                  <form onSubmit={createThread} className="surface-card space-y-3 p-5">
                    <h3 className="font-display text-lg">Fazer uma pergunta</h3>
                    <Input name="title" placeholder="Título da sua dúvida" required />
                    <Textarea name="content" placeholder="Descreva sua dúvida..." rows={3} required />
                    <div className="flex justify-end">
                      <Button type="submit">
                        <Send className="mr-2 h-4 w-4" /> Publicar
                      </Button>
                    </div>
                  </form>

                  {threads.length === 0 ? (
                    <div className="surface-card p-5 text-center text-sm text-muted-foreground">
                      Seja o primeiro a abrir uma discussão nesta aula.
                    </div>
                  ) : (
                    threads.map((t) => (
                      <ThreadCard
                        key={t.id}
                        thread={t}
                        replies={replies[t.id] ?? []}
                        onReply={(c) => postReply(t.id, c)}
                      />
                    ))
                  )}
                </TabsContent>
              </Tabs>

              <div className="mt-6 flex flex-col justify-between gap-3 sm:flex-row">
                <Button
                  asChild
                  variant="outline"
                  disabled={!prevLesson}
                  className={!prevLesson ? "pointer-events-none opacity-50" : ""}
                >
                  {prevLesson ? (
                    <Link
                      to="/aprender/$slug/$lessonId"
                      params={{ slug: course.slug, lessonId: prevLesson.id }}
                    >
                      <ChevronLeft className="mr-2 h-4 w-4" /> Aula anterior
                    </Link>
                  ) : (
                    <span>
                      <ChevronLeft className="mr-2 h-4 w-4" /> Aula anterior
                    </span>
                  )}
                </Button>
                <Button
                  asChild
                  disabled={!nextLesson}
                  className={!nextLesson ? "pointer-events-none opacity-50" : ""}
                >
                  {nextLesson ? (
                    <Link
                      to="/aprender/$slug/$lessonId"
                      params={{ slug: course.slug, lessonId: nextLesson.id }}
                    >
                      Próxima aula <ChevronRight className="ml-2 h-4 w-4" />
                    </Link>
                  ) : (
                    <span>
                      Próxima aula <ChevronRight className="ml-2 h-4 w-4" />
                    </span>
                  )}
                </Button>
              </div>
            </>
          )}
        </div>

        {/* Sidebar trilha */}
        <aside
          className={`${
            sidebarOpen ? "block" : "hidden"
          } lg:block lg:sticky lg:top-20 lg:self-start`}
        >
          <div className="surface-card overflow-hidden">
            <div className="border-b border-border p-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-accent">
                Sua trilha
              </div>
              <div className="mt-1 font-display text-lg leading-tight">{course.title}</div>
              <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {completedCount} / {totalLessons} aulas
                </span>
                <span className="font-semibold text-primary">{progressPct}%</span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
            <div className="max-h-[60vh] overflow-y-auto">
              {modules?.map((m, mi) => (
                <div key={m.id} className="border-b border-border last:border-0">
                  <div className="bg-secondary/40 px-4 py-2 text-xs font-semibold uppercase text-muted-foreground">
                    Módulo {mi + 1} · {m.title}
                  </div>
                  <ul>
                    {m.lessons.map((l) => {
                      const done = progressIds.has(l.id);
                      const active = l.id === lessonId;
                      return (
                        <li key={l.id}>
                          <Link
                            to="/aprender/$slug/$lessonId"
                            params={{ slug: course.slug, lessonId: l.id }}
                            onClick={() => setSidebarOpen(false)}
                            className={`flex items-center gap-3 px-4 py-2.5 text-sm transition ${
                              active
                                ? "bg-primary/10 font-medium text-primary"
                                : "hover:bg-muted/40"
                            }`}
                          >
                            {done ? (
                              <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
                            ) : active ? (
                              <PlayCircle className="h-4 w-4 shrink-0 text-primary" />
                            ) : (
                              <Circle className="h-4 w-4 shrink-0 text-muted-foreground" />
                            )}
                            <span className="min-w-0 flex-1 truncate">{l.title}</span>
                            <span className="text-xs text-muted-foreground">
                              {l.duration_minutes}min
                            </span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function VideoPlayer({ lesson }: { lesson: Lesson }) {
  const embed = useMemo(() => toEmbedUrl(lesson.video_url), [lesson.video_url]);
  if (!embed) {
    return (
      <div className="grid aspect-video place-items-center text-sm text-muted-foreground">
        Vídeo não disponível para esta aula.
      </div>
    );
  }
  return (
    <div className="relative aspect-video w-full">
      <iframe
        src={embed}
        title={lesson.title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="absolute inset-0 h-full w-full"
      />
    </div>
  );
}

function toEmbedUrl(url: string | null): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    // YouTube
    if (u.hostname.includes("youtu.be")) {
      return `https://www.youtube.com/embed/${u.pathname.slice(1)}`;
    }
    if (u.hostname.includes("youtube.com")) {
      const id = u.searchParams.get("v");
      if (id) return `https://www.youtube.com/embed/${id}`;
      if (u.pathname.startsWith("/embed/")) return url;
    }
    // Vimeo
    if (u.hostname.includes("vimeo.com")) {
      const id = u.pathname.split("/").filter(Boolean)[0];
      if (id) return `https://player.vimeo.com/video/${id}`;
    }
    return url;
  } catch {
    return null;
  }
}

function ThreadCard({
  thread,
  replies,
  onReply,
}: {
  thread: Thread;
  replies: Reply[];
  onReply: (c: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  return (
    <div className="surface-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="font-display text-lg">{thread.title}</h4>
          <p className="mt-1 whitespace-pre-line text-sm text-muted-foreground">
            {thread.content}
          </p>
        </div>
        <span className="shrink-0 text-xs text-muted-foreground">
          {new Date(thread.created_at).toLocaleDateString("pt-BR")}
        </span>
      </div>
      <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
        <MessageSquare className="h-3.5 w-3.5" />
        {replies.length} resposta{replies.length === 1 ? "" : "s"}
        <button
          onClick={() => setOpen((v) => !v)}
          className="ml-auto text-primary hover:underline"
        >
          {open ? "Ocultar" : "Responder / ver"}
        </button>
      </div>
      {open && (
        <div className="mt-3 space-y-3 border-t border-border pt-3">
          {replies.map((r) => (
            <div key={r.id} className="rounded-lg bg-muted/40 p-3 text-sm">
              <p className="whitespace-pre-line">{r.content}</p>
              <div className="mt-1 text-xs text-muted-foreground">
                {new Date(r.created_at).toLocaleString("pt-BR")}
              </div>
            </div>
          ))}
          <div className="flex gap-2">
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={2}
              placeholder="Escreva uma resposta..."
            />
            <Button
              onClick={() => {
                onReply(text);
                setText("");
              }}
              size="sm"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
