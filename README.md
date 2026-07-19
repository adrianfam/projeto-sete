# Projeto Sete — Móveis Planejados e Marcenaria

Site institucional + CMS administrativo + Ponto Eletrônico para a **Projeto Sete**,
marcenaria de alto padrão de Fortaleza.

## Features
- **Landing page** cinematográfica com hero, portfólio, cases, depoimentos, blog, contato
- **CMS Admin** completo (blog, portfólio, cases, instagram, comentários, contato)
- **Ponto Eletrônico** — colaboradores registram entrada/almoco/saída com GPS
- **Upload de imagens** via signed URL direto no Supabase Storage
- **Tema escuro** em todo o ambiente administrativo

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

## Documentação
- **[docs/INSTALL.md](docs/INSTALL.md)** — Instalação local
- **[docs/DEPLOY.md](docs/DEPLOY.md)** — Deploy na Vercel
- **[docs/ROUTE_MAP.md](docs/ROUTE_MAP.md)** — Mapa completo de rotas
- **[docs/DESENVOLVIMENTO.md](docs/DESENVOLVIMENTO.md)** — Documentação técnica

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
