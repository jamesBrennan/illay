/**
 * Format seconds into MM:SS display.
 */
export function formatTime(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60)
  const secs = totalSeconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

/**
 * Format a duration between two dates as "Xh Ym" or "Xm".
 */
export function formatDuration(start: Date, end: Date): string {
  const ms = end.getTime() - start.getTime()
  const totalMinutes = Math.round(ms / 60000)
  if (totalMinutes < 60) return `${totalMinutes}m`
  const hours = Math.floor(totalMinutes / 60)
  const mins = totalMinutes % 60
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
}

/**
 * Format weight with units. Strips trailing zeroes.
 */
export function formatWeight(weight: number): string {
  if (weight === 0) return 'BW' // Bodyweight
  const formatted = weight % 1 === 0 ? weight.toString() : weight.toFixed(1)
  return `${formatted} lbs`
}

/**
 * Format a date for display in history lists.
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

/**
 * Format a date with time.
 */
export function formatDateTime(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}
