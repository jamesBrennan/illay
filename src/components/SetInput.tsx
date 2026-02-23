import { useState } from 'react'

interface Props {
  targetReps: number
  previousWeight: number
  onComplete: (weight: number, reps: number) => void
}

export default function SetInput({ targetReps, previousWeight, onComplete }: Props) {
  const [weight, setWeight] = useState(previousWeight.toString())
  const [reps, setReps] = useState(targetReps.toString())

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const w = parseFloat(weight) || 0
    const r = parseInt(reps) || 0
    if (r > 0) {
      onComplete(w, r)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-slate-400 mb-1">Weight (lbs)</label>
          <input
            type="number"
            inputMode="decimal"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-3 text-center text-2xl font-semibold text-slate-100 focus:outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1">Reps</label>
          <input
            type="number"
            inputMode="numeric"
            value={reps}
            onChange={(e) => setReps(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-3 text-center text-2xl font-semibold text-slate-100 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>
      <button
        type="submit"
        className="w-full py-4 rounded-xl bg-green-600 active:bg-green-700 text-white text-lg font-semibold transition-colors"
      >
        Complete Set
      </button>
    </form>
  )
}
