import { describe, it, expect } from 'vitest'
import { formatTime, formatDuration, formatWeight, formatDate, formatDateTime } from './formatters'

describe('formatTime', () => {
  it('formats zero seconds', () => {
    expect(formatTime(0)).toBe('0:00')
  })

  it('formats seconds under a minute', () => {
    expect(formatTime(5)).toBe('0:05')
    expect(formatTime(30)).toBe('0:30')
    expect(formatTime(59)).toBe('0:59')
  })

  it('formats exact minutes', () => {
    expect(formatTime(60)).toBe('1:00')
    expect(formatTime(120)).toBe('2:00')
  })

  it('formats minutes and seconds', () => {
    expect(formatTime(90)).toBe('1:30')
    expect(formatTime(65)).toBe('1:05')
  })

  it('pads single-digit seconds', () => {
    expect(formatTime(61)).toBe('1:01')
    expect(formatTime(9)).toBe('0:09')
  })
})

describe('formatDuration', () => {
  it('formats durations under an hour', () => {
    const start = new Date('2025-01-01T10:00:00')
    const end = new Date('2025-01-01T10:45:00')
    expect(formatDuration(start, end)).toBe('45m')
  })

  it('formats durations of exactly one hour', () => {
    const start = new Date('2025-01-01T10:00:00')
    const end = new Date('2025-01-01T11:00:00')
    expect(formatDuration(start, end)).toBe('1h')
  })

  it('formats durations over an hour', () => {
    const start = new Date('2025-01-01T10:00:00')
    const end = new Date('2025-01-01T11:30:00')
    expect(formatDuration(start, end)).toBe('1h 30m')
  })

  it('formats zero duration', () => {
    const t = new Date('2025-01-01T10:00:00')
    expect(formatDuration(t, t)).toBe('0m')
  })
})

describe('formatWeight', () => {
  it('returns BW for zero weight', () => {
    expect(formatWeight(0)).toBe('BW')
  })

  it('formats whole numbers without decimals', () => {
    expect(formatWeight(135)).toBe('135 lbs')
    expect(formatWeight(45)).toBe('45 lbs')
  })

  it('formats fractional weights with one decimal', () => {
    expect(formatWeight(132.5)).toBe('132.5 lbs')
    expect(formatWeight(2.5)).toBe('2.5 lbs')
  })
})

describe('formatDate', () => {
  it('formats a date with weekday, month, and day', () => {
    const date = new Date('2025-06-15T12:00:00')
    const result = formatDate(date)
    // Should contain day-of-week, month abbreviation, and day number
    expect(result).toMatch(/Sun/)
    expect(result).toMatch(/Jun/)
    expect(result).toMatch(/15/)
  })
})

describe('formatDateTime', () => {
  it('includes time in the output', () => {
    const date = new Date('2025-06-15T14:30:00')
    const result = formatDateTime(date)
    expect(result).toMatch(/Sun/)
    expect(result).toMatch(/Jun/)
    expect(result).toMatch(/15/)
    // Should include time portion
    expect(result).toMatch(/\d{1,2}:\d{2}/)
  })
})
