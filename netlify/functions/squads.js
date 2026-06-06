/**
 * Netlify Function: /squads
 * Returns the squad for a single WC 2026 team.
 *
 * Primary call:  /players/squads?team={id}
 *   → players[].{ id, name, age, number, position, photo }
 *   Note: club affiliation is NOT in this endpoint.
 *
 * Enrichment call: /players?team={id}&season={season}&league={league}
 *   → full player objects including statistics per competition.
 *   We scan statistics[] to find the player's club team (any entry
 *   whose league.type === "League" is their domestic club competition).
 *   This is one extra API call but keeps the browser to a single round-trip.
 *
 * Cached for 6 hours — squads only change on emergency injury replacements.
 *
 * Required query param: team (team ID)
 */

const API_HOST = process.env.API_FOOTBALL_HOST || 'v3.football.api-sports.io'
const API_KEY  = process.env.API_FOOTBALL_KEY
const LEAGUE   = process.env.WC_LEAGUE_ID || '1'
const SEASON   = process.env.WC_SEASON    || '2026'

async function apiFetch(url) {
  const res = await fetch(url, {
    headers: {
      'x-rapidapi-host': API_HOST,
      'x-rapidapi-key': API_KEY,
    },
  })
  if (!res.ok) throw new Error(`API-Football ${res.status}`)
  return res.json()
}

export const handler = async (event) => {
  if (!API_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'API_FOOTBALL_KEY is not configured' }),
    }
  }

  const { team } = event.queryStringParameters ?? {}
  if (!team) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing required param: team' }),
    }
  }

  try {
    // ── Primary: squad list ───────────────────────────────────
    const squadData = await apiFetch(
      `https://${API_HOST}/players/squads?team=${team}`
    )

    const squadEntry = squadData.response?.[0]
    if (!squadEntry) {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
        body: JSON.stringify({ response: [] }),
      }
    }

    const players = squadEntry.players ?? []

    // ── Enrichment: player details with club ─────────────────
    // Fetch page 1 of /players for this team/season. For squads of ~26
    // players the API returns up to 20 per page, so we may need page 2.
    let playerDetails = []
    try {
      const p1 = await apiFetch(
        `https://${API_HOST}/players?team=${team}&season=${SEASON}&league=${LEAGUE}&page=1`
      )
      playerDetails = p1.response ?? []

      // Fetch remaining pages if any
      const totalPages = p1.paging?.total ?? 1
      if (totalPages > 1) {
        const rest = await Promise.all(
          Array.from({ length: totalPages - 1 }, (_, i) =>
            apiFetch(
              `https://${API_HOST}/players?team=${team}&season=${SEASON}&league=${LEAGUE}&page=${i + 2}`
            ).then((d) => d.response ?? [])
          )
        )
        playerDetails = playerDetails.concat(...rest)
      }
    } catch {
      // Enrichment is best-effort — squad list still returned without club
    }

    // Build a lookup: player id → club name (from domestic league statistics)
    const clubById = {}
    for (const entry of playerDetails) {
      const pid = entry.player?.id
      if (!pid) continue
      // Find a statistics entry whose league type is "League" (domestic club)
      const clubStat = entry.statistics?.find(
        (s) => s.league?.type === 'League' || s.league?.type === 'Cup'
      )
      if (clubStat?.team?.name) {
        clubById[pid] = clubStat.team.name
      }
    }

    // Merge club into each player
    const enrichedPlayers = players.map((p) => ({
      ...p,
      club: clubById[p.id] ?? null,
    }))

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        // Squads change rarely — 6 hour CDN cache
        'Cache-Control': 'public, max-age=21600, stale-while-revalidate=3600',
      },
      body: JSON.stringify({
        response: [{ team: squadEntry.team, players: enrichedPlayers }],
      }),
    }
  } catch (err) {
    return {
      statusCode: 502,
      body: JSON.stringify({ error: err.message }),
    }
  }
}
