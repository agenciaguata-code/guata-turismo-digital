import { Link } from "@tanstack/react-router";
import logoAsset from "@/assets/guata-capacita-logo.png.asset.json";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-border bg-secondary/40">
      <div className="container-narrow grid gap-8 py-12 md:grid-cols-3">
        <div>
          <img
            src={logoAsset.url}
            alt="Guatá Capacita"
            className="h-14 w-auto object-contain"
          />
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            Capacitando pessoas para transformar o turismo.
          </p>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-semibold">Navegue</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/cursos" className="hover:text-primary">Catálogo de cursos</Link></li>
            <li><Link to="/validar" className="hover:text-primary">Validar certificado</Link></li>
            <li><Link to="/auth" className="hover:text-primary">Entrar / cadastrar</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-semibold">Para você</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>Alunos: cursos, certificados, fórum</li>
            <li>Professores: criar e gerenciar cursos</li>
            <li>Administração: gestão completa</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="container-narrow flex flex-col items-center justify-between gap-2 py-4 text-xs text-muted-foreground sm:flex-row">
          <span>© {new Date().getFullYear()} Guatá Capacita. Todos os direitos reservados.</span>
          <span>Feito com 💚 para o turismo brasileiro</span>
        </div>
      </div>
    </footer>
  );
}
