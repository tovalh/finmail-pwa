import { useState, useCallback } from 'react'
import { Inbox, Plus, WifiOff } from 'lucide-react'
import { useTransacciones } from '../hooks/useTransacciones.js'
import { useCategorias } from '../hooks/useCategorias.js'
import { useConfig } from '../hooks/useConfig.js'
import { useInstallPrompt } from '../hooks/useInstallPrompt.js'
import { useOnlineStatus } from '../hooks/useOnlineStatus.js'
import PeriodSummary from './PeriodSummary.jsx'
import TransaccionList from './TransaccionList.jsx'
import AnalisisPage from './AnalisisPage.jsx'
import AjustesPage from './AjustesPage.jsx'
import HistoricoModal from './HistoricoModal.jsx'
import CrearTransaccionModal from './CrearTransaccionModal.jsx'
import InstallBanner from './InstallBanner.jsx'
import PeriodNav from './PeriodNav.jsx'
import BottomNav from './BottomNav.jsx'
import Spinner from './Spinner.jsx'

const TITULOS = {
  gastos: 'Gastos',
  analisis: 'Análisis',
  ajustes: 'Ajustes',
}

export default function Dashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState('gastos')
  const [showHistorico, setShowHistorico] = useState(false)
  const [showCrear, setShowCrear] = useState(false)
  const [periodOffset, setPeriodOffset] = useState(0)
  const [soloPendientes, setSoloPendientes] = useState(false)
  const [bannerDismissed, setBannerDismissed] = useState(false)

  const { canInstall, promptInstall } = useInstallPrompt()
  const isOnline = useOnlineStatus()

  const { diaInicioMes, setDiaInicioMes, loading: configLoading, error: configError } =
    useConfig({ onSessionExpired: onLogout })

  // Al cambiar el día de inicio, volvemos al período actual
  const handleSetDiaInicioMes = useCallback((dia) => {
    setDiaInicioMes(dia)
    setPeriodOffset(0)
  }, [setDiaInicioMes])

  const {
    transacciones, resumen, resumenAnterior,
    loading, error, reload, confirmarCategoria, confirmarVarias, eliminarTransaccion, crearTransaccion,
    desde, hasta,
  } = useTransacciones({ onSessionExpired: onLogout, diaInicioMes, periodOffset, enabled: !configLoading })

  const { categorias, setCategorias, crearCategoria, error: categoriasError } = useCategorias({ onSessionExpired: onLogout })

  const isLoading = configLoading || loading
  const esActual = periodOffset === 0
  const showPeriodNav = activeTab === 'gastos' || activeTab === 'analisis'

  const verPendientes = useCallback(() => {
    setSoloPendientes(true)
    setActiveTab('gastos')
  }, [])

  return (
    <div className="min-h-svh">
      <main className="mx-auto flex max-w-lg flex-col gap-5 px-4 pt-5 pb-28">
        <header className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">{TITULOS[activeTab]}</h1>
          {activeTab === 'gastos' && (
            <button
              type="button"
              onClick={() => setShowHistorico(true)}
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-muted transition-colors hover:bg-surface hover:text-fg"
            >
              <Inbox size={16} />
              Importar correos
            </button>
          )}
        </header>

        {showPeriodNav && <PeriodNav desde={desde} hasta={hasta} offset={periodOffset} onChange={setPeriodOffset} />}

        {!isOnline && (
          <p className="flex items-center gap-2.5 rounded-2xl bg-surface px-4 py-3 text-sm text-muted">
            <WifiOff size={16} className="flex-shrink-0" />
            Sin conexión. Estás viendo los últimos datos guardados.
          </p>
        )}

        {error && !isLoading && activeTab !== 'ajustes' && (
          <p role="alert" className="rounded-2xl bg-up/10 px-4 py-3 text-sm text-up">
            No se pudieron cargar los movimientos: {error}.{' '}
            <button type="button" onClick={reload} className="font-semibold underline underline-offset-2">
              Reintentar
            </button>
          </p>
        )}

        {(configError || categoriasError) && !isLoading && (
          <p role="alert" className="rounded-2xl bg-mark/10 px-4 py-3 text-sm text-mark">
            {configError ?? categoriasError}
          </p>
        )}

        {canInstall && !bannerDismissed && (
          <InstallBanner onInstall={promptInstall} onDismiss={() => setBannerDismissed(true)} />
        )}

        {activeTab === 'gastos' && (
          isLoading ? (
            <div className="flex justify-center py-16 text-muted"><Spinner size="lg" /></div>
          ) : resumen && (
            <>
              <PeriodSummary resumen={resumen} desde={desde} hasta={hasta} esActual={esActual} />
              <TransaccionList
                transacciones={transacciones}
                categorias={categorias}
                soloPendientes={soloPendientes}
                onTogglePendientes={() => setSoloPendientes((v) => !v)}
                onAgregar={() => setShowCrear(true)}
                onConfirmar={confirmarCategoria}
                onConfirmarVarias={confirmarVarias}
                onEliminar={eliminarTransaccion}
                onCrearCategoria={crearCategoria}
              />
            </>
          )
        )}

        {activeTab === 'analisis' && (
          <AnalisisPage
            resumen={resumen}
            resumenAnterior={resumenAnterior}
            categorias={categorias}
            desde={desde}
            hasta={hasta}
            esActual={esActual}
            loading={isLoading}
            onVerPendientes={verPendientes}
          />
        )}

        {activeTab === 'ajustes' && (
          <AjustesPage
            categorias={categorias}
            setCategorias={setCategorias}
            diaInicioMes={diaInicioMes}
            setDiaInicioMes={handleSetDiaInicioMes}
            onSessionExpired={onLogout}
            onLogout={onLogout}
          />
        )}
      </main>

      {showHistorico && (
        <HistoricoModal desdeInicial={desde} onClose={() => setShowHistorico(false)} onImportado={reload} />
      )}

      {showCrear && (
        <CrearTransaccionModal categorias={categorias} onCrear={crearTransaccion} onClose={() => setShowCrear(false)} />
      )}

      {activeTab === 'gastos' && (
        <button
          type="button"
          onClick={() => setShowCrear(true)}
          className="fixed right-4 bottom-[calc(5.25rem_+_env(safe-area-inset-bottom))] z-20 flex h-14 w-14 items-center justify-center rounded-full bg-fg text-ink shadow-[0_8px_24px_rgba(0,0,0,0.4)] transition-transform active:scale-95"
          aria-label="Agregar gasto"
        >
          <Plus size={26} strokeWidth={2.25} />
        </button>
      )}

      <BottomNav active={activeTab} onChange={setActiveTab} />
    </div>
  )
}
