import { useState, useMemo } from 'react'
import styles from './LeaderboardTable.module.css'

// ── Players tab ──────────────────────────────────────────────────────────────

const PLAYER_COLS = [
  { key: 'rank',        label: '#',     title: 'Rank',               mobile: true,  sticky: true  },
  { key: 'name',        label: 'Player',title: 'Player',             mobile: true,  sticky: true  },
  { key: 'team',        label: 'Nation',title: 'Nation',             mobile: false, sticky: false },
  { key: 'goals',       label: 'G',     title: 'Goals',              mobile: true,  sticky: false },
  { key: 'assists',     label: 'A',     title: 'Assists',            mobile: false, sticky: false },
  { key: 'ga',          label: 'G+A',   title: 'Goal Contributions', mobile: false, sticky: false },
  { key: 'yellowCards', label: 'YC',    title: 'Yellow Cards',       mobile: false, sticky: false },
  { key: 'redCards',    label: 'RC',    title: 'Red Cards',          mobile: false, sticky: false },
]

// ── Teams tab ────────────────────────────────────────────────────────────────

const TEAM_COLS = [
  { key: 'rank',         label: '#',    title: 'Rank',              mobile: true  },
  { key: 'name',         label: 'Team', title: 'Team',              mobile: true  },
  { key: 'played',       label: 'P',    title: 'Played',            mobile: true  },
  { key: 'goalsScored',  label: 'GS',   title: 'Goals Scored',      mobile: true  },
  { key: 'goalsConceded',label: 'GA',   title: 'Goals Conceded',    mobile: false },
  { key: 'gd',           label: 'GD',   title: 'Goal Difference',   mobile: false },
  { key: 'cleanSheets',  label: 'CS',   title: 'Clean Sheets',      mobile: false },
  { key: 'yellowCards',  label: 'YC',   title: 'Yellow Cards',      mobile: false },
  { key: 'redCards',     label: 'RC',   title: 'Red Cards',         mobile: false },
  { key: 'fouls',        label: 'F',    title: 'Fouls Committed',   mobile: false },
]

// Sort helpers
function sortPlayers(players, key, dir) {
  return [...players].sort((a, b) => {
    if (key === 'name') return dir * a.name.localeCompare(b.name)
    if (key === 'team') return dir * a.team.name.localeCompare(b.team.name)
    return dir * ((b[key] ?? 0) - (a[key] ?? 0))
  })
}

function sortTeams(teams, key, dir) {
  return [...teams].sort((a, b) => {
    if (key === 'name') return dir * a.name.localeCompare(b.name)
    return dir * ((b[key] ?? 0) - (a[key] ?? 0))
  })
}

function SortIcon({ col, sortKey, sortDir }) {
  if (col !== sortKey) return <span className={styles.sortIcon}>↕</span>
  return <span className={`${styles.sortIcon} ${styles.sortActive}`}>{sortDir === 1 ? '↑' : '↓'}</span>
}

// ── Players table ─────────────────────────────────────────────────────────────

export function PlayersTable({ players, loading, error }) {
  const [sortKey, setSortKey] = useState('goals')
  const [sortDir, setSortDir] = useState(-1) // -1 = desc

  const sorted = useMemo(() => {
    const ranked = sortPlayers(players, sortKey, sortDir)
    return ranked.map((p, i) => ({ ...p, rank: i + 1 }))
  }, [players, sortKey, sortDir])

  function handleSort(key) {
    if (key === 'rank') return
    if (key === sortKey) setSortDir((d) => d * -1)
    else {
      setSortKey(key)
      setSortDir(-1)
    }
  }

  if (loading) return <SkeletonRows cols={PLAYER_COLS.length} />
  if (error)   return <div className="error-box">Failed to load leaderboard: {error}</div>
  if (!sorted.length) return <p className={styles.empty}>No player data yet — check back after the first matches.</p>

  const topScorerId = sorted.find((p) => p.goals > 0)?.id

  return (
    <div className={styles.scrollWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            {PLAYER_COLS.map((col) => (
              <th
                key={col.key}
                className={[
                  col.key === 'rank'  ? styles.rankCol  : '',
                  col.key === 'name'  ? styles.nameCol  : '',
                  col.key === 'goals' ? styles.goalsCol : '',
                  col.sticky          ? styles.sticky    : '',
                  !col.mobile         ? styles.hideMobile : '',
                  sortKey === col.key ? styles.sorted    : '',
                ].filter(Boolean).join(' ')}
                title={col.title}
                onClick={() => handleSort(col.key)}
                style={{ cursor: col.key !== 'rank' ? 'pointer' : 'default' }}
              >
                {col.label}
                {col.key !== 'rank' && (
                  <SortIcon col={col.key} sortKey={sortKey} sortDir={sortDir} />
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((p) => (
            <tr
              key={p.id}
              className={[
                p.id === topScorerId ? styles.topScorer : '',
              ].filter(Boolean).join(' ')}
            >
              <td className={`${styles.rankCol} ${styles.sticky}`}>{p.rank}</td>

              {/* Player name — sticky on mobile */}
              <td className={`${styles.nameCol} ${styles.sticky} ${sortKey === 'name' ? styles.sorted : ''}`}>
                <div className={styles.playerCell}>
                  <img
                    src={p.team?.logo}
                    alt={p.team?.name}
                    className={styles.teamLogoTiny}
                    onError={(e) => { e.currentTarget.style.opacity = '0' }}
                  />
                  <span className={styles.playerName}>{p.name}</span>
                  {/* Nation shown below name on mobile */}
                  {p.team?.name && (
                    <span className={`${styles.nationMini} ${styles.showMobile}`}>
                      {p.team.name}
                    </span>
                  )}
                </div>
              </td>

              {/* Nation — hidden on mobile (shown inline above) */}
              <td className={`${styles.hideMobile} ${sortKey === 'team' ? styles.sorted : ''}`}>
                <div className={styles.teamCell}>
                  <img
                    src={p.team?.logo}
                    alt={p.team?.name}
                    className={styles.teamLogoSmall}
                    onError={(e) => { e.currentTarget.style.opacity = '0' }}
                  />
                  <span>{p.team?.name}</span>
                </div>
              </td>

              <td className={`${styles.statCell} ${sortKey === 'goals' ? styles.sorted : ''}`}>
                <span className={styles.statVal}>{p.goals}</span>
              </td>
              <td className={`${styles.statCell} ${styles.hideMobile} ${sortKey === 'assists' ? styles.sorted : ''}`}>
                <span className={styles.statVal}>{p.assists}</span>
              </td>
              <td className={`${styles.statCell} ${styles.hideMobile} ${sortKey === 'ga' ? styles.sorted : ''}`}>
                <span className={styles.statVal}>{p.ga}</span>
              </td>
              <td className={`${styles.statCell} ${styles.hideMobile} ${sortKey === 'yellowCards' ? styles.sorted : ''}`}>
                {p.yellowCards > 0 ? <span className={styles.ycVal}>{p.yellowCards}</span> : <span className={styles.zero}>—</span>}
              </td>
              <td className={`${styles.statCell} ${styles.hideMobile} ${sortKey === 'redCards' ? styles.sorted : ''}`}>
                {p.redCards > 0 ? <span className={styles.rcVal}>{p.redCards}</span> : <span className={styles.zero}>—</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ── Teams table ───────────────────────────────────────────────────────────────

export function TeamsTable({ teams, loading, error }) {
  const [sortKey, setSortKey] = useState('goalsScored')
  const [sortDir, setSortDir] = useState(-1)

  const sorted = useMemo(() => {
    const ranked = sortTeams(teams, sortKey, sortDir)
    return ranked.map((t, i) => ({ ...t, rank: i + 1 }))
  }, [teams, sortKey, sortDir])

  function handleSort(key) {
    if (key === 'rank') return
    if (key === sortKey) setSortDir((d) => d * -1)
    else {
      setSortKey(key)
      setSortDir(-1)
    }
  }

  if (loading) return <SkeletonRows cols={TEAM_COLS.length} />
  if (error)   return <div className="error-box">Failed to load leaderboard: {error}</div>
  if (!sorted.length) return <p className={styles.empty}>No team data yet — check back after the first matches.</p>

  return (
    <div className={styles.scrollWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            {TEAM_COLS.map((col) => (
              <th
                key={col.key}
                className={[
                  col.key === 'rank' ? styles.rankCol  : '',
                  col.key === 'name' ? styles.teamNameCol : '',
                  !col.mobile        ? styles.hideMobile : '',
                  sortKey === col.key ? styles.sorted   : '',
                ].filter(Boolean).join(' ')}
                title={col.title}
                onClick={() => handleSort(col.key)}
                style={{ cursor: col.key !== 'rank' ? 'pointer' : 'default' }}
              >
                {col.label}
                {col.key !== 'rank' && (
                  <SortIcon col={col.key} sortKey={sortKey} sortDir={sortDir} />
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((t) => (
            <tr key={t.id}>
              <td className={styles.rankCol}>{t.rank}</td>
              <td className={`${styles.teamNameCol} ${sortKey === 'name' ? styles.sorted : ''}`}>
                <div className={styles.teamCell}>
                  <img
                    src={t.logo}
                    alt={t.name}
                    className={styles.teamLogoSmall}
                    onError={(e) => { e.currentTarget.style.opacity = '0' }}
                  />
                  <span>{t.name}</span>
                </div>
              </td>
              <td className={`${styles.statCell} ${sortKey === 'played' ? styles.sorted : ''}`}>{t.played}</td>
              <td className={`${styles.statCell} ${sortKey === 'goalsScored' ? styles.sorted : ''}`}>
                <span className={styles.statVal}>{t.goalsScored}</span>
              </td>
              <td className={`${styles.statCell} ${styles.hideMobile} ${sortKey === 'goalsConceded' ? styles.sorted : ''}`}>{t.goalsConceded}</td>
              <td className={`${styles.statCell} ${styles.hideMobile} ${sortKey === 'gd' ? styles.sorted : ''}`}>
                <span className={t.gd > 0 ? styles.pos : t.gd < 0 ? styles.neg : ''}>
                  {t.gd > 0 ? `+${t.gd}` : t.gd}
                </span>
              </td>
              <td className={`${styles.statCell} ${styles.hideMobile} ${sortKey === 'cleanSheets' ? styles.sorted : ''}`}>{t.cleanSheets}</td>
              <td className={`${styles.statCell} ${styles.hideMobile} ${sortKey === 'yellowCards' ? styles.sorted : ''}`}>
                {t.yellowCards > 0 ? <span className={styles.ycVal}>{t.yellowCards}</span> : <span className={styles.zero}>—</span>}
              </td>
              <td className={`${styles.statCell} ${styles.hideMobile} ${sortKey === 'redCards' ? styles.sorted : ''}`}>
                {t.redCards > 0 ? <span className={styles.rcVal}>{t.redCards}</span> : <span className={styles.zero}>—</span>}
              </td>
              <td className={`${styles.statCell} ${styles.hideMobile} ${sortKey === 'fouls' ? styles.sorted : ''}`}>{t.fouls || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function SkeletonRows({ cols }) {
  return (
    <div className={styles.skeletonWrap}>
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className={`skeleton ${styles.skeletonRow}`} />
      ))}
    </div>
  )
}

// Keep default export for any legacy imports
export default PlayersTable
