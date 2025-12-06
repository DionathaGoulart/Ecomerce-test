-- ============================================
-- SISTEMA DE CARGOS/ROLES
-- Adiciona superadmin, admin, moderador e user
-- ============================================

-- 1. Atualizar CHECK constraint para incluir os novos roles
ALTER TABLE profiles 
DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE profiles 
ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('user', 'moderador', 'admin', 'superadmin'));

-- 2. Atualizar função is_admin para incluir superadmin, admin e moderador
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() 
    AND role IN ('admin', 'superadmin', 'moderador')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Função para verificar se é superadmin
CREATE OR REPLACE FUNCTION public.is_superadmin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() 
    AND role = 'superadmin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Função para verificar se pode deletar (admin ou superadmin)
CREATE OR REPLACE FUNCTION public.can_delete()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Função para verificar se pode gerenciar cargos (apenas superadmin)
CREATE OR REPLACE FUNCTION public.can_manage_roles()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() 
    AND role = 'superadmin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Atualizar comentário da coluna role
COMMENT ON COLUMN profiles.role IS 'Role do usuário: user (padrão), moderador, admin ou superadmin';

