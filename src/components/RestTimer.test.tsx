import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, fireEvent, cleanup } from '@testing-library/react'
import RestTimer from './RestTimer'

afterEach(cleanup)

describe('RestTimer', () => {
  it('displays formatted time', () => {
    const { getByText } = render(<RestTimer secondsLeft={90} onSkip={vi.fn()} />)
    expect(getByText('1:30')).toBeInTheDocument()
  })

  it('displays zero time correctly', () => {
    const { getByText } = render(<RestTimer secondsLeft={0} onSkip={vi.fn()} />)
    expect(getByText('0:00')).toBeInTheDocument()
  })

  it('shows the Rest label', () => {
    const { getByText } = render(<RestTimer secondsLeft={60} onSkip={vi.fn()} />)
    expect(getByText('Rest')).toBeInTheDocument()
  })

  it('calls onSkip when Skip Rest is clicked', () => {
    const onSkip = vi.fn()
    const { getByText } = render(<RestTimer secondsLeft={60} onSkip={onSkip} />)
    fireEvent.click(getByText('Skip Rest'))
    expect(onSkip).toHaveBeenCalledOnce()
  })
})
