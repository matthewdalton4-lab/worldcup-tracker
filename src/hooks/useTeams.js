import { useState, useEffect } from 'react'
import { fetchStandings } from '../utils/api'

/**
 * Derives all 48 WC teams directly from the standings response,
 * which includes team id, name, logo, and group — no /teams endpoint needed.
 */
export function useTeams() {
  const [teams, setTeams]     = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    fetchStandings()
      .then((data) => {
        if (cancelled) return

        const standingsGroups = data?.response?.[0]?.league?.standings ?? []

        const mapped = []
        for (const group of standingsGroups) {
          for (const entry of group) {
            mapped.push({
              id:    entry.team.id,
              name:  entry.team.name,
              logo:  entry.team.logo,
              group: entry.group ?? '',
            })
          }
        }

        // Sort by group label (Group A, Group B…) then alphabetically
        mapped.sort((a, b) => {
          if (a.group !== b.group) return a.group.localeCompare(b.group)
          return a.name.localeCompare(b.name)
        })

        setTeams(mapped)
      })
      .catch((err) => {
        if (!cancelled) setError(err.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [])

  return { teams, loading, error }
}
