import { formatTime } from '../lib/formatters'

interface Props {
  secondsLeft: number
  onSkip: () => void
}

export default function RestTimer({ secondsLeft, onSkip }: Props) {
  return (
    <div className="flex flex-col items-center gap-6 py-8">
      <p className="text-sm text-slate-400 uppercase tracking-wide">Rest</p>
      <div className="text-7xl font-bold tabular-nums text-slate-100">
        {formatTime(secondsLeft)}
      </div>
      <button
        onClick={onSkip}
        className="px-6 py-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 active:bg-slate-700 transition-colors"
      >
        Skip Rest
      </button>
    </div>
  )
}
