## Estado atual (já implementado nas rodadas anteriores)

Antes de planejar correções, é importante que você saiba o que **já existe** no app — porque a percepção "não foi desenvolvido" não bate com o código:

- **Painel admin completo** em `/admin`:
  - `/admin` — dashboard com estatísticas
  - `/admin/cursos` — listagem com busca/filtros, publicar/despublicar, excluir
  - `/admin/cursos/novo` — criação de curso
  - `/admin/cursos/:id` — editor completo com 3 abas: **Detalhes** (incl. upload de capa), **Módulos & aulas** (CRUD + reordenação), **Materiais** (upload de PDFs)
  - `/admin/alunos` — promover usuários a admin/professor
  - `/admin/matriculas` — matricular alunos manualmente
  - Link "Admin" no header (só aparece pra admin) — você confirmou que vê
- **Storage**: os 3 buckets existem (`course-covers`, `lesson-materials`, `avatars`), todos privados, com políticas RLS corretas (uso de URLs assinadas de 10 anos via `src/lib/storage.ts`)
- **Upload de avatar** em `/perfil` já está plugado

Ou seja, criar/editar cursos **deveria funcionar**. Se não está funcionando, é bug, não falta de implementação.

## O problema real a investigar

Você diz "não faz upload da imagem" e ainda não testou em `/admin`. Os buckets e políticas existem — então "Bucket not found" como mensagem literal não condiz com o estado atual do banco. Suspeitas mais prováveis, em ordem:

1. **Preview com build quebrado/desatualizado** — a sessão de hoje começou com um Vite error overlay; é possível que você esteja vendo uma versão anterior em cache.
2. **Toast genérico "Bucket not found"** porque o cliente não acha o bucket pela política RLS (caso o usuário não esteja autenticado no momento do upload, ou o token de sessão esteja expirado).
3. **Bug pontual no path/owner check** que só ativa em certo cenário.

## Plano de ação (curto, sem grandes reescritas)

```text
1. Diagnóstico assistido (sem mudar regras)
2. Correção pontual do(s) bug(s) encontrado(s)
3. Pequenas melhorias de UX no admin (se você quiser)
```

### Fase 1 — Diagnóstico (30 min, código mínimo)
- Adicionar logs detalhados em `uploadAndSignUrl` (qual bucket, qual path, código de erro real do Supabase) e mostrar a mensagem do Supabase no toast em vez de só "Falha no upload".
- Testar 3 fluxos com você acompanhando:
  - `/perfil` → trocar foto
  - `/admin/cursos/novo` → criar curso de teste
  - `/admin/cursos/:id` → trocar capa do curso de teste
- Coletar a mensagem **exata** do Supabase (ex.: `new row violates row-level security`, `Bucket not found`, `JWT expired`).

### Fase 2 — Correção (depende do diagnóstico)
Possíveis correções, escolhidas conforme o que a Fase 1 mostrar:
- Ajustar política RLS do bucket envolvido.
- Ajustar o formato do `path` (prefixo de pasta) para casar com a política.
- Garantir que a sessão Supabase está válida antes do upload (refresh forçado).
- Forçar refresh do preview / limpar cache se for um build velho.

### Fase 3 — Polimento opcional do admin (você decide)
Só se quiser, dá pra acrescentar:
- Drag-and-drop real nos módulos/aulas (hoje é botão ↑/↓).
- Preview da capa antes de salvar.
- Filtro por categoria/nível na listagem de cursos.
- Atalho "Editar" direto do card do curso na home/catálogo (admin only).

## O que eu preciso de você antes de começar

1. Confirme se posso seguir com a **Fase 1 (logs de diagnóstico)** — é uma alteração mínima e segura.
2. Quando eu liberar a Fase 1, **abra `/perfil`, tente trocar a foto, e cole aqui a mensagem que aparecer no toast** (será a mensagem real do Supabase, não mais "Falha no upload"). Faça o mesmo em `/admin/cursos/novo` criando um curso "Teste" e tentando subir uma capa.
3. Diga se quer também a Fase 3 (polimento) agora ou só depois do bug resolvido.