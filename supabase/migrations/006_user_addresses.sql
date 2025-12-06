-- ============================================
-- Tabela de Endereços Salvos dos Usuários
-- ============================================

-- Criar tabela de endereços
CREATE TABLE IF NOT EXISTS user_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label TEXT, -- Nome/apelido do endereço (ex: "Casa", "Trabalho")
  street TEXT NOT NULL,
  number TEXT NOT NULL,
  complement TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zipcode TEXT NOT NULL,
  is_default BOOLEAN DEFAULT FALSE, -- Endereço padrão
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar índices
CREATE INDEX idx_user_addresses_user_id ON user_addresses(user_id);
CREATE INDEX idx_user_addresses_user_id_default ON user_addresses(user_id, is_default) WHERE is_default = TRUE;

-- Trigger para atualizar updated_at
CREATE TRIGGER update_user_addresses_updated_at
  BEFORE UPDATE ON user_addresses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS
ALTER TABLE user_addresses ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
-- Usuários podem ver apenas seus próprios endereços
CREATE POLICY "Usuários podem ver próprios endereços"
  ON user_addresses FOR SELECT
  USING (auth.uid() = user_id);

-- Usuários podem criar seus próprios endereços
CREATE POLICY "Usuários podem criar próprios endereços"
  ON user_addresses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Usuários podem atualizar seus próprios endereços
CREATE POLICY "Usuários podem atualizar próprios endereços"
  ON user_addresses FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Usuários podem deletar seus próprios endereços
CREATE POLICY "Usuários podem deletar próprios endereços"
  ON user_addresses FOR DELETE
  USING (auth.uid() = user_id);

-- Função para garantir que só existe um endereço padrão por usuário
CREATE OR REPLACE FUNCTION ensure_single_default_address()
RETURNS TRIGGER AS $$
BEGIN
  -- Se este endereço está sendo marcado como padrão
  IF NEW.is_default = TRUE THEN
    -- Remove o padrão de todos os outros endereços do mesmo usuário
    UPDATE user_addresses
    SET is_default = FALSE
    WHERE user_id = NEW.user_id
      AND id != NEW.id
      AND is_default = TRUE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para garantir apenas um endereço padrão
CREATE TRIGGER ensure_single_default_address_trigger
  BEFORE INSERT OR UPDATE ON user_addresses
  FOR EACH ROW
  WHEN (NEW.is_default = TRUE)
  EXECUTE FUNCTION ensure_single_default_address();

COMMENT ON TABLE user_addresses IS 'Endereços salvos pelos usuários para facilitar compras futuras';
COMMENT ON COLUMN user_addresses.label IS 'Apelido do endereço (ex: "Casa", "Trabalho", "Casa dos Pais")';
COMMENT ON COLUMN user_addresses.is_default IS 'Se TRUE, este é o endereço padrão do usuário (só pode haver um por usuário)';

