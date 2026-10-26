import { useState } from 'react'
import { ChevronRight, Plus } from 'lucide-react'
import { postCategoria, updateCategoria, deleteCategoria, patchConfig } from '../lib/api.js'
import { IS_DEMO } from '../lib/env.js'
import Modal from './Modal.jsx'
import CategoryBadge from './CategoryBadge.jsx'
import CategoriaForm from './CategoriaForm.jsx'
import { Button, ErrorText, Field } from './ui.jsx'
import { inputClass } from './styles.js'

function EditCategoriaModal({ cat, onSave, onDelete, onClose }) {
  const [confirmando, setConfirmando] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState(null)

  async function handleSave(nombre, color, icono) {
    await onSave(cat.id, nombre, color, icono)
    onClose()
  }

  async function handleDelete() {
    setDeleting(true)
    setError(null)
    try {
      await onDelete(cat.id)
      onClose()
    } catch (err) {
      setError(err.message)
      setConfirmando(false)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Modal title="Editar categoría" onClose={onClose}>
      <CategoriaForm initial={cat} submitLabel="Guardar cambios" onSubmit={handleSave}>
        <div className="border-t border-line pt-4">
          <ErrorText>{error}</ErrorText>
          {confirmando ? (
            <div className="flex flex-col gap-3">
              <p className="text-sm text-muted">¿Eliminar «{cat.nombre}»? Esta acción no se puede deshacer.</p>
              <div className="flex gap-3">
                <Button variant="secondary" onClick={() => setConfirmando(false)} disabled={deleting} className="flex-1">
                  Cancelar
                </Button>
                <Button variant="dangerSolid" onClick={handleDelete} loading={deleting} className="flex-1">
                  Sí, eliminar
                </Button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmando(true)}
              className="mt-1 text-sm font-medium text-up hover:underline"
            >
              Eliminar categoría
            </button>
          )}
        </div>
      </CategoriaForm>
    </Modal>
  )
}

function ConfigModal({ diaActual, onSave, onClose }) {
  const [dia, setDia] = useState(String(diaActual))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  async function handleSave() {
    const n = Number(dia)
    if (!Number.isInteger(n) || n < 1 || n > 28) {
      setError('Elige un día entre 1 y 28.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      await onSave(n)
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      title="Inicio del período"
      onClose={onClose}
      footer={
        <Button onClick={handleSave} loading={saving} className="w-full">
          Guardar
        </Button>
      }
    >
      <div className="flex flex-col gap-4">
        <p className="text-muted">
          Si te pagan el 15, poner el período del 15 al 14 hace que cada mes calce con tu sueldo.
        </p>
        <Field label="El período empieza el día" htmlFor="config-dia">
          <input
            id="config-dia"
            type="number"
            inputMode="numeric"
            min={1}
            max={28}
            value={dia}
            onChange={(e) => { setDia(e.target.value); setError(null) }}
            className={inputClass}
          />
        </Field>
        <p className="text-sm text-faint">Máximo 28, para que funcione también en febrero.</p>
        <ErrorText>{error}</ErrorText>
      </div>
    </Modal>
  )
}

export default function AjustesPage({ categorias, setCategorias, diaInicioMes, setDiaInicioMes, onSessionExpired, onLogout }) {
  const [editando, setEditando] = useState(null)
  const [showAdd, setShowAdd] = useState(false)
  const [showConfig, setShowConfig] = useState(false)

  // Relanzan el error para que el modal lo muestre; si no, un 409
  // ("la categoría tiene movimientos asociados") se perdía en silencio.
  function rethrow(err) {
    if (err.message === 'SESSION_EXPIRED') {
      onSessionExpired()
      return
    }
    throw err
  }

  async function handleSaveConfig(dia) {
    try {
      await patchConfig(dia)
      setDiaInicioMes(dia)
    } catch (err) {
      rethrow(err)
    }
  }

  async function handleSave(id, nombre, color, icono) {
    try {
      await updateCategoria(id, nombre, color, icono)
      // Los campos vacíos no se envían en el PATCH y el backend los deja como estaban
      setCategorias((prev) =>
        prev.map((c) => (c.id === id ? { ...c, nombre, ...(color ? { color } : {}), ...(icono ? { icono } : {}) } : c))
      )
    } catch (err) {
      rethrow(err)
    }
  }

  async function handleDelete(id) {
    try {
      await deleteCategoria(id)
      setCategorias((prev) => prev.filter((c) => c.id !== id))
    } catch (err) {
      rethrow(err)
    }
  }

  async function handleAdd(nombre, color, icono) {
    try {
      const created = await postCategoria(nombre, color, icono)
      setCategorias((prev) => [...prev, created])
      setShowAdd(false)
    } catch (err) {
      rethrow(err)
    }
  }

  return (
    <div className="flex flex-col gap-7">
      <section>
        <h2 className="mb-2 font-semibold">Período</h2>
        <button
          type="button"
          onClick={() => setShowConfig(true)}
          className="flex w-full items-center justify-between rounded-2xl bg-surface px-4 py-3.5 text-left transition-colors hover:bg-raised"
        >
          <span>
            El período empieza el día {diaInicioMes}
            <span className="block text-sm text-muted">
              {diaInicioMes === 1 ? 'Coincide con el mes calendario' : `Del ${diaInicioMes} al ${diaInicioMes - 1} del mes siguiente`}
            </span>
          </span>
          <ChevronRight size={18} className="text-faint" />
        </button>
      </section>

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-semibold">Categorías</h2>
          <button
            type="button"
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-1 text-sm font-medium text-fg hover:underline"
          >
            <Plus size={16} />
            Nueva
          </button>
        </div>

        <ul className="divide-y divide-line overflow-hidden rounded-2xl bg-surface">
          {categorias.map((cat) => (
            <li key={cat.id}>
              <button
                type="button"
                onClick={() => setEditando(cat)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-raised"
              >
                <CategoryBadge categoria={cat} size={32} />
                <span className="flex-1 truncate">{cat.nombre}</span>
                <ChevronRight size={18} className="text-faint" />
              </button>
            </li>
          ))}
        </ul>
      </section>

      <Button variant="danger" onClick={onLogout}>
        Cerrar sesión
      </Button>

      {IS_DEMO && <p className="-mt-3 text-center text-sm text-faint">Estás en el modo demo.</p>}

      {showConfig && (
        <ConfigModal diaActual={diaInicioMes} onSave={handleSaveConfig} onClose={() => setShowConfig(false)} />
      )}

      {editando && (
        <EditCategoriaModal
          cat={editando}
          onSave={handleSave}
          onDelete={handleDelete}
          onClose={() => setEditando(null)}
        />
      )}

      {showAdd && (
        <Modal title="Nueva categoría" onClose={() => setShowAdd(false)}>
          <CategoriaForm submitLabel="Crear categoría" onSubmit={handleAdd} />
        </Modal>
      )}
    </div>
  )
}
