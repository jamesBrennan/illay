import { describe, it, expect, afterEach } from 'vitest'
import { render, cleanup } from '@testing-library/react'
import ExerciseCard from './ExerciseCard'
import type { ExerciseWithSets } from '../models/types'

afterEach(cleanup)

const makeExercise = (overrides?: Partial<ExerciseWithSets>): ExerciseWithSets => ({
  exercise: { id: 'squat', name: 'Squat', defaultSets: 5, defaultReps: 5, weightIncrement: 5 },
  targetSets: 5,
  targetReps: 5,
  ...overrides,
})

describe('ExerciseCard', () => {
  it('displays the exercise name', () => {
    const { getByText } = render(<ExerciseCard exerciseWithSets={makeExercise()} currentSet={0} />)
    expect(getByText('Squat')).toBeInTheDocument()
  })

  it('shows the current set number (1-indexed)', () => {
    const { container } = render(<ExerciseCard exerciseWithSets={makeExercise()} currentSet={0} />)
    expect(container.textContent).toContain('Set 1 of 5')
  })

  it('shows correct set on later sets', () => {
    const { container } = render(<ExerciseCard exerciseWithSets={makeExercise()} currentSet={3} />)
    expect(container.textContent).toContain('Set 4 of 5')
  })

  it('shows target reps', () => {
    const { container } = render(<ExerciseCard exerciseWithSets={makeExercise()} currentSet={0} />)
    expect(container.textContent).toContain('Target: 5 reps')
  })

  it('renders correct number of progress segments', () => {
    const { container } = render(
      <ExerciseCard exerciseWithSets={makeExercise({ targetSets: 3 })} currentSet={1} />,
    )
    const segments = container.querySelectorAll('.rounded-full')
    expect(segments).toHaveLength(3)
  })

  it('marks completed sets with green, current with blue, future with gray', () => {
    const { container } = render(
      <ExerciseCard exerciseWithSets={makeExercise({ targetSets: 3 })} currentSet={1} />,
    )
    const segments = container.querySelectorAll('.rounded-full')
    expect(segments[0].className).toContain('bg-green-500')
    expect(segments[1].className).toContain('bg-blue-500')
    expect(segments[2].className).toContain('bg-slate-700')
  })
})
