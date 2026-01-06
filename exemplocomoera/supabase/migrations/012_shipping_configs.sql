-- ============================================
-- Sistema de Configurações de Frete
-- ============================================

-- Criar tabela de configurações de frete
CREATE TABLE IF NOT EXISTS shipping_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE, -- Nome da configuração (ex: "SP Metropolitana", "SP Interior", "Outros Estados")
  region_type TEXT NOT NULL CHECK (region_type IN ('same_cep', 'metro_sp', 'sp_state', 'other_states', 'custom')), -- Tipo de região
  state_code TEXT, -- Código do estado (ex: 'SP', 'RJ') - opcional
  cep_prefix TEXT, -- Prefixo do CEP (ex: '0' para região metropolitana de SP) - opcional
  base_cost_cents INTEGER NOT NULL DEFAULT 0, -- Custo base em centavos
  delivery_days INTEGER NOT NULL DEFAULT 5, -- Prazo de entrega em dias
  weight_multiplier DECIMAL(10, 2) DEFAULT 0.1, -- Multiplicador por kg extra (ex: 0.1 = 10% por kg)
  min_weight_kg DECIMAL(10, 2) DEFAULT 1.0, -- Peso mínimo para aplicar o multiplicador
  is_active BOOLEAN DEFAULT true, -- Se a configuração está ativa
  priority INTEGER DEFAULT 0, -- Prioridade de aplicação (maior número = maior prioridade)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar tabela para configurações gerais de frete
-- Usar um ID fixo para garantir apenas uma linha
CREATE TABLE IF NOT EXISTS shipping_settings (
  id UUID PRIMARY KEY DEFAULT '00000000-0000-0000-0000-000000000000'::uuid,
  origin_cep TEXT NOT NULL DEFAULT '01310100', -- CEP de origem (empresa)
  origin_state TEXT NOT NULL DEFAULT 'SP', -- Estado de origem
  origin_city TEXT NOT NULL DEFAULT 'São Paulo', -- Cidade de origem
  default_cost_cents INTEGER DEFAULT 2000, -- Custo padrão se não encontrar configuração (R$ 20,00)
  default_delivery_days INTEGER DEFAULT 5, -- Prazo padrão
  use_correios_api BOOLEAN DEFAULT false, -- Se deve tentar usar API dos Correios
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inserir configuração padrão única
INSERT INTO shipping_settings (id, origin_cep, origin_state, origin_city, default_cost_cents, default_delivery_days, use_correios_api)
VALUES ('00000000-0000-0000-0000-000000000000'::uuid, '01310100', 'SP', 'São Paulo', 2000, 5, false)
ON CONFLICT (id) DO NOTHING;

-- Inserir configurações padrão de frete
INSERT INTO shipping_configs (name, region_type, state_code, cep_prefix, base_cost_cents, delivery_days, weight_multiplier, priority, is_active)
VALUES
  ('Mesmo CEP', 'same_cep', NULL, NULL, 1000, 1, 0, 100, true),
  ('SP Região Metropolitana', 'metro_sp', 'SP', '0', 1500, 2, 0.1, 90, true),
  ('SP Interior', 'sp_state', 'SP', NULL, 2000, 3, 0.1, 80, true),
  ('Outros Estados', 'other_states', NULL, NULL, 3000, 5, 0.1, 70, true)
ON CONFLICT (name) DO NOTHING;

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_shipping_configs_region_type ON shipping_configs(region_type);
CREATE INDEX IF NOT EXISTS idx_shipping_configs_state_code ON shipping_configs(state_code);
CREATE INDEX IF NOT EXISTS idx_shipping_configs_is_active ON shipping_configs(is_active);
CREATE INDEX IF NOT EXISTS idx_shipping_configs_priority ON shipping_configs(priority DESC);

-- Trigger para atualizar updated_at em shipping_configs
CREATE TRIGGER update_shipping_configs_updated_at
  BEFORE UPDATE ON shipping_configs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger para atualizar updated_at em shipping_settings
CREATE TRIGGER update_shipping_settings_updated_at
  BEFORE UPDATE ON shipping_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS
ALTER TABLE shipping_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipping_settings ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para shipping_configs
-- Todos podem ver configurações ativas (público para cálculo)
CREATE POLICY "Todos podem ver configurações de frete"
  ON shipping_configs FOR SELECT
  TO public
  USING (true);

-- Apenas admins podem criar/atualizar/deletar configurações
CREATE POLICY "Admins podem criar configurações de frete"
  ON shipping_configs FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins podem atualizar configurações de frete"
  ON shipping_configs FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins podem deletar configurações de frete"
  ON shipping_configs FOR DELETE
  USING (public.is_admin());

-- Políticas RLS para shipping_settings
-- Todos podem ver configurações gerais (público para cálculo)
CREATE POLICY "Todos podem ver configurações gerais de frete"
  ON shipping_settings FOR SELECT
  TO public
  USING (true);

-- Apenas admins podem atualizar configurações gerais
CREATE POLICY "Admins podem atualizar configurações gerais de frete"
  ON shipping_settings FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

