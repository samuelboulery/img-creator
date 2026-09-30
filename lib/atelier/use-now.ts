'use client'

import { useEffect, useState } from 'react'

/** Horloge à la seconde, active seulement quand quelque chose tourne. */
export function useNow(active: boolean): number {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    if (!active) return
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [active])
  return now
}

export function elapsedSeconds(now: number, startedAt: number): number {
  return Math.max(0, Math.round((now - startedAt) / 1000))
}
