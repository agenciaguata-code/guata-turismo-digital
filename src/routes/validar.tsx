import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Award, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/validar")({
  head: () => ({
    meta: [
      { title: "Validar certificado — Guatá Capacita" },
      { name: "description", content: "Confira a autenticidade de um certificado pelo código." },
    ],
  }),
  component: ValidatePage,
});

type Cert = {
  code: string;
  hours: number;
  issued_at: string;
  student_name: string;
  course_title: string;
};

function ValidatePage() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Cert | null | "not_found">(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = code.trim();
    if (!trimmed) return toast.error("Informe o código do certificado");
    setLoading(true);
    const { data, error } = await supabase.rpc("validate_certificate", { _code: trimmed });
    setLoading(false);
    if (error) return toast.error(error.message);
    const row = Array.isArray(data) ? data[0] : data;
    setResult(row ?? "not_found");
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="container-narrow flex-1 py-12 sm:py-16">
        <div className="mx-auto max-w-xl">
          <div className="text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-accent/15 text-accent-foreground">
              <Award className="h-7 w-7 text-accent" />
            </div>
            <h1 className="mt-4 font-display text-3xl sm:text-4xl">Validar certificado</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Digite o código de validação que aparece no certificado.
            </p>
          </div>

          <form onSubmit={onSubmit} className="surface-card mt-8 p-6">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Ex.: GUATA-XXXX-XXXX"
                  className="pl-9 uppercase"
                />
              </div>
              <Button type="submit" disabled={loading}>
                {loading ? "Buscando..." : "Validar"}
              </Button>
            </div>
          </form>

          {result === "not_found" && (
            <div className="surface-card mt-6 border-destructive/30 p-6 text-center">
              <h2 className="font-display text-lg text-destructive">Certificado não encontrado</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Verifique o código e tente novamente.
              </p>
            </div>
          )}

          {result && result !== "not_found" && (
            <div className="surface-card mt-6 overflow-hidden p-0">
              <div
                className="px-6 py-4 text-primary-foreground"
                style={{ background: "var(--gradient-trilha)" }}
              >
                <div className="text-xs uppercase tracking-wider opacity-80">
                  Certificado autêntico
                </div>
                <div className="font-display text-lg">{result.course_title}</div>
              </div>
              <dl className="grid grid-cols-2 gap-y-3 p-6 text-sm">
                <dt className="text-muted-foreground">Aluno(a)</dt>
                <dd className="font-medium">{result.student_name}</dd>
                <dt className="text-muted-foreground">Carga horária</dt>
                <dd className="font-medium">{Number(result.hours)} h</dd>
                <dt className="text-muted-foreground">Código</dt>
                <dd className="font-mono text-xs">{result.code}</dd>
                <dt className="text-muted-foreground">Emitido em</dt>
                <dd className="font-medium">
                  {new Date(result.issued_at).toLocaleDateString("pt-BR")}
                </dd>
              </dl>
            </div>
          )}

          <div className="mt-8 text-center text-xs text-muted-foreground">
            <Link to="/" className="hover:text-primary">
              ← Voltar ao início
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
