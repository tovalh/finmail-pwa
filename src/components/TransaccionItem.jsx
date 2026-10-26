import { formatCLP, formatTime, nombreMovimiento } from '../lib/format.js'
import CategoryBadge from './CategoryBadge.jsx'

export default function TransaccionItem({ transaccion: tx, categorias, onOpen, onConfirmar }) {
  const isPendiente = tx.categoriaNombre == null
  const nombreCategoria = isPendiente ? tx.categoriaSugeridaNombre : tx.categoriaNombre
  const categoria = categorias.find((c) => c.nombre === nombreCategoria)

  return (
    <li className="relative">
      {isPendiente && (
        <span className="absolute top-3 bottom-3 left-0 w-[3px] rounded-r-full bg-mark" aria-hidden="true" />
      )}
      <div className="flex items-center gap-3 px-4 py-3">
        <button type="button" onClick={onOpen} className="flex min-w-0 flex-1 items-center gap-3 text-left">
          <CategoryBadge categoria={categoria} pending={isPendiente} />
          <span className="min-w-0">
            <span className="block truncate font-medium">{nombreMovimiento(tx)}</span>
            {isPendiente ? (
              <span className="block truncate text-sm text-mark">
                {nombreCategoria ? `¿${nombreCategoria}?` : 'Sin categoría'}
              </span>
            ) : (
              <span className="block truncate text-sm text-muted">{nombreCategoria}</span>
            )}
          </span>
        </button>

        <div className="flex flex-shrink-0 flex-col items-end gap-1">
          <span className="font-semibold tabular-nums">{formatCLP(tx.monto)}</span>
          {isPendiente && categoria ? (
            <button
              type="button"
              onClick={() => onConfirmar(tx.id, categoria.id, categoria.nombre)}
              className="rounded-full border border-mark/50 px-2.5 py-0.5 text-xs font-semibold text-mark transition-colors hover:bg-mark/10"
              aria-label={`Confirmar ${nombreCategoria} para ${nombreMovimiento(tx)}`}
            >
              Confirmar
            </button>
          ) : (
            <span className="text-xs text-faint tabular-nums">{formatTime(tx.fecha)}</span>
          )}
        </div>
      </div>
    </li>
  )
}
