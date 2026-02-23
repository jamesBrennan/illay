import { Link } from 'react-router-dom'
import type { Session } from '../models/types'
import { formatDate, formatDuration } from '../lib/formatters'

interface Props {
  session: Session
  routineName: string
  sequenceName: string
}

export default function SessionCard({ session, routineName, sequenceName }: Props) {
  const duration =
    session.completedAt
      ? formatDuration(session.startedAt, session.completedAt)
      : 'In progress'

  return (
    <Link
      to={`/history/${session.id}`}
      className="block p-4 rounded-xl bg-slate-900 border border-slate-800 active:bg-slate-800 transition-colors"
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-slate-100">{routineName}</h3>
          <p className="text-sm text-slate-400">{sequenceName}</p>
        </div>
        <span className="text-sm text-slate-400">{duration}</span>
      </div>
      <p className="text-xs text-slate-500 mt-2">{formatDate(session.startedAt)}</p>
    </Link>
  )
}
