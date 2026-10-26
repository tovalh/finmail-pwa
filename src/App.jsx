import { useState, useCallback, useEffect } from 'react'
import { setTokens, clearTokens, hasStoredSession, refreshAccessToken } from './lib/auth.js'
import { login as apiLogin } from './lib/api.js'
import LoginScreen from './components/LoginScreen.jsx'
import Dashboard from './components/Dashboard.jsx'
import Spinner from './components/Spinner.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loginError, setLoginError] = useState(null)
  const [loginLoading, setLoginLoading] = useState(false)
  const [bootstrapping, setBootstrapping] = useState(hasStoredSession())

  // Si hay un refresh token guardado, se pide un access token nuevo sin pasar por el login
  useEffect(() => {
    if (!hasStoredSession()) return
    refreshAccessToken()
      .then(() => setIsAuthenticated(true))
      .catch(() => clearTokens())
      .finally(() => setBootstrapping(false))
  }, [])

  const handleLogin = useCallback(async (username, password) => {
    setLoginLoading(true)
    setLoginError(null)
    try {
      const { accessToken, refreshToken } = await apiLogin(username, password)
      setTokens(accessToken, refreshToken)
      setIsAuthenticated(true)
    } catch (err) {
      setLoginError(err.message)
    } finally {
      setLoginLoading(false)
    }
  }, [])

  const handleLogout = useCallback(() => {
    clearTokens()
    // El service worker guarda respuestas de la API para usarlas offline;
    // al cerrar sesión no deben quedar en el dispositivo.
    if ('caches' in window) caches.delete('api-cache')
    setIsAuthenticated(false)
  }, [])

  if (bootstrapping) {
    return (
      <div className="flex min-h-svh items-center justify-center text-muted">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <ErrorBoundary>
      {isAuthenticated ? (
        <Dashboard onLogout={handleLogout} />
      ) : (
        <LoginScreen onLogin={handleLogin} error={loginError} loading={loginLoading} />
      )}
    </ErrorBoundary>
  )
}
