import { useRef, useCallback } from 'react'

export function useAudioAlert() {
  const audioContextRef = useRef<AudioContext | null>(null)
  const bufferRef = useRef<AudioBuffer | null>(null)

  const init = useCallback(async () => {
    if (audioContextRef.current) return
    const ctx = new AudioContext()
    audioContextRef.current = ctx

    try {
      const response = await fetch('/sounds/alert.wav')
      const arrayBuffer = await response.arrayBuffer()
      bufferRef.current = await ctx.decodeAudioData(arrayBuffer)
    } catch {
      // Audio not critical — fail silently
    }
  }, [])

  const play = useCallback(() => {
    const ctx = audioContextRef.current
    const buffer = bufferRef.current
    if (!ctx || !buffer) return

    if (ctx.state === 'suspended') {
      ctx.resume()
    }

    const source = ctx.createBufferSource()
    source.buffer = buffer
    source.connect(ctx.destination)
    source.start()
  }, [])

  return { init, play }
}
