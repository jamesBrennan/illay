import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, fireEvent, cleanup, within } from '@testing-library/react'
import SetInput from './SetInput'

afterEach(cleanup)

function getInputs(container: HTMLElement) {
  const inputs = container.querySelectorAll<HTMLInputElement>('input[type="number"]')
  return { weightInput: inputs[0], repsInput: inputs[1] }
}

describe('SetInput', () => {
  it('pre-fills weight from previousWeight prop', () => {
    const { container } = render(<SetInput targetReps={5} previousWeight={135} onComplete={vi.fn()} />)
    const { weightInput } = getInputs(container)
    expect(weightInput.value).toBe('135')
  })

  it('pre-fills reps from targetReps prop', () => {
    const { container } = render(<SetInput targetReps={5} previousWeight={0} onComplete={vi.fn()} />)
    const { repsInput } = getInputs(container)
    expect(repsInput.value).toBe('5')
  })

  it('calls onComplete with weight and reps on submit', () => {
    const onComplete = vi.fn()
    const { container } = render(<SetInput targetReps={5} previousWeight={135} onComplete={onComplete} />)
    fireEvent.click(within(container).getByText('Complete Set'))
    expect(onComplete).toHaveBeenCalledWith(135, 5)
  })

  it('calls onComplete with updated values after user edits', () => {
    const onComplete = vi.fn()
    const { container } = render(<SetInput targetReps={5} previousWeight={135} onComplete={onComplete} />)
    const { weightInput, repsInput } = getInputs(container)

    fireEvent.change(weightInput, { target: { value: '140' } })
    fireEvent.change(repsInput, { target: { value: '3' } })

    fireEvent.click(within(container).getByText('Complete Set'))
    expect(onComplete).toHaveBeenCalledWith(140, 3)
  })

  it('does not call onComplete when reps is 0', () => {
    const onComplete = vi.fn()
    const { container } = render(<SetInput targetReps={5} previousWeight={135} onComplete={onComplete} />)
    const { repsInput } = getInputs(container)

    fireEvent.change(repsInput, { target: { value: '0' } })

    fireEvent.click(within(container).getByText('Complete Set'))
    expect(onComplete).not.toHaveBeenCalled()
  })

  it('treats empty weight as 0 (bodyweight)', () => {
    const onComplete = vi.fn()
    const { container } = render(<SetInput targetReps={10} previousWeight={0} onComplete={onComplete} />)
    const { weightInput } = getInputs(container)

    fireEvent.change(weightInput, { target: { value: '' } })

    fireEvent.click(within(container).getByText('Complete Set'))
    expect(onComplete).toHaveBeenCalledWith(0, 10)
  })
})
