import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, KeyRound } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/_authenticated/trocar-senha")({
  head: () => ({
    meta: [
      { title: "Trocar senha — Guatá Capacita" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ChangePasswordPage,
});

const schema = z
  .object({
    password: z
      .string()
      .min(10, "Mínimo de 10 caracteres")
      .regex(/[A-Z]/, "Inclua ao menos uma letra maiúscula")
      .regex(/[a-z]/, "Inclua ao menos uma letra minúscula")
      .regex(/[0-9]/, "Inclua ao menos um número"),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: "As senhas não coincidem",
    path: ["confirm"],
  });

function ChangePasswordPage() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [mustChange, setMustChange] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      const flag = Boolean(data.user?.user_metadata?.must_change_password);
      setMustChange(flag);
    })();
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = schema.safeParse({
      password: fd.get("password"),
      confirm: fd.get("confirm"),
    });
    if (!parsed.success) {
      return toast.error(parsed.error.issues[0]?.message ?? "Dados inválidos");
    }
    setSaving(true);
    const { data: userData } = await supabase.auth.getUser();
    const uid = userData.user?.id;
    const { error } = await supabase.auth.updateUser({
      password: parsed.data.password,
      data: { must_change_password: false },
    });
    if (error) {
      setSaving(false);
      return toast.error(error.message);
    }
    if (uid) {
      await supabase.from("profiles").update({ must_change_password: false }).eq("id", uid);
    }
    setSaving(false);
    toast.success("Senha atualizada com sucesso");
    navigate({ to: "/perfil" });
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="container-narrow flex-1 py-12 sm:py-16">
        <div className="mx-auto max-w-md">
          <div className="text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary">
              <KeyRound className="h-7 w-7" />
            </div>
            <h1 className="mt-4 font-display text-3xl">Trocar senha</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {mustChange
                ? "Por segurança, defina uma nova senha antes de continuar."
                : "Defina uma nova senha de acesso."}
            </p>
          </div>

          <form onSubmit={onSubmit} className="surface-card mt-8 space-y-4 p-6">
            <div>
              <Label htmlFor="password">Nova senha</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={10}
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Mínimo 10 caracteres, com maiúscula, minúscula e número.
              </p>
            </div>
            <div>
              <Label htmlFor="confirm">Confirmar senha</Label>
              <Input
                id="confirm"
                name="confirm"
                type="password"
                autoComplete="new-password"
                required
                minLength={10}
              />
            </div>
            <Button type="submit" className="w-full" disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Atualizar senha
            </Button>
          </form>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
