import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react'

const alertVariants = cva(
  'relative w-full rounded-xl border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground',
  {
    variants: {
      variant: {
        default: 'bg-white border-neutral-200 text-neutral-900',
        destructive:
          'border-error-500/50 text-error-900 bg-error-50 [&>svg]:text-error-600',
        success:
          'border-success-500/50 text-success-900 bg-success-50 [&>svg]:text-success-600',
        warning:
          'border-warning-500/50 text-warning-900 bg-warning-50 [&>svg]:text-warning-600',
        info:
          'border-info-500/50 text-info-900 bg-info-50 [&>svg]:text-info-600',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(alertVariants({ variant }), className)}
    {...props}
  />
))
Alert.displayName = 'Alert'

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn('mb-1 font-medium leading-none tracking-tight', className)}
    {...props}
  />
))
AlertTitle.displayName = 'AlertTitle'

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('text-sm [&_p]:leading-relaxed', className)}
    {...props}
  />
))
AlertDescription.displayName = 'AlertDescription'

// Componente com ícone automático baseado na variante
interface AlertWithIconProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  title?: string
  description?: string
  onClose?: () => void
}

const AlertWithIcon = React.forwardRef<HTMLDivElement, AlertWithIconProps>(
  ({ className, variant = 'default', title, description, onClose, ...props }, ref) => {
    const icons = {
      default: Info,
      destructive: AlertCircle,
      success: CheckCircle2,
      warning: AlertTriangle,
      info: Info,
    }

    const Icon = icons[variant || 'default']

    return (
      <Alert ref={ref} variant={variant} className={className} {...props}>
        <Icon className="h-4 w-4" />
        <div className="flex-1">
          {title && <AlertTitle>{title}</AlertTitle>}
          {description && <AlertDescription>{description}</AlertDescription>}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-2"
            aria-label="Fechar"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </Alert>
    )
  }
)
AlertWithIcon.displayName = 'AlertWithIcon'

export {
  Alert,
  AlertTitle,
  AlertDescription,
  AlertWithIcon,
  alertVariants,
}

