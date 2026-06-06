import { useState, useEffect } from 'react'
import { fetchSquad } from '../utils/api'

/**
 * Fetch squad (players) for a given team.
 * @param {number|string} teamId
 */
export function useSquad(teamId) {
  const [squad, setSquad]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    if (!teamId) return
    let cancelled = false
    setLoading(true)
    setError(null)

    fetchSquad({ team: teamId })
      .then((data) => {
        if (!cancelled) setSquad(data.response?.[0] ?? null)
      })
      .catch((err) => {
        if (!cancelled) setError(err.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [teamId])

  return { squad, loading, error }
}
