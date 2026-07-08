# Projeto Sete — Móveis Planejados e Marcenaria

Site institucional + CMS administrativo para a **Projeto Sete**, marcenaria de alto padrão de Fortaleza.

## Stack
- **Frontend:** Vite + React 18 + TypeScript + Tailwind CSS + Framer Motion
- **Backend:** Fastify (Node) como Serverless Functions
- **Banco / Auth / Storage:** Supabase (PostgreSQL, Auth, Storage)
- **Deploy:** Vercel · **Versionamento:** GitHub

## Estrutura (monorepo npm workspaces)
```
projeto-sete/
├─ web/     # frontend (Vite + React)
├─ api/     # backend (Fastify)
├─ shared/  # schemas Zod + constantes + tipos (compartilhados)
└─ docs/    # SQL do Supabase + guias
```

## Próximos passos
Veja **[docs/INSTALL.md](docs/INSTALL.md)** para instalação local e **[docs/DEPLOY.md](docs/DEPLOY.md)** para deploy na Vercel. O mapeamento de rotas está em **[docs/ROUTE_MAP.md](docs/ROUTE_MAP.md)**.

## Scripts principais (raiz)
```bash
npm install      # instala e linka os workspaces
npm run dev      # roda web (5173) + api (3001)
npm run build    # compila shared, api e web
npm run lint     # lint de todos os workspaces
npm run typecheck
```

## Documentação técnica
Plano completo de desenvolvimento: `docs/DESENVOLVIMENTO.md`.
