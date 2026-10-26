import { ChevronLeft, ChevronRight } from 'lucide-react'
import { formatShortDate } from '../lib/format.js'

const arrowClass =
  'flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface hover:text-fg disabled:pointer-events-none disabled:opacity-25'

export default function PeriodNav({ desde, hasta, offset, onChange }) {
  return (
    <div className="flex items-center gap-2">
      <button type="button" onClick={() => onChange(offset - 1)} className={arrowClass} aria-label="Período anterior">
        <ChevronLeft size={18} />
      </button>

      <p className="flex-1 text-center text-sm">
        <span className="font-medium">
          {formatShortDate(desde)} al {formatShortDate(hasta)}
        </span>
        {offset !== 0 && (
          <button
            type="button"
            onClick={() => onChange(0)}
            className="ml-2 text-muted underline underline-offset-2 hover:text-fg"
          >
            Ir al actual
          </button>
        )}
      </p>

      <button
        type="button"
        onClick={() => onChange(offset + 1)}
        disabled={offset >= 0}
        className={arrowClass}
        aria-label="Período siguiente"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  )
}
