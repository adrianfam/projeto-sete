# Instalação — Projeto Sete (pt-BR)

Pré-requisitos: **Node 20+**, **npm 10+**, uma conta no **Supabase** e (opcional) **Resend** para e-mail.

## 1. Variáveis de ambiente
```bash
cp .env.example .env          # raiz (api)
cp web/.env.example web/.env  # frontend
```
Preencha no `.env` da raiz: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` e, se usar autenticação de admin, `SUPABASE_JWT_SECRET`. Em `web/.env` preencha `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.

## 2. Banco de dados (Supabase SQL Editor)
Execute nesta ordem:
1. `docs/SUPABASE_SCHEMA.sql`
2. `docs/SUPABASE_RLS.sql`
3. `docs/SUPABASE_SEED.sql` (conteúdo de exemplo)

## 3. Criar o admin
No painel do Supabase: **Authentication → Users → Add user** com e-mail/senha do `Felipe Amorim`. Copie o `id` do usuário e rode no SQL Editor:
```sql
insert into public.admin_profiles (user_id, full_name, role)
values ('<USER_ID>', 'Felipe Amorim', 'admin');
```

## 4. Instalar e rodar
```bash
npm install      # raiz — linka os workspaces web/api/shared
npm run dev      # web em :5173 e api em :3001 em paralelo
```
O `web` já faz proxy de `/api` → `http://localhost:3001`.

## 5. Verificação rápida
- `curl http://localhost:3001/api/health` → `{ "status":"ok", ... }`
- `curl http://localhost:3001/api/portfolio` → itens do seed
- Abra `http://localhost:5173/` → hero + landing
- `/admin/login` com o admin cadastrado → dashboard
