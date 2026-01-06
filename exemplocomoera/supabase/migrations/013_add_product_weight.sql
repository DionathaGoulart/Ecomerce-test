-- ============================================
-- Adicionar campo de peso aos produtos
-- ============================================

-- Adicionar coluna weight_kg na tabela products
ALTER TABLE products 
  ADD COLUMN IF NOT EXISTS weight_kg DECIMAL(10, 3) DEFAULT NULL;

-- Comentário na coluna
COMMENT ON COLUMN products.weight_kg IS 'Peso do produto em quilogramas (opcional, usado para cálculo de frete)';

