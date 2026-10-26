# FinMail PWA

**Demo:** [finmail.toval.dev](https://finmail.toval.dev) (datos de ejemplo, sin backend)

App móvil para registrar gastos personales en pesos chilenos (CLP). Se conecta a un [backend Java/Spring](https://github.com/tovalh/finmail) que lee los correos del banco, guarda cada movimiento y le pide a Claude una categoría. En la app solo confirmas o corriges esa sugerencia.

Se instala como PWA, muestra los últimos datos guardados cuando no hay conexión y permite que el "mes" empiece el día que quieras (útil si te pagan el 15).

## Stack

- **React 19** + **Vite 8**
- **Tailwind v4** (vía `@tailwindcss/vite`, sin archivo de config; los colores son tokens en `src/index.css`)
- **lucide-react** para íconos
- **vite-plugin-pwa** + Workbox para el service worker y el caché offline
- Autenticación con JWT (access 1h + refresh 30d)

## Requisitos

- Node 20+
- Backend FinMail corriendo (por defecto en `http://localhost:8080`), salvo en modo demo

## Cómo correr

```bash
npm install --legacy-peer-deps   # Vite 8 tiene conflictos de peer deps
cp .env.example .env
npm run dev                      # http://localhost:5173
```

### Modo demo

```bash
npm run dev:demo
```

Levanta la app con datos de ejemplo en memoria (`src/lib/demo.js`), sin backend y sin datos reales. Sirve para probar la interfaz o publicar una demo: `npm run build:demo` genera un build estático listo para subir.

### Deploy de la demo en Vercel

`vercel.json` ya deja configurado el deploy de la demo: instala con `--legacy-peer-deps`, construye con `build:demo` y publica `dist/`. Basta con importar el repo en Vercel, sin variables de entorno. El service worker (`sw.js`) se sirve sin caché para que cada deploy llegue a quienes ya la instalaron.

## Scripts

| Script | Qué hace |
|---|---|
| `npm run dev` | Dev server con HMR |
| `npm run dev:demo` | Dev server con datos de ejemplo, sin backend |
| `npm run build` | Build de producción + service worker |
| `npm run build:demo` | Build estático en modo demo |
| `npm run preview` | Sirve el build local (para probar PWA / offline) |
| `npm run lint` | ESLint |

## Variables de entorno

| Variable | Default | Descripción |
|---|---|---|
| `VITE_API_URL` | `http://localhost:8080` | URL base del backend |
| `VITE_DEMO` | — | `true` para usar datos de ejemplo en vez del backend |

## Arquitectura

```
src/
├── lib/
│   ├── api.js           Cliente HTTP, fetchWithAuth y refresh single-flight
│   ├── demo.js          Backend falso en memoria para el modo demo
│   ├── auth.js          Tokens JWT (access en memoria, refresh en localStorage)
│   ├── format.js        CLP, fechas locales y rangos de período configurables
│   └── categoryIcons.js Mapa de íconos lucide-react
├── hooks/
│   ├── useTransacciones.js   Carga y mutaciones optimistas
│   ├── useCategorias.js
│   ├── useConfig.js          Día de inicio del período
│   ├── useInstallPrompt.js   beforeinstallprompt
│   └── useOnlineStatus.js    navigator.onLine
├── components/          Pantallas, modales y piezas de UI (ui.jsx)
└── App.jsx              Login + ErrorBoundary
```

### Decisiones técnicas

- **Sin router**: es una sola pantalla con tres pestañas resueltas con `useState`.
- **Refresh token en `localStorage`**: es vulnerable a XSS; lo robusto sería una cookie `httpOnly`, pero requiere cambios de CORS en el backend. Para este alcance está aceptado.
- **Access token en una variable de módulo**: nunca toca `localStorage`.
- **Refresh single-flight** (`src/lib/api.js`): si varias peticiones reciben 401 a la vez, se hace un solo refresh y todas esperan la misma promesa.
- **Fechas locales, no UTC**: Chile es GMT-3 y `new Date('2026-03-20')` se mostraría como el día 19. `format.js` agrega `T00:00:00` y nunca usa `toISOString()`.
- **Gráfico en SVG propio** (`Donut.jsx`): para una sola dona no se justificaban los ~200KB de Recharts.
- **Caché offline por ruta** (`/api/`), no por puerto, y se borra al cerrar sesión.
- **Errores del backend** (`ProblemDetail`, RFC 9457): se muestran con su `detail`.

## API que consume

- `POST /api/auth/login` · `POST /api/auth/refresh`
- `GET/POST /api/transacciones` · `PATCH /api/transacciones/{id}/categoria` · `DELETE /api/transacciones/{id}`
- `GET /api/transacciones/resumen` · `POST /api/transacciones/historico`
- `GET/POST /api/categorias` · `PATCH/DELETE /api/categorias/{id}`
- `GET/PATCH /api/config`

## Pendiente

- Tests con Vitest + React Testing Library
- Encerrar el foco del teclado dentro de los modales
