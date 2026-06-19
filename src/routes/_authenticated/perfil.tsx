import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, User as UserIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/perfil")({
  head: () => ({
    meta: [
      { title: "Meu perfil — Guatá Capacita" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ProfilePage,
});

type Profile = {
  id: string;
  full_name: string;
  bio: string | null;
  avatar_url: string | null;
  phone: string | null;
  city: string | null;
  state: string | null;
};

const profileSchema = z.object({
  full_name: z.string().trim().min(2, "Nome muito curto").max(120),
  bio: z.string().trim().max(500, "Máx. 500 caracteres").optional().or(z.literal("")),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  city: z.string().trim().max(80).optional().or(z.literal("")),
  state: z.string().trim().max(40).optional().or(z.literal("")),
  avatar_url: z.string().trim().url("URL inválida").max(500).optional().or(z.literal("")),
});

function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [email, setEmail] = useState<string>("");
  const [roles, setRoles] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;
      setEmail(userData.user.email ?? "");

      const [{ data: prof }, { data: roleRows }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", userData.user.id).maybeSingle(),
        supabase.from("user_roles").select("role").eq("user_id", userData.user.id),
      ]);
      setProfile(prof);
      setRoles((roleRows ?? []).map((r) => r.role));
      setLoading(false);
    })();
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!profile) return;
    const fd = new FormData(e.currentTarget);
    const parsed = profileSchema.safeParse({
      full_name: fd.get("full_name"),
      bio: fd.get("bio"),
      phone: fd.get("phone"),
      city: fd.get("city"),
      state: fd.get("state"),
      avatar_url: fd.get("avatar_url"),
    });
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);

    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: parsed.data.full_name,
        bio: parsed.data.bio || null,
        phone: parsed.data.phone || null,
        city: parsed.data.city || null,
        state: parsed.data.state || null,
        avatar_url: parsed.data.avatar_url || null,
      })
      .eq("id", profile.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Perfil atualizado!");
    setProfile({ ...profile, ...parsed.data, bio: parsed.data.bio || null });
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="container-narrow flex-1 py-8 sm:py-12">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl sm:text-4xl">Meu perfil</h1>
            <p className="text-sm text-muted-foreground">
              Mantenha seus dados atualizados — eles aparecem no seu certificado.
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {roles.map((r) => (
              <Badge key={r} variant="secondary" className="capitalize">
                {r}
              </Badge>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid place-items-center py-24 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : !profile ? (
          <div className="surface-card p-8 text-center text-muted-foreground">
            Perfil não encontrado.
          </div>
        ) : (
          <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-[280px_1fr]">
            {/* Avatar / preview */}
            <div className="surface-card flex flex-col items-center p-6">
              <div className="grid h-28 w-28 place-items-center overflow-hidden rounded-full bg-primary/10 text-primary">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <UserIcon className="h-12 w-12" />
                )}
              </div>
              <div className="mt-3 text-center">
                <div className="font-display text-lg">{profile.full_name || "Sem nome"}</div>
                <div className="text-xs text-muted-foreground">{email}</div>
              </div>
            </div>

            {/* Form */}
            <div className="surface-card space-y-4 p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Nome completo" id="full_name" defaultValue={profile.full_name} required />
                <FormField label="Telefone" id="phone" defaultValue={profile.phone ?? ""} />
                <FormField label="Cidade" id="city" defaultValue={profile.city ?? ""} />
                <FormField label="Estado (UF)" id="state" defaultValue={profile.state ?? ""} />
              </div>
              <FormField label="URL do avatar" id="avatar_url" defaultValue={profile.avatar_url ?? ""} placeholder="https://..." />
              <div className="space-y-1.5">
                <Label htmlFor="bio">Biografia</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  defaultValue={profile.bio ?? ""}
                  rows={4}
                  placeholder="Conte um pouco sobre você e sua experiência em turismo..."
                />
                <p className="text-xs text-muted-foreground">Máx. 500 caracteres.</p>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="submit" disabled={saving} size="lg">
                  {saving ? "Salvando..." : "Salvar alterações"}
                </Button>
              </div>
            </div>
          </form>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}

function FormField({
  id,
  label,
  defaultValue,
  required,
  placeholder,
}: {
  id: string;
  label: string;
  defaultValue?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} name={id} defaultValue={defaultValue} required={required} placeholder={placeholder} />
    </div>
  );
}
