export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'

// Con VITE_DEMO=true la app no llama al backend: usa datos de ejemplo en memoria.
// Sirve para mostrarla sin exponer movimientos reales.
export const IS_DEMO = import.meta.env.VITE_DEMO === 'true'
