import { useReducer, useEffect, useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import { buildExerciseList, getNextPosition } from '../lib/routineLogic'
import type { SessionState, SessionAction, ExerciseWithSets } from '../models/types'
import ExerciseCard from '../components/ExerciseCard'
import SetInput from '../components/SetInput'
import RestTimer from '../components/RestTimer'
import { useRestTimer } from '../hooks/useRestTimer'
import { useAudioAlert } from '../hooks/useAudioAlert'

function sessionReducer(state: SessionState, action: SessionAction): SessionState {
  switch (action.type) {
    case 'COMPLETE_SET':
      return { ...state, phase: 'resting' }
    case 'SKIP_REST':
    case 'REST_FINISHED': {
      const next = getNextPosition(state.exerciseIndex, state.setIndex, state.exerciseList)
      if (!next) return { ...state, phase: 'complete' }
      return {
        ...state,
        exerciseIndex: next.exerciseIndex,
        setIndex: next.setIndex,
        phase: 'recording',
      }
    }
    case 'RESUME':
      return {
        ...state,
        exerciseIndex: action.exerciseIndex,
        setIndex: action.setIndex,
        phase: 'recording',
      }
    default:
      return state
  }
}

export default function SessionPage() {
  const navigate = useNavigate()
  const { init: initAudio, play: playAlert } = useAudioAlert()
  const [previousWeights, setPreviousWeights] = useState<Map<string, number>>(new Map())

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

  const [state, dispatch] = useReducer(sessionReducer, {
    exerciseIndex: 0,
    setIndex: 0,
    phase: 'recording' as const,
    exerciseList: [],
  })

  // Sync exerciseList into state when loaded
  useEffect(() => {
    if (exerciseList.length > 0 && state.exerciseList.length === 0) {
      dispatch({ type: 'RESUME', exerciseIndex: 0, setIndex: 0 })
    }
  }, [exerciseList.length, state.exerciseList.length])

  // Update exerciseList reference in state
  const currentState: SessionState = { ...state, exerciseList }

  // Resume from existing sets
  useEffect(() => {
    if (!session || exerciseList.length === 0) return
    let cancelled = false

    db.workoutSets
      .where('sessionId')
      .equals(session.id)
      .count()
      .then((completedSets) => {
        if (cancelled || completedSets === 0) return
        // Walk through exercises to find resume position
        let remaining = completedSets
        for (let ei = 0; ei < exerciseList.length; ei++) {
          const sets = exerciseList[ei].targetSets
          if (remaining < sets) {
            dispatch({ type: 'RESUME', exerciseIndex: ei, setIndex: remaining })
            return
          }
          remaining -= sets
        }
        // All sets done — mark complete
        dispatch({ type: 'RESUME', exerciseIndex: exerciseList.length - 1, setIndex: exerciseList[exerciseList.length - 1].targetSets - 1 })
      })

    return () => { cancelled = true }
  }, [session?.id, exerciseList.length])

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

  const handleRestFinished = useCallback(() => {
    playAlert()
    dispatch({ type: 'REST_FINISHED' })
  }, [playAlert])

  const { secondsLeft, isRunning, start: startRest, skip: skipRest } = useRestTimer(handleRestFinished)

  // Init audio on first user interaction
  useEffect(() => {
    const handler = () => {
      initAudio()
      window.removeEventListener('touchstart', handler)
      window.removeEventListener('click', handler)
    }
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

    return () => {
      wakeLock?.release()
    }
  }, [])

  async function handleSetComplete(weight: number, reps: number) {
    if (!session) return

    const currentExercise = exerciseList[currentState.exerciseIndex]
    if (!currentExercise) return

    await db.workoutSets.add({
      id: crypto.randomUUID(),
      sessionId: session.id,
      exerciseId: currentExercise.exercise.id,
      orderIndex: currentState.setIndex,
      weight,
      reps,
      completedAt: new Date(),
    })

    // Check if this was the last set of the last exercise
    const next = getNextPosition(currentState.exerciseIndex, currentState.setIndex, exerciseList)
    if (!next) {
      await db.sessions.update(session.id, { completedAt: new Date() })
      dispatch({ type: 'COMPLETE_SET' })
      navigate(`/summary/${session.id}`, { replace: true })
      return
    }

    dispatch({ type: 'COMPLETE_SET' })
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

  const currentExercise = exerciseList[currentState.exerciseIndex] as ExerciseWithSets | undefined
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
        currentSet={currentState.setIndex}
      />

      <div className="mt-6">
        {currentState.phase === 'resting' && isRunning ? (
          <RestTimer secondsLeft={secondsLeft} onSkip={skipRest} />
        ) : (
          <SetInput
            targetReps={currentExercise.targetReps}
            previousWeight={prevWeight}
            onComplete={handleSetComplete}
          />
        )}
      </div>
    </div>
  )
}
