import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import { getNextRoutineIndex } from '../lib/routineLogic'
import type { Routine, RoutineSequence } from '../models/types'

interface NextRoutineResult {
  routine: Routine | null
  sequence: RoutineSequence | null
  loading: boolean
  inProgressSessionId: string | null
}

export function useNextRoutine(): NextRoutineResult {
  const result = useLiveQuery(async () => {
    const settings = await db.appSettings.get(1)
    if (!settings?.selectedRoutineSequenceId) {
      return { routine: null, sequence: null, inProgressSessionId: null }
    }

    const sequenceId = settings.selectedRoutineSequenceId
    const sequence = await db.routineSequences.get(sequenceId)
    if (!sequence) {
      return { routine: null, sequence: null, inProgressSessionId: null }
    }

    // Check for in-progress session
    const inProgress = await db.sessions
      .where('routineSequenceId')
      .equals(sequenceId)
      .filter((s) => !s.completedAt)
      .first()

    if (inProgress) {
      const routine = await db.routines.get(inProgress.routineId)
      return {
        routine: routine ?? null,
        sequence,
        inProgressSessionId: inProgress.id,
      }
    }

    // Compute next routine
    const completedCount = await db.sessions
      .where('routineSequenceId')
      .equals(sequenceId)
      .filter((s) => !!s.completedAt)
      .count()

    const routines = await db.routines
      .where('routineSequenceId')
      .equals(sequenceId)
      .sortBy('orderIndex')

    const nextIndex = getNextRoutineIndex(completedCount, routines.length)
    const routine = routines[nextIndex] ?? null

    return { routine, sequence, inProgressSessionId: null }
  })

  return {
    routine: result?.routine ?? null,
    sequence: result?.sequence ?? null,
    loading: result === undefined,
    inProgressSessionId: result?.inProgressSessionId ?? null,
  }
}
