import Image from 'next/image'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'
import { Button } from '@/components/atoms/Button'
import { Card, CardContent } from '@/components/molecules/Card'
import { cn } from '@/lib/utils'

export interface Product {
  id: string
  title: string
  description?: string | null
  price_cents: number
  image_url?: string | null
}

export interface ProductCardProps {
  product: Product
  href?: string
  showDescription?: boolean
  className?: string
  imagePriority?: boolean
}

/**
 * ProductCard - Card de produto reutilizável
 * 
 * Componente organism que exibe informações de um produto em formato de card.
 * Usa Card molecule e Button atom para manter consistência.
 * 
 * @example
 * ```tsx
 * <ProductCard
 *   product={product}
 *   href={`/store/products/${product.id}`}
 *   showDescription
 * />
 * ```
 */
export default function ProductCard({
  product,
  href,
  showDescription = true,
  className,
  imagePriority = false,
}: ProductCardProps) {
  const cardContent = (
    <Card
      variant="default"
      padding="none"
      className={cn(
        'group overflow-hidden transition-all duration-300 hover:shadow-lg',
        className
      )}
    >
      {product.image_url && (
        <div className="aspect-square overflow-hidden bg-neutral-50">
          <Image
            src={product.image_url}
            alt={product.title}
            width={400}
            height={400}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            priority={imagePriority}
          />
        </div>
      )}
      <CardContent className="p-6">
        <h3 className="text-xl font-semibold text-neutral-900">
          {product.title}
        </h3>
        {showDescription && product.description && (
          <p className="mt-2 text-sm text-neutral-500 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        )}
        <div className="mt-6 flex items-center justify-between">
          <span className="text-2xl font-semibold text-neutral-900">
            {formatCurrency(product.price_cents)}
          </span>
          {href ? (
            <Link href={href}>
              <Button size="sm" variant="primary">
                Personalizar
              </Button>
            </Link>
          ) : (
            <Button size="sm" variant="primary" disabled>
              Personalizar
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )

  return cardContent
}

