import { useState, useEffect } from 'react'
import { fetchTopScorers, fetchTopAssists } from '../utils/api'

/**
 * Fetch both top scorers and top assists for WC 2026 in parallel.
 */
export function useTopScorers() {
  const [scorers, setScorers]   = useState([])
  const [assists, setAssists]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    Promise.all([fetchTopScorers(), fetchTopAssists()])
      .then(([scorersData, assistsData]) => {
        if (!cancelled) {
          setScorers(scorersData.response ?? [])
          setAssists(assistsData.response ?? [])
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [])

  return { scorers, assists, loading, error }
}
