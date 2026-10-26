import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary:', error, info)
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <main className="flex min-h-svh flex-col justify-center px-6">
        <div className="mx-auto w-full max-w-sm">
          <h1 className="text-xl font-semibold">La app tuvo un error inesperado</h1>
          <p className="mt-2 text-muted">Recarga la página. Tus datos están guardados en el servidor.</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-6 h-12 rounded-xl bg-fg px-5 text-[15px] font-semibold text-ink"
          >
            Recargar
          </button>
        </div>
      </main>
    )
  }
}
