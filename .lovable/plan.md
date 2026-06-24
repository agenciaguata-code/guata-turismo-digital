
# Diagnóstico: o que existe x o que falta

## O que JÁ está pronto
- **Banco de dados completo**: tabelas `courses`, `modules`, `lessons`, `materials`, `quizzes`, `quiz_questions`, `assignments`, `enrollments`, `certificates`, `profiles`, `user_roles` — todas com RLS e políticas que permitem `admin`/`professor` gerenciarem conteúdo.
- **Autenticação e papéis**: login, troca de senha obrigatória, papel `admin` atribuído ao seu e-mail.
- **Área pública**: home, catálogo `/cursos`, detalhe `/cursos/:slug`, validação de certificado.
- **Área do aluno**: `/meus-cursos`, player `/aprender/:slug/:lessonId`, perfil.

## O que NÃO existe (origem dos bugs que você viu)
1. **Nenhuma tela de administração** — não há rotas tipo `/admin/cursos`, `/admin/cursos/novo`, edição de módulos/aulas. Por isso "editar/criar curso não dá": a UI nunca foi construída.
2. **Nenhum bucket de Storage** — daí o erro **"Bucket not found"** ao trocar a foto de capa. Precisamos criar o bucket `course-covers` (público) e `lesson-materials` (privado) com políticas RLS.
3. **Sem gestão de matrículas/alunos** pelo admin.
4. **Sem upload de avatar** no perfil (também depende de bucket).

---

# Plano de desenvolvimento (proposto)

Dividido em 4 fases entregáveis. Posso fazer tudo de uma vez ou parar a cada fase para você validar — me diga sua preferência.

## Fase 1 — Infraestrutura de arquivos (rápido, destrava upload)
- Criar bucket **`course-covers`** (público) — capas de curso.
- Criar bucket **`lesson-materials`** (privado) — PDFs, slides etc.
- Criar bucket **`avatars`** (público) — foto de perfil.
- Políticas RLS em `storage.objects`: admin/professor podem escrever; leitura conforme o bucket.

## Fase 2 — Painel admin de Cursos
- Rota protegida `_authenticated/admin/` com guard verificando `has_role('admin')`.
- `/admin/cursos` — listagem com filtros (publicado/rascunho, categoria), busca.
- `/admin/cursos/novo` e `/admin/cursos/:id/editar` — formulário com:
  - título, slug (auto), descrição curta/longa, categoria, nível, duração, preço, publicado (sim/não), instrutor.
  - upload da capa direto no bucket `course-covers`.
- Ações: duplicar, despublicar, excluir (com confirmação).
- Link "Admin" no menu do header (visível só para admin).

## Fase 3 — Módulos, Aulas e Materiais
- Dentro de `/admin/cursos/:id/editar`, abas:
  - **Módulos**: criar/editar/reordenar (drag-and-drop) — campos título, descrição, ordem.
  - **Aulas** (por módulo): título, descrição, conteúdo, vídeo (provider + URL), duração, preview gratuita, ordem.
  - **Materiais**: upload para `lesson-materials`, tipo (pdf/slide/etc), tamanho, vínculo a curso ou aula.

## Fase 4 — Alunos, matrículas e dashboard admin
- `/admin` — dashboard: total de alunos, cursos publicados, matrículas ativas, certificados emitidos.
- `/admin/alunos` — lista de usuários, papel, matrículas, ação de promover a professor/admin.
- `/admin/matriculas` — matricular/desmatricular manualmente.
- (Opcional) `/admin/certificados` — emitir manualmente.

---

# Detalhes técnicos (referência rápida)

- **Stack**: TanStack Start + server functions (`createServerFn` com `requireSupabaseAuth` + check de `has_role`).
- **Uploads**: via `supabase.storage.from('course-covers').upload(...)` no client; URL pública gravada em `courses.cover_url`.
- **Validação**: Zod nos formulários.
- **UI**: shadcn (Form, Dialog, Table, Tabs, DragHandle via `@dnd-kit`).
- **Tipos**: regenerados após cada migration.

---

# Perguntas antes de começar

1. **Posso começar pela Fase 1 (buckets) agora?** Sem isso, qualquer upload continua quebrado.
2. **Quer todas as 4 fases nesta rodada**, ou prefere validar fase a fase?
3. **Quer que `professor` também consiga gerenciar cursos** no painel, ou só `admin`?
4. **Fase 4 (dashboard/alunos/matrículas) entra agora** ou pode ficar para uma segunda iteração?
