// Gráfico de dona en SVG. Reemplaza a Recharts: para un solo gráfico no se
// justificaban ~200KB de dependencia.
export default function Donut({ data, size = 116, thickness = 14, label }) {
  const total = data.reduce((sum, d) => sum + d.value, 0)
  const r = (size - thickness) / 2
  const c = 2 * Math.PI * r
  const center = size / 2
  const gap = data.length > 1 ? 2 : 0

  let offset = 0
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={label}>
      <circle cx={center} cy={center} r={r} fill="none" stroke="var(--color-line)" strokeWidth={thickness} />
      {total > 0 &&
        data.map((d) => {
          const len = (d.value / total) * c
          const segment = (
            <circle
              key={d.name}
              cx={center}
              cy={center}
              r={r}
              fill="none"
              stroke={d.color}
              strokeWidth={thickness}
              strokeDasharray={`${Math.max(len - gap, 0)} ${c}`}
              strokeDashoffset={-offset}
              transform={`rotate(-90 ${center} ${center})`}
            />
          )
          offset += len
          return segment
        })}
    </svg>
  )
}
