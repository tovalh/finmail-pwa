import { useEffect, useId, useLayoutEffect, useRef } from 'react'
import { X } from 'lucide-react'

// En el teléfono se abre como hoja desde abajo; en pantallas anchas, centrado.
export default function Modal({ title, onClose, children, footer }) {
  const titleId = useId()
  const panelRef = useRef(null)
  const onCloseRef = useRef(onClose)
  useLayoutEffect(() => {
    onCloseRef.current = onClose
  })

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onCloseRef.current()
    }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const prevFocus = document.activeElement
    panelRef.current?.focus()
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
      prevFocus?.focus?.()
    }
  }, [])

  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center sm:items-center sm:px-4">
      <div className="fade-in absolute inset-0 bg-black/60" onClick={onClose} aria-hidden="true" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="sheet-in relative flex max-h-[88svh] w-full flex-col rounded-t-3xl border border-line bg-surface outline-none sm:max-w-md sm:rounded-3xl"
      >
        <div className="flex items-start justify-between gap-4 px-5 pt-5 pb-3">
          <div id={titleId} className="min-w-0 flex-1">
            {typeof title === 'string' ? <h2 className="text-lg font-semibold">{title}</h2> : title}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="-mr-1.5 -mt-0.5 rounded-full p-1.5 text-muted transition-colors hover:bg-raised hover:text-fg"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-5">{children}</div>

        {footer && (
          <div className="border-t border-line px-5 pt-4 pb-[calc(1rem_+_env(safe-area-inset-bottom))]">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
