import { useState } from 'react'
import { useLeaderboard } from '../hooks/useLeaderboard'
import { PlayersTable, TeamsTable } from '../components/leaderboard/LeaderboardTable'
import styles from './Leaderboard.module.css'

function formatTime(iso) {
  if (!iso) return null
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

export default function Leaderboard() {
  const [tab, setTab] = useState('players')
  const { players, teams, fixtureCount, cachedAt, loading, error } = useLeaderboard()

  return (
    <div className="container page-wrap">
      <div className={styles.titleRow}>
        <h1 className="page-title">Leaderboard</h1>
        {fixtureCount > 0 && (
          <span className={styles.fixtureCount}>{fixtureCount} matches</span>
        )}
      </div>

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${tab === 'players' ? styles.active : ''}`}
          onClick={() => setTab('players')}
        >
          Players
        </button>
        <button
          className={`${styles.tab} ${tab === 'teams' ? styles.active : ''}`}
          onClick={() => setTab('teams')}
        >
          Teams
        </button>
      </div>

      {tab === 'players' ? (
        <PlayersTable players={players} loading={loading} error={error} />
      ) : (
        <TeamsTable teams={teams} loading={loading} error={error} />
      )}

      {cachedAt && (
        <p className={styles.updated}>Updated {formatTime(cachedAt)}</p>
      )}
    </div>
  )
}
