/**
 * Netlify Function: /leaderboard
 *
 * Fetches all completed WC2026 fixtures, then aggregates:
 *  - Player stats: goals, assists, yellow cards, red cards (from /fixtures/events)
 *  - Team stats: goals scored/conceded, clean sheets, yellow cards, red cards,
 *    fouls (from fixture scores + /fixtures/statistics)
 *
 * Results are cached in-memory for 5 minutes to avoid burning API quota.
 */

const API_HOST = process.env.API_FOOTBALL_HOST || 'v3.football.api-sports.io'
const API_KEY  = process.env.API_FOOTBALL_KEY
const LEAGUE   = process.env.WC_LEAGUE_ID || '1'
const SEASON   = process.env.WC_SEASON    || '2026'

const CACHE_TTL = 5 * 60 * 1000 // 5 minutes
let cache = null
let cacheAt = 0

// Statuses that count as a completed result
const FINISHED = new Set(['FT', 'AET', 'PEN'])

async function apiFetch(path) {
  const url = `https://${API_HOST}${path}`
  const res = await fetch(url, {
    headers: {
      'x-rapidapi-host': API_HOST,
      'x-rapidapi-key': API_KEY,
    },
  })
  if (!res.ok) throw new Error(`API ${res.status} for ${path}`)
  const data = await res.json()
  return data.response ?? []
}

// Run promises in batches to avoid hammering the API rate limit
async function batchAll(items, fn, batchSize = 10) {
  const results = []
  for (let i = 0; i < items.length; i += batchSize) {
    const chunk = items.slice(i, i + batchSize)
    const chunkResults = await Promise.allSettled(chunk.map(fn))
    results.push(...chunkResults)
  }
  return results
}

async function buildLeaderboard() {
  // 1. Fetch all completed fixtures
  const fixturesRaw = await apiFetch(
    `/fixtures?league=${LEAGUE}&season=${SEASON}&status=FT-AET-PEN`
  )

  const fixtures = fixturesRaw.filter((f) =>
    FINISHED.has(f.fixture?.status?.short)
  )

  if (!fixtures.length) {
    return { players: [], teams: [], fixtureCount: 0 }
  }

  const fixtureIds = fixtures.map((f) => f.fixture.id)

  // 2. Fetch events + statistics for every completed fixture in parallel batches
  const [eventsResults, statsResults] = await Promise.all([
    batchAll(fixtureIds, (id) => apiFetch(`/fixtures/events?fixture=${id}`)),
    batchAll(fixtureIds, (id) => apiFetch(`/fixtures/statistics?fixture=${id}`)),
  ])

  // ── Aggregate players ────────────────────────────────────────────────────────
  const playerMap = new Map() // playerId → aggregated stats

  function getPlayer(playerId, playerName, team) {
    if (!playerMap.has(playerId)) {
      playerMap.set(playerId, {
        id: playerId,
        name: playerName,
        team,       // { id, name, logo }
        goals: 0,
        assists: 0,
        yellowCards: 0,
        redCards: 0,
      })
    }
    return playerMap.get(playerId)
  }

  for (const result of eventsResults) {
    if (result.status !== 'fulfilled') continue
    const events = result.value // array of event objects
    for (const ev of events) {
      const { player, assist, type, detail, team } = ev
      if (!player?.id) continue

      if (type === 'Goal') {
        if (detail === 'Own Goal') {
          // Own goal — don't credit any player (it hurts the team, not helps)
          continue
        }
        // Goal scorer
        const p = getPlayer(player.id, player.name, team)
        p.goals += 1
        // Assist (can be null)
        if (assist?.id) {
          const a = getPlayer(assist.id, assist.name, team)
          a.assists += 1
        }
      } else if (type === 'Card') {
        const p = getPlayer(player.id, player.name, team)
        if (detail === 'Yellow Card') p.yellowCards += 1
        else if (detail === 'Red Card' || detail === 'Second Yellow card') p.redCards += 1
      }
    }
  }

  // ── Aggregate teams ──────────────────────────────────────────────────────────
  const teamMap = new Map() // teamId → aggregated stats

  function getTeam(teamId, teamName, teamLogo) {
    if (!teamMap.has(teamId)) {
      teamMap.set(teamId, {
        id: teamId,
        name: teamName,
        logo: teamLogo,
        played: 0,
        goalsScored: 0,
        goalsConceded: 0,
        cleanSheets: 0,
        yellowCards: 0,
        redCards: 0,
        fouls: 0,
      })
    }
    return teamMap.get(teamId)
  }

  // Derive goals from fixture scores (more reliable than summing events)
  for (const fixture of fixtures) {
    const { home, away } = fixture.teams
    const { home: hGoals, away: aGoals } = fixture.goals

    if (hGoals == null || aGoals == null) continue

    const ht = getTeam(home.id, home.name, home.logo)
    const at = getTeam(away.id, away.name, away.logo)

    ht.played += 1
    at.played += 1
    ht.goalsScored += hGoals
    ht.goalsConceded += aGoals
    at.goalsScored += aGoals
    at.goalsConceded += hGoals

    if (aGoals === 0) ht.cleanSheets += 1
    if (hGoals === 0) at.cleanSheets += 1
  }

  // Derive team cards + fouls from /fixtures/statistics
  for (const result of statsResults) {
    if (result.status !== 'fulfilled') continue
    const teamStats = result.value // array: [{ team, statistics: [{type, value}] }]
    for (const entry of teamStats) {
      if (!entry.team?.id) continue
      const t = teamMap.get(entry.team.id)
      if (!t) continue
      for (const stat of entry.statistics ?? []) {
        const val = stat.value ?? 0
        if (stat.type === 'Fouls') t.fouls += val
        else if (stat.type === 'Yellow Cards') t.yellowCards += val
        else if (stat.type === 'Red Cards') t.redCards += val
      }
    }
  }

  // ── Sort and format output ───────────────────────────────────────────────────
  const players = Array.from(playerMap.values())
    .filter((p) => p.goals > 0 || p.assists > 0 || p.yellowCards > 0 || p.redCards > 0)
    .sort((a, b) =>
      b.goals - a.goals ||
      b.assists - a.assists ||
      a.name.localeCompare(b.name)
    )
    .map((p) => ({ ...p, ga: p.goals + p.assists }))

  const teams = Array.from(teamMap.values())
    .sort((a, b) => b.goalsScored - a.goalsScored || a.name.localeCompare(b.name))
    .map((t) => ({ ...t, gd: t.goalsScored - t.goalsConceded }))

  return { players, teams, fixtureCount: fixtures.length }
}

export const handler = async () => {
  if (!API_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'API_FOOTBALL_KEY is not configured' }),
    }
  }

  const now = Date.now()

  // Serve from in-memory cache if fresh
  if (cache && now - cacheAt < CACHE_TTL) {
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300',
        'X-Cache': 'HIT',
      },
      body: JSON.stringify({ ...cache, cachedAt: new Date(cacheAt).toISOString() }),
    }
  }

  try {
    const data = await buildLeaderboard()
    cache = data
    cacheAt = now

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300',
        'X-Cache': 'MISS',
      },
      body: JSON.stringify({ ...data, cachedAt: new Date(cacheAt).toISOString() }),
    }
  } catch (err) {
    // If we have stale cache, serve it rather than erroring
    if (cache) {
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=60',
          'X-Cache': 'STALE',
        },
        body: JSON.stringify({ ...cache, cachedAt: new Date(cacheAt).toISOString(), stale: true }),
      }
    }
    return {
      statusCode: 502,
      body: JSON.stringify({ error: err.message }),
    }
  }
}
