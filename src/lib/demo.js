// Backend falso para el modo demo (VITE_DEMO=true). Mismo contrato que la API real,
// con datos generados en memoria relativos a la fecha de hoy.
import { toISODate } from './format.js'

const CATEGORIAS = [
  { id: 1, nombre: 'Supermercado', color: '#EAB308', icono: 'ShoppingCart' },
  { id: 2, nombre: 'Restaurantes', color: '#EF4444', icono: 'ChefHat' },
  { id: 3, nombre: 'Delivery', color: '#FB923C', icono: 'PackageOpen' },
  { id: 4, nombre: 'Transporte', color: '#3B82F6', icono: 'Bus' },
  { id: 5, nombre: 'Combustible', color: '#F59E0B', icono: 'Fuel' },
  { id: 6, nombre: 'Salud y Farmacia', color: '#10B981', icono: 'HeartPulse' },
  { id: 7, nombre: 'Suscripciones', color: '#6366F1', icono: 'RefreshCw' },
  { id: 8, nombre: 'Hogar y Servicios', color: '#14B8A6', icono: 'House' },
  { id: 9, nombre: 'Entretenimiento', color: '#8B5CF6', icono: 'Clapperboard' },
  { id: 10, nombre: 'Ropa y Calzado', color: '#EC4899', icono: 'Shirt' },
  { id: 11, nombre: 'Otro', color: '#6B7280', icono: 'Tag' },
]

// [comercio, categoría, monto mínimo, monto máximo, veces en ~70 días]
const COMERCIOS = [
  ['LIDER EXPRESS', 'Supermercado', 4500, 38000, 9],
  ['UNIMARC', 'Supermercado', 6000, 52000, 4],
  ['JUMBO', 'Supermercado', 25000, 89000, 2],
  ['JUAN MAESTRO', 'Restaurantes', 7900, 15800, 3],
  ['STARBUCKS', 'Restaurantes', 3600, 7400, 4],
  ['PEDIDOSYA', 'Delivery', 9800, 21500, 5],
  ['RAPPI', 'Delivery', 8900, 18900, 3],
  ['UBER', 'Transporte', 3200, 9800, 7],
  ['COPEC', 'Combustible', 25000, 48000, 3],
  ['CRUZ VERDE', 'Salud y Farmacia', 3990, 24900, 2],
  ['NETFLIX', 'Suscripciones', 9490, 9490, 2],
  ['SPOTIFY', 'Suscripciones', 6490, 6490, 2],
  ['ENTEL', 'Hogar y Servicios', 21990, 21990, 2],
  ['ESSBIO', 'Hogar y Servicios', 14200, 19800, 2],
  ['CINEMARK', 'Entretenimiento', 6900, 17800, 2],
  ['FALABELLA', 'Ropa y Calzado', 19990, 59990, 1],
]

// Generador determinístico: la demo se ve igual en cada recarga del mismo día.
function rng(seed) {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296
    return s / 4294967296
  }
}

function pad(n) {
  return String(n).padStart(2, '0')
}

function generar() {
  const rand = rng(20261023)
  const hoy = new Date()
  const txs = []
  let id = 1

  for (const [comercio, categoria, min, max, veces] of COMERCIOS) {
    for (let i = 0; i < veces; i++) {
      const dias = Math.floor(rand() * 70)
      const fecha = new Date(hoy)
      fecha.setDate(hoy.getDate() - dias)
      const hora = 8 + Math.floor(rand() * 14)
      const minuto = Math.floor(rand() * 60)
      const monto = Math.round((min + rand() * (max - min)) / 10) * 10
      txs.push({
        id: id++,
        monto,
        fecha: `${toISODate(fecha)}T${pad(hora)}:${pad(minuto)}:00`,
        tipoTransaccion: 'CARGO',
        comercioNombre: comercio,
        categoriaNombre: categoria,
        categoriaSugeridaNombre: categoria,
        mensaje: null,
        destinatario: null,
      })
    }
  }

  // Arriendo: transferencia a principio de cada mes
  for (let m = 0; m < 3; m++) {
    const fecha = new Date(hoy.getFullYear(), hoy.getMonth() - m, 3, 10, 15)
    if (fecha > hoy) continue
    txs.push({
      id: id++,
      monto: 380000,
      fecha: `${toISODate(fecha)}T10:15:00`,
      tipoTransaccion: 'TRANSFERENCIA',
      comercioNombre: null,
      categoriaNombre: 'Hogar y Servicios',
      categoriaSugeridaNombre: 'Hogar y Servicios',
      mensaje: 'Arriendo',
      destinatario: 'ARRIENDO DEPTO',
    })
  }

  // Un par de compras de hoy, para que la lista no empiece días atrás
  const hoyISO = toISODate(hoy)
  const horaActual = Math.max(hoy.getHours(), 10)
  const deHoy = [
    { comercio: 'LIDER EXPRESS', categoria: 'Supermercado', monto: 12990, hora: horaActual - 2 },
    { comercio: 'UBER', categoria: 'Transporte', monto: 4870, hora: horaActual - 1 },
  ]
  txs.push(...deHoy.map((t) => ({
    id: id++,
    monto: t.monto,
    fecha: `${hoyISO}T${pad(t.hora)}:${pad(12)}:00`,
    tipoTransaccion: 'CARGO',
    comercioNombre: t.comercio,
    categoriaNombre: t.categoria,
    categoriaSugeridaNombre: t.categoria,
    mensaje: null,
    destinatario: null,
  }))
  )

  // Algunos de los más recientes quedan pendientes: Claude sugirió y el usuario
  // todavía no confirma.
  txs.sort((a, b) => b.fecha.localeCompare(a.fecha))
  for (const i of [0, 3, 6]) if (txs[i]) txs[i].categoriaNombre = null
  return txs
}

let transacciones = generar()
let categorias = CATEGORIAS.map((c) => ({ ...c }))
let nextTxId = transacciones.length + 1
let nextCatId = categorias.length + 1
let diaInicioMes = 1

const wait = (value, ms = 220) => new Promise((resolve) => setTimeout(() => resolve(value), ms))
const enRango = (tx, desde, hasta) => tx.fecha.slice(0, 10) >= desde && tx.fecha.slice(0, 10) <= hasta

export const login = () => wait({ accessToken: 'demo', refreshToken: 'demo' }, 400)

export const getTransacciones = (desde, hasta) =>
  wait(transacciones.filter((tx) => enRango(tx, desde, hasta)).map((tx) => ({ ...tx })))

export function getResumen(desde, hasta) {
  const txs = transacciones.filter((tx) => enRango(tx, desde, hasta))
  const suma = (lista) => lista.reduce((s, tx) => s + tx.monto, 0)
  const porCategoria = new Map()
  for (const tx of txs) {
    if (!tx.categoriaNombre) continue
    porCategoria.set(tx.categoriaNombre, (porCategoria.get(tx.categoriaNombre) ?? 0) + tx.monto)
  }
  return wait({
    totalCargos: suma(txs.filter((tx) => tx.tipoTransaccion === 'CARGO')),
    totalTransferencias: suma(txs.filter((tx) => tx.tipoTransaccion === 'TRANSFERENCIA')),
    total: suma(txs),
    sinCategorizar: txs.filter((tx) => !tx.categoriaNombre).length,
    gastosPorCategoria: [...porCategoria]
      .map(([categoria, monto]) => ({ categoria, monto }))
      .sort((a, b) => b.monto - a.monto),
  })
}

export function patchCategoria(id, categoriaId) {
  const cat = categorias.find((c) => c.id === categoriaId)
  transacciones = transacciones.map((tx) => (tx.id === id ? { ...tx, categoriaNombre: cat?.nombre ?? null } : tx))
  return wait(null)
}

export function deleteTransaccion(id) {
  transacciones = transacciones.filter((tx) => tx.id !== id)
  return wait(null)
}

export function postTransaccion(body) {
  const cat = categorias.find((c) => c.id === body.categoriaId)
  const tx = {
    id: nextTxId++,
    monto: body.monto,
    fecha: body.fecha,
    tipoTransaccion: 'CARGO',
    comercioNombre: body.comercio ?? 'Gasto manual',
    categoriaNombre: cat?.nombre ?? null,
    categoriaSugeridaNombre: null,
    mensaje: null,
    destinatario: null,
  }
  transacciones = [tx, ...transacciones]
  return wait({ ...tx })
}

export const getCategorias = () => wait(categorias.map((c) => ({ ...c })))

export function postCategoria(nombre, color, icono) {
  if (categorias.some((c) => c.nombre.toLowerCase() === nombre.toLowerCase())) {
    return Promise.reject(new Error('Ya existe una categoría con ese nombre'))
  }
  const cat = { id: nextCatId++, nombre, color: color || null, icono: icono || null }
  categorias = [...categorias, cat]
  return wait({ ...cat })
}

export function updateCategoria(id, nombre, color, icono) {
  const anterior = categorias.find((c) => c.id === id)
  categorias = categorias.map((c) =>
    c.id === id ? { ...c, nombre, ...(color ? { color } : {}), ...(icono ? { icono } : {}) } : c
  )
  if (anterior && anterior.nombre !== nombre) {
    transacciones = transacciones.map((tx) => ({
      ...tx,
      categoriaNombre: tx.categoriaNombre === anterior.nombre ? nombre : tx.categoriaNombre,
      categoriaSugeridaNombre: tx.categoriaSugeridaNombre === anterior.nombre ? nombre : tx.categoriaSugeridaNombre,
    }))
  }
  return wait(null)
}

export function deleteCategoria(id) {
  const cat = categorias.find((c) => c.id === id)
  if (transacciones.some((tx) => tx.categoriaNombre === cat?.nombre)) {
    return Promise.reject(new Error('La categoría tiene movimientos asociados. Cámbialos de categoría antes de eliminarla.'))
  }
  categorias = categorias.filter((c) => c.id !== id)
  return wait(null)
}

export const getConfig = () => wait({ diaInicioMes })

export function patchConfig(dia) {
  diaInicioMes = dia
  return wait(null)
}

export const postHistorico = () => wait({ importadas: 0 }, 900)
