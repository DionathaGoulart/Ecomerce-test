# 🎨 Design System - E-commerce Personalizados

Documentação completa do sistema de design do projeto.

## 📋 Índice

1. [Paleta de Cores](#paleta-de-cores)
2. [Tipografia](#tipografia)
3. [Espaçamento](#espaçamento)
4. [Componentes](#componentes)
5. [Uso do Tailwind](#uso-do-tailwind)
6. [Guia de Migração](#guia-de-migração)

---

## 🎨 Paleta de Cores

### Primary (Amarelo/Lime - #E9EF33)

Cor principal da marca, usada para CTAs, destaques e elementos interativos.

```tsx
// Uso no Tailwind
className="bg-primary-500"      // Cor principal
className="text-primary-600"    // Hover states
className="border-primary-400" // Bordas
```

**Escala completa:**
- `primary-50` a `primary-950`
- Cor base: `primary-500` (#E9EF33)

### Secondary (Cinza Escuro)

Usado para backgrounds, cards e containers.

```tsx
className="bg-secondary-800"   // Header background
className="border-secondary-600" // Bordas
```

**Escala completa:**
- `secondary-50` a `secondary-950`
- Cores principais: `secondary-800` (#212121), `secondary-600` (#3D3D3D)

### Neutral (Cinza)

Usado para textos, bordas e elementos neutros.

```tsx
className="text-neutral-900"    // Texto principal
className="text-neutral-500"    // Texto secundário
className="border-neutral-200" // Bordas
```

**Escala completa:**
- `neutral-50` a `neutral-950`

### Cores Semânticas

#### Success (Verde)
```tsx
className="bg-success-500 text-white"
className="border-success-500"
```

#### Error (Vermelho)
```tsx
className="bg-error-500 text-white"
className="border-error-500"
```

#### Warning (Amarelo)
```tsx
className="bg-warning-500 text-white"
className="border-warning-500"
```

#### Info (Azul)
```tsx
className="bg-info-500 text-white"
className="border-info-500"
```

### Cores de Compatibilidade

Mantidas para compatibilidade com código existente:

- `header-bg`: #212121
- `header-border`: #3D3D3D
- `cart-button`: #E9EF33
- `body-bg`: #0A0A0A

---

## 📝 Tipografia

### Font Family

**Sans-serif (Principal):**
```tsx
className="font-sans" // Instrument Sans
```

**Monospace:**
```tsx
className="font-mono" // Courier New
```

### Font Sizes

```tsx
className="text-xs"   // 12px
className="text-sm"   // 14px
className="text-base" // 16px
className="text-lg"   // 18px
className="text-xl"   // 20px
className="text-2xl"   // 24px
className="text-3xl"  // 30px
className="text-4xl"  // 36px
className="text-5xl"  // 48px
// ... até text-9xl
```

### Font Weights

```tsx
className="font-light"    // 300
className="font-normal"   // 400
className="font-medium"   // 500
className="font-semibold" // 600
className="font-bold"     // 700
```

---

## 📏 Espaçamento

### Spacing Padrão

Use a escala padrão do Tailwind (0.25rem = 4px):

```tsx
className="p-4"   // 16px
className="m-6"   // 24px
className="gap-8" // 32px
```

### Spacing Customizado

```tsx
className="mt-header-top"     // 45px
className="px-header-sides"   // 390px
```

---

## 🧩 Componentes

### Atoms

Elementos básicos e indivisíveis.

#### Button

```tsx
import { Button } from '@/components/atoms/Button'

// Variantes
<Button variant="default">Padrão</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="destructive">Destrutivo</Button>
<Button variant="success">Sucesso</Button>
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>

// Tamanhos
<Button size="sm">Pequeno</Button>
<Button size="md">Médio</Button>
<Button size="lg">Grande</Button>
<Button size="icon">Ícone</Button>
```

#### Input

```tsx
import { Input } from '@/components/atoms/Input'

<Input variant="default" />
<Input variant="error" />
<Input variant="success" />

<Input size="sm" />
<Input size="md" />
<Input size="lg" />
```

#### Label

```tsx
import { Label } from '@/components/atoms/Label'

<Label variant="default">Label</Label>
<Label variant="error">Label com erro</Label>
<Label variant="success">Label com sucesso</Label>
<Label variant="muted">Label muted</Label>
```

#### Badge

```tsx
import { Badge } from '@/components/atoms/Badge'

<Badge variant="default">Badge</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="destructive">Erro</Badge>
<Badge variant="success">Sucesso</Badge>
<Badge variant="outline">Outline</Badge>
```

#### Spinner

```tsx
import { Spinner } from '@/components/atoms/Spinner'

<Spinner size="sm" />
<Spinner size="md" />
<Spinner size="lg" />
<Spinner variant="default" />
<Spinner label="Carregando..." />
```

### Molecules

Combinações simples de atoms.

#### Card

```tsx
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/molecules/Card'

<Card variant="default" padding="md">
  <CardHeader>
    <CardTitle>Título</CardTitle>
    <CardDescription>Descrição</CardDescription>
  </CardHeader>
  <CardContent>Conteúdo</CardContent>
  <CardFooter>Rodapé</CardFooter>
</Card>
```

**Variantes:**
- `default`: Com sombra suave
- `outlined`: Apenas borda
- `elevated`: Sombra mais pronunciada
- `ghost`: Sem borda e sem background

#### Alert

```tsx
import { Alert, AlertTitle, AlertDescription, AlertWithIcon } from '@/components/molecules/Alert'

// Básico
<Alert variant="default">
  <AlertTitle>Alerta</AlertTitle>
  <AlertDescription>Mensagem do alerta</AlertDescription>
</Alert>

// Com ícone automático
<AlertWithIcon
  variant="success"
  title="Sucesso!"
  description="Operação realizada com sucesso."
  onClose={() => console.log('Fechado')}
/>
```

**Variantes:**
- `default`
- `destructive` (erro)
- `success`
- `warning`
- `info`

#### InputField

```tsx
import { InputField } from '@/components/molecules/InputField'

<InputField
  label="Email"
  type="email"
  required
  error={errors.email?.message}
  helperText="Digite seu email"
/>
```

#### FormField

```tsx
import { FormField } from '@/components/molecules/FormField'

<FormField
  label="Nome"
  required
  error={errors.name?.message}
/>
```

---

## 🎯 Uso do Tailwind

### Classes de Cores

```tsx
// Backgrounds
className="bg-primary-500"
className="bg-secondary-800"
className="bg-neutral-50"

// Textos
className="text-primary-600"
className="text-neutral-900"
className="text-error-500"

// Bordas
className="border-primary-500"
className="border-neutral-200"
```

### Responsividade

```tsx
className="text-sm md:text-base lg:text-lg"
className="p-4 md:p-6 lg:p-8"
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
```

### Estados

```tsx
className="hover:bg-primary-600"
className="focus:ring-2 focus:ring-primary-500"
className="active:scale-[0.98]"
className="disabled:opacity-50"
```

---

## 🔄 Guia de Migração

### Migrando Cores Hardcoded

**Antes:**
```tsx
className="bg-[#E9EF33]"
className="text-[#121212]"
```

**Depois:**
```tsx
className="bg-primary-500"
className="text-neutral-950"
```

### Migrando Componentes

**Antes:**
```tsx
import { Button } from '@/components/ui/button'
```

**Depois (recomendado):**
```tsx
import { Button } from '@/components/atoms/Button'
```

**Nota:** Os imports antigos ainda funcionam (compatibilidade mantida), mas use os novos caminhos em código novo.

### Migrando para InputField

**Antes:**
```tsx
<Label htmlFor="email">Email</Label>
<Input id="email" />
{errors.email && <p>{errors.email.message}</p>}
```

**Depois:**
```tsx
<InputField
  label="Email"
  error={errors.email?.message}
/>
```

---

## 📚 Recursos Adicionais

### Design Tokens

Todos os tokens de design estão disponíveis em:

```tsx
import { colors, typography, spacing } from '@/lib/design-tokens'
```

### Ícones

Use `lucide-react` para ícones:

```tsx
import { ShoppingCart, User, Menu } from 'lucide-react'

<ShoppingCart className="h-4 w-4" />
```

---

## ✅ Checklist de Uso

Ao criar novos componentes:

- [ ] Use cores do design system (não hardcode)
- [ ] Use componentes atoms/molecules quando possível
- [ ] Siga a estrutura Atomic Design
- [ ] Adicione variantes usando `cva`
- [ ] Documente props com TypeScript
- [ ] Teste responsividade
- [ ] Adicione estados de acessibilidade (focus, aria-labels)

---

**Última atualização:** 2024
**Versão:** 1.0.0

