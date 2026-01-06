-- Storage policies para o bucket 'personalizations'
-- Permite que usuários anônimos e autenticados façam upload de imagens de personalização
--
-- IMPORTANTE: Esta migration deve ser executada APÓS a migration 011_create_personalizations_bucket.sql
-- que cria o bucket 'personalizations'

-- Dropar políticas existentes se já existirem (para permitir re-execução da migration)
DROP POLICY IF EXISTS "Permitir upload de imagens de personalização" ON storage.objects;
DROP POLICY IF EXISTS "Permitir leitura de imagens de personalização" ON storage.objects;
DROP POLICY IF EXISTS "Permitir upload anon personalizations" ON storage.objects;
DROP POLICY IF EXISTS "Permitir leitura anon personalizations" ON storage.objects;
DROP POLICY IF EXISTS "Permitir upload authenticated personalizations" ON storage.objects;
DROP POLICY IF EXISTS "Permitir leitura authenticated personalizations" ON storage.objects;

-- Política para permitir INSERT (upload) de imagens
-- Permite upload de qualquer arquivo no bucket personalizations
CREATE POLICY "Permitir upload anon personalizations"
ON storage.objects FOR INSERT
TO anon
WITH CHECK (
  bucket_id = 'personalizations'
);

-- Política para permitir SELECT (leitura) de imagens
-- Necessária para criar signed URLs e visualizar as imagens
CREATE POLICY "Permitir leitura anon personalizations"
ON storage.objects FOR SELECT
TO anon
USING (
  bucket_id = 'personalizations'
);

-- Políticas também para authenticated users (caso necessário no futuro)
CREATE POLICY "Permitir upload authenticated personalizations"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'personalizations'
);

CREATE POLICY "Permitir leitura authenticated personalizations"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'personalizations'
);

-- Nota: Estas políticas permitem que usuários anônimos e autenticados façam upload e leitura
-- no bucket personalizations. Se você quiser mais segurança, pode:
-- 1. Remover as políticas de SELECT e usar apenas signed URLs (mais seguro)
-- 2. Adicionar validações mais específicas no WITH CHECK e USING (ex: validar extensão do arquivo)
