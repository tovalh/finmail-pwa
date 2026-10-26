import { useState } from 'react'
import { postHistorico } from '../lib/api.js'
import { todayISO } from '../lib/format.js'
import Modal from './Modal.jsx'
import { Button, ErrorText, Field } from './ui.jsx'
import { inputClass } from './styles.js'

export default function HistoricoModal({ desdeInicial, onClose, onImportado }) {
  const [desde, setDesde] = useState(desdeInicial)
  const [loading, setLoading] = useState(false)
  const [resultado, setResultado] = useState(null)
  const [error, setError] = useState(null)

  async function handleImportar() {
    if (!desde) return
    setLoading(true)
    setError(null)
    setResultado(null)
    try {
      const res = await postHistorico(desde)
      setResultado(res)
      onImportado()
    } catch (err) {
      if (err.message === 'SESSION_EXPIRED') onClose()
      else setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const importadas = resultado?.importadas ?? 0

  return (
    <Modal
      title="Importar correos anteriores"
      onClose={onClose}
      footer={
        <Button onClick={handleImportar} loading={loading} disabled={!desde} className="w-full">
          Importar
        </Button>
      }
    >
      <div className="flex flex-col gap-4">
        <p className="text-muted">
          Busca en tu Gmail los correos del banco desde la fecha que elijas y agrega los movimientos que falten.
        </p>

        <Field label="Desde" htmlFor="historico-desde">
          <input
            id="historico-desde"
            type="date"
            value={desde}
            max={todayISO()}
            onChange={(e) => { setDesde(e.target.value); setResultado(null); setError(null) }}
            className={inputClass}
          />
        </Field>

        <ErrorText>{error}</ErrorText>

        {resultado && (
          <p role="status" className="rounded-xl bg-down/10 px-3.5 py-2.5 text-sm text-down">
            {importadas === 0
              ? 'No había movimientos nuevos en ese rango.'
              : `Se ${importadas === 1 ? 'agregó 1 movimiento' : `agregaron ${importadas} movimientos`}.`}
          </p>
        )}
      </div>
    </Modal>
  )
}
