-- ============================================
-- Adicionar campos de endereço completo da sede
-- ============================================

-- Adicionar colunas de endereço completo
ALTER TABLE shipping_settings
  ADD COLUMN IF NOT EXISTS origin_street TEXT,
  ADD COLUMN IF NOT EXISTS origin_number TEXT,
  ADD COLUMN IF NOT EXISTS origin_complement TEXT,
  ADD COLUMN IF NOT EXISTS origin_neighborhood TEXT;

-- Atualizar com o endereço da sede fornecido
-- R. Buarque de Macedo, 1432 - São Francisco, Garibaldi - RS, 95720-000
UPDATE shipping_settings
SET 
  origin_street = 'R. Buarque de Macedo',
  origin_number = '1432',
  origin_complement = NULL,
  origin_neighborhood = 'São Francisco',
  origin_cep = '95720000',
  origin_state = 'RS',
  origin_city = 'Garibaldi'
WHERE id = '00000000-0000-0000-0000-000000000000'::uuid;

