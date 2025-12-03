# 📁 Estrutura do Projeto - Organização Completa

## 🎯 Visão Geral

Este documento descreve a estrutura completa e organizada do projeto, pensada para fácil manutenção e adição de novas features.

---

## 📂 Estrutura de Diretórios

```
Ecomerce-test/
├── app/                          # Next.js App Router
│   ├── (admin)/                 # Route group - Admin
│   │   └── admin/
│   ├── (store)/                 # Route group - Store
│   │   └── store/
│   ├── api/                     # API Routes
│   └── layout.tsx              # Root layout
│
├── components/                   # Componentes React
│   ├── atoms/                   # Elementos básicos
│   │   ├── Button/
│   │   ├── Input/
│   │   ├── Label/
│   │   ├── Badge/
│   │   └── Spinner/
│   │
│   ├── molecules/               # Combinações simples
│   │   ├── Card/
│   │   ├── Alert/
│   │   ├── InputField/
│   │   ├── FormField/
│   │   └── Container/
│   │
│   ├── organisms/               # Seções complexas
│   │   └── ProductCard/
│   │
│   ├── templates/               # Layouts de página
│   │
│   ├── admin/                   # Componentes específicos admin
│   │   ├── AdminNav.tsx
│   │   ├── ProductForm.tsx
│   │   └── ...
│   │
│   └── store/                   # Componentes específicos store
│       ├── CartCheckoutForm.tsx
│       ├── ProductPersonalizeForm.tsx
│       └── Logo.tsx
│
├── hooks/                       # Custom React Hooks
│   ├── useCart.ts              # Gerenciamento de carrinho
│   ├── useProducts.ts          # Busca de produtos
│   ├── useImageUpload.ts       # Upload de imagens
│   └── index.ts                # Exportações centralizadas
│
├── lib/                         # Bibliotecas e utilitários
│   ├── services/               # Camada de serviços (lógica de negócio)
│   │   ├── cart.service.ts
│   │   ├── product.service.ts
│   │   ├── order.service.ts
│   │   └── index.ts
│   │
│   ├── constants/              # Constantes do sistema
│   │   └── index.ts
│   │
│   ├── supabase/              # Clientes Supabase
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── admin.ts
│   │
│   ├── stripe/                 # Clientes Stripe
│   │   ├── client.ts
│   │   └── server.ts
│   │
│   ├── utils/                  # Funções utilitárias
│   │   ├── formatting.ts
│   │   └── smoothScroll.ts
│   │
│   ├── validations/            # Schemas Zod
│   │   ├── product.ts
│   │   ├── order.ts
│   │   └── admin.ts
│   │
│   ├── design-tokens.ts       # Tokens de design
│   ├── utils.ts               # Utilitários gerais
│   └── email.ts               # Serviço de email
│
├── types/                       # TypeScript Types
│   ├── entities/              # Tipos de entidades
│   │   └── index.ts
│   ├── api/                   # Tipos de API
│   │   └── index.ts
│   └── index.ts               # Exportações centralizadas
│
├── public/                     # Arquivos estáticos
│   ├── icons/
│   ├── carousel/
│   └── Logotipo.svg
│
└── supabase/                   # Migrations do Supabase
    └── migrations/
```

---

## 🧩 Organização por Responsabilidade

### 1. **Components** (`/components`)

Organizados por Atomic Design:

- **Atoms**: Elementos básicos e indivisíveis
- **Molecules**: Combinações simples de atoms
- **Organisms**: Seções complexas compostas de molecules
- **Templates**: Layouts de página (futuro)
- **admin/**: Componentes específicos do painel admin
- **store/**: Componentes específicos da loja

### 2. **Hooks** (`/hooks`)

Custom hooks para lógica reutilizável:

- `useCart`: Gerencia carrinho (localStorage)
- `useProducts`: Busca produtos do Supabase
- `useImageUpload`: Upload de imagens

**Regra**: Toda lógica de estado complexa deve estar em hooks.

### 3. **Services** (`/lib/services`)

Camada de serviços para lógica de negócio:

- `CartService`: Cálculos e validações do carrinho
- `ProductService`: Operações com produtos
- `OrderService`: Criação e validação de pedidos

**Regra**: Lógica de negócio separada dos componentes.

### 4. **Types** (`/types`)

Tipos TypeScript organizados:

- `entities/`: Tipos de entidades do domínio
- `api/`: Tipos para comunicação com APIs

**Regra**: Um tipo, um lugar. Reutilize ao invés de duplicar.

### 5. **Constants** (`/lib/constants`)

Constantes centralizadas:

- Storage keys
- Routes
- Validações
- Status

**Regra**: Nunca hardcode valores. Use constantes.

---

## 🔄 Fluxo de Dados

### Componente → Hook → Service → API

```
Component (UI)
    ↓
Hook (Estado/efeitos)
    ↓
Service (Lógica de negócio)
    ↓
API Route / Supabase Client
```

**Exemplo:**

```tsx
// Component
function ProductCard() {
  const { products } = useProducts()
  // ...
}

// Hook
function useProducts() {
  const products = ProductService.getAll()
  // ...
}

// Service
class ProductService {
  static async getAll() {
    return supabase.from('products').select('*')
  }
}
```

---

## 📝 Convenções de Código

### Nomenclatura

- **Componentes**: PascalCase (`ProductCard.tsx`)
- **Hooks**: camelCase com prefixo `use` (`useCart.ts`)
- **Services**: PascalCase com sufixo `Service` (`CartService.ts`)
- **Types**: PascalCase (`Product`, `CartItem`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_FILE_SIZE`)

### Estrutura de Arquivos

Cada componente/hook/service deve ter:

```
ComponentName/
├── ComponentName.tsx    # Implementação
└── index.ts            # Exportação
```

### Imports

Ordem de imports:

```tsx
// 1. React/Next.js
import { useState } from 'react'
import { useRouter } from 'next/navigation'

// 2. Bibliotecas externas
import { useForm } from 'react-hook-form'

// 3. Componentes internos (aliases)
import { Button } from '@/components/atoms/Button'
import { useCart } from '@/hooks'

// 4. Services/Utils
import { CartService } from '@/lib/services'
import { formatCurrency } from '@/lib/utils'

// 5. Types
import type { Product } from '@/types'

// 6. Estilos (se houver)
import styles from './styles.module.css'
```

---

## 🎯 Princípios de Organização

### 1. **Separação de Responsabilidades**

- **Componentes**: Apenas UI e interação
- **Hooks**: Estado e efeitos colaterais
- **Services**: Lógica de negócio
- **Types**: Definições de tipos

### 2. **DRY (Don't Repeat Yourself)**

- Use hooks para lógica reutilizável
- Use services para operações comuns
- Centralize tipos e constantes

### 3. **Single Source of Truth**

- Tipos em `/types`
- Constantes em `/lib/constants`
- Configurações em arquivos específicos

### 4. **Facilidade de Manutenção**

- Estrutura clara e previsível
- Nomes descritivos
- Documentação inline

---

## 🚀 Adicionando Novas Features

### Passo a Passo:

1. **Defina os tipos** em `/types/entities` ou `/types/api`
2. **Crie constantes** se necessário em `/lib/constants`
3. **Implemente services** em `/lib/services` para lógica de negócio
4. **Crie hooks** em `/hooks` se precisar de estado/efeitos
5. **Desenvolva componentes** em `/components` seguindo Atomic Design
6. **Crie API routes** em `/app/api` se necessário

### Exemplo: Adicionar Wishlist

```
1. types/entities/index.ts
   - Adicionar interface WishlistItem

2. lib/constants/index.ts
   - Adicionar WISHLIST_STORAGE_KEY

3. lib/services/wishlist.service.ts
   - Criar WishlistService

4. hooks/useWishlist.ts
   - Criar hook useWishlist

5. components/organisms/WishlistButton/
   - Criar componente
```

---

## 📚 Documentação

- `DESIGN_SYSTEM.md`: Guia do design system
- `ESTRUTURA_PROJETO.md`: Este arquivo
- `README.md`: Visão geral do projeto

---

**Última atualização**: 2024
**Versão**: 2.0.0

