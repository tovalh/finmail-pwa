import { ReceiptText, ChartPie, Settings } from 'lucide-react'

const TABS = [
  { id: 'gastos', label: 'Gastos', Icon: ReceiptText },
  { id: 'analisis', label: 'Análisis', Icon: ChartPie },
  { id: 'ajustes', label: 'Ajustes', Icon: Settings },
]

export default function BottomNav({ active, onChange }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 border-t border-line bg-ink/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
      <div className="mx-auto flex max-w-lg">
        {TABS.map(({ id, label, Icon }) => {
          const isActive = active === id
          return (
            <button
              key={id}
              type="button"
              onClick={() => onChange(id)}
              aria-current={isActive ? 'page' : undefined}
              className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-xs transition-colors ${
                isActive ? 'font-semibold text-fg' : 'text-faint hover:text-muted'
              }`}
            >
              <Icon size={22} strokeWidth={isActive ? 2.25 : 1.75} />
              {label}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
