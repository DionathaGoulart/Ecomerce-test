import * as React from 'react'
import { InputField, type InputFieldProps } from '@/components/molecules/InputField'
import { cn } from '@/lib/utils'

export interface FormFieldProps extends InputFieldProps {
  className?: string
}

/**
 * FormField - Componente completo de campo de formulário
 * 
 * Combina InputField com estilos e comportamentos específicos de formulários.
 * Use este componente para campos de formulário que precisam de validação e feedback visual.
 * 
 * @example
 * ```tsx
 * <FormField
 *   label="Email"
 *   type="email"
 *   required
 *   error={errors.email?.message}
 *   helperText="Digite seu email"
 * />
 * ```
 */
const FormField = React.forwardRef<HTMLInputElement, FormFieldProps>(
  ({ className, ...props }, ref) => {
    return (
      <div className={cn('w-full', className)}>
        <InputField ref={ref} {...props} />
      </div>
    )
  }
)
FormField.displayName = 'FormField'

export { FormField }

