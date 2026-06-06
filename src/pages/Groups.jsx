import { useStandings } from '../hooks/useStandings'
import GroupsGrid from '../components/groups/GroupsGrid'
import styles from './Groups.module.css'

export default function Groups() {
  const { groups, loading, error, lastUpdated, dataUpdated, refresh } = useStandings()

  const fetchedAt = lastUpdated?.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })

  // Format the upstream data timestamp (when API-Football last changed the data)
  const dataAt = dataUpdated
    ? new Date(dataUpdated).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      })
    : null

  return (
    <div className="container page-wrap">
      <div className={styles.titleRow}>
        <div>
          <h1 className="page-title">Groups</h1>
          {!loading && (
            <p className={styles.meta}>
              {dataAt ? `Standings as of ${dataAt}` : 'Group stage standings'}
              {fetchedAt && <span className={styles.fetched}> · Fetched {fetchedAt}</span>}
            </p>
          )}
        </div>
        <button
          className={styles.refreshBtn}
          onClick={refresh}
          disabled={loading}
          title="Refresh standings"
        >
          {loading ? '···' : '↻ Refresh'}
        </button>
      </div>

      <p className={styles.note}>
        <span className={styles.qualBar} /> Top 2 in each group advance to the Round of 32
      </p>

      <GroupsGrid groups={groups} loading={loading} error={error} />
    </div>
  )
}
