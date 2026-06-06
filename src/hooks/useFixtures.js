import { useState, useEffect, useCallback, useRef } from 'react'
import { fetchFixtures } from '../utils/api'

const LIVE_STATUSES = new Set(['1H', 'HT', '2H', 'ET', 'BT', 'P', 'SUSP', 'INT', 'LIVE'])
const LIVE_POLL_MS  = 60_000 // 60 seconds

function hasLiveFixture(fixtures) {
  return fixtures.some((f) => LIVE_STATUSES.has(f.fixture?.status?.short))
}

/**
 * Fetch all WC 2026 fixtures.
 * - Initial load shows a loading state.
 * - Subsequent auto-refreshes are silent (stale data stays visible).
 * - Auto-refresh every 60 s only while at least one match is live.
 *
 * Returns:
 *   fixtures    - array of API-Football fixture objects
 *   loading     - true only on the very first fetch
 *   error       - error message string or null
 *   hasLive     - true if any fixture is currently in play
 *   lastUpdated - Date of the most recent successful fetch
 */
export function useFixtures() {
  const [fixtures, setFixtures]       = useState([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState(null)
  const [hasLive, setHasLive]         = useState(false)
  const [lastUpdated, setLastUpdated] = useState(null)

  const isFirstFetch = useRef(true)
  const intervalRef  = useRef(null)

  const load = useCallback(async () => {
    // Only show loading spinner on the very first fetch
    if (isFirstFetch.current) setLoading(true)
    setError(null)

    try {
      const data = await fetchFixtures()
      const list = data.response ?? []
      setFixtures(list)
      setHasLive(hasLiveFixture(list))
      setLastUpdated(new Date())
    } catch (err) {
      // On auto-refresh errors, keep the stale data — only surface the error
      // on the first load when there's nothing to show.
      if (isFirstFetch.current) setError(err.message)
    } finally {
      if (isFirstFetch.current) {
        setLoading(false)
        isFirstFetch.current = false
      }
    }
  }, [])

  // Initial fetch
  useEffect(() => {
    load()
  }, [load])

  // Start / stop live-polling based on whether any fixture is live
  useEffect(() => {
    if (hasLive) {
      // Guard against double-registering
      if (intervalRef.current) return
      intervalRef.current = setInterval(load, LIVE_POLL_MS)
    } else {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    return () => {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [hasLive, load])

  return { fixtures, loading, error, hasLive, lastUpdated }
}
