# Deploy — Projeto Sete

Estratégia: **um único projeto Vercel** na raiz do repositório. O `web/` gera o site estático; as Serverless Functions em `api/api/` atendem `/api/*`.

## Vercel (recomendado)
1. Suba o repositório ao GitHub.
2. No Vercel → **Add New → Project** → importe o repo.
3. **Build & Output**:
   - Build Command: `npm run build`
   - Output Directory: `web/dist`
4. **Environment Variables** (mesmas do `.env` da raiz + `web`):
   - `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_JWT_SECRET`
   - `APP_URL` (a URL final), `NODE_ENV=production`
   - `RESEND_API_KEY` (ou SMTP_*), `MAIL_FROM`, `ADMIN_NOTIFY_EMAIL`
   - `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_API_BASE=/api`, `VITE_SITE_URL`
   - `VITE_GOOGLE_MAPS_API_KEY`, `WHATSAPP_NUMBER`
5. **Deploy**. As Functions em `api/api/[[...route]].ts` ficam expostas em `/api/*`.

## Domínio
Em **Settings → Domains** adicione `projetosete.com.br` (e `www`). Atualize DNS no registrador. SSL é automático. Após apontar o domínio, ajuste `APP_URL` e `VITE_SITE_URL` para `https://projetosete.com.br`.

## Alternativa (Render para o API)
Se preferir o `api` como servidor longo-running fora da Vercel: use `api/Dockerfile` (não incluído aqui) e `npm start` após `npm run build`. O frontend então aponta `VITE_API_BASE` para a URL do Render. Reescreva `web/vercel.json` para que o proxy aponte para lá.
