import { useState, useEffect, useCallback, useRef } from 'react'
import { fetchStandings } from '../utils/api'

// Standings change when a match finishes. Poll every 5 minutes so the page
// stays current throughout a matchday without hammering the API.
const POLL_MS = 5 * 60 * 1000

/**
 * Fetch all 12 WC 2026 group standings.
 *
 * - Initial load shows a loading state.
 * - Background refreshes every 5 minutes are silent (stale data stays visible).
 * - `refresh()` triggers an immediate silent re-fetch (e.g. from a button).
 *
 * Returns:
 *   groups       - array of 12 group arrays (API-Football shape)
 *   loading      - true only on the very first fetch
 *   error        - error string or null
 *   lastUpdated  - Date of the most recent successful fetch from our function
 *   dataUpdated  - ISO string from API-Football's own `update` field (when data changed upstream)
 *   refresh      - call to force an immediate re-fetch
 */
export function useStandings() {
  const [groups, setGroups]           = useState([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [dataUpdated, setDataUpdated] = useState(null)

  const isFirstFetch = useRef(true)
  const intervalRef  = useRef(null)

  const load = useCallback(async () => {
    if (isFirstFetch.current) setLoading(true)
    setError(null)

    try {
      const data = await fetchStandings()
      // API-Football nests standings under response[0].league.standings
      const raw = data.response?.[0]?.league?.standings ?? []
      setGroups(raw)
      setLastUpdated(new Date())
      if (data.latestUpdate) setDataUpdated(data.latestUpdate)
    } catch (err) {
      if (isFirstFetch.current) setError(err.message)
      // On background refresh errors, keep stale data — don't surface error
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

  // 5-minute background poll
  useEffect(() => {
    intervalRef.current = setInterval(load, POLL_MS)
    return () => clearInterval(intervalRef.current)
  }, [load])

  return { groups, loading, error, lastUpdated, dataUpdated, refresh: load }
}
