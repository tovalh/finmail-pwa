import Spinner from './Spinner.jsx'

const VARIANTS = {
  primary: 'bg-fg text-ink hover:bg-white',
  secondary: 'border border-line text-fg hover:bg-raised',
  danger: 'border border-up/40 text-up hover:bg-up/10',
  dangerSolid: 'bg-up text-ink hover:brightness-105',
  mark: 'bg-mark text-mark-ink hover:brightness-105',
}

export function Button({ variant = 'primary', loading = false, className = '', disabled, children, ...props }) {
  return (
    <button
      type="button"
      {...props}
      disabled={disabled || loading}
      className={`inline-flex h-12 items-center justify-center gap-2 rounded-xl px-4 text-[15px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${VARIANTS[variant]} ${className}`}
    >
      {loading ? <Spinner /> : children}
    </button>
  )
}

export function Field({ label, hint, htmlFor, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm text-muted">
        {label}
        {hint && <span className="text-faint"> {hint}</span>}
      </label>
      {children}
    </div>
  )
}

export function ErrorText({ children }) {
  if (!children) return null
  return (
    <p role="alert" className="rounded-xl bg-up/10 px-3.5 py-2.5 text-sm text-up">
      {children}
    </p>
  )
}
