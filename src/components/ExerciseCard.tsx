import type { ExerciseWithSets } from '../models/types'

interface Props {
  exerciseWithSets: ExerciseWithSets
  currentSet: number
}

export default function ExerciseCard({ exerciseWithSets, currentSet }: Props) {
  const { exercise, targetSets, targetReps } = exerciseWithSets

  return (
    <div className="rounded-xl bg-slate-900 border border-slate-800 p-4">
      <h2 className="text-xl font-bold text-slate-100">{exercise.name}</h2>
      <div className="flex gap-4 mt-2 text-sm text-slate-400">
        <span>
          Set {currentSet + 1} of {targetSets}
        </span>
        <span>Target: {targetReps} reps</span>
      </div>
      <div className="flex gap-1 mt-3">
        {Array.from({ length: targetSets }, (_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full ${
              i < currentSet ? 'bg-green-500' : i === currentSet ? 'bg-blue-500' : 'bg-slate-700'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
