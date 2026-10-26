import { useState } from 'react'
import { todayISO } from '../lib/format.js'
import Modal from './Modal.jsx'
import CategoryGrid from './CategoryGrid.jsx'
import { Button, ErrorText, Field } from './ui.jsx'
import { inputClass } from './styles.js'

export default function CrearTransaccionModal({ categorias, onCrear, onClose }) {
  const [monto, setMonto] = useState('')
  const [comercio, setComercio] = useState('')
  const [fecha, setFecha] = useState(todayISO())
  const [categoriaId, setCategoriaId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const montoNumero = Number(monto.replace(/\D/g, ''))
  const canSubmit = montoNumero > 0 && fecha && categoriaId

  async function handleSubmit(e) {
    e.preventDefault()
    if (!canSubmit) return
    setLoading(true)
    setError(null)
    try {
      await onCrear({
        monto: montoNumero,
        // El backend espera LocalDateTime sin zona horaria
        fecha: `${fecha}T12:00:00`,
        categoriaId: Number(categoriaId),
        ...(comercio.trim() ? { comercio: comercio.trim() } : {}),
      })
      onClose()
    } catch (err) {
      if (err.message === 'SESSION_EXPIRED') onClose()
      else setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      title="Agregar gasto"
      onClose={onClose}
      footer={
        <Button type="submit" form="crear-gasto" loading={loading} disabled={!canSubmit} className="w-full">
          Agregar gasto
        </Button>
      }
    >
      <form id="crear-gasto" onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="Monto" htmlFor="gasto-monto">
          <div className="relative">
            <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted">$</span>
            <input
              id="gasto-monto"
              type="text"
              inputMode="numeric"
              value={monto ? Number(monto.replace(/\D/g, '')).toLocaleString('es-CL') : ''}
              onChange={(e) => setMonto(e.target.value.replace(/\D/g, ''))}
              placeholder="5.000"
              required
              autoFocus
              className={`${inputClass} pl-7 tabular-nums`}
            />
          </div>
        </Field>

        <Field label="Dónde" hint="(opcional)" htmlFor="gasto-comercio">
          <input
            id="gasto-comercio"
            type="text"
            value={comercio}
            onChange={(e) => setComercio(e.target.value)}
            placeholder="Feria, almacén…"
            className={inputClass}
          />
        </Field>

        <Field label="Fecha" htmlFor="gasto-fecha">
          <input
            id="gasto-fecha"
            type="date"
            value={fecha}
            max={todayISO()}
            onChange={(e) => setFecha(e.target.value)}
            required
            className={inputClass}
          />
        </Field>

        <Field label="Categoría">
          <CategoryGrid categorias={categorias} value={categoriaId} onChange={setCategoriaId} />
        </Field>

        <ErrorText>{error}</ErrorText>
      </form>
    </Modal>
  )
}
