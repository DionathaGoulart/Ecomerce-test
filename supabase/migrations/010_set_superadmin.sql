-- ============================================
-- ATRIBUIR SUPERADMIN A UM USUÁRIO
-- ============================================
-- 
-- INSTRUÇÕES:
-- 1. Substitua 'EMAIL_DO_USUARIO@exemplo.com' pelo email do usuário que você quer tornar superadmin
-- 2. Execute esta migration no Supabase SQL Editor
-- 
-- ============================================

-- Opção 1: Atribuir superadmin pelo email
UPDATE profiles
SET role = 'superadmin'
WHERE email = 'EMAIL_DO_USUARIO@exemplo.com';

-- Opção 2: Atribuir superadmin pelo ID do usuário (se você souber o ID)
-- UPDATE profiles
-- SET role = 'superadmin'
-- WHERE id = 'UUID_DO_USUARIO_AQUI';

-- ============================================
-- VERIFICAR SE FOI ATUALIZADO
-- ============================================
-- Execute esta query para verificar:
-- SELECT id, email, full_name, role FROM profiles WHERE role = 'superadmin';

