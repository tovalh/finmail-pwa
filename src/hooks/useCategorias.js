import { useState, useEffect, useCallback } from 'react'
import { getCategorias, postCategoria } from '../lib/api.js'

export function useCategorias({ onSessionExpired }) {
  const [categorias, setCategorias] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    getCategorias()
      .then(setCategorias)
      .catch((err) => {
        if (err.message === 'SESSION_EXPIRED') onSessionExpired()
        else setError('No se pudieron cargar las categorías')
      })
  }, [onSessionExpired])

  // Relanza el error para que el formulario que llamó pueda mostrarlo.
  const crearCategoria = useCallback(async (nombre, color, icono) => {
    try {
      const created = await postCategoria(nombre, color, icono)
      setCategorias((prev) => [...prev, created])
      return created
    } catch (err) {
      if (err.message === 'SESSION_EXPIRED') {
        onSessionExpired()
        return null
      }
      throw err
    }
  }, [onSessionExpired])

  return { categorias, setCategorias, crearCategoria, error }
}
