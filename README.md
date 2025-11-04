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

O sistema usa Resend para envio de emails. Configure seu domínio no Resend e atualize o `from` em `lib/email.ts`.

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
