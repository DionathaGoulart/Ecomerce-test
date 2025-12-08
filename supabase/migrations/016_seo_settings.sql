-- ============================================
-- Sistema de Configurações de SEO
-- ============================================

-- Criar tabela para configurações de SEO
-- Usar um ID fixo para garantir apenas uma linha
CREATE TABLE IF NOT EXISTS seo_settings (
  id UUID PRIMARY KEY DEFAULT '00000000-0000-0000-0000-000000000001'::uuid,
  site_title TEXT NOT NULL DEFAULT 'E-commerce Personalizados',
  site_description TEXT NOT NULL DEFAULT 'Produtos personalizados com qualidade',
  site_keywords TEXT, -- Palavras-chave separadas por vírgula
  og_title TEXT, -- Open Graph title
  og_description TEXT, -- Open Graph description
  og_image_url TEXT, -- URL da imagem para Open Graph
  twitter_card TEXT DEFAULT 'summary_large_image', -- Tipo de card do Twitter
  twitter_title TEXT,
  twitter_description TEXT,
  twitter_image_url TEXT,
  canonical_url TEXT, -- URL canônica do site
  robots_txt TEXT, -- Conteúdo do robots.txt
  google_analytics_id TEXT, -- ID do Google Analytics
  google_tag_manager_id TEXT, -- ID do Google Tag Manager
  facebook_pixel_id TEXT, -- ID do Facebook Pixel
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inserir configuração padrão única
INSERT INTO seo_settings (
  id, 
  site_title, 
  site_description,
  canonical_url
)
VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid, 
  'E-commerce Personalizados', 
  'Produtos personalizados com qualidade',
  ''
)
ON CONFLICT (id) DO NOTHING;

-- Trigger para atualizar updated_at
CREATE TRIGGER update_seo_settings_updated_at
  BEFORE UPDATE ON seo_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS
ALTER TABLE seo_settings ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para seo_settings
-- Todos podem ver configurações de SEO (público para renderização)
CREATE POLICY "Todos podem ver configurações de SEO"
  ON seo_settings FOR SELECT
  TO public
  USING (true);

-- Apenas admins podem atualizar configurações de SEO
CREATE POLICY "Admins podem atualizar configurações de SEO"
  ON seo_settings FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

