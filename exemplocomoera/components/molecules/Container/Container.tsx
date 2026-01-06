import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface ContainerProps {
  children: ReactNode
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
}

/**
 * Container - Componente responsivo para conteúdo
 * 
 * Substitui o Container antigo com padding fixo por um sistema responsivo.
 * 
 * @example
 * ```tsx
 * <Container size="lg">
 *   <h1>Conteúdo</h1>
 * </Container>
 * ```
 */
export default function Container({ 
  children, 
  className = '',
  size = 'lg'
}: ContainerProps) {
  const sizeClasses = {
    sm: 'px-4 sm:px-6 md:px-12',
    md: 'px-4 sm:px-6 md:px-12 lg:px-24',
    lg: 'px-4 sm:px-6 md:px-12 lg:px-24 xl:px-32 3xl:px-40 2xl:px-96',
    xl: 'px-4 sm:px-8 md:px-16 lg:px-32 xl:px-48 3xl:px-56 2xl:px-[24rem]',
    full: 'px-4 sm:px-6',
  }

  return (
    <div className={cn(sizeClasses[size], className)}>
      {children}
    </div>
  )
}

