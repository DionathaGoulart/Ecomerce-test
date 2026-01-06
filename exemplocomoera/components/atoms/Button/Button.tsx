import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'bg-primary-500 text-neutral-950 hover:bg-primary-600 active:scale-[0.98] shadow-sm hover:shadow-md focus-visible:ring-primary-500',
        outline:
          'border border-neutral-300 bg-transparent text-neutral-900 hover:bg-neutral-50 hover:border-neutral-400 active:scale-[0.98] focus-visible:ring-neutral-500',
        ghost:
          'text-neutral-700 hover:bg-neutral-100 active:scale-[0.98] focus-visible:ring-neutral-500',
        destructive:
          'bg-error-500 text-white hover:bg-error-600 active:scale-[0.98] shadow-sm hover:shadow-md focus-visible:ring-error-500',
        success:
          'bg-success-500 text-white hover:bg-success-600 active:scale-[0.98] shadow-sm hover:shadow-md focus-visible:ring-success-500',
        primary:
          'bg-primary-500 text-neutral-950 hover:bg-primary-600 active:scale-[0.98] shadow-sm hover:shadow-md focus-visible:ring-primary-500',
        secondary:
          'bg-secondary-800 text-white hover:bg-secondary-700 active:scale-[0.98] shadow-sm hover:shadow-md focus-visible:ring-secondary-500',
      },
      size: {
        sm: 'h-9 px-4 text-sm',
        md: 'h-11 px-6 text-sm',
        lg: 'h-12 px-8 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }

