declare namespace JSX {
  interface IntrinsicElements {
    'spline-viewer': React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement> & {
        url?: string
        'data-scroll'?: string
      },
      HTMLElement
    >
  }
}

// Estende HTMLElement para incluir propriedades do spline-viewer
interface HTMLElement {
  application?: any
  setAttribute?(name: string, value: string): void
}

