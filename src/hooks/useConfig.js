import { useState, useEffect } from 'react'
import { getConfig } from '../lib/api.js'

export function useConfig({ onSessionExpired }) {
  const [diaInicioMes, setDiaInicioMes] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    getConfig()
      .then((cfg) => { if (cfg?.diaInicioMes) setDiaInicioMes(cfg.diaInicioMes) })
      .catch((err) => {
        if (err.message === 'SESSION_EXPIRED') onSessionExpired()
        else setError('No se pudo cargar la configuración')
      })
      .finally(() => setLoading(false))
  }, [onSessionExpired])

  return { diaInicioMes, setDiaInicioMes, loading, error }
}
