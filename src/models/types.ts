// Planning Domain (seed data, read-only at runtime)

export interface Exercise {
  id: string
  name: string
  defaultSets: number
  defaultReps: number
  weightIncrement: number // lbs to add each session; 0 for bodyweight
}

export interface Routine {
  id: string
  name: string
  routineSequenceId: string
  orderIndex: number
  exerciseIds: string[]
}

export interface RoutineSequence {
  id: string
  name: string
  description: string
}

// Recording Domain (user-generated)

export interface Session {
  id: string
  routineId: string
  routineSequenceId: string
  startedAt: Date
  completedAt?: Date
}

export interface WorkoutSet {
  id: string
  sessionId: string
  exerciseId: string
  orderIndex: number
  weight: number
  reps: number
  completedAt: Date
}

export interface AppSettings {
  id: number // always 1 (singleton)
  selectedRoutineSequenceId?: string
}

// Session page state machine

export type SessionPhase = 'recording' | 'resting' | 'complete'

export interface SessionState {
  exerciseIndex: number
  setIndex: number
  phase: SessionPhase
  exerciseList: ExerciseWithSets[]
}

export interface ExerciseWithSets {
  exercise: Exercise
  targetSets: number
  targetReps: number
}

export type SessionAction =
  | { type: 'COMPLETE_SET' }
  | { type: 'SKIP_REST' }
  | { type: 'REST_FINISHED' }
  | { type: 'RESUME'; exerciseIndex: number; setIndex: number }
