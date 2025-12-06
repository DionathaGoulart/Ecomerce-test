-- ============================================
-- Sistema de Categorias
-- ============================================

-- Criar tabela de categorias
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Adicionar categoria_id aos produtos
ALTER TABLE products 
  ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES categories(id) ON DELETE SET NULL;

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);

-- Trigger para atualizar updated_at em categories
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS em categories
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para categories
-- Todos podem ver categorias (público)
CREATE POLICY "Todos podem ver categorias"
  ON categories FOR SELECT
  TO public
  USING (true);

-- Apenas admins podem criar/atualizar/deletar categorias
CREATE POLICY "Admins podem criar categorias"
  ON categories FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins podem atualizar categorias"
  ON categories FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins podem deletar categorias"
  ON categories FOR DELETE
  USING (public.is_admin());

