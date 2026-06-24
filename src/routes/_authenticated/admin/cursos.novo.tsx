import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { ArrowLeft } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/_authenticated/admin/cursos/novo")({
  head: () => ({ meta: [{ title: "Novo curso" }, { name: "robots", content: "noindex" }] }),
  component: NewCoursePage,
});

const schema = z.object({
  title: z.string().trim().min(3, "Mínimo 3 caracteres"),
  slug: z
    .string()
    .trim()
    .min(3, "Mínimo 3 caracteres")
    .regex(/^[a-z0-9-]+$/, "Use apenas minúsculas, números e hífens"),
  short_description: z.string().trim().max(280).optional().or(z.literal("")),
});

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function NewCoursePage() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [touched, setTouched] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = schema.safeParse({
      title: fd.get("title"),
      slug: fd.get("slug"),
      short_description: fd.get("short_description"),
    });
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);

    setSaving(true);
    const { data, error } = await supabase
      .from("courses")
      .insert({
        title: parsed.data.title,
        slug: parsed.data.slug,
        short_description: parsed.data.short_description || null,
      })
      .select("id")
      .single();
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Curso criado! Complete os demais campos.");
    navigate({ to: "/admin/cursos/$id", params: { id: data.id } });
  }

  return (
    <div>
      <Button asChild variant="ghost" size="sm" className="mb-3">
        <Link to="/admin/cursos">
          <ArrowLeft className="mr-1.5 h-4 w-4" /> Voltar
        </Link>
      </Button>
      <div className="mb-6">
        <h1 className="font-display text-3xl">Novo curso</h1>
        <p className="text-sm text-muted-foreground">Comece pelo básico — você poderá editar todos os detalhes em seguida.</p>
      </div>
      <form onSubmit={onSubmit} className="surface-card max-w-2xl space-y-4 p-6">
        <div className="space-y-1.5">
          <Label htmlFor="title">Título *</Label>
          <Input
            id="title"
            name="title"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (!touched) setSlug(slugify(e.target.value));
            }}
            placeholder="Ex.: Atendimento ao turista"
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="slug">Slug (URL) *</Label>
          <Input
            id="slug"
            name="slug"
            value={slug}
            onChange={(e) => {
              setTouched(true);
              setSlug(e.target.value);
            }}
            placeholder="atendimento-ao-turista"
            required
          />
          <p className="text-xs text-muted-foreground">Será acessível em /cursos/{slug || "..."}</p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="short_description">Descrição curta</Label>
          <Textarea id="short_description" name="short_description" rows={3} maxLength={280} placeholder="Resumo de até 280 caracteres" />
        </div>
        <div className="flex justify-end pt-2">
          <Button type="submit" disabled={saving} size="lg">
            {saving ? "Criando..." : "Criar curso"}
          </Button>
        </div>
      </form>
    </div>
  );
}
