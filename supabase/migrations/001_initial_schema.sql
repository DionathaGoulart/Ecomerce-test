-- ============================================
-- MIGRATION COMPLETA DO ZERO
-- Remove tudo e recria com nova estrutura
-- ============================================

-- ============================================
-- 1. REMOVER TUDO QUE EXISTE (com segurança)
-- ============================================

-- Remover trigger do auth.users (se existir)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Remover tabelas (em ordem de dependência, com CASCADE)
-- O CASCADE remove automaticamente: triggers, políticas RLS, índices e dependências
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS customers CASCADE;

-- Remover funções (se existirem)
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.is_admin() CASCADE;

-- ============================================
-- 2. CRIAR FUNÇÕES BÁSICAS
-- ============================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Função para criar perfil automaticamente quando usuário se registra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'user'
  );
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Se der erro (ex: perfil já existe), apenas retorna
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 3. CRIAR TABELAS
-- ============================================

-- Tabela de Produtos
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  price_cents INTEGER NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Perfis de Usuário (vinculada ao auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Pedidos
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'production', 'shipped', 'cancelled')),
  total_cents INTEGER NOT NULL,
  stripe_session_id TEXT,
  delivery_address JSONB, -- { street, number, city, state, zipcode, complement }
  receipt_url TEXT, -- URL do recibo do Stripe
  invoice_url TEXT, -- URL da nota fiscal (upload manual pelo admin)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Itens do Pedido
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL,
  unit_price_cents INTEGER NOT NULL,
  personalization JSONB -- { imageUrl: "...", description: "..." }
);

-- ============================================
-- 4. CRIAR ÍNDICES
-- ============================================

CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_role ON profiles(role);

-- ============================================
-- 5. CRIAR TRIGGERS
-- ============================================

-- Trigger para atualizar updated_at em products
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger para atualizar updated_at em orders
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger para atualizar updated_at em profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger para criar perfil automaticamente quando usuário se registra
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 6. CRIAR FUNÇÃO DE ADMIN (depois das tabelas)
-- ============================================

-- Função para verificar se é admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 7. CONFIGURAR RLS (Row Level Security)
-- ============================================

-- Habilitar RLS nas tabelas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles
-- Usuários podem ver e editar apenas seu próprio perfil
CREATE POLICY "Usuários podem ver próprio perfil"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar próprio perfil"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admins podem ver todos os perfis (usando função para evitar recursão)
CREATE POLICY "Admins podem ver todos os perfis"
  ON profiles FOR SELECT
  USING (public.is_admin());

-- Políticas para orders
-- Usuários podem ver apenas seus próprios pedidos
CREATE POLICY "Usuários podem ver próprios pedidos"
  ON orders FOR SELECT
  USING (auth.uid() = user_id);

-- Usuários podem criar pedidos
CREATE POLICY "Usuários podem criar pedidos"
  ON orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins podem ver todos os pedidos (usando função para evitar recursão)
CREATE POLICY "Admins podem ver todos os pedidos"
  ON orders FOR SELECT
  USING (public.is_admin());

-- Admins podem atualizar pedidos (usando função para evitar recursão)
CREATE POLICY "Admins podem atualizar pedidos"
  ON orders FOR UPDATE
  USING (public.is_admin());

-- Políticas para order_items
-- Usuários podem ver itens de seus próprios pedidos
CREATE POLICY "Usuários podem ver itens de próprios pedidos"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Usuários podem criar itens de pedido
CREATE POLICY "Usuários podem criar itens de pedido"
  ON order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Admins podem ver todos os itens (usando função para evitar recursão)
CREATE POLICY "Admins podem ver todos os itens"
  ON order_items FOR SELECT
  USING (public.is_admin());

-- ============================================
-- 8. COMENTÁRIOS E DOCUMENTAÇÃO
-- ============================================

COMMENT ON TABLE profiles IS 'Perfis de usuário vinculados ao auth.users do Supabase';
COMMENT ON TABLE orders IS 'Pedidos vinculados aos usuários autenticados';
COMMENT ON COLUMN orders.delivery_address IS 'Endereço de entrega em formato JSON: {street, number, city, state, zipcode, complement}';
COMMENT ON COLUMN orders.receipt_url IS 'URL do recibo do Stripe (preenchido automaticamente pelo webhook)';
COMMENT ON COLUMN orders.invoice_url IS 'URL da nota fiscal (preenchido manualmente pelo admin)';
COMMENT ON COLUMN profiles.role IS 'Role do usuário: user (padrão) ou admin';
