import { getIconComponent } from '../lib/categoryIcons.js'

const NEUTRAL = '#627873'

function tint(color, alpha) {
  if (!/^#[0-9a-f]{6}$/i.test(color)) return 'transparent'
  return color + Math.round(alpha * 255).toString(16).padStart(2, '0')
}

// Ícono de la categoría sobre un fondo teñido con su color.
// `pending` lo muestra con borde punteado: es una sugerencia, todavía no una categoría.
export default function CategoryBadge({ categoria, size = 36, pending = false }) {
  const color = categoria?.color || NEUTRAL
  const Icon = getIconComponent(categoria?.icono)
  const inicial = categoria?.nombre?.charAt(0).toUpperCase() ?? '?'

  return (
    <span
      className={`flex flex-shrink-0 items-center justify-center rounded-[10px] text-sm font-semibold ${
        pending ? 'border border-dashed border-mark/70' : ''
      }`}
      style={{
        width: size,
        height: size,
        backgroundColor: tint(color, pending ? 0.08 : 0.16),
        color,
      }}
      aria-hidden="true"
    >
      {Icon ? <Icon size={Math.round(size * 0.48)} /> : inicial}
    </span>
  )
}
