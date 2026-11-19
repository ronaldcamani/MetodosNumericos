import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  titulo?: string
  mensaje?: string
  compacto?: boolean
}

interface State {
  error: Error | null
}

/** Captura fallos de renderizado para aislar errores en gráficos o vistas sin derribar el portal. */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  private reintentar = () => {
    this.setState({ error: null })
  }

  render() {
    if (!this.state.error) return this.props.children

    const {
      titulo = 'Ocurrió un error al mostrar esta sección',
      mensaje = 'Puedes reintentar o continuar navegando por los demás módulos del portal.',
      compacto = false,
    } = this.props

    return (
      <div className={compacto ? 'error-boundary error-boundary-compacto' : 'error-boundary'} role="alert">
        <strong>⚠ {titulo}</strong>
        <p>{mensaje}</p>
        <details>
          <summary>Detalle técnico</summary>
          <p><code>{this.state.error.message || 'Error desconocido'}</code></p>
        </details>
        <div className="acciones">
          <button type="button" onClick={this.reintentar}>Reintentar</button>
        </div>
      </div>
    )
  }
}
