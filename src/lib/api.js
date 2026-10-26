import { getAccessToken, refreshAccessToken, clearTokens } from './auth.js'
import { API_URL, IS_DEMO } from './env.js'
import * as demo from './demo.js'

// Lee un ProblemDetail (RFC 9457) y devuelve `detail`, luego `title`,
// y si no hay cuerpo legible, "HTTP <status>".
async function readError(res) {
  try {
    const body = await res.json()
    return body.detail ?? body.title ?? `HTTP ${res.status}`
  } catch {
    return `HTTP ${res.status}`
  }
}

// Single-flight: si varias peticiones reciben 401 a la vez, se hace un solo
// refresh y todas esperan la misma promesa.
let _refreshPromise = null

async function fetchWithAuth(path, options = {}) {
  const makeReq = (token) =>
    fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
        Authorization: `Bearer ${token}`,
      },
    })

  let res = await makeReq(getAccessToken())

  if (res.status === 401) {
    if (!_refreshPromise) {
      _refreshPromise = refreshAccessToken().finally(() => {
        _refreshPromise = null
      })
    }

    try {
      const newToken = await _refreshPromise
      res = await makeReq(newToken)
    } catch {
      clearTokens()
      throw new Error('SESSION_EXPIRED')
    }
  }

  if (!res.ok) throw new Error(await readError(res))
  // 204 o cuerpo vacío: devolvemos null en vez de romper en res.json()
  const ct = res.headers.get('content-type') || ''
  if (res.status === 204 || !ct.includes('application/json')) return null
  return res.json()
}

const categoriaBody = (nombre, color, icono) =>
  JSON.stringify({ nombre, ...(color ? { color } : {}), ...(icono ? { icono } : {}) })

const remote = {
  async login(username, password) {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
    if (res.status === 401) throw new Error('Usuario o contraseña incorrectos')
    if (!res.ok) throw new Error(await readError(res))
    return res.json()
  },

  getTransacciones: (desde, hasta) =>
    fetchWithAuth(`/api/transacciones?desde=${desde}&hasta=${hasta}`),

  getResumen: (desde, hasta) =>
    fetchWithAuth(`/api/transacciones/resumen?desde=${desde}&hasta=${hasta}`),

  patchCategoria: (id, categoriaId) =>
    fetchWithAuth(`/api/transacciones/${id}/categoria`, {
      method: 'PATCH',
      body: JSON.stringify({ categoriaId }),
    }),

  deleteTransaccion: (id) =>
    fetchWithAuth(`/api/transacciones/${id}`, { method: 'DELETE' }),

  postTransaccion: (body) =>
    fetchWithAuth('/api/transacciones', { method: 'POST', body: JSON.stringify(body) }),

  getCategorias: () => fetchWithAuth('/api/categorias'),

  postCategoria: (nombre, color, icono) =>
    fetchWithAuth('/api/categorias', { method: 'POST', body: categoriaBody(nombre, color, icono) }),

  updateCategoria: (id, nombre, color, icono) =>
    fetchWithAuth(`/api/categorias/${id}`, { method: 'PATCH', body: categoriaBody(nombre, color, icono) }),

  deleteCategoria: (id) =>
    fetchWithAuth(`/api/categorias/${id}`, { method: 'DELETE' }),

  getConfig: () => fetchWithAuth('/api/config'),

  patchConfig: (diaInicioMes) =>
    fetchWithAuth('/api/config', { method: 'PATCH', body: JSON.stringify({ diaInicioMes }) }),

  postHistorico: (desde) =>
    fetchWithAuth(`/api/transacciones/historico?desde=${desde}`, { method: 'POST' }),
}

const impl = IS_DEMO ? demo : remote

export const login = (username, password) => impl.login(username, password)

export const getTransacciones = (desde, hasta) => impl.getTransacciones(desde, hasta)
export const getResumen = (desde, hasta) => impl.getResumen(desde, hasta)
// Los ids llegan como string desde los formularios; la API espera un número.
export const patchCategoria = (id, categoriaId) => impl.patchCategoria(id, Number(categoriaId))
export const deleteTransaccion = (id) => impl.deleteTransaccion(id)
export const postTransaccion = (body) => impl.postTransaccion(body)

export const getCategorias = () => impl.getCategorias()
export const postCategoria = (nombre, color, icono) => impl.postCategoria(nombre, color, icono)
export const updateCategoria = (id, nombre, color, icono) => impl.updateCategoria(id, nombre, color, icono)
export const deleteCategoria = (id) => impl.deleteCategoria(id)

export const getConfig = () => impl.getConfig()
export const patchConfig = (diaInicioMes) => impl.patchConfig(diaInicioMes)

export const postHistorico = (desde) => impl.postHistorico(desde)
