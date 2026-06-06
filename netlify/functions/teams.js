/**
 * Netlify Function: /teams
 * Returns all teams registered for WC 2026 via API-Football /teams endpoint.
 * One call fetches all 48 teams — cached for 24 h since the squad list
 * doesn't change during the tournament (only injury replacements).
 *
 * Response shape per team:
 *   { team: { id, name, code, country, national, logo }, venue: {...} }
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

  const url = `https://${API_HOST}/teams?league=${LEAGUE}&season=${SEASON}`

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

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        // Teams list is stable — cache on CDN for 24 hours
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=3600',
      },
      body: JSON.stringify(data),
    }
  } catch (err) {
    return {
      statusCode: 502,
      body: JSON.stringify({ error: err.message }),
    }
  }
}
