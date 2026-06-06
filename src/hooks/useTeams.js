import { useState, useEffect } from 'react'
import { fetchTeams, fetchStandings } from '../utils/api'

/**
 * Fetch all 48 WC 2026 teams.
 *
 * Makes two calls in parallel:
 *   1. /teams  → all registered teams (reliable pre-tournament)
 *   2. /standings → group assignments (available once draw is made)
 *
 * Returns teams sorted alphabetically within each group (A–L).
 * If standings aren't available yet, teams are sorted by name.
 *
 * Each team object:
 *   { id, name, logo, code, country, group }
 */
export function useTeams() {
  const [teams, setTeams]     = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    Promise.all([
      fetchTeams(),
      fetchStandings().catch(() => null), // standings failure is non-fatal
    ])
      .then(([teamsData, standingsData]) => {
        if (cancelled) return

        const teamList = teamsData.response ?? []

        // Build group lookup from standings: teamId → "Group A" etc.
        const groupByTeamId = {}
        const standingsGroups = standingsData?.response?.[0]?.league?.standings ?? []
        for (const group of standingsGroups) {
          for (const entry of group) {
            groupByTeamId[entry.team.id] = entry.group ?? ''
          }
        }

        const mapped = teamList.map(({ team }) => ({
          id:      team.id,
          name:    team.name,
          logo:    team.logo,
          code:    team.code,
          country: team.country,
          group:   groupByTeamId[team.id] ?? '',
        }))

        // Sort by group then name so the grid is predictable
        mapped.sort((a, b) => {
          if (a.group && b.group && a.group !== b.group) {
            return a.group.localeCompare(b.group)
          }
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
