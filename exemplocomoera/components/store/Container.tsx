import { ReactNode } from 'react'

interface ContainerProps {
  children: ReactNode
  className?: string
}

export default function Container({ children, className = '' }: ContainerProps) {
  return (
    <div className={`px-96 ${className}`}>
      {children}
    </div>
  )
}

