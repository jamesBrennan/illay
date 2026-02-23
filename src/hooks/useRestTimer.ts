import { useState, useEffect, useCallback, useRef } from 'react'

const REST_DURATION = 90 // seconds

export function useRestTimer(onComplete: () => void) {
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  useEffect(() => {
    if (!isRunning) return
    if (secondsLeft <= 0) {
      setIsRunning(false)
      onCompleteRef.current()
      return
    }

    const id = setInterval(() => {
      setSecondsLeft((s) => s - 1)
    }, 1000)

    return () => clearInterval(id)
  }, [isRunning, secondsLeft])

  const start = useCallback(() => {
    setSecondsLeft(REST_DURATION)
    setIsRunning(true)
  }, [])

  const skip = useCallback(() => {
    setSecondsLeft(0)
    setIsRunning(false)
    onCompleteRef.current()
  }, [])

  return { secondsLeft, isRunning, start, skip }
}
