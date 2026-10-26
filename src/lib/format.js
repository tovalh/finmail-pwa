// Todas las fechas se manejan en hora local. Chile es GMT-3: `new Date('2026-03-20')`
// se interpreta como medianoche UTC y se muestra como el día 19. Por eso a las
// fechas sin hora se les agrega T00:00:00 y nunca se usa toISOString().

// CLP no tiene decimales: 7580 → "$7.580"
export function formatCLP(amount) {
  return '$' + formatNumber(amount)
}

export function formatNumber(amount) {
  return Math.round(amount ?? 0).toLocaleString('es-CL')
}

export function toISODate(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function todayISO() {
  return toISODate(new Date())
}

function parseLocal(iso) {
  return new Date(iso.includes('T') ? iso : iso + 'T00:00:00')
}

function startOfToday() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

// Rango { desde, hasta } ('YYYY-MM-DD') de un período que empieza el día `diaInicio`.
// offset 0 = período actual, -1 = el anterior, etc.
// diaInicio=15, hoy 21-mar → 15-mar al 14-abr
export function getMonthRangeWithOffset(diaInicio = 1, offset = 0) {
  const now = new Date()

  let year = now.getFullYear()
  let month = now.getMonth()
  if (now.getDate() < diaInicio) month -= 1

  month += offset
  year += Math.floor(month / 12)
  month = ((month % 12) + 12) % 12

  const desde = new Date(year, month, diaInicio)
  const hasta = new Date(year, month + 1, diaInicio - 1)
  return { desde: toISODate(desde), hasta: toISODate(hasta) }
}

export function getPeriodLength(desdeISO, hastaISO) {
  return Math.round((parseLocal(hastaISO) - parseLocal(desdeISO)) / 86400000) + 1
}

// Días que faltan hasta `hasta`, sin contar hoy. 0 si el período ya cerró.
export function getDaysRemaining(hastaISO) {
  return Math.max(0, Math.round((parseLocal(hastaISO) - startOfToday()) / 86400000))
}

// Días transcurridos desde `desde` contando hoy, acotado al largo del período.
export function getDaysElapsed(desdeISO, hastaISO) {
  const elapsed = Math.floor((startOfToday() - parseLocal(desdeISO)) / 86400000) + 1
  const max = hastaISO ? getPeriodLength(desdeISO, hastaISO) : Infinity
  return Math.min(Math.max(1, elapsed), max)
}

// '2026-03-15' → '15 mar'
export function formatShortDate(iso) {
  return parseLocal(iso)
    .toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })
    .replace(/\./g, '')
}

// '2026-03-20T14:11:00' → '14:11'
export function formatTime(iso) {
  return parseLocal(iso).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', hour12: false })
}

// Encabezado de cada día en la lista: 'Hoy', 'Ayer' o 'Martes 18 de marzo'
export function formatDayLabel(isoDate) {
  const date = parseLocal(isoDate)
  const diff = Math.round((startOfToday() - date) / 86400000)
  if (diff === 0) return 'Hoy'
  if (diff === 1) return 'Ayer'
  const label = date.toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })
  return label.charAt(0).toUpperCase() + label.slice(1)
}

// '2026-03-20T14:11:00' → 'Viernes 20 de marzo, 14:11'
export function formatDateTime(iso) {
  return `${formatDayLabel(iso.slice(0, 10))}, ${formatTime(iso)}`
}

// Los correos del banco traen los comercios en mayúsculas: 'LIDER EXPRESS' → 'Lider Express'
export function toTitleCase(text) {
  if (!text) return text
  return text
    .toLowerCase()
    .replace(/(^|[\s\-/(])(\p{L})/gu, (_, sep, letter) => sep + letter.toUpperCase())
}

export function nombreMovimiento(tx) {
  return toTitleCase(tx.comercioNombre ?? tx.destinatario ?? tx.mensaje) ?? 'Movimiento sin nombre'
}
