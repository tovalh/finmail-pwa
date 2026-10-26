import { useState, useCallback } from 'react'
import { formatCLP, formatDayLabel } from '../lib/format.js'
import TransaccionItem from './TransaccionItem.jsx'
import TransaccionModal from './TransaccionModal.jsx'
import { Button, ErrorText } from './ui.jsx'

const norm = (s) => (s ?? '').trim().toLowerCase()

function agruparPorDia(transacciones) {
  const grupos = []
  for (const tx of transacciones) {
    const dia = tx.fecha.slice(0, 10)
    const ultimo = grupos[grupos.length - 1]
    if (ultimo?.dia === dia) {
      ultimo.items.push(tx)
      ultimo.total += tx.monto
    } else {
      grupos.push({ dia, items: [tx], total: tx.monto })
    }
  }
  return grupos
}

export default function TransaccionList({
  transacciones, categorias, soloPendientes, onTogglePendientes, onAgregar,
  onConfirmar, onConfirmarVarias, onEliminar, onCrearCategoria,
}) {
  const [selectedTx, setSelectedTx] = useState(null)
  const [bulkMatch, setBulkMatch] = useState(null)
  const [error, setError] = useState(null)

  const pendientes = transacciones.filter((tx) => tx.categoriaNombre == null).length
  const visibles = soloPendientes ? transacciones.filter((tx) => tx.categoriaNombre == null) : transacciones
  const grupos = agruparPorDia(visibles)

  const handleClose = useCallback(() => {
    setSelectedTx(null)
    setBulkMatch(null)
  }, [])

  // Al confirmar desde la lista, si hay otros pendientes del mismo comercio
  // se abre el modal para ofrecer aplicarles la misma categoría.
  const handleQuickConfirm = useCallback(async (txId, categoriaId, categoriaNombre) => {
    const tx = transacciones.find((t) => t.id === txId)
    if (!tx) return

    const comercio = norm(tx.comercioNombre)
    const otros = comercio
      ? transacciones.filter((t) => t.id !== txId && norm(t.comercioNombre) === comercio && t.categoriaNombre == null)
      : []

    if (otros.length > 0) {
      setBulkMatch(otros)
      setSelectedTx(tx)
      return
    }

    setError(null)
    try {
      await onConfirmar(txId, categoriaId, categoriaNombre)
    } catch (err) {
      setError(err.message)
    }
  }, [transacciones, onConfirmar])

  if (!transacciones.length) {
    return (
      <div className="rounded-2xl border border-dashed border-line px-5 py-8">
        <p className="font-medium">No hay movimientos en este período</p>
        <p className="mt-1 text-sm text-muted">
          Los gastos aparecen solos cuando el banco te envía el correo. También puedes agregar uno a mano.
        </p>
        <Button variant="secondary" onClick={onAgregar} className="mt-4">
          Agregar gasto
        </Button>
      </div>
    )
  }

  return (
    <section aria-label="Movimientos" className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Movimientos</h2>
        {pendientes > 0 ? (
          <button
            type="button"
            onClick={onTogglePendientes}
            aria-pressed={soloPendientes}
            className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
              soloPendientes ? 'bg-mark text-mark-ink' : 'bg-mark/12 text-mark hover:bg-mark/20'
            }`}
          >
            {pendientes === 1 ? '1 por confirmar' : `${pendientes} por confirmar`}
          </button>
        ) : soloPendientes && (
          <button
            type="button"
            onClick={onTogglePendientes}
            className="text-sm text-muted underline underline-offset-2 hover:text-fg"
          >
            Ver todos
          </button>
        )}
      </div>

      <ErrorText>{error}</ErrorText>

      {soloPendientes && pendientes === 0 ? (
        <p className="rounded-2xl bg-surface px-4 py-6 text-sm text-muted">Todo confirmado en este período.</p>
      ) : (
        <div className="overflow-hidden rounded-2xl bg-surface">
          {grupos.map((grupo) => (
            <div key={grupo.dia}>
              <div className="flex items-baseline justify-between px-4 pt-4 pb-1 text-sm text-muted">
                <h3>{formatDayLabel(grupo.dia)}</h3>
                <span className="tabular-nums">{formatCLP(grupo.total)}</span>
              </div>
              <ul className="divide-y divide-line">
                {grupo.items.map((tx) => (
                  <TransaccionItem
                    key={tx.id}
                    transaccion={tx}
                    categorias={categorias}
                    onOpen={() => { setBulkMatch(null); setSelectedTx(tx) }}
                    onConfirmar={handleQuickConfirm}
                  />
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {selectedTx && (
        <TransaccionModal
          tx={selectedTx}
          transacciones={transacciones}
          categorias={categorias}
          onConfirmar={onConfirmar}
          onConfirmarVarias={onConfirmarVarias}
          onEliminar={onEliminar}
          onCrearCategoria={onCrearCategoria}
          initialPendingMatch={bulkMatch}
          onClose={handleClose}
        />
      )}
    </section>
  )
}
