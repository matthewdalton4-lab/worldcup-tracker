import { useParams, Link } from 'react-router-dom'
import { useSquad } from '../hooks/useSquad'
import PlayerCard from '../components/squads/PlayerCard'
import styles from './Squad.module.css'

const POSITIONS = ['Goalkeeper', 'Defender', 'Midfielder', 'Attacker']

export default function Squad() {
  const { teamId } = useParams()
  const { squad, loading, error } = useSquad(teamId)

  const hasClubData = squad?.players?.some((p) => p.club)

  return (
    <div className="container page-wrap">
      <Link to="/teams" className={styles.back}>← All Teams</Link>

      {loading && (
        <>
          <div className={`skeleton ${styles.skeletonHeader}`} />
          <div className={styles.skeletonGrid}>
            {Array.from({ length: 26 }).map((_, i) => (
              <div key={i} className={`skeleton ${styles.skeletonPlayer}`} />
            ))}
          </div>
        </>
      )}

      {error && <div className="error-box">Failed to load squad: {error}</div>}

      {squad && (
        <>
          <div className={styles.header}>
            <img
              src={squad.team.logo}
              alt={squad.team.name}
              className={styles.teamLogo}
              onError={(e) => { e.currentTarget.style.opacity = '0.3' }}
            />
            <div>
              <h1 className={styles.teamName}>{squad.team.name}</h1>
              <p className={styles.playerCount}>
                {squad.players.length} players
                {hasClubData && ' · with club affiliations'}
              </p>
            </div>
          </div>

          {POSITIONS.map((pos) => {
            const players = squad.players
              .filter((p) => p.position === pos)
              .sort((a, b) => (a.number ?? 99) - (b.number ?? 99))

            if (!players.length) return null

            return (
              <section key={pos} className={styles.section}>
                <h2 className={styles.posTitle}>
                  {pos}s
                  <span className={styles.posCount}>{players.length}</span>
                </h2>
                <div className={styles.grid}>
                  {players.map((p) => (
                    <PlayerCard key={p.id} player={p} />
                  ))}
                </div>
              </section>
            )
          })}
        </>
      )}
    </div>
  )
}
