-- Storage policies para o bucket 'products'
-- Permite que apenas admins façam upload de imagens de produtos

-- IMPORTANTE: Certifique-se de que o bucket 'products' já foi criado
-- antes de executar esta migration

-- Dropar políticas existentes se já existirem (para permitir re-execução da migration)
DROP POLICY IF EXISTS "Admins podem fazer upload de produtos" ON storage.objects;
DROP POLICY IF EXISTS "Todos podem ler imagens de produtos" ON storage.objects;
DROP POLICY IF EXISTS "Admins podem deletar imagens de produtos" ON storage.objects;
DROP POLICY IF EXISTS "Admins podem atualizar imagens de produtos" ON storage.objects;

-- Política para permitir INSERT (upload) de imagens de produtos
-- Apenas admins podem fazer upload
CREATE POLICY "Admins podem fazer upload de produtos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'products' AND
  public.is_admin()
);

-- Política para permitir SELECT (leitura) de imagens de produtos
-- Todos podem ler (público)
CREATE POLICY "Todos podem ler imagens de produtos"
ON storage.objects FOR SELECT
TO public
USING (
  bucket_id = 'products'
);

-- Política para permitir UPDATE (atualização) de imagens de produtos
-- Apenas admins podem atualizar
CREATE POLICY "Admins podem atualizar imagens de produtos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'products' AND
  public.is_admin()
)
WITH CHECK (
  bucket_id = 'products' AND
  public.is_admin()
);

-- Política para permitir DELETE (deletar) de imagens de produtos
-- Apenas admins podem deletar
CREATE POLICY "Admins podem deletar imagens de produtos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'products' AND
  public.is_admin()
);

