import { useTeams } from '../hooks/useTeams'
import TeamCard from '../components/squads/TeamCard'
import styles from './Teams.module.css'

export default function Teams() {
  const { teams, loading, error } = useTeams()

  // Group teams by group letter for section headings
  const grouped = teams.reduce((acc, team) => {
    const key = team.group || 'Unassigned'
    if (!acc[key]) acc[key] = []
    acc[key].push(team)
    return acc
  }, {})

  const groupKeys = Object.keys(grouped).sort()

  return (
    <div className="container page-wrap">
      <div className={styles.titleRow}>
        <h1 className="page-title">Teams</h1>
        <span className={styles.count}>
          {loading ? '–' : teams.length} / 48 teams
        </span>
      </div>

      {error && <div className="error-box">{error}</div>}

      {loading && (
        <div className={styles.grid}>
          {Array.from({ length: 48 }).map((_, i) => (
            <div key={i} className={`skeleton ${styles.skeletonCard}`} />
          ))}
        </div>
      )}

      {!loading && !error && groupKeys.length > 0 && (
        <div className={styles.sections}>
          {groupKeys.map((groupKey) => (
            <section key={groupKey} className={styles.section}>
              <h2 className={styles.groupHeading}>{groupKey}</h2>
              <div className={styles.grid}>
                {grouped[groupKey].map((team) => (
                  <TeamCard key={team.id} team={team} group={team.group?.replace('Group ', '')} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {!loading && !error && teams.length === 0 && (
        <p className={styles.empty}>
          No teams found. Check that <code>WC_LEAGUE_ID</code> and{' '}
          <code>WC_SEASON</code> are correct in your environment variables.
        </p>
      )}
    </div>
  )
}
