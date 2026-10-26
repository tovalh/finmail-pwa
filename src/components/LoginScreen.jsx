import { useState } from 'react'
import { IS_DEMO } from '../lib/env.js'
import { Button, ErrorText, Field } from './ui.jsx'
import { inputClass } from './styles.js'

export default function LoginScreen({ onLogin, error, loading }) {
  const [username, setUsername] = useState(IS_DEMO ? 'demo' : '')
  const [password, setPassword] = useState(IS_DEMO ? 'demo' : '')

  function handleSubmit(e) {
    e.preventDefault()
    onLogin(username, password)
  }

  return (
    <main className="flex min-h-svh flex-col justify-center px-6 py-10">
      <div className="mx-auto w-full max-w-sm">
        <img src="/favicon.svg" alt="" className="mb-6 h-12 w-12" />
        <h1 className="text-[28px] font-semibold tracking-tight">FinMail</h1>
        <p className="mt-1 text-muted">Tus gastos, leídos desde los correos del banco.</p>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
          <Field label="Usuario" htmlFor="login-usuario">
            <input
              id="login-usuario"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
              className={inputClass}
            />
          </Field>

          <Field label="Contraseña" htmlFor="login-password">
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className={inputClass}
            />
          </Field>

          <ErrorText>{error}</ErrorText>

          <Button type="submit" loading={loading} className="mt-2">
            Entrar
          </Button>
        </form>

        {IS_DEMO && (
          <p className="mt-6 text-sm text-faint">
            Modo demo: los datos son de ejemplo y cualquier usuario sirve.
          </p>
        )}
      </div>
    </main>
  )
}
