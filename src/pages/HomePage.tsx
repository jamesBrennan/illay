import { useNavigate } from 'react-router-dom'
import { db } from '../db'
import { useNextRoutine } from '../hooks/useNextRoutine'

export default function HomePage() {
  const navigate = useNavigate()
  const { routine, sequence, loading, inProgressSessionId } = useNextRoutine()

  async function handleStartSession() {
    if (!routine || !sequence) return

    if (inProgressSessionId) {
      navigate('/session')
      return
    }

    const id = crypto.randomUUID()
    await db.sessions.add({
      id,
      routineId: routine.id,
      routineSequenceId: sequence.id,
      startedAt: new Date(),
    })
    navigate('/session')
  }

  if (loading) return null

  if (!routine || !sequence) {
    navigate('/setup', { replace: true })
    return null
  }

  return (
    <div className="max-w-md mx-auto flex flex-col items-center pt-12">
      <p className="text-sm text-slate-400 uppercase tracking-wide">{sequence.name}</p>
      <h1 className="text-3xl font-bold text-slate-100 mt-2">{routine.name}</h1>
      <p className="text-slate-400 mt-1">Up next</p>

      <button
        onClick={handleStartSession}
        className="mt-10 w-full py-5 rounded-2xl bg-blue-600 active:bg-blue-700 text-white text-xl font-semibold transition-colors"
      >
        {inProgressSessionId ? 'Resume Session' : 'Start Session'}
      </button>

      <button
        onClick={() => navigate('/setup')}
        className="mt-4 text-sm text-slate-500 active:text-slate-300"
      >
        Change program
      </button>
    </div>
  )
}
