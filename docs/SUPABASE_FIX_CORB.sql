-- ===========================================================================
-- Projeto Sete — Fix CORB: substitui URLs quebradas do Unsplash no banco
-- Os seeds usam ON CONFLICT DO NOTHING, então é preciso UPDATE explícito.
-- ===========================================================================

-- 1. Corrigir gallery nos case_studies
UPDATE public.case_studies
SET gallery = REPLACE(gallery::text, 'photo-1600573472556-3c0c4f31d036', 'photo-1618220179428-22790b461013')::jsonb
WHERE gallery::text LIKE '%1600573472556%';

-- 2. Corrigir cover_image_url e gallery nos portfolio_items
UPDATE public.portfolio_items
SET cover_image_url = REPLACE(cover_image_url, 'photo-1600573472556-3c0c4f31d036', 'photo-1618220179428-22790b461013')
WHERE cover_image_url LIKE '%1600573472556%';

UPDATE public.portfolio_items
SET media = REPLACE(media::text, 'photo-1600573472556-3c0c4f31d036', 'photo-1618220179428-22790b461013')::jsonb
WHERE media::text LIKE '%1600573472556%';
