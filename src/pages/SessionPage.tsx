import { useEffect, useCallback, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import { buildExerciseList, getNextPosition } from '../lib/routineLogic'
import type { ExerciseWithSets } from '../models/types'
import ExerciseCard from '../components/ExerciseCard'
import SetInput from '../components/SetInput'
import RestTimer from '../components/RestTimer'
import { useRestTimer } from '../hooks/useRestTimer'
import { useAudioAlert } from '../hooks/useAudioAlert'

type Phase = 'recording' | 'resting' | 'complete'

export default function SessionPage() {
  const navigate = useNavigate()
  const { init: initAudio, play: playAlert } = useAudioAlert()
  const [previousWeights, setPreviousWeights] = useState<Map<string, number>>(new Map())

  const [exerciseIndex, setExerciseIndex] = useState(0)
  const [setIndex, setSetIndex] = useState(0)
  const [phase, setPhase] = useState<Phase>('recording')
  const [resumed, setResumed] = useState(false)

  // Find the current in-progress session
  const session = useLiveQuery(async () => {
    return db.sessions.filter((s) => !s.completedAt).first()
  })

  // Load routine + exercises for this session
  const sessionData = useLiveQuery(async () => {
    if (!session) return null
    const routine = await db.routines.get(session.routineId)
    if (!routine) return null
    const exercises = await db.exercises.toArray()
    const exerciseMap = new Map(exercises.map((e) => [e.id, e]))
    const exerciseList = buildExerciseList(routine, exerciseMap)
    return { routine, exerciseList }
  }, [session?.id])

  const exerciseList = sessionData?.exerciseList ?? []

  // Resume from existing sets — runs once per session
  const sessionId = session?.id
  useEffect(() => {
    if (!sessionId || exerciseList.length === 0 || resumed) return

    db.workoutSets
      .where('sessionId')
      .equals(sessionId)
      .count()
      .then((completedSets) => {
        if (completedSets === 0) {
          setResumed(true)
          return
        }
        let remaining = completedSets
        for (let ei = 0; ei < exerciseList.length; ei++) {
          const sets = exerciseList[ei].targetSets
          if (remaining < sets) {
            setExerciseIndex(ei)
            setSetIndex(remaining)
            setResumed(true)
            return
          }
          remaining -= sets
        }
        // All sets done
        setExerciseIndex(exerciseList.length - 1)
        setSetIndex(exerciseList[exerciseList.length - 1].targetSets)
        setPhase('complete')
        setResumed(true)
      })
  }, [sessionId, exerciseList.length, resumed])

  // Load previous weights for pre-fill
  useEffect(() => {
    if (!session) return
    let cancelled = false

    db.sessions
      .where('routineSequenceId')
      .equals(session.routineSequenceId)
      .filter((s) => !!s.completedAt && s.id !== session.id)
      .sortBy('startedAt')
      .then(async (sessions) => {
        if (cancelled || sessions.length === 0) return
        const lastSession = sessions[sessions.length - 1]
        const sets = await db.workoutSets
          .where('sessionId')
          .equals(lastSession.id)
          .toArray()
        const weights = new Map<string, number>()
        for (const s of sets) {
          weights.set(s.exerciseId, s.weight)
        }
        if (!cancelled) setPreviousWeights(weights)
      })

    return () => { cancelled = true }
  }, [session?.id, session?.routineSequenceId])

  // Ref to current position for use in callbacks
  const posRef = useRef({ exerciseIndex, setIndex })
  posRef.current = { exerciseIndex, setIndex }

  const advanceToNext = useCallback(() => {
    const next = getNextPosition(posRef.current.exerciseIndex, posRef.current.setIndex, exerciseList)
    if (!next) {
      setPhase('complete')
      return
    }
    setExerciseIndex(next.exerciseIndex)
    setSetIndex(next.setIndex)
    setPhase('recording')
  }, [exerciseList])

  const handleRestFinished = useCallback(() => {
    playAlert()
    advanceToNext()
  }, [playAlert, advanceToNext])

  const { secondsLeft, isRunning, start: startRest, skip: skipRest } = useRestTimer(handleRestFinished)

  // Init audio on first user interaction
  useEffect(() => {
    const handler = () => { initAudio() }
    window.addEventListener('touchstart', handler, { once: true })
    window.addEventListener('click', handler, { once: true })
    return () => {
      window.removeEventListener('touchstart', handler)
      window.removeEventListener('click', handler)
    }
  }, [initAudio])

  // Wake Lock
  useEffect(() => {
    let wakeLock: WakeLockSentinel | null = null

    if ('wakeLock' in navigator) {
      navigator.wakeLock.request('screen').then((wl) => {
        wakeLock = wl
      }).catch(() => {})
    }

    return () => { wakeLock?.release() }
  }, [])

  async function handleSetComplete(weight: number, reps: number) {
    if (!session) return

    const currentExercise = exerciseList[exerciseIndex]
    if (!currentExercise) return

    await db.workoutSets.add({
      id: crypto.randomUUID(),
      sessionId: session.id,
      exerciseId: currentExercise.exercise.id,
      orderIndex: setIndex,
      weight,
      reps,
      completedAt: new Date(),
    })

    // Check if this was the last set of the last exercise
    const next = getNextPosition(exerciseIndex, setIndex, exerciseList)
    if (!next) {
      await db.sessions.update(session.id, { completedAt: new Date() })
      navigate(`/summary/${session.id}`, { replace: true })
      return
    }

    setPhase('resting')
    startRest()
  }

  if (!session || exerciseList.length === 0) {
    return (
      <div className="max-w-md mx-auto pt-12 text-center">
        <p className="text-slate-400">No active session.</p>
        <button
          onClick={() => navigate('/')}
          className="mt-4 text-blue-500"
        >
          Go Home
        </button>
      </div>
    )
  }

  const currentExercise = exerciseList[exerciseIndex] as ExerciseWithSets | undefined
  if (!currentExercise) {
    navigate('/')
    return null
  }

  const prevWeight = previousWeights.get(currentExercise.exercise.id) ?? 0

  return (
    <div className="max-w-md mx-auto pt-2">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-lg font-semibold text-slate-100">
          {sessionData?.routine.name}
        </h1>
        <button
          onClick={async () => {
            await db.sessions.update(session.id, { completedAt: new Date() })
            navigate(`/summary/${session.id}`, { replace: true })
          }}
          className="text-sm text-red-500 active:text-red-400"
        >
          End Early
        </button>
      </div>

      <ExerciseCard
        exerciseWithSets={currentExercise}
        currentSet={setIndex}
      />

      <div className="mt-6">
        {phase === 'resting' && isRunning ? (
          <RestTimer secondsLeft={secondsLeft} onSkip={skipRest} />
        ) : (
          <SetInput
            key={`${exerciseIndex}-${setIndex}`}
            targetReps={currentExercise.targetReps}
            previousWeight={prevWeight}
            onComplete={handleSetComplete}
          />
        )}
      </div>
    </div>
  )
}
