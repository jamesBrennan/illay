import Dexie, { type Table } from 'dexie'
import type {
  Exercise,
  Routine,
  RoutineSequence,
  Session,
  WorkoutSet,
  AppSettings,
} from '../models/types'

export class IllayDB extends Dexie {
  exercises!: Table<Exercise, string>
  routines!: Table<Routine, string>
  routineSequences!: Table<RoutineSequence, string>
  sessions!: Table<Session, string>
  workoutSets!: Table<WorkoutSet, string>
  appSettings!: Table<AppSettings, number>

  constructor() {
    super('illay')
    this.version(1).stores({
      exercises: 'id, name',
      routines: 'id, routineSequenceId, orderIndex',
      routineSequences: 'id',
      sessions: 'id, routineId, routineSequenceId, startedAt',
      workoutSets: 'id, sessionId, exerciseId',
      appSettings: 'id',
    })
  }
}

export const db = new IllayDB()
