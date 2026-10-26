export default function Spinner({ size = 'sm' }) {
  const dim = size === 'lg' ? 'h-7 w-7' : 'h-4 w-4'
  return (
    <span
      className={`${dim} inline-block animate-spin rounded-full border-2 border-current border-t-transparent opacity-70`}
      role="status"
      aria-label="Cargando"
    />
  )
}
