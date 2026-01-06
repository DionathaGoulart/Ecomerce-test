-- ============================================
-- CRIAÇÃO DO BUCKET 'personalizations'
-- Para armazenar imagens de personalização dos pedidos
-- ============================================

-- Criar o bucket 'personalizations' se não existir
-- O bucket será privado (não público) para segurança
-- As imagens serão acessadas via signed URLs
--
-- NOTA: Se a inserção direta não funcionar, você pode criar o bucket manualmente:
-- 1. Acesse o Supabase Dashboard > Storage
-- 2. Clique em "New bucket"
-- 3. Nome: "personalizations"
-- 4. Marque como "Private" (não público)
-- 5. Limite de tamanho: 5MB
-- 6. Tipos MIME permitidos: image/jpeg, image/jpg, image/png, image/webp, image/gif

-- Tentar criar o bucket via SQL (pode não funcionar em todas as versões do Supabase)
DO $$
BEGIN
  -- Verificar se o bucket já existe
  IF NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'personalizations'
  ) THEN
    -- Inserir o bucket
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES (
      'personalizations',
      'personalizations',
      false, -- Bucket privado (não público)
      5242880, -- Limite de 5MB por arquivo (5 * 1024 * 1024)
      ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'] -- Apenas imagens
    );
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    -- Se houver erro, apenas logar (não quebrar a migration)
    RAISE NOTICE 'Não foi possível criar o bucket via SQL. Crie manualmente no Dashboard: Storage > New bucket > Nome: personalizations > Private';
END $$;

