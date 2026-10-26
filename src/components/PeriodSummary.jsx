import { formatNumber, getDaysElapsed, getDaysRemaining, getPeriodLength } from '../lib/format.js'

export default function PeriodSummary({ resumen, desde, hasta, esActual }) {
  const total = resumen?.total ?? 0
  const largo = getPeriodLength(desde, hasta)
  const transcurridos = esActual ? getDaysElapsed(desde, hasta) : largo
  const quedan = getDaysRemaining(hasta)
  const avance = Math.round((transcurridos / largo) * 100)

  return (
    <section aria-label="Resumen del período" className="pt-2">
      <p className="text-sm text-muted">{esActual ? 'Gastado en este período' : 'Gastado en el período'}</p>
      <p className="mt-1 flex items-start text-[44px] leading-none font-semibold tracking-tight tabular-nums">
        <span className="mt-1.5 mr-1 text-[26px] font-medium text-muted">$</span>
        {formatNumber(total)}
      </p>

      <div
        className="mt-5 h-1 overflow-hidden rounded-full bg-line"
        role="progressbar"
        aria-label="Avance del período"
        aria-valuenow={avance}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className="h-full rounded-full bg-fg/70" style={{ width: `${avance}%` }} />
      </div>
      <div className="mt-2 flex justify-between text-sm text-muted">
        <span>{esActual ? `Día ${transcurridos} de ${largo}` : 'Período cerrado'}</span>
        {esActual && <span>{quedan === 1 ? 'Queda 1 día' : `Quedan ${quedan} días`}</span>}
      </div>
    </section>
  )
}
