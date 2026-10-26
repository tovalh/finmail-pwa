import { useState, useEffect, useCallback } from 'react'
import { getTransacciones, getResumen, patchCategoria, deleteTransaccion, postTransaccion } from '../lib/api.js'
import { getMonthRangeWithOffset } from '../lib/format.js'

// `enabled` evita disparar la carga con el diaInicioMes por defecto mientras
// useConfig todavía no resuelve: si no, se piden los datos del período
// equivocado y se vuelven a pedir apenas llega el valor real.
export function useTransacciones({ onSessionExpired, diaInicioMes = 1, periodOffset = 0, enabled = true }) {
  const [transacciones, setTransacciones] = useState([])
  const [resumen, setResumen] = useState(null)
  const [resumenAnterior, setResumenAnterior] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const { desde, hasta } = getMonthRangeWithOffset(diaInicioMes, periodOffset)
  const { desde: desdeAnt, hasta: hastaAnt } = getMonthRangeWithOffset(diaInicioMes, periodOffset - 1)

  const load = useCallback(async () => {
    if (!enabled) return
    setLoading(true)
    setError(null)
    try {
      const [txs, res, resAnt] = await Promise.all([
        getTransacciones(desde, hasta),
        getResumen(desde, hasta),
        getResumen(desdeAnt, hastaAnt),
      ])
      txs.sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
      setTransacciones(txs)
      setResumen(res)
      setResumenAnterior(resAnt)
    } catch (err) {
      if (err.message === 'SESSION_EXPIRED') onSessionExpired()
      else setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [enabled, desde, hasta, desdeAnt, hastaAnt, onSessionExpired])

  useEffect(() => { load() }, [load])

  // Re-fetches both resumen values after any mutation that affects totals/categories
  const refreshResumen = useCallback(async () => {
    try {
      const [res, resAnt] = await Promise.all([
        getResumen(desde, hasta),
        getResumen(desdeAnt, hastaAnt),
      ])
      setResumen(res)
      setResumenAnterior(resAnt)
    } catch (err) {
      if (err.message === 'SESSION_EXPIRED') onSessionExpired()
    }
  }, [desde, hasta, desdeAnt, hastaAnt, onSessionExpired])

  // Las mutaciones relanzan el error para que el componente lo muestre.
  // Solo SESSION_EXPIRED se maneja acá, porque se resuelve con logout.
  const handleMutationError = useCallback((err) => {
    if (err.message === 'SESSION_EXPIRED') {
      onSessionExpired()
      return
    }
    throw err
  }, [onSessionExpired])

  const confirmarCategoria = useCallback(
    async (transaccionId, categoriaId, categoriaNombre) => {
      try {
        await patchCategoria(transaccionId, categoriaId)
        setTransacciones((prev) =>
          prev.map((tx) =>
            tx.id === transaccionId ? { ...tx, categoriaNombre } : tx
          )
        )
        await refreshResumen()
      } catch (err) {
        handleMutationError(err)
      }
    },
    [refreshResumen, handleMutationError]
  )

  const confirmarVarias = useCallback(
    async (transaccionIds, categoriaId, categoriaNombre) => {
      try {
        await Promise.all(transaccionIds.map((id) => patchCategoria(id, categoriaId)))
        setTransacciones((prev) =>
          prev.map((tx) =>
            transaccionIds.includes(tx.id) ? { ...tx, categoriaNombre } : tx
          )
        )
        await refreshResumen()
      } catch (err) {
        // Puede haber fallado solo una de las N: recargamos para no dejar la
        // lista mostrando confirmaciones que el servidor no aceptó.
        await load()
        handleMutationError(err)
      }
    },
    [refreshResumen, handleMutationError, load]
  )

  const eliminarTransaccion = useCallback(
    async (transaccionId) => {
      try {
        await deleteTransaccion(transaccionId)
        setTransacciones((prev) => prev.filter((tx) => tx.id !== transaccionId))
        await refreshResumen()
      } catch (err) {
        handleMutationError(err)
      }
    },
    [refreshResumen, handleMutationError]
  )

  const crearTransaccion = useCallback(
    async (body) => {
      const tx = await postTransaccion(body).catch(handleMutationError)
      if (!tx) return
      // Solo la insertamos si cae dentro del período visible; si no, aparecería
      // en la lista pero sin sumar en el resumen.
      const dentroDelPeriodo = tx.fecha.slice(0, 10) >= desde && tx.fecha.slice(0, 10) <= hasta
      if (dentroDelPeriodo) {
        setTransacciones((prev) => [tx, ...prev].sort((a, b) => new Date(b.fecha) - new Date(a.fecha)))
      }
      await refreshResumen()
    },
    [refreshResumen, handleMutationError, desde, hasta]
  )

  return {
    transacciones, resumen, resumenAnterior,
    loading, error, reload: load,
    confirmarCategoria, confirmarVarias, eliminarTransaccion, crearTransaccion,
    desde, hasta, desdeAnt, hastaAnt,
  }
}
