import type { RoutineSequence } from '../models/types'

interface Props {
  sequence: RoutineSequence
  onSelect: (id: string) => void
}

export default function RoutineSelector({ sequence, onSelect }: Props) {
  return (
    <button
      onClick={() => onSelect(sequence.id)}
      className="w-full text-left p-4 rounded-xl bg-slate-900 border border-slate-800 active:bg-slate-800 transition-colors"
    >
      <h3 className="text-lg font-semibold text-slate-100">{sequence.name}</h3>
      <p className="text-sm text-slate-400 mt-1">{sequence.description}</p>
    </button>
  )
}
