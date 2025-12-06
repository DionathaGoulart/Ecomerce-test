# E-commerce de Produtos Personalizados

E-commerce completo construído com Next.js 14, Supabase, Stripe e TypeScript.

## 🚀 Tecnologias

- **Next.js 14** (App Router)
- **Supabase** (Postgres + Storage + Auth)
- **Stripe Checkout** (Pagamentos)
- **Resend** (Envio de emails)
- **TypeScript**
- **TailwindCSS**
- **Zod** (Validação)
- **React Hook Form**

## 📋 Pré-requisitos

- Node.js 18+
- Conta no Supabase
- Conta no Stripe
- Conta no Resend (ou Brevo)

## 🛠️ Instalação

1. Clone o repositório:
```bash
git clone <repo-url>
cd ecommerce-personalizados
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp env.example .env.local
```

Preencha o arquivo `.env.local` com suas credenciais:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Resend (Email)
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=onboarding@resend.dev
# Em desenvolvimento/testes, o Resend só permite enviar para o email cadastrado na conta
# Para enviar para qualquer email, você precisa verificar um domínio em https://resend.com/domains

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. Execute as migrations no Supabase:
   - Acesse o SQL Editor no Supabase
   - Execute o arquivo `supabase/migrations/001_initial_schema.sql`

5. Configure o Storage no Supabase:
   - Acesse o Supabase Dashboard > Storage
   - Crie um bucket chamado `personalizations`
   - Configure como **privado** (importante para segurança dos uploads dos clientes)
   - Execute a migration `supabase/migrations/003_storage_policies.sql` no SQL Editor para configurar as políticas RLS
   - **Nota**: O código já usa signed URLs para acesso às imagens, então o bucket deve ser privado
   - **Importante**: Sem a migration 003, você receberá erro "new row violates row-level security policy" ao tentar fazer upload

6. Configure o Stripe Webhook:
   - No dashboard do Stripe, vá em Developers > Webhooks
   - Adicione endpoint: `https://seu-dominio.com/api/stripe/webhook`
   - Selecione o evento: `checkout.session.completed`
   - Copie o secret e adicione no `.env.local`

7. Execute o servidor de desenvolvimento:
```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

## 📁 Estrutura do Projeto

```
/app
  /(store)          # Rotas públicas (loja)
  /(admin)          # Rotas protegidas (painel)
  /api              # API routes
/components
  /ui               # Componentes reutilizáveis
  /store            # Componentes da loja
  /admin            # Componentes do admin
/lib
  /supabase         # Cliente Supabase
  /stripe           # Funções Stripe
  /validations      # Schemas Zod
  /utils            # Helpers
/supabase
  /migrations       # Migrations SQL
```

## 🔐 Painel Administrativo

1. Crie um usuário admin no Supabase Auth
2. Acesse `/admin/login`
3. Faça login com suas credenciais

## 🛒 Fluxo do Cliente

1. Navegar produtos em `/store`
2. Personalizar produto com upload de imagem
3. Adicionar ao carrinho
4. Preencher dados em `/store/cart`
5. Pagar via Stripe Checkout
6. Receber email de confirmação após pagamento

## 📧 Configuração de Email

### Emails de Pedidos (Resend)
O sistema usa Resend para envio de emails de confirmação de pedidos. Configure seu domínio no Resend e atualize o `from` em `lib/email.ts`.

### Emails de Autenticação (Supabase)
Para personalizar o email que envia as mensagens de recuperação de senha e outros emails de autenticação:

1. **Acesse o Dashboard do Supabase:**
   - Vá para: `https://app.supabase.com/project/[seu-projeto]/settings/auth`

2. **Configure SMTP Customizado:**
   - Na seção **SMTP Settings**, ative **Enable Custom SMTP**
   - Preencha as informações do seu provedor de email:
     - **Host**: smtp do seu provedor (ex: `smtp.resend.com`, `smtp.gmail.com`, `smtp.sendgrid.net`)
     - **Port**: Porta SMTP (geralmente 587 ou 465)
     - **Username**: Seu usuário SMTP
     - **Password**: Sua senha SMTP
     - **Sender email**: O email que aparecerá como remetente (ex: `noreply@seudominio.com`)
     - **Sender name**: Nome que aparecerá (ex: "Sua Loja")

3. **Personalizar Templates (Opcional):**
   - Na seção **Email Templates**, você pode personalizar os templates de:
     - Reset Password (Recuperação de senha)
     - Magic Link
     - Email Change
     - Email Confirmation

4. **Provedores Recomendados:**
   - **Resend**: `smtp.resend.com:587` (use a mesma conta do Resend que você já tem)
   - **SendGrid**: `smtp.sendgrid.net:587`
   - **Mailgun**: `smtp.mailgun.org:587`
   - **Gmail**: `smtp.gmail.com:587` (requer App Password)

**Nota:** Se você já usa Resend para emails de pedidos, pode usar a mesma conta para SMTP do Supabase!

## 🔐 Configuração do Login com Google

Para configurar o login com Google OAuth:

### 1. Configurar no Google Cloud Console

1. **Acesse o Google Cloud Console:**
   - Vá para: `https://console.cloud.google.com/apis/credentials`
   - Selecione seu projeto (ou crie um novo)

2. **Criar Credenciais OAuth 2.0:**
   - Clique em **"Criar credenciais"** > **"ID do cliente OAuth 2.0"**
   - Tipo de aplicativo: **"Aplicativo da Web"**
   - Nome: "Sua Loja - Login"

3. **Configurar Authorized JavaScript origins:**
   Adicione as seguintes URLs (uma por linha):
   ```
   http://localhost:3000
   https://seudominio.com
   ```
   ⚠️ **Importante:** Use `http://` para desenvolvimento local e `https://` para produção

4. **Configurar Authorized redirect URIs:**
   Adicione as seguintes URLs (uma por linha):
   ```
   https://[seu-projeto-id].supabase.co/auth/v1/callback
   http://localhost:3000/api/auth/google
   https://seudominio.com/api/auth/google
   ```
   ⚠️ **Importante:** 
   - Substitua `[seu-projeto-id]` pelo ID do seu projeto Supabase (encontre em: Supabase Dashboard > Settings > API)
   - O formato é: `https://[projeto-id].supabase.co/auth/v1/callback`
   - Adicione também a URL do seu app (`/api/auth/google`) para ambos ambientes

5. **Copiar as credenciais:**
   - Copie o **Client ID** e **Client Secret**
   - Você precisará deles no próximo passo

### 2. Configurar no Supabase

1. **Acesse o Dashboard do Supabase:**
   - Vá para: `https://app.supabase.com/project/[seu-projeto]/settings/auth`
   - Role até a seção **Providers**

2. **Ativar Google Provider:**
   - Encontre **Google** na lista de provedores
   - Ative o toggle
   - Cole o **Client ID** do Google
   - Cole o **Client Secret** do Google
   - Clique em **Save**

### 3. URLs de Exemplo

**Para desenvolvimento local:**
- **Authorized JavaScript origins:** `http://localhost:3000`
- **Authorized redirect URIs:** 
  - `https://[projeto-id].supabase.co/auth/v1/callback`
  - `http://localhost:3000/api/auth/google`

**Para produção:**
- **Authorized JavaScript origins:** `https://seudominio.com`
- **Authorized redirect URIs:**
  - `https://[projeto-id].supabase.co/auth/v1/callback`
  - `https://seudominio.com/api/auth/google`

### 4. Verificar se está funcionando

1. Acesse `/login` no seu site
2. Clique em "Continuar com Google"
3. Você deve ser redirecionado para o Google para autorizar
4. Após autorizar, deve voltar para `/minha-conta`

**Troubleshooting:**
- Se aparecer erro "redirect_uri_mismatch", verifique se todas as URLs estão corretas no Google Console
- Certifique-se de que o Client ID e Secret estão corretos no Supabase
- Verifique se o projeto do Google está no modo de teste (pode precisar adicionar usuários de teste)

## 🚀 Deploy

### Vercel (Recomendado)

1. Faça push para um repositório Git
2. Conecte ao Vercel
3. Configure as variáveis de ambiente
4. Deploy automático!

### Notas para Deploy

- Configure o webhook do Stripe com a URL de produção
- Atualize `NEXT_PUBLIC_APP_URL` com a URL de produção
- Configure CORS no Supabase se necessário

## 📝 Licença

MIT
