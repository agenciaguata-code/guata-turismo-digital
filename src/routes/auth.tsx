import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { Mail, Lock, User as UserIcon, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import logoAsset from "@/assets/guata-capacita-logo.png.asset.json";
const logo = logoAsset.url;

const searchSchema = z.object({
  tab: z.enum(["signin", "signup", "forgot"]).optional(),
});

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Entrar — Guatá Capacita" },
      { name: "description", content: "Entre ou cadastre-se na plataforma Guatá Capacita." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const [tab, setTab] = useState<"signin" | "signup" | "forgot">(search.tab ?? "signin");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: "/perfil" });
    });
  }, [navigate]);

  return (
    <div className="grid min-h-screen md:grid-cols-2">
      {/* Painel esquerdo (decorativo) */}
      <div
        className="relative hidden flex-col justify-between p-10 text-primary-foreground md:flex"
        style={{ background: "var(--gradient-trilha)" }}
      >
        <Link to="/" className="inline-flex items-center gap-2 text-sm opacity-90 hover:opacity-100">
          <ArrowLeft className="h-4 w-4" /> Voltar ao site
        </Link>
        <div>
          <div className="rounded-2xl bg-background/95 p-4 inline-block shadow-elevated">
            <img src={logo} alt="Guatá Capacita" className="h-24 w-auto object-contain" />
          </div>
          <h1 className="mt-6 font-display text-4xl leading-tight">
            Sua trilha de capacitação em turismo começa aqui.
          </h1>
          <p className="mt-4 max-w-md text-primary-foreground/85">
            Aprenda com quem vive turismo, no seu ritmo, e leve seu certificado.
          </p>
        </div>
        <div className="text-xs opacity-75">© Guatá Capacita</div>
      </div>

      {/* Formulário */}
      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">
          <div className="mb-6 flex items-center justify-between md:hidden">
            <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <ArrowLeft className="h-4 w-4" /> Início
            </Link>
            <img src={logo} alt="Guatá Capacita" className="h-10 w-auto object-contain" />
          </div>

          <h2 className="font-display text-3xl">
            {tab === "signup" ? "Criar conta" : tab === "forgot" ? "Recuperar senha" : "Entrar"}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {tab === "signup"
              ? "Comece grátis em segundos."
              : tab === "forgot"
                ? "Enviaremos um link de redefinição para seu e-mail."
                : "Bem-vindo de volta!"}
          </p>

          {tab === "forgot" ? (
            <ForgotForm onBack={() => setTab("signin")} />
          ) : (
            <Tabs value={tab} onValueChange={(v) => setTab(v as "signin" | "signup")} className="mt-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Entrar</TabsTrigger>
                <TabsTrigger value="signup">Cadastrar</TabsTrigger>
              </TabsList>
              <TabsContent value="signin" className="mt-5">
                <SignInForm onForgot={() => setTab("forgot")} />
              </TabsContent>
              <TabsContent value="signup" className="mt-5">
                <SignUpForm />
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </div>
  );
}

const emailSchema = z.string().trim().email("E-mail inválido").max(255);
const passwordSchema = z.string().min(6, "Mínimo 6 caracteres").max(72);
const nameSchema = z.string().trim().min(2, "Nome muito curto").max(120);

function SignInForm({ onForgot }: { onForgot: () => void }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = emailSchema.safeParse(fd.get("email"));
    const password = passwordSchema.safeParse(fd.get("password"));
    if (!email.success) return toast.error(email.error.issues[0].message);
    if (!password.success) return toast.error(password.error.issues[0].message);

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.data,
      password: password.data,
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Bem-vindo de volta!");
    navigate({ to: "/perfil" });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Field id="email" type="email" label="E-mail" icon={Mail} autoComplete="email" />
      <Field id="password" type="password" label="Senha" icon={Lock} autoComplete="current-password" />
      <div className="flex justify-end">
        <button type="button" onClick={onForgot} className="text-sm text-primary hover:underline">
          Esqueci minha senha
        </button>
      </div>
      <Button type="submit" disabled={loading} className="w-full" size="lg">
        {loading ? "Entrando..." : "Entrar"}
      </Button>
    </form>
  );
}

function SignUpForm() {
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = nameSchema.safeParse(fd.get("name"));
    const email = emailSchema.safeParse(fd.get("email"));
    const password = passwordSchema.safeParse(fd.get("password"));
    if (!name.success) return toast.error(name.error.issues[0].message);
    if (!email.success) return toast.error(email.error.issues[0].message);
    if (!password.success) return toast.error(password.error.issues[0].message);

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: email.data,
      password: password.data,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: { full_name: name.data },
      },
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Conta criada! Verifique seu e-mail para confirmar.");
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Field id="name" type="text" label="Nome completo" icon={UserIcon} autoComplete="name" />
      <Field id="email" type="email" label="E-mail" icon={Mail} autoComplete="email" />
      <Field id="password" type="password" label="Senha" icon={Lock} autoComplete="new-password" hint="Mínimo 6 caracteres" />
      <Button type="submit" disabled={loading} className="w-full" size="lg">
        {loading ? "Criando conta..." : "Criar conta grátis"}
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        Ao cadastrar você concorda com nossos termos de uso.
      </p>
    </form>
  );
}

function ForgotForm({ onBack }: { onBack: () => void }) {
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = emailSchema.safeParse(fd.get("email"));
    if (!email.success) return toast.error(email.error.issues[0].message);

    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.data, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Se a conta existir, enviamos o link de redefinição.");
    onBack();
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-4">
      <Field id="email" type="email" label="E-mail" icon={Mail} autoComplete="email" />
      <Button type="submit" disabled={loading} className="w-full" size="lg">
        {loading ? "Enviando..." : "Enviar link de recuperação"}
      </Button>
      <button type="button" onClick={onBack} className="block w-full text-center text-sm text-muted-foreground hover:text-primary">
        ← Voltar para entrar
      </button>
    </form>
  );
}

function Field({
  id,
  label,
  type,
  icon: Icon,
  autoComplete,
  hint,
}: {
  id: string;
  label: string;
  type: string;
  icon: React.ComponentType<{ className?: string }>;
  autoComplete?: string;
  hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id={id}
          name={id}
          type={type}
          autoComplete={autoComplete}
          required
          className="pl-9"
        />
      </div>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
