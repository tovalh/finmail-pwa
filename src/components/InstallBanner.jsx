import { useState } from 'react'
import { Download, X } from 'lucide-react'

export default function InstallBanner({ onInstall, onDismiss }) {
  const [installing, setInstalling] = useState(false)

  async function handleInstall() {
    setInstalling(true)
    await onInstall()
    setInstalling(false)
  }

  return (
    <div className="flex items-center gap-3 rounded-2xl bg-surface px-4 py-3">
      <Download size={18} className="flex-shrink-0 text-muted" />
      <p className="flex-1 text-sm">Instala FinMail en tu teléfono para abrirla como una app.</p>
      <button
        type="button"
        onClick={handleInstall}
        disabled={installing}
        className="flex-shrink-0 text-sm font-semibold text-fg disabled:opacity-50"
      >
        Instalar
      </button>
      <button
        type="button"
        onClick={onDismiss}
        className="flex-shrink-0 text-faint hover:text-fg"
        aria-label="Ocultar aviso"
      >
        <X size={16} />
      </button>
    </div>
  )
}
