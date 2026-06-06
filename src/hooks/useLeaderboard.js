import { useState, useEffect } from 'react'
import { fetchLeaderboard } from '../utils/api'

export function useLeaderboard() {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const json = await fetchLeaderboard()
        if (!cancelled) {
          setData(json)
          setError(null)
        }
      } catch (err) {
        if (!cancelled) setError(err.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [])

  return {
    players:      data?.players      ?? [],
    teams:        data?.teams        ?? [],
    fixtureCount: data?.fixtureCount ?? 0,
    cachedAt:     data?.cachedAt     ?? null,
    loading,
    error,
  }
}
