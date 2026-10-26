import { ICON_LIST, ICON_MAP } from '../lib/categoryIcons.js'

// Un segundo toque sobre el ícono elegido lo deselecciona.
export default function IconPicker({ value, onChange, color }) {
  return (
    <div className="grid max-h-44 grid-cols-7 gap-1.5 overflow-y-auto pr-1">
      {ICON_LIST.map((name) => {
        const Icon = ICON_MAP[name]
        const selected = value === name
        return (
          <button
            key={name}
            type="button"
            title={name}
            aria-label={name}
            aria-pressed={selected}
            onClick={() => onChange(selected ? '' : name)}
            className={`flex aspect-square items-center justify-center rounded-lg transition-colors ${
              selected ? 'bg-raised ring-2 ring-fg' : 'hover:bg-raised'
            }`}
            style={{ color: selected ? color : 'var(--color-muted)' }}
          >
            <Icon size={18} />
          </button>
        )
      })}
    </div>
  )
}
