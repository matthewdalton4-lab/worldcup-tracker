import GroupTable from './GroupTable'
import styles from './GroupsGrid.module.css'

export default function GroupsGrid({ groups, loading, error }) {
  if (loading) {
    return (
      <div className={styles.grid}>
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className={`skeleton ${styles.skeletonTable}`} />
        ))}
      </div>
    )
  }

  if (error) {
    return <div className="error-box">Failed to load standings: {error}</div>
  }

  if (!groups.length) {
    return <p className={styles.empty}>No group data available.</p>
  }

  return (
    <div className={styles.grid}>
      {groups.map((group, i) => (
        <GroupTable key={group[0]?.group ?? i} group={group} />
      ))}
    </div>
  )
}
