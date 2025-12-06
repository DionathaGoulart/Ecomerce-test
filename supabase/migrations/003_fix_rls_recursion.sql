-- ============================================
-- FIX: Corrigir recursão infinita nas políticas RLS
-- ============================================

-- Remover políticas problemáticas
DROP POLICY IF EXISTS "Admins podem ver todos os perfis" ON profiles;
DROP POLICY IF EXISTS "Admins podem ver todos os pedidos" ON orders;
DROP POLICY IF EXISTS "Admins podem atualizar pedidos" ON orders;
DROP POLICY IF EXISTS "Admins podem ver todos os itens" ON order_items;

-- Recriar políticas usando a função is_admin() para evitar recursão
-- Admins podem ver todos os perfis (usando função para evitar recursão)
CREATE POLICY "Admins podem ver todos os perfis"
  ON profiles FOR SELECT
  USING (public.is_admin());

-- Admins podem ver todos os pedidos (usando função para evitar recursão)
CREATE POLICY "Admins podem ver todos os pedidos"
  ON orders FOR SELECT
  USING (public.is_admin());

-- Admins podem atualizar pedidos (usando função para evitar recursão)
CREATE POLICY "Admins podem atualizar pedidos"
  ON orders FOR UPDATE
  USING (public.is_admin());

-- Admins podem ver todos os itens (usando função para evitar recursão)
CREATE POLICY "Admins podem ver todos os itens"
  ON order_items FOR SELECT
  USING (public.is_admin());

