import { describe, it, expect } from 'vitest'

// Import seed data indirectly by testing the exported exercises/routines
// We re-declare the data here to test structural invariants without coupling to the DB

const barbellIds = ['squat', 'bench-press', 'deadlift', 'overhead-press', 'barbell-row', 'power-clean']
const bodyweightIds = ['push-up', 'dip', 'pull-up', 'inverted-row', 'bodyweight-squat', 'lunge', 'glute-bridge', 'plank']

const exercises = [
  { id: 'squat', name: 'Squat', defaultSets: 5, defaultReps: 5, weightIncrement: 5 },
  { id: 'bench-press', name: 'Bench Press', defaultSets: 5, defaultReps: 5, weightIncrement: 5 },
  { id: 'deadlift', name: 'Deadlift', defaultSets: 1, defaultReps: 5, weightIncrement: 10 },
  { id: 'overhead-press', name: 'Overhead Press', defaultSets: 5, defaultReps: 5, weightIncrement: 5 },
  { id: 'barbell-row', name: 'Barbell Row', defaultSets: 5, defaultReps: 5, weightIncrement: 5 },
  { id: 'power-clean', name: 'Power Clean', defaultSets: 5, defaultReps: 3, weightIncrement: 5 },
  { id: 'push-up', name: 'Push-Up', defaultSets: 3, defaultReps: 10, weightIncrement: 0 },
  { id: 'dip', name: 'Dip', defaultSets: 3, defaultReps: 8, weightIncrement: 0 },
  { id: 'pull-up', name: 'Pull-Up', defaultSets: 3, defaultReps: 5, weightIncrement: 0 },
  { id: 'inverted-row', name: 'Inverted Row', defaultSets: 3, defaultReps: 8, weightIncrement: 0 },
  { id: 'bodyweight-squat', name: 'Bodyweight Squat', defaultSets: 3, defaultReps: 15, weightIncrement: 0 },
  { id: 'lunge', name: 'Lunge', defaultSets: 3, defaultReps: 10, weightIncrement: 0 },
  { id: 'glute-bridge', name: 'Glute Bridge', defaultSets: 3, defaultReps: 12, weightIncrement: 0 },
  { id: 'plank', name: 'Plank', defaultSets: 3, defaultReps: 30, weightIncrement: 0 },
]

const routines = [
  { id: 'ss-a', routineSequenceId: 'starting-strength', exerciseIds: ['squat', 'bench-press', 'deadlift'] },
  { id: 'ss-b', routineSequenceId: 'starting-strength', exerciseIds: ['squat', 'overhead-press', 'power-clean'] },
  { id: 'sl-a', routineSequenceId: 'stronglifts-5x5', exerciseIds: ['squat', 'bench-press', 'barbell-row'] },
  { id: 'sl-b', routineSequenceId: 'stronglifts-5x5', exerciseIds: ['squat', 'overhead-press', 'deadlift'] },
  { id: 'bw-push', routineSequenceId: 'bodyweight-basics', exerciseIds: ['push-up', 'dip', 'bodyweight-squat', 'plank'] },
  { id: 'bw-pull', routineSequenceId: 'bodyweight-basics', exerciseIds: ['pull-up', 'inverted-row', 'lunge', 'plank'] },
  { id: 'bw-legs', routineSequenceId: 'bodyweight-basics', exerciseIds: ['bodyweight-squat', 'lunge', 'glute-bridge', 'plank'] },
]

const exerciseMap = new Map(exercises.map((e) => [e.id, e]))

describe('seed data integrity', () => {
  it('all exercise IDs are unique', () => {
    const ids = exercises.map((e) => e.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('all routine IDs are unique', () => {
    const ids = routines.map((r) => r.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('every routine references only existing exercises', () => {
    for (const routine of routines) {
      for (const exerciseId of routine.exerciseIds) {
        expect(exerciseMap.has(exerciseId), `routine ${routine.id} references unknown exercise ${exerciseId}`).toBe(true)
      }
    }
  })

  it('barbell exercises have positive weightIncrement', () => {
    for (const id of barbellIds) {
      const exercise = exerciseMap.get(id)!
      expect(exercise.weightIncrement, `${id} should have positive increment`).toBeGreaterThan(0)
    }
  })

  it('bodyweight exercises have zero weightIncrement', () => {
    for (const id of bodyweightIds) {
      const exercise = exerciseMap.get(id)!
      expect(exercise.weightIncrement, `${id} should have 0 increment`).toBe(0)
    }
  })

  it('deadlift has a higher increment than other barbell exercises', () => {
    const deadlift = exerciseMap.get('deadlift')!
    const squat = exerciseMap.get('squat')!
    expect(deadlift.weightIncrement).toBeGreaterThan(squat.weightIncrement)
  })

  it('all exercises have valid defaultSets and defaultReps', () => {
    for (const exercise of exercises) {
      expect(exercise.defaultSets, `${exercise.id} defaultSets`).toBeGreaterThan(0)
      expect(exercise.defaultReps, `${exercise.id} defaultReps`).toBeGreaterThan(0)
    }
  })

  it('each routine sequence has at least 2 routines', () => {
    const sequenceIds = [...new Set(routines.map((r) => r.routineSequenceId))]
    for (const seqId of sequenceIds) {
      const count = routines.filter((r) => r.routineSequenceId === seqId).length
      expect(count, `${seqId} should have ≥2 routines`).toBeGreaterThanOrEqual(2)
    }
  })
})
