-- ============================================
-- Atualizar endereço da sede para Garibaldi
-- ============================================

-- Atualizar com o novo endereço da sede
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

