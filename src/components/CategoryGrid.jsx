import CategoryBadge from './CategoryBadge.jsx'

export default function CategoryGrid({ categorias, value, onChange }) {
  return (
    <div className="grid grid-cols-2 gap-2" role="radiogroup">
      {categorias.map((cat) => {
        const selected = String(cat.id) === String(value)
        return (
          <button
            key={cat.id}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(String(cat.id))}
            className={`flex items-center gap-2.5 rounded-xl border p-2.5 text-left transition-colors ${
              selected ? 'border-fg bg-raised' : 'border-line hover:border-faint'
            }`}
          >
            <CategoryBadge categoria={cat} size={30} />
            <span className="truncate text-sm font-medium">{cat.nombre}</span>
          </button>
        )
      })}
    </div>
  )
}
