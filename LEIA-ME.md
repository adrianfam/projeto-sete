# Projeto Sete — Guia rápido (LEIA-ME)

Bem-vindo ao site e painel administrativo da **Projeto Sete — Móveis Planejados e Marcenaria**.

Este documento é para a equipe. Para detalhes técnicos, veja `docs/`.

## Como editar o site (painel)

1. Acesse o endereço do site e entre em `/admin/login`.
2. Use seu e-mail e senha (fornecidos pelo suporte).
3. No painel você pode:
   - **Dashboard** — ver quantos posts, comentários e mensagens pendem.
   - **Blog** — criar/editar artigos (escreva em *Markdown*). Marque **Publicar** para
     que apareça no site.
   - **Portfólio** — adicionar projetos com foto de capa e categoria.
   - **Estudos de Caso** — descrever desafio, processo e resultados com métricas.
   - **Depoimentos** — cadastrar falas de clientes/parceiros.
   - **Instagram** — inserir imagens da galeria manual (link do post + imagem).
   - **Comentários** — aprovar, rejeitar ou marcar como spam comentários do blog.
   - **Atendimento** — ler mensagens do formulário de contato e responder.

## Onde Editar as Informações da Empresa

Os dados de contato, endereço, telefone e horário ficam em **um único lugar**:
`shared/src/constants/brand.ts`. Qualquer mudança de telefone/endereço deve ser feita
ali, e reflete em todo o site (rodapé, contato, Google, WhatsApp).

## Como Publicar / Atualizar

- O site é publicado automaticamente quando há mudança enviada ao GitHub (deploys
  automáticos na Vercel). Para publicar conteúdo você usa o painel — não precisa
  mexer no código.

## Suporte

- Problemas no site: `projetosete.gerencia@gmail.com`
- Documentação técnica: `docs/INSTALL.md` e `docs/DEPLOY.md`.

---

_Marcenaria de alto padrão em Fortaleza, desde 2009._
