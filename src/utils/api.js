/**
 * Thin client for the Netlify Function proxy endpoints.
 * All calls go to /.netlify/functions/* so the API key stays server-side.
 */

const BASE = '/.netlify/functions'

async function get(path, params = {}) {
  const qs = new URLSearchParams(params).toString()
  const url = qs ? `${BASE}${path}?${qs}` : `${BASE}${path}`
  const res = await fetch(url)
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`API error ${res.status}: ${text}`)
  }
  return res.json()
}

// ── Fixtures ────────────────────────────────────────────────
export const fetchFixtures = (params) => get('/fixtures', params)

// ── Group Standings ──────────────────────────────────────────
export const fetchStandings = (params) => get('/standings', params)

// ── Teams list ───────────────────────────────────────────────
export const fetchTeams = () => get('/teams')

// ── Squad ────────────────────────────────────────────────────
export const fetchSquad = (params) => get('/squads', params)

// ── Top Scorers / Assists ────────────────────────────────────
export const fetchTopScorers = (params) => get('/topscorers', params)
export const fetchTopAssists = (params) => get('/topassists', params)

// ── Leaderboard (aggregated) ──────────────────────────────────
export const fetchLeaderboard = () => get('/leaderboard')
