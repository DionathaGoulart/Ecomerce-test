import { cn } from '@/lib/utils'

export interface LoadingDotsProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: 'h-1 w-1',
  md: 'h-1.5 w-1.5',
  lg: 'h-2 w-2',
}

export function LoadingDots({ className, size = 'md' }: LoadingDotsProps) {
  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <span
        className={cn(
          'loading-dot rounded-full bg-primary-500',
          sizeClasses[size]
        )}
        style={{ animationDelay: '0ms' }}
      />
      <span
        className={cn(
          'loading-dot rounded-full bg-primary-500',
          sizeClasses[size]
        )}
        style={{ animationDelay: '200ms' }}
      />
      <span
        className={cn(
          'loading-dot rounded-full bg-primary-500',
          sizeClasses[size]
        )}
        style={{ animationDelay: '400ms' }}
      />
    </div>
  )
}

