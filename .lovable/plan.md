## Objetivo

1. Criar o usuário **guilhermearevalo27@gmail.com** como **admin** com uma senha temporária.
2. Forçar a troca de senha no primeiro login.
3. Validar que o sistema (landing, auth, catálogo, área do aluno, validação de certificado, perfil) está funcionando.

---

## 1. Senha temporária

Gero uma senha aleatória forte (ex.: `Guata#TempXXXX` com 16 chars). Mostro no chat **uma única vez** após a criação para você copiar. Não fica salva no código.

## 2. Criação do admin (provisionamento único)

- Crio uma rota pública protegida por token de setup: `POST /api/public/setup-admin`.
  - Recebe `{ email, setup_token }`.
  - Valida `setup_token` contra a env `ADMIN_SETUP_TOKEN` (gerada via `generate_secret`).
  - Usa `supabaseAdmin.auth.admin.createUser` com `email_confirm: true`, `password: <temp>`, `user_metadata: { must_change_password: true }`.
  - Insere/garante `role='admin'` em `public.user_roles` para esse user_id.
  - Retorna 200 e fica inerte após uso (verifica se já existe admin com aquele email).
- Eu chamo essa rota uma vez via `curl` no sandbox passando o token, capturo o `user_id` e confirmo.
- Depois disso a senha temporária está pronta para você usar.

Alternativa mais simples (caso prefira): faço a chamada direto pelo `supabase--insert`/Auth Admin API em uma função one-shot e descarto a rota. **Recomendo a rota** porque permite reexecutar se algo falhar.

## 3. Troca obrigatória de senha

- Adiciono coluna `must_change_password boolean default false` em `public.profiles` (migration).
- O trigger `handle_new_user` continua igual; o setup-admin grava `true` na coluna para o admin recém-criado.
- Crio rota `/_authenticated/trocar-senha.tsx` com formulário (nova senha + confirmação, validação zod, força mínima 10 chars + maiúscula + número).
- No layout `_authenticated/route.tsx`, após `getUser()`, consulto `profiles.must_change_password`. Se `true` e a rota atual não for `/trocar-senha`, redireciono para lá.
- Ao salvar: `supabase.auth.updateUser({ password })` + `update profiles set must_change_password = false`.
- Também adiciono link "Alterar senha" no menu do header para trocas voluntárias futuras.

## 4. Smoke test funcional

Rodo um script Playwright no sandbox que:

1. Abre `/` — confirma landing renderiza (hero, stats, features).
2. Vai em `/cursos` — lista os 3 cursos seed, testa busca e filtros.
3. Abre `/cursos/atendimento-ao-turista` — confirma módulos/aulas e botão de inscrição.
4. Abre `/validar` — submete um código inexistente, confirma "não encontrado".
5. Faz login com o admin recém-criado, confirma redirect para `/trocar-senha`.
6. Troca a senha, confirma redirect para `/meus-cursos` ou `/perfil`.
7. Verifica que `/perfil` mostra a badge **admin**.
8. Faz logout.

Capturo screenshot de cada passo e te reporto o resultado. Erros de console/network entram no relatório.

## Detalhes técnicos

- `ADMIN_SETUP_TOKEN`: gerado via `secrets--generate_secret` (64 chars), usado uma vez e pode ser removido depois.
- Rota de setup valida assinatura via `timingSafeEqual` e rejeita se o admin já existir com senha definida.
- `must_change_password` em `profiles` tem GRANT já existente (SELECT/UPDATE para o próprio user via política atual).
- A checagem no layout `_authenticated` é client-side (`ssr: false` já), então não quebra o build.
- O scaffolding de e-mails de auth **não** é necessário para esse fluxo (login é por senha; reset não está sendo usado aqui).

## Arquivos afetados

- `supabase/migrations/*` — adiciona `must_change_password` em `profiles`.
- `src/routes/api/public/setup-admin.ts` — rota one-shot.
- `src/routes/_authenticated/trocar-senha.tsx` — nova tela.
- `src/routes/_authenticated/route.tsx` — checagem do flag.
- `src/components/SiteHeader.tsx` — link "Alterar senha".

## Pergunta antes de implementar

Posso seguir com esse plano? Se sim, eu cuido de tudo e te entrego no fim:
- e-mail + senha temporária para o primeiro login,
- relatório do smoke test com screenshots,
- confirmação de que o admin tem o papel correto.
