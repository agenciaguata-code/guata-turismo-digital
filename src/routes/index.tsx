import { createFileRoute, Link } from "@tanstack/react-router";
import {
  GraduationCap,
  PlayCircle,
  Award,
  Users,
  MapPin,
  CheckCircle2,
  Compass,
  Sparkles,
} from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import hero from "@/assets/hero-forest.jpg";
import logoAsset from "@/assets/guata-capacita-logo.png.asset.json";
const logo = logoAsset.url;

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Guatá Capacita — Capacitação profissional em turismo" },
      {
        name: "description",
        content:
          "Cursos, treinamentos e certificações para profissionais e estudantes do turismo. Aprenda no seu ritmo e receba certificado.",
      },
      { property: "og:title", content: "Guatá Capacita" },
      {
        property: "og:description",
        content: "Capacitando pessoas para transformar o turismo.",
      },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <Stats />
        <Features />
        <ForAudience />
        <HowItWorks />
        <CTA />
      </main>
      <SiteFooter />
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        className="absolute inset-0 -z-10 bg-cover bg-center opacity-25"
        style={{ backgroundImage: `url(${hero})` }}
        aria-hidden
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background/80 via-background/95 to-background" />

      <div className="container-narrow grid items-center gap-10 py-14 sm:py-20 md:grid-cols-2 md:py-28">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-xs font-medium text-accent-foreground">
            <Sparkles className="h-3.5 w-3.5 text-accent" />
            Capacitação em turismo, no seu ritmo
          </span>
          <h1 className="mt-4 font-display text-4xl leading-tight tracking-tight text-foreground sm:text-5xl md:text-6xl">
            Capacitando pessoas para <span className="text-primary">transformar o turismo</span>.
          </h1>
          <p className="mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
            Cursos, treinamentos e certificações para profissionais, guias, estudantes e
            apaixonados pelo setor. Aprenda quando e onde quiser — e leve o seu certificado.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link to="/cursos">
                <Compass className="mr-2 h-5 w-5" /> Explorar cursos
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/auth">Criar conta gratuita</Link>
            </Button>
          </div>
          <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
            <li className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-success" /> 100% online
            </li>
            <li className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-success" /> Certificado digital
            </li>
            <li className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-success" /> Conteúdo prático
            </li>
          </ul>
        </div>

        <div className="relative mx-auto w-full max-w-md">
          <div className="absolute -inset-4 -z-10 rounded-[2rem] bg-gradient-to-br from-primary/15 via-accent/10 to-transparent blur-2xl" />
          <div className="surface-card relative overflow-hidden p-6 sm:p-8">
            <div className="flex flex-col items-center text-center">
              <img src={logo} alt="Mascote Guatá Capacita" className="h-40 w-auto object-contain" />
              <div className="mt-3 text-sm text-muted-foreground">
                Bem-vindo à trilha! Eu sou o Guatá, seu guia.
              </div>
            </div>
            <div className="mt-5 space-y-3">
              <MiniCourse title="Atendimento ao turista" tag="Iniciante" hours="6h" />
              <MiniCourse title="Guia de turismo regional" tag="Intermediário" hours="20h" />
              <MiniCourse title="Hospitalidade & vendas" tag="Avançado" hours="12h" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function MiniCourse({ title, tag, hours }: { title: string; tag: string; hours: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-background p-3">
      <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
        <PlayCircle className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium">{title}</div>
        <div className="text-xs text-muted-foreground">
          {tag} · {hours}
        </div>
      </div>
      <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-semibold uppercase text-accent-foreground">
        Novo
      </span>
    </div>
  );
}

function Stats() {
  const items = [
    { value: "100%", label: "Online & mobile" },
    { value: "+30h", label: "De conteúdo" },
    { value: "PT-BR", label: "Em português" },
    { value: "Grátis", label: "Para começar" },
  ];
  return (
    <section className="border-y border-border bg-secondary/40">
      <div className="container-narrow grid grid-cols-2 gap-4 py-8 sm:grid-cols-4">
        {items.map((i) => (
          <div key={i.label} className="text-center">
            <div className="font-display text-2xl font-semibold text-primary sm:text-3xl">
              {i.value}
            </div>
            <div className="text-xs text-muted-foreground sm:text-sm">{i.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Features() {
  const items = [
    {
      icon: GraduationCap,
      title: "Aulas em vídeo",
      text: "Player integrado com YouTube/Vimeo, materiais para download e progresso automático.",
    },
    {
      icon: Award,
      title: "Certificado digital",
      text: "Conclua o curso, faça a avaliação e receba certificado com código de validação.",
    },
    {
      icon: Users,
      title: "Fórum por aula",
      text: "Tire dúvidas com colegas e professores. Aprenda em comunidade.",
    },
    {
      icon: MapPin,
      title: "Foco no turismo BR",
      text: "Conteúdo prático para guias, hotelaria, gastronomia e atrativos brasileiros.",
    },
  ];
  return (
    <section className="container-narrow py-16 sm:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <span className="text-xs font-semibold uppercase tracking-wider text-accent">
          O que você encontra
        </span>
        <h2 className="mt-2 font-display text-3xl sm:text-4xl">
          Tudo o que você precisa para evoluir
        </h2>
        <p className="mt-3 text-muted-foreground">
          Uma plataforma feita por quem entende de turismo, para quem vive turismo todo dia.
        </p>
      </div>
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((i) => (
          <div key={i.title} className="surface-card p-6">
            <div className="grid h-11 w-11 place-items-center rounded-lg bg-primary/10 text-primary">
              <i.icon className="h-5 w-5" />
            </div>
            <h3 className="mt-4 font-display text-lg">{i.title}</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">{i.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function ForAudience() {
  return (
    <section className="bg-secondary/30 py-16 sm:py-24">
      <div className="container-narrow grid gap-6 md:grid-cols-3">
        {[
          {
            badge: "Aluno",
            title: "Aprenda e se certifique",
            list: [
              "Cadastro grátis em segundos",
              "Catálogo completo de cursos",
              "Progresso automático e certificado",
              "Fórum de dúvidas por aula",
            ],
          },
          {
            badge: "Professor",
            title: "Ensine na sua área",
            list: [
              "Crie cursos, módulos e aulas",
              "Acompanhe alunos e progresso",
              "Corrija atividades dissertativas",
              "Responda dúvidas no fórum",
            ],
          },
          {
            badge: "Instituição",
            title: "Capacite seu time",
            list: [
              "Painel administrativo completo",
              "Gestão de usuários e papéis",
              "Relatórios e certificados",
              "Pronto para múltiplos cursos",
            ],
          },
        ].map((c) => (
          <div key={c.title} className="surface-card p-7">
            <span className="inline-flex rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold uppercase text-primary">
              {c.badge}
            </span>
            <h3 className="mt-3 font-display text-2xl">{c.title}</h3>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              {c.list.map((l) => (
                <li key={l} className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                  <span>{l}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { n: "1", t: "Crie sua conta", d: "Cadastro grátis com e-mail e senha." },
    { n: "2", t: "Escolha um curso", d: "Explore o catálogo e inscreva-se." },
    { n: "3", t: "Assista no seu ritmo", d: "Vídeos, materiais e progresso salvo." },
    { n: "4", t: "Receba certificado", d: "Conclua, faça avaliação e baixe o PDF." },
  ];
  return (
    <section className="container-narrow py-16 sm:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <span className="text-xs font-semibold uppercase tracking-wider text-accent">
          Como funciona
        </span>
        <h2 className="mt-2 font-display text-3xl sm:text-4xl">A trilha é simples</h2>
      </div>
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((s) => (
          <div key={s.n} className="relative surface-card p-6">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-accent text-accent-foreground font-display text-lg font-semibold">
              {s.n}
            </div>
            <h3 className="mt-4 font-display text-lg">{s.t}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="container-narrow py-12 sm:py-16">
      <div
        className="relative overflow-hidden rounded-3xl p-8 sm:p-12 text-primary-foreground"
        style={{ background: "var(--gradient-trilha)" }}
      >
        <div className="relative z-10 max-w-2xl">
          <h2 className="font-display text-3xl sm:text-4xl">
            Pronto para iniciar sua trilha?
          </h2>
          <p className="mt-3 text-primary-foreground/85">
            Cadastre-se agora e comece com um curso grátis. Sem cartão de crédito.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild size="lg" variant="secondary">
              <Link to="/auth">Criar conta grátis</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
              <Link to="/cursos">Ver cursos</Link>
            </Button>
          </div>
        </div>
        <div className="pointer-events-none absolute -right-12 -top-12 h-64 w-64 rounded-full bg-accent/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-10 h-72 w-72 rounded-full bg-primary-foreground/10 blur-3xl" />
      </div>
    </section>
  );
}
