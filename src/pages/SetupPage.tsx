import { useLiveQuery } from 'dexie-react-hooks'
import { useNavigate } from 'react-router-dom'
import { db } from '../db'
import RoutineSelector from '../components/RoutineSelector'

export default function SetupPage() {
  const navigate = useNavigate()
  const sequences = useLiveQuery(() => db.routineSequences.toArray())

  async function handleSelect(id: string) {
    await db.appSettings.put({ id: 1, selectedRoutineSequenceId: id })
    navigate('/')
  }

  if (!sequences) return null

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-slate-100 mt-4">Choose a Program</h1>
      <p className="text-slate-400 mt-1 mb-6">Pick a routine sequence to get started.</p>
      <div className="space-y-3">
        {sequences.map((seq) => (
          <RoutineSelector key={seq.id} sequence={seq} onSelect={handleSelect} />
        ))}
      </div>
    </div>
  )
}
