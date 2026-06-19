import { createFileRoute, Link } from "@tanstack/react-router";
import { Compass } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/cursos")({
  head: () => ({
    meta: [
      { title: "Catálogo de cursos — Guatá Capacita" },
      { name: "description", content: "Explore cursos de capacitação em turismo." },
    ],
  }),
  component: CoursesPlaceholder,
});

function CoursesPlaceholder() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="container-narrow flex-1 py-16 sm:py-24">
        <div className="mx-auto max-w-xl text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary">
            <Compass className="h-7 w-7" />
          </div>
          <h1 className="mt-5 font-display text-3xl sm:text-4xl">Catálogo em construção</h1>
          <p className="mt-3 text-muted-foreground">
            A trilha de cursos chega na próxima fase. Enquanto isso, crie sua conta para
            ser notificado quando os primeiros cursos forem publicados.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild>
              <Link to="/auth">Criar conta</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/">Voltar ao início</Link>
            </Button>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
