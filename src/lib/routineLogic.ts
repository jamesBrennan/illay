import type { Routine, ExerciseWithSets, Exercise } from '../models/types'

/**
 * Given how many sessions have been completed for a sequence,
 * return the index of the next routine to perform.
 */
export function getNextRoutineIndex(
  completedCount: number,
  totalRoutines: number,
): number {
  if (totalRoutines <= 0) return 0
  return completedCount % totalRoutines
}

/**
 * Build the exercise list for a session from a routine and exercise lookup.
 */
export function buildExerciseList(
  routine: Routine,
  exerciseMap: Map<string, Exercise>,
): ExerciseWithSets[] {
  return routine.exerciseIds
    .map((id) => {
      const exercise = exerciseMap.get(id)
      if (!exercise) return null
      return {
        exercise,
        targetSets: exercise.defaultSets,
        targetReps: exercise.defaultReps,
      }
    })
    .filter((e): e is ExerciseWithSets => e !== null)
}

/**
 * Advance to the next set/exercise. Returns the new indices,
 * or null if the workout is complete.
 */
export function getNextPosition(
  exerciseIndex: number,
  setIndex: number,
  exerciseList: ExerciseWithSets[],
): { exerciseIndex: number; setIndex: number } | null {
  const current = exerciseList[exerciseIndex]
  if (!current) return null

  const nextSet = setIndex + 1
  if (nextSet < current.targetSets) {
    return { exerciseIndex, setIndex: nextSet }
  }

  const nextExercise = exerciseIndex + 1
  if (nextExercise < exerciseList.length) {
    return { exerciseIndex: nextExercise, setIndex: 0 }
  }

  return null // Workout complete
}

/**
 * Compute total completed sets, reps, and weight from workout sets.
 */
export function computeSessionTotals(sets: { weight: number; reps: number }[]): {
  totalSets: number
  totalReps: number
  totalWeight: number
} {
  return sets.reduce(
    (acc, set) => ({
      totalSets: acc.totalSets + 1,
      totalReps: acc.totalReps + set.reps,
      totalWeight: acc.totalWeight + set.weight * set.reps,
    }),
    { totalSets: 0, totalReps: 0, totalWeight: 0 },
  )
}
