/**
 * Netlify Function: /topscorers
 * Proxies GET requests to API-Football /players/topscorers endpoint.
 */

const API_HOST = process.env.API_FOOTBALL_HOST || 'v3.football.api-sports.io'
const API_KEY  = process.env.API_FOOTBALL_KEY
const LEAGUE   = process.env.WC_LEAGUE_ID || '1'
const SEASON   = process.env.WC_SEASON    || '2026'

export const handler = async () => {
  if (!API_KEY) {
    return { statusCode: 500, body: JSON.stringify({ error: 'API key not configured' }) }
  }

  const url = `https://${API_HOST}/players/topscorers?league=${LEAGUE}&season=${SEASON}`

  try {
    const res = await fetch(url, {
      headers: {
        'x-rapidapi-host': API_HOST,
        'x-rapidapi-key': API_KEY,
      },
    })
    const data = await res.json()
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }
  } catch (err) {
    return { statusCode: 502, body: JSON.stringify({ error: err.message }) }
  }
}
