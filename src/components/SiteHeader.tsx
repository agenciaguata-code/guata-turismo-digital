import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X, LogOut, User as UserIcon, BookOpen, KeyRound, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import logoAsset from "@/assets/guata-capacita-logo.png.asset.json";

export function SiteHeader() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) =>
      setUser(session?.user ?? null),
    );
    return () => sub.subscription.unsubscribe();
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="container-narrow flex h-16 items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2" aria-label="Guatá Capacita — início">
          <img
            src={logoAsset.url}
            alt="Guatá Capacita"
            className="h-11 w-auto object-contain"
            width={120}
            height={44}
          />
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link to="/" className="text-sm font-medium text-foreground/80 hover:text-primary">
            Início
          </Link>
          <Link to="/cursos" className="text-sm font-medium text-foreground/80 hover:text-primary">
            Cursos
          </Link>
          <Link to="/validar" className="text-sm font-medium text-foreground/80 hover:text-primary">
            Validar certificado
          </Link>
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link to="/meus-cursos">
                  <BookOpen className="mr-1.5 h-4 w-4" /> Meus cursos
                </Link>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link to="/perfil">
                  <UserIcon className="mr-1.5 h-4 w-4" /> Perfil
                </Link>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link to="/trocar-senha">
                  <KeyRound className="mr-1.5 h-4 w-4" /> Senha
                </Link>
              </Button>
              <Button onClick={handleSignOut} variant="outline" size="sm">
                <LogOut className="mr-1.5 h-4 w-4" /> Sair
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link to="/auth">Entrar</Link>
              </Button>
              <Button asChild size="sm">
                <Link to="/auth" search={{ tab: "signup" }}>
                  Criar conta
                </Link>
              </Button>
            </>
          )}
        </div>

        <button
          className="rounded-md p-2 text-foreground hover:bg-muted md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Abrir menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-background md:hidden">
          <div className="container-narrow flex flex-col gap-1 py-3">
            <Link to="/" onClick={() => setOpen(false)} className="rounded-md px-3 py-2 text-sm hover:bg-muted">
              Início
            </Link>
            <Link to="/cursos" onClick={() => setOpen(false)} className="rounded-md px-3 py-2 text-sm hover:bg-muted">
              Cursos
            </Link>
            <Link to="/validar" onClick={() => setOpen(false)} className="rounded-md px-3 py-2 text-sm hover:bg-muted">
              Validar certificado
            </Link>
            <div className="mt-2 flex flex-col gap-2 border-t border-border pt-3">
              {user ? (
                <>
                  <Button asChild variant="outline" size="sm">
                    <Link to="/meus-cursos" onClick={() => setOpen(false)}>
                      <BookOpen className="mr-1.5 h-4 w-4" /> Meus cursos
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="sm">
                    <Link to="/perfil" onClick={() => setOpen(false)}>
                      <UserIcon className="mr-1.5 h-4 w-4" /> Perfil
                    </Link>
                  </Button>
                  <Button onClick={handleSignOut} size="sm">
                    <LogOut className="mr-1.5 h-4 w-4" /> Sair
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild variant="outline" size="sm">
                    <Link to="/auth" onClick={() => setOpen(false)}>Entrar</Link>
                  </Button>
                  <Button asChild size="sm">
                    <Link to="/auth" onClick={() => setOpen(false)}>Criar conta</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
