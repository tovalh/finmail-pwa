import { useState } from 'react'
import IconPicker from './IconPicker.jsx'
import CategoryBadge from './CategoryBadge.jsx'
import { Button, ErrorText, Field } from './ui.jsx'
import { inputClass } from './styles.js'

const COLORES = ['#EAB308', '#F97316', '#EF4444', '#EC4899', '#8B5CF6', '#6366F1', '#3B82F6', '#14B8A6', '#10B981', '#6B7280']

// Formulario único para crear y editar categorías (antes había tres copias).
export default function CategoriaForm({ initial, submitLabel, onSubmit, onCancel, children }) {
  const [nombre, setNombre] = useState(initial?.nombre ?? '')
  const [color, setColor] = useState(initial?.color || COLORES[0])
  const [icono, setIcono] = useState(initial?.icono ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!nombre.trim()) return
    setSaving(true)
    setError(null)
    try {
      await onSubmit(nombre.trim(), color, icono)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <CategoryBadge categoria={{ nombre: nombre || '?', color, icono }} size={44} />
        <div className="flex-1">
          <Field label="Nombre" htmlFor="categoria-nombre">
            <input
              id="categoria-nombre"
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Supermercado"
              required
              className={inputClass}
            />
          </Field>
        </div>
      </div>

      <Field label="Color">
        <div className="flex flex-wrap items-center gap-2">
          {COLORES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              aria-label={`Color ${c}`}
              aria-pressed={color.toLowerCase() === c.toLowerCase()}
              className={`h-8 w-8 rounded-full transition-transform ${
                color.toLowerCase() === c.toLowerCase() ? 'ring-2 ring-fg ring-offset-2 ring-offset-surface' : ''
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
          <label className="relative h-8 w-8 cursor-pointer overflow-hidden rounded-full border border-dashed border-faint" title="Otro color">
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              aria-label="Elegir otro color"
            />
            <span className="flex h-full items-center justify-center text-xs text-muted">+</span>
          </label>
        </div>
      </Field>

      <Field label="Ícono" hint="(opcional)">
        <IconPicker value={icono} onChange={setIcono} color={color} />
      </Field>

      <ErrorText>{error}</ErrorText>

      <div className="flex gap-3">
        {onCancel && (
          <Button variant="secondary" onClick={onCancel} disabled={saving} className="flex-1">
            Cancelar
          </Button>
        )}
        <Button type="submit" loading={saving} disabled={!nombre.trim()} className="flex-1">
          {submitLabel}
        </Button>
      </div>

      {children}
    </form>
  )
}
