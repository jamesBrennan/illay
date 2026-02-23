import { describe, it, expect } from 'vitest'
import {
  getNextRoutineIndex,
  getNextPosition,
  computeSessionTotals,
  buildExerciseList,
  buildPreviousWeights,
} from './routineLogic'
import type { Exercise, Routine, ExerciseWithSets } from '../models/types'

describe('getNextRoutineIndex', () => {
  it('returns 0 when no sessions completed', () => {
    expect(getNextRoutineIndex(0, 2)).toBe(0)
  })

  it('cycles through routines', () => {
    expect(getNextRoutineIndex(0, 3)).toBe(0)
    expect(getNextRoutineIndex(1, 3)).toBe(1)
    expect(getNextRoutineIndex(2, 3)).toBe(2)
    expect(getNextRoutineIndex(3, 3)).toBe(0)
    expect(getNextRoutineIndex(4, 3)).toBe(1)
  })

  it('handles single routine', () => {
    expect(getNextRoutineIndex(5, 1)).toBe(0)
  })

  it('handles zero total routines', () => {
    expect(getNextRoutineIndex(0, 0)).toBe(0)
  })
})

describe('getNextPosition', () => {
  const exerciseList: ExerciseWithSets[] = [
    {
      exercise: { id: 'a', name: 'A', defaultSets: 3, defaultReps: 5, weightIncrement: 5 },
      targetSets: 3,
      targetReps: 5,
    },
    {
      exercise: { id: 'b', name: 'B', defaultSets: 2, defaultReps: 8, weightIncrement: 5 },
      targetSets: 2,
      targetReps: 8,
    },
  ]

  it('advances to next set in same exercise', () => {
    expect(getNextPosition(0, 0, exerciseList)).toEqual({ exerciseIndex: 0, setIndex: 1 })
    expect(getNextPosition(0, 1, exerciseList)).toEqual({ exerciseIndex: 0, setIndex: 2 })
  })

  it('advances to next exercise when sets complete', () => {
    expect(getNextPosition(0, 2, exerciseList)).toEqual({ exerciseIndex: 1, setIndex: 0 })
  })

  it('returns null when workout complete', () => {
    expect(getNextPosition(1, 1, exerciseList)).toBeNull()
  })
})

describe('computeSessionTotals', () => {
  it('computes totals correctly', () => {
    const sets = [
      { weight: 135, reps: 5 },
      { weight: 135, reps: 5 },
      { weight: 0, reps: 10 },
    ]
    expect(computeSessionTotals(sets)).toEqual({
      totalSets: 3,
      totalReps: 20,
      totalWeight: 1350,
    })
  })

  it('handles empty sets', () => {
    expect(computeSessionTotals([])).toEqual({
      totalSets: 0,
      totalReps: 0,
      totalWeight: 0,
    })
  })
})

describe('buildExerciseList', () => {
  it('builds list from routine and exercise map', () => {
    const exercises: Exercise[] = [
      { id: 'squat', name: 'Squat', defaultSets: 5, defaultReps: 5, weightIncrement: 5 },
      { id: 'bench', name: 'Bench', defaultSets: 5, defaultReps: 5, weightIncrement: 5 },
    ]
    const routine: Routine = {
      id: 'r1',
      name: 'A',
      routineSequenceId: 's1',
      orderIndex: 0,
      exerciseIds: ['squat', 'bench'],
    }
    const map = new Map(exercises.map((e) => [e.id, e]))
    const result = buildExerciseList(routine, map)
    expect(result).toHaveLength(2)
    expect(result[0].exercise.name).toBe('Squat')
    expect(result[1].exercise.name).toBe('Bench')
  })

  it('skips missing exercises', () => {
    const routine: Routine = {
      id: 'r1',
      name: 'A',
      routineSequenceId: 's1',
      orderIndex: 0,
      exerciseIds: ['squat', 'missing'],
    }
    const map = new Map([['squat', { id: 'squat', name: 'Squat', defaultSets: 5, defaultReps: 5, weightIncrement: 5 }]])
    const result = buildExerciseList(routine, map)
    expect(result).toHaveLength(1)
  })
})

describe('buildPreviousWeights', () => {
  const increments = new Map([
    ['squat', 5],
    ['bench-press', 5],
    ['overhead-press', 5],
    ['deadlift', 10],
    ['push-up', 0],
  ])

  it('returns empty map when no sessions', () => {
    expect(buildPreviousWeights([], increments)).toEqual(new Map())
  })

  it('applies increment to last session weight', () => {
    const result = buildPreviousWeights([
      {
        startedAt: new Date('2025-01-01'),
        sets: [{ exerciseId: 'squat', weight: 135 }],
      },
    ], increments)
    expect(result.get('squat')).toBe(140) // 135 + 5
  })

  it('uses most recent session per exercise across different workouts', () => {
    // Simulates StrongLifts: Workout A (squat+bench), then Workout B (squat+OHP)
    const result = buildPreviousWeights([
      {
        startedAt: new Date('2025-01-01'),
        sets: [
          { exerciseId: 'squat', weight: 60 },
          { exerciseId: 'bench-press', weight: 50 },
        ],
      },
      {
        startedAt: new Date('2025-01-03'),
        sets: [
          { exerciseId: 'squat', weight: 65 },
          { exerciseId: 'overhead-press', weight: 40 },
        ],
      },
    ], increments)

    // Squat: most recent is 65 (from Jan 3) + 5 = 70
    expect(result.get('squat')).toBe(70)
    // Bench: most recent is 50 (from Jan 1) + 5 = 55
    expect(result.get('bench-press')).toBe(55)
    // OHP: most recent is 40 (from Jan 3) + 5 = 45
    expect(result.get('overhead-press')).toBe(45)
  })

  it('does not increment bodyweight exercises', () => {
    const result = buildPreviousWeights([
      {
        startedAt: new Date('2025-01-01'),
        sets: [{ exerciseId: 'push-up', weight: 0 }],
      },
    ], increments)
    expect(result.get('push-up')).toBe(0)
  })

  it('applies correct increment per exercise (deadlift gets +10)', () => {
    const result = buildPreviousWeights([
      {
        startedAt: new Date('2025-01-01'),
        sets: [
          { exerciseId: 'squat', weight: 100 },
          { exerciseId: 'deadlift', weight: 150 },
        ],
      },
    ], increments)
    expect(result.get('squat')).toBe(105)    // +5
    expect(result.get('deadlift')).toBe(160) // +10
  })

  it('takes the later weight when same exercise appears in multiple sessions', () => {
    // User squatted 100 in Workout A, then 105 in Workout B
    const result = buildPreviousWeights([
      {
        startedAt: new Date('2025-01-01'),
        sets: [{ exerciseId: 'squat', weight: 100 }],
      },
      {
        startedAt: new Date('2025-01-03'),
        sets: [{ exerciseId: 'squat', weight: 105 }],
      },
    ], increments)
    // Should use 105 (Jan 3), not 100 (Jan 1)
    expect(result.get('squat')).toBe(110) // 105 + 5
  })
})
