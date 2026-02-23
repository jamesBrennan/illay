import { Routes, Route, Navigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from './db'
import Layout from './components/Layout'
import SetupPage from './pages/SetupPage'
import HomePage from './pages/HomePage'
import SessionPage from './pages/SessionPage'
import SummaryPage from './pages/SummaryPage'
import HistoryPage from './pages/HistoryPage'
import SessionDetailPage from './pages/SessionDetailPage'

function SetupGuard({ children }: { children: React.ReactNode }) {
  const settings = useLiveQuery(() => db.appSettings.get(1))

  // Still loading
  if (settings === undefined) return null

  // No sequence selected — redirect to setup
  if (!settings?.selectedRoutineSequenceId) {
    return <Navigate to="/setup" replace />
  }

  return <>{children}</>
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/setup" element={<SetupPage />} />
        <Route
          path="/"
          element={
            <SetupGuard>
              <HomePage />
            </SetupGuard>
          }
        />
        <Route path="/session" element={<SessionPage />} />
        <Route path="/summary/:id" element={<SummaryPage />} />
        <Route
          path="/history"
          element={
            <SetupGuard>
              <HistoryPage />
            </SetupGuard>
          }
        />
        <Route path="/history/:id" element={<SessionDetailPage />} />
      </Route>
    </Routes>
  )
}
