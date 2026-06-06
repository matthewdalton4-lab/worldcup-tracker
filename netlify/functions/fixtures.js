/**
 * Netlify Function: /fixtures
 * Proxies GET requests to API-Football /fixtures.
 * The API key is injected server-side and never exposed to the browser.
 *
 * Query params are forwarded as-is (round, date, team, status, etc.).
 * league and season are always forced to the WC 2026 env values.
 *
 * Cache-Control is set to no-store so that live scores are never served
 * stale from the Netlify CDN.
 */

const API_HOST = process.env.API_FOOTBALL_HOST || 'v3.football.api-sports.io'
const API_KEY  = process.env.API_FOOTBALL_KEY
const LEAGUE   = process.env.WC_LEAGUE_ID || '1'
const SEASON   = process.env.WC_SEASON    || '2026'

const LIVE_STATUSES = new Set(['1H', 'HT', '2H', 'ET', 'BT', 'P', 'SUSP', 'INT', 'LIVE'])

export const handler = async (event) => {
  if (!API_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'API_FOOTBALL_KEY is not configured' }),
    }
  }

  const query = event.queryStringParameters ?? {}

  const params = new URLSearchParams({
    league: LEAGUE,
    season: SEASON,
    // Allow the client to request only live fixtures efficiently
    ...query,
  })

  const url = `https://${API_HOST}/fixtures?${params}`

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

    // Detect if any returned fixture is currently live so the client
    // knows whether it needs to poll.
    const hasLive = (data.response ?? []).some((f) =>
      LIVE_STATUSES.has(f.fixture?.status?.short)
    )

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        // Never cache on CDN — live scores must always hit the function
        'Cache-Control': 'no-store',
        // Expose the hasLive flag so the client can read it cheaply
        'X-Has-Live': String(hasLive),
      },
      body: JSON.stringify({ ...data, hasLive }),
    }
  } catch (err) {
    return {
      statusCode: 502,
      body: JSON.stringify({ error: err.message }),
    }
  }
}
