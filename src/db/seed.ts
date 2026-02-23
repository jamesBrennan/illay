import { db } from './index'
import type { Exercise, Routine, RoutineSequence } from '../models/types'

// Exercises

const exercises: Exercise[] = [
  // Barbell
  { id: 'squat', name: 'Squat', defaultSets: 5, defaultReps: 5 },
  { id: 'bench-press', name: 'Bench Press', defaultSets: 5, defaultReps: 5 },
  { id: 'deadlift', name: 'Deadlift', defaultSets: 1, defaultReps: 5 },
  { id: 'overhead-press', name: 'Overhead Press', defaultSets: 5, defaultReps: 5 },
  { id: 'barbell-row', name: 'Barbell Row', defaultSets: 5, defaultReps: 5 },
  { id: 'power-clean', name: 'Power Clean', defaultSets: 5, defaultReps: 3 },
  // Bodyweight
  { id: 'push-up', name: 'Push-Up', defaultSets: 3, defaultReps: 10 },
  { id: 'dip', name: 'Dip', defaultSets: 3, defaultReps: 8 },
  { id: 'pull-up', name: 'Pull-Up', defaultSets: 3, defaultReps: 5 },
  { id: 'inverted-row', name: 'Inverted Row', defaultSets: 3, defaultReps: 8 },
  { id: 'bodyweight-squat', name: 'Bodyweight Squat', defaultSets: 3, defaultReps: 15 },
  { id: 'lunge', name: 'Lunge', defaultSets: 3, defaultReps: 10 },
  { id: 'glute-bridge', name: 'Glute Bridge', defaultSets: 3, defaultReps: 12 },
  { id: 'plank', name: 'Plank', defaultSets: 3, defaultReps: 30 }, // reps = seconds
]

// Routine Sequences

const routineSequences: RoutineSequence[] = [
  {
    id: 'starting-strength',
    name: 'Starting Strength',
    description: 'Classic A/B barbell program. Squat every session, alternate pressing and pulling.',
  },
  {
    id: 'stronglifts-5x5',
    name: 'StrongLifts 5×5',
    description: 'A/B alternating barbell program. Five sets of five on compound lifts.',
  },
  {
    id: 'bodyweight-basics',
    name: 'Bodyweight Basics',
    description: '3-day Push/Pull/Legs rotation. No equipment needed.',
  },
]

// Routines

const routines: Routine[] = [
  // Starting Strength
  {
    id: 'ss-a',
    name: 'Workout A',
    routineSequenceId: 'starting-strength',
    orderIndex: 0,
    exerciseIds: ['squat', 'bench-press', 'deadlift'],
  },
  {
    id: 'ss-b',
    name: 'Workout B',
    routineSequenceId: 'starting-strength',
    orderIndex: 1,
    exerciseIds: ['squat', 'overhead-press', 'power-clean'],
  },
  // StrongLifts 5x5
  {
    id: 'sl-a',
    name: 'Workout A',
    routineSequenceId: 'stronglifts-5x5',
    orderIndex: 0,
    exerciseIds: ['squat', 'bench-press', 'barbell-row'],
  },
  {
    id: 'sl-b',
    name: 'Workout B',
    routineSequenceId: 'stronglifts-5x5',
    orderIndex: 1,
    exerciseIds: ['squat', 'overhead-press', 'deadlift'],
  },
  // Bodyweight Basics
  {
    id: 'bw-push',
    name: 'Push Day',
    routineSequenceId: 'bodyweight-basics',
    orderIndex: 0,
    exerciseIds: ['push-up', 'dip', 'bodyweight-squat', 'plank'],
  },
  {
    id: 'bw-pull',
    name: 'Pull Day',
    routineSequenceId: 'bodyweight-basics',
    orderIndex: 1,
    exerciseIds: ['pull-up', 'inverted-row', 'lunge', 'plank'],
  },
  {
    id: 'bw-legs',
    name: 'Legs Day',
    routineSequenceId: 'bodyweight-basics',
    orderIndex: 2,
    exerciseIds: ['bodyweight-squat', 'lunge', 'glute-bridge', 'plank'],
  },
]

export async function populateSeedData(): Promise<void> {
  const count = await db.exercises.count()
  if (count > 0) return // Already seeded

  await db.transaction('rw', [db.exercises, db.routines, db.routineSequences], async () => {
    await db.exercises.bulkPut(exercises)
    await db.routineSequences.bulkPut(routineSequences)
    await db.routines.bulkPut(routines)
  })
}
