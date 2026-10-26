import { formatCLP, getDaysElapsed, getPeriodLength } from '../lib/format.js'
import { getCategoriaColor } from '../lib/categoryIcons.js'
import Donut from './Donut.jsx'
import Spinner from './Spinner.jsx'

function Comparacion({ total, totalAnterior }) {
  if (totalAnterior == null) return null
  if (totalAnterior === 0) {
    return <p className="mt-2 text-sm text-muted">No hay gastos en el período anterior para comparar.</p>
  }
  const delta = Math.round(((total - totalAnterior) / totalAnterior) * 100)
  if (delta === 0) {
    return <p className="mt-2 text-sm text-muted">Lo mismo que el período anterior ({formatCLP(totalAnterior)}).</p>
  }
  return (
    <p className="mt-2 text-sm text-muted">
      <span className={`font-semibold ${delta > 0 ? 'text-up' : 'text-down'}`}>
        {Math.abs(delta)}% {delta > 0 ? 'más' : 'menos'}
      </span>{' '}
      que el período anterior ({formatCLP(totalAnterior)}).
    </p>
  )
}

export default function AnalisisPage({ resumen, resumenAnterior, categorias, desde, hasta, esActual, loading, onVerPendientes }) {
  if (loading) {
    return <div className="flex justify-center py-16 text-muted"><Spinner size="lg" /></div>
  }
  if (!resumen) return null

  const total = resumen.total ?? 0
  const dias = esActual ? getDaysElapsed(desde, hasta) : getPeriodLength(desde, hasta)
  const promedio = Math.round(total / dias)
  const pendientes = resumen.sinCategorizar ?? 0

  const gastos = (resumen.gastosPorCategoria ?? []).map((g, i) => ({
    name: g.categoria,
    value: g.monto,
    color: getCategoriaColor(categorias, g.categoria, i),
  }))
  const totalCategorizado = gastos.reduce((s, g) => s + g.value, 0)
  const maximo = Math.max(...gastos.map((g) => g.value), 1)
  const principal = gastos.reduce((a, b) => (b.value > (a?.value ?? -1) ? b : a), null)

  return (
    <div className="flex flex-col gap-6">
      <section>
        <p className="text-sm text-muted">{esActual ? 'Gastado en este período' : 'Gastado en el período'}</p>
        <p className="mt-1 text-[32px] leading-tight font-semibold tabular-nums">{formatCLP(total)}</p>
        <Comparacion total={total} totalAnterior={resumenAnterior?.total ?? null} />
      </section>

      <dl className="grid grid-cols-3 divide-x divide-line rounded-2xl bg-surface py-4">
        {[
          ['Promedio diario', formatCLP(promedio)],
          ['Compras', formatCLP(resumen.totalCargos ?? 0)],
          ['Transferencias', formatCLP(resumen.totalTransferencias ?? 0)],
        ].map(([label, value]) => (
          <div key={label} className="px-3 text-center">
            <dt className="text-xs text-muted">{label}</dt>
            <dd className="mt-1 text-[15px] font-semibold tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>

      {pendientes > 0 && (
        <button
          type="button"
          onClick={onVerPendientes}
          className="relative rounded-2xl bg-surface py-3.5 pr-4 pl-5 text-left text-sm"
        >
          <span className="absolute top-3 bottom-3 left-0 w-[3px] rounded-r-full bg-mark" aria-hidden="true" />
          <span className="text-mark">
            {pendientes === 1 ? '1 movimiento espera' : `${pendientes} movimientos esperan`} tu confirmación
          </span>{' '}
          <span className="text-muted">y todavía no se cuentan por categoría.</span>
        </button>
      )}

      <section className="rounded-2xl bg-surface p-4">
        <h2 className="font-semibold">Por categoría</h2>

        {gastos.length === 0 ? (
          <p className="mt-3 text-sm text-muted">Cuando confirmes categorías, aquí verás en qué se va tu plata.</p>
        ) : (
          <>
            <div className="mt-4 flex items-center gap-5">
              <Donut data={gastos} label="Distribución del gasto por categoría" />
              {principal && (
                <p className="text-sm text-muted">
                  <span className="block text-[26px] leading-tight font-semibold text-fg tabular-nums">
                    {Math.round((principal.value / totalCategorizado) * 100)}%
                  </span>
                  se fue en {principal.name}
                </p>
              )}
            </div>

            <ul className="mt-5 flex flex-col gap-3.5">
              {gastos.map((g) => (
                <li key={g.name}>
                  <div className="flex items-baseline justify-between gap-3 text-sm">
                    <span className="flex min-w-0 items-center gap-2">
                      <span className="h-2.5 w-2.5 flex-shrink-0 rounded-full" style={{ backgroundColor: g.color }} />
                      <span className="truncate">{g.name}</span>
                    </span>
                    <span className="flex-shrink-0 font-semibold tabular-nums">{formatCLP(g.value)}</span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-line">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${(g.value / maximo) * 100}%`, backgroundColor: g.color }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>
    </div>
  )
}
