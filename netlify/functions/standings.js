/**
 * Netlify Function: /standings
 * Proxies API-Football /standings for WC 2026.
 *
 * Standings update when a match finishes, so we must never serve stale
 * data from the CDN — Cache-Control is set to no-store.
 *
 * The API-Football response shape:
 *   response[0].league.standings  →  array of 12 group arrays
 *   Each entry has: rank, team, points, goalsDiff, group, form, all, update
 */

const API_HOST = process.env.API_FOOTBALL_HOST || 'v3.football.api-sports.io'
const API_KEY  = process.env.API_FOOTBALL_KEY
const LEAGUE   = process.env.WC_LEAGUE_ID || '1'
const SEASON   = process.env.WC_SEASON    || '2026'

export const handler = async () => {
  if (!API_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'API_FOOTBALL_KEY is not configured' }),
    }
  }

  const url = `https://${API_HOST}/standings?league=${LEAGUE}&season=${SEASON}`

  try {
    const res = await fetch(url, {
      headers: {
        'x-rapidapi-host': API_HOST,
        'x-rapidapi-key': API_KEY,
      },
    })

    if (!res.ok) {
      return {
        statusCode: res.status,
        body: JSON.stringify({ error: `API-Football returned ${res.status}` }),
      }
    }

    const data = await res.json()

    // Pull the standings array out and find the most recent update timestamp
    // across all entries so the client can surface data freshness.
    const groups = data.response?.[0]?.league?.standings ?? []
    let latestUpdate = null
    for (const group of groups) {
      for (const entry of group) {
        if (entry.update && (!latestUpdate || entry.update > latestUpdate)) {
          latestUpdate = entry.update
        }
      }
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
      body: JSON.stringify({ ...data, latestUpdate }),
    }
  } catch (err) {
    return {
      statusCode: 502,
      body: JSON.stringify({ error: err.message }),
    }
  }
}
