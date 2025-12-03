import * as React from 'react'
import { Input, type InputProps } from '@/components/atoms/Input'
import { Label, type LabelProps } from '@/components/atoms/Label'
import { cn } from '@/lib/utils'

export interface InputFieldProps extends InputProps {
  label?: string
  labelProps?: LabelProps
  error?: string
  helperText?: string
  required?: boolean
}

const InputField = React.forwardRef<HTMLInputElement, InputFieldProps>(
  (
    {
      className,
      label,
      labelProps,
      error,
      helperText,
      required,
      id,
      ...inputProps
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`
    const hasError = !!error

    return (
      <div className="w-full space-y-2">
        {label && (
          <Label
            htmlFor={inputId}
            variant={hasError ? 'error' : 'default'}
            {...labelProps}
          >
            {label}
            {required && <span className="text-error-500 ml-1">*</span>}
          </Label>
        )}
        <Input
          id={inputId}
          ref={ref}
          variant={hasError ? 'error' : 'default'}
          aria-invalid={hasError}
          aria-describedby={
            error
              ? `${inputId}-error`
              : helperText
              ? `${inputId}-helper`
              : undefined
          }
          className={cn(className)}
          {...inputProps}
        />
        {error && (
          <p
            id={`${inputId}-error`}
            className="text-sm text-error-600"
            role="alert"
          >
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={`${inputId}-helper`} className="text-xs text-neutral-500">
            {helperText}
          </p>
        )}
      </div>
    )
  }
)
InputField.displayName = 'InputField'

export { InputField }

