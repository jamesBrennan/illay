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
    this.version(2).stores({}).upgrade((tx) => {
      const barbellIncrements: Record<string, number> = {
        squat: 5,
        'bench-press': 5,
        deadlift: 10,
        'overhead-press': 5,
        'barbell-row': 5,
        'power-clean': 5,
      }
      return tx.table('exercises').toCollection().modify((exercise: Record<string, unknown>) => {
        exercise.weightIncrement = barbellIncrements[exercise.id as string] ?? 0
      })
    })
  }
}

export const db = new IllayDB()
