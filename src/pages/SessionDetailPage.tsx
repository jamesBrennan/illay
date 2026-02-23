import { useParams, useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import { computeSessionTotals } from '../lib/routineLogic'
import { formatDate, formatDuration, formatWeight } from '../lib/formatters'

export default function SessionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const data = useLiveQuery(async () => {
    if (!id) return null
    const session = await db.sessions.get(id)
    if (!session) return null

    const routine = await db.routines.get(session.routineId)
    const sequence = await db.routineSequences.get(session.routineSequenceId)
    const sets = await db.workoutSets.where('sessionId').equals(id).sortBy('completedAt')
    const totals = computeSessionTotals(sets)

    const exercises = await db.exercises.toArray()
    const exerciseMap = new Map(exercises.map((e) => [e.id, e]))

    const exerciseGroups: { name: string; sets: typeof sets }[] = []
    const seen = new Map<string, number>()
    for (const set of sets) {
      const idx = seen.get(set.exerciseId)
      if (idx !== undefined) {
        exerciseGroups[idx].sets.push(set)
      } else {
        seen.set(set.exerciseId, exerciseGroups.length)
        exerciseGroups.push({
          name: exerciseMap.get(set.exerciseId)?.name ?? set.exerciseId,
          sets: [set],
        })
      }
    }

    return { session, routine, sequence, totals, exerciseGroups }
  }, [id])

  if (!data) return null

  const { session, routine, sequence, totals, exerciseGroups } = data
  const duration =
    session.completedAt
      ? formatDuration(session.startedAt, session.completedAt)
      : '—'

  return (
    <div className="max-w-md mx-auto pt-4">
      <button
        onClick={() => navigate('/history')}
        className="text-sm text-blue-500 active:text-blue-400 mb-4 inline-block"
      >
        &larr; History
      </button>

      <h1 className="text-2xl font-bold text-slate-100">
        {routine?.name}
      </h1>
      <p className="text-slate-400 mt-1">
        {sequence?.name} &middot; {formatDate(session.startedAt)}
      </p>

      <div className="grid grid-cols-3 gap-3 mt-4">
        <div className="rounded-xl bg-slate-900 border border-slate-800 p-3 text-center">
          <p className="text-xs text-slate-400">Duration</p>
          <p className="text-lg font-bold text-slate-100 mt-0.5">{duration}</p>
        </div>
        <div className="rounded-xl bg-slate-900 border border-slate-800 p-3 text-center">
          <p className="text-xs text-slate-400">Sets</p>
          <p className="text-lg font-bold text-slate-100 mt-0.5">{totals.totalSets}</p>
        </div>
        <div className="rounded-xl bg-slate-900 border border-slate-800 p-3 text-center">
          <p className="text-xs text-slate-400">Volume</p>
          <p className="text-lg font-bold text-slate-100 mt-0.5">{formatWeight(totals.totalWeight)}</p>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {exerciseGroups.map((group) => (
          <div key={group.name} className="rounded-xl bg-slate-900 border border-slate-800 p-4">
            <h3 className="font-semibold text-slate-100 mb-2">{group.name}</h3>
            <div className="space-y-1">
              {group.sets.map((set, i) => (
                <div key={set.id} className="flex justify-between text-sm text-slate-400">
                  <span>Set {i + 1}</span>
                  <span>
                    {formatWeight(set.weight)} × {set.reps}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
