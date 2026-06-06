import { groupFixturesByDate } from '../../utils/timezones'
import FixtureCard from './FixtureCard'
import styles from './FixtureList.module.css'

export default function FixtureList({ fixtures, timezone, loading, error }) {
  if (loading) {
    return (
      <div className={styles.skeletons}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className={`skeleton ${styles.skeletonCard}`} />
        ))}
      </div>
    )
  }

  if (error) {
    return <div className="error-box">Failed to load fixtures: {error}</div>
  }

  if (!fixtures.length) {
    return <p className={styles.empty}>No fixtures found.</p>
  }

  const groups = groupFixturesByDate(fixtures, timezone)

  return (
    <div className={styles.groups}>
      {groups.map(({ dateKey, heading, fixtures: dayFixtures }) => (
        <section key={dateKey} className={styles.dateGroup}>
          <h2 className={styles.dateHeading}>{heading}</h2>
          <div className={styles.cards}>
            {dayFixtures.map((f) => (
              <FixtureCard key={f.fixture.id} fixture={f} timezone={timezone} />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
