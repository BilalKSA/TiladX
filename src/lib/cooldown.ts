import { useCallback, useEffect, useState } from 'react'

// Mirrors the per-hour caps configured on Supabase Auth: the server is the
// real enforcement, this just stops people burning their allowance by
// mashing the button and gives them a visible countdown instead of a
// rejection.
//
// Backed by localStorage rather than component state so a page refresh can't
// trivially reset it.

const PREFIX = 'tld:cooldown:'

function readUntil(key: string): number {
  const raw = localStorage.getItem(PREFIX + key)
  const until = raw ? Number(raw) : 0
  return Number.isFinite(until) ? until : 0
}

export function useCooldown(key: string, seconds = 60) {
  const [remaining, setRemaining] = useState(0)

  useEffect(() => {
    function tick() {
      const left = Math.max(0, Math.ceil((readUntil(key) - Date.now()) / 1000))
      setRemaining(left)
      if (left === 0) localStorage.removeItem(PREFIX + key)
    }

    tick()
    const timer = setInterval(tick, 1000)
    return () => clearInterval(timer)
  }, [key])

  const start = useCallback(() => {
    localStorage.setItem(PREFIX + key, String(Date.now() + seconds * 1000))
    setRemaining(seconds)
  }, [key, seconds])

  return { remaining, active: remaining > 0, start }
}

/** "٥٩ ثانية" style label for the button while it's cooling down. */
export function cooldownLabel(remaining: number): string {
  return `أعد المحاولة بعد ${remaining} ثانية`
}
