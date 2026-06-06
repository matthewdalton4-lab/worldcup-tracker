import { useState } from 'react'
import { useFixtures } from '../hooks/useFixtures'
import { DEFAULT_TIMEZONE } from '../utils/timezones'
import TimezoneSelector from '../components/fixtures/TimezoneSelector'
import FixtureList from '../components/fixtures/FixtureList'
import styles from './Fixtures.module.css'

export default function Fixtures() {
  const [timezone, setTimezone] = useState(DEFAULT_TIMEZONE)
  const { fixtures, loading, error, hasLive, lastUpdated } = useFixtures()

  const updatedLabel = lastUpdated
    ? lastUpdated.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit' })
    : null

  return (
    <div className="container page-wrap">
      <div className={styles.titleRow}>
        <h1 className="page-title">Fixtures</h1>
        {hasLive && (
          <span className={styles.liveIndicator}>
            <span className={styles.liveDot} />
            Live · Auto-refreshing
          </span>
        )}
      </div>

      <div className={styles.controls}>
        <TimezoneSelector value={timezone} onChange={setTimezone} />
        {updatedLabel && (
          <span className={styles.updated}>Updated {updatedLabel}</span>
        )}
      </div>

      <FixtureList
        fixtures={fixtures}
        timezone={timezone}
        loading={loading}
        error={error}
      />
    </div>
  )
}
