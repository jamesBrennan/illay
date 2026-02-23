import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import SessionCard from '../components/SessionCard'

export default function HistoryPage() {
  const data = useLiveQuery(async () => {
    const sessions = await db.sessions
      .filter((s) => !!s.completedAt)
      .reverse()
      .sortBy('startedAt')

    // Sort descending by startedAt
    sessions.sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime())

    const routines = await db.routines.toArray()
    const routineMap = new Map(routines.map((r) => [r.id, r]))
    const sequences = await db.routineSequences.toArray()
    const sequenceMap = new Map(sequences.map((s) => [s.id, s]))

    return sessions.map((session) => ({
      session,
      routineName: routineMap.get(session.routineId)?.name ?? 'Unknown',
      sequenceName: sequenceMap.get(session.routineSequenceId)?.name ?? 'Unknown',
    }))
  })

  if (!data) return null

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-slate-100 mt-4 mb-4">History</h1>
      {data.length === 0 ? (
        <p className="text-slate-400 text-center mt-12">
          No completed sessions yet. Start your first workout!
        </p>
      ) : (
        <div className="space-y-3">
          {data.map(({ session, routineName, sequenceName }) => (
            <SessionCard
              key={session.id}
              session={session}
              routineName={routineName}
              sequenceName={sequenceName}
            />
          ))}
        </div>
      )}
    </div>
  )
}
