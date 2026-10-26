import { useState } from 'react'
import { ChevronLeft } from 'lucide-react'
import { formatCLP, formatDateTime, nombreMovimiento, toTitleCase } from '../lib/format.js'
import Modal from './Modal.jsx'
import CategoryGrid from './CategoryGrid.jsx'
import CategoryBadge from './CategoryBadge.jsx'
import CategoriaForm from './CategoriaForm.jsx'
import { Button, ErrorText } from './ui.jsx'

const norm = (s) => (s ?? '').trim().toLowerCase()

export default function TransaccionModal({
  tx, transacciones, categorias,
  onConfirmar, onConfirmarVarias, onEliminar, onCrearCategoria,
  onClose,
  initialPendingMatch = null,
}) {
  const isConfirmed = tx.categoriaNombre != null
  const nombreInicial = isConfirmed ? tx.categoriaNombre : tx.categoriaSugeridaNombre
  const initialCatId = String(categorias.find((c) => c.nombre === nombreInicial)?.id ?? '')

  const [selectedCatId, setSelectedCatId] = useState(initialCatId)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState(null)
  // 'select' | 'bulk' | 'nueva' | 'eliminar'
  const [step, setStep] = useState(initialPendingMatch ? 'bulk' : 'select')
  const [pendingMatch, setPendingMatch] = useState(initialPendingMatch ?? [])

  const canSave = !!selectedCatId && (!isConfirmed || selectedCatId !== initialCatId)
  const cat = categorias.find((c) => String(c.id) === String(selectedCatId))
  const nombre = nombreMovimiento(tx)

  function handleGuardar() {
    if (!canSave) return
    const comercio = norm(tx.comercioNombre)
    if (comercio) {
      const otros = transacciones.filter(
        (t) => t.id !== tx.id && norm(t.comercioNombre) === comercio && t.categoriaNombre == null
      )
      if (otros.length > 0) {
        setPendingMatch(otros)
        setStep('bulk')
        return
      }
    }
    doConfirm([tx.id])
  }

  async function doConfirm(ids) {
    setSaving(true)
    setError(null)
    try {
      if (ids.length === 1) await onConfirmar(ids[0], selectedCatId, cat?.nombre ?? '')
      else await onConfirmarVarias(ids, selectedCatId, cat?.nombre ?? '')
      onClose()
    } catch (err) {
      setError(err.message)
      setStep('select')
    } finally {
      setSaving(false)
    }
  }

  async function handleEliminar() {
    setDeleting(true)
    setError(null)
    try {
      await onEliminar(tx.id)
      onClose()
    } catch (err) {
      setError(err.message)
      setStep('select')
    } finally {
      setDeleting(false)
    }
  }

  async function handleCrearCategoria(nombreCat, color, icono) {
    const created = await onCrearCategoria(nombreCat, color, icono)
    if (created) {
      setSelectedCatId(String(created.id))
      setStep('select')
    }
  }

  const header = (
    <>
      <h2 className="truncate text-lg font-semibold">{nombre}</h2>
      <p className="mt-0.5 text-[28px] leading-tight font-semibold tabular-nums">{formatCLP(tx.monto)}</p>
      <p className="mt-1 text-sm text-muted">{formatDateTime(tx.fecha)}</p>
    </>
  )

  let body = null
  let footer = null

  if (step === 'select') {
    body = (
      <div className="flex flex-col gap-3">
        {!isConfirmed && tx.categoriaSugeridaNombre && (
          <p className="rounded-xl bg-mark/12 px-3.5 py-2.5 text-sm text-mark">
            Sugerencia automática: {tx.categoriaSugeridaNombre}. Confírmala o elige otra.
          </p>
        )}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted">Categoría</p>
          <button
            type="button"
            onClick={() => setStep('nueva')}
            className="text-sm font-medium text-fg underline-offset-2 hover:underline"
          >
            Nueva categoría
          </button>
        </div>
        <CategoryGrid categorias={categorias} value={selectedCatId} onChange={setSelectedCatId} />
        <ErrorText>{error}</ErrorText>
      </div>
    )
    footer = (
      <div className="flex gap-3">
        <Button variant="danger" onClick={() => setStep('eliminar')} disabled={saving} className="flex-1">
          Eliminar
        </Button>
        <Button onClick={handleGuardar} loading={saving} disabled={!canSave} className="flex-1">
          {isConfirmed ? 'Guardar cambio' : 'Confirmar'}
        </Button>
      </div>
    )
  }

  if (step === 'eliminar') {
    body = (
      <p className="text-muted">Se eliminará este movimiento y dejará de contar en tus totales.</p>
    )
    footer = (
      <div className="flex gap-3">
        <Button variant="secondary" onClick={() => setStep('select')} disabled={deleting} className="flex-1">
          Cancelar
        </Button>
        <Button variant="dangerSolid" onClick={handleEliminar} loading={deleting} className="flex-1">
          Sí, eliminar
        </Button>
      </div>
    )
  }

  if (step === 'bulk') {
    const total = pendingMatch.length + 1
    body = (
      <div className="flex flex-col gap-4">
        <div>
          <p className="font-semibold">
            Hay {pendingMatch.length === 1 ? 'otro movimiento' : `${pendingMatch.length} movimientos más`} de{' '}
            {toTitleCase(tx.comercioNombre)} sin confirmar
          </p>
          <p className="mt-1 text-sm text-muted">Puedes aplicarles la misma categoría de una vez.</p>
        </div>

        {cat && (
          <div className="flex items-center gap-3 rounded-xl bg-raised p-3">
            <CategoryBadge categoria={cat} size={32} />
            <span className="font-medium">{cat.nombre}</span>
          </div>
        )}

        <ul className="divide-y divide-line rounded-xl border border-line">
          {pendingMatch.map((t) => (
            <li key={t.id} className="flex justify-between px-3.5 py-2.5 text-sm">
              <span className="text-muted">{formatDateTime(t.fecha)}</span>
              <span className="font-medium tabular-nums">{formatCLP(t.monto)}</span>
            </li>
          ))}
        </ul>
      </div>
    )
    footer = (
      <div className="flex gap-3">
        <Button variant="secondary" onClick={() => doConfirm([tx.id])} disabled={saving} className="flex-1">
          Solo este
        </Button>
        <Button
          onClick={() => doConfirm([tx.id, ...pendingMatch.map((t) => t.id)])}
          loading={saving}
          className="flex-1"
        >
          Aplicar a los {total}
        </Button>
      </div>
    )
  }

  if (step === 'nueva') {
    body = (
      <div className="flex flex-col gap-4">
        <button
          type="button"
          onClick={() => setStep('select')}
          className="flex items-center gap-1 self-start text-sm text-muted hover:text-fg"
        >
          <ChevronLeft size={16} />
          Volver a las categorías
        </button>
        <CategoriaForm submitLabel="Crear categoría" onSubmit={handleCrearCategoria} />
      </div>
    )
  }

  return (
    <Modal title={header} onClose={onClose} footer={footer}>
      {body}
    </Modal>
  )
}
